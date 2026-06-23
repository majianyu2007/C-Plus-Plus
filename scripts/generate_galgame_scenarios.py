#!/usr/bin/env python3
"""Generate offline Galgame scenario text for the C++ practice site.

默认走 OpenAI 兼容接口（当前默认 endpoint 为 https://api.715654.xyz/v1，模型为 grok-4.3-fast）。
需要把 API key 通过环境变量传入（不硬编码）。

支持的环境变量（任一都可覆盖命令行默认值）：
  XAI_API_KEY / OPENAI_API_KEY / GALGAME_OPENAI_API_KEY   —— API key（必填）
  OPENAI_BASE_URL / GALGAME_OPENAI_BASE_URL               —— endpoint，默认 https://api.x.ai/v1
  OPENAI_MODEL  / GALGAME_OPENAI_MODEL                    —— 模型名，默认 grok-4-fast-non-reasoned
  GALGAME_LIMIT / GALGAME_OFFSET                          —— 批次范围
  GALGAME_MAX_TOKENS                                      —— 单条响应上限，默认 1800
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import ssl
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


def build_ssl_context() -> ssl.SSLContext:
    """构建一个能验证 TLS 证书的 SSLContext。

    macOS Homebrew/官方安装器 Python 不带 CA 证书包，直连 HTTPS 会报
    CERTIFICATE_VERIFY_FAILED。优先用 certifi 的证书；没装 certifi 则回退到
    系统默认（OpenSSL 自带或 Keychain 派生）。
    """
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "data" / "galgame_scenarios.json"
EVENTS = [
    "intro",
    "next",
    "prev",
    "selected",
    "answer",
    "correct",
    "wrong",
    "review",
    "mastered",
    "markedWrong",
    "favorite",
    "unfavorite",
    "affectionMilestone",
    "affectionDown",
]


def env(name: str, fallback: str = "") -> str:
    return os.environ.get(name, fallback).strip()


# Grok 系列默认配置（API key 仍走环境变量，不在此硬编码）。
GROK_BASE_URL = "https://api.715654.xyz/v1"
GROK_MODEL = "grok-4.3-fast"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch-generate Galgame scenario JSON for the local site."
    )
    parser.add_argument(
        "--base-url",
        default=env("OPENAI_BASE_URL") or env("GALGAME_OPENAI_BASE_URL") or GROK_BASE_URL,
        help=f"OpenAI 兼容 endpoint（默认 {GROK_BASE_URL}）。",
    )
    parser.add_argument(
        "--api-key",
        default=env("OPENAI_API_KEY") or env("GALGAME_OPENAI_API_KEY") or env("XAI_API_KEY"),
        help="API key；建议用环境变量 XAI_API_KEY 传入，不要写死在命令行。",
    )
    parser.add_argument(
        "--model",
        default=env("OPENAI_MODEL") or env("GALGAME_OPENAI_MODEL") or GROK_MODEL,
        help=f"模型名（默认 {GROK_MODEL}）。",
    )
    parser.add_argument("--limit", type=int, default=int(env("GALGAME_LIMIT", "40") or 40))
    parser.add_argument("--offset", type=int, default=int(env("GALGAME_OFFSET", "0") or 0))
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--temperature", type=float, default=0.62)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--sleep", type=float, default=0.3)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只打印将要处理的题目 key 和第一条 prompt 预览，不调用 API、不写输出文件。",
    )
    parser.add_argument(
        "--replace-output",
        action="store_true",
        help="覆盖输出文件；默认会读取已有 data/galgame_scenarios.json 并按 key 合并，适合分批生成。",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=int(env("GALGAME_MAX_TOKENS", "1800") or 1800),
        help="单条响应 token 上限（默认 1800，避免 Grok 把题目整段重述）。",
    )
    return parser.parse_args()


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def progress_key(item: dict) -> str:
    prefix = "prog" if item.get("type") == "programming" else "q"
    return f"{prefix}_{item.get('id')}"


def knowledge_points(item: dict) -> str:
    if item.get("type") == "programming":
        points = item.get("keyPoints") or []
    else:
        points = item.get("knowledgePointsNormalized") or item.get("knowledgePoints") or []
    return "、".join(str(p) for p in points if p) or "暂无"


def item_task(item: dict) -> str:
    if item.get("type") == "programming":
        return (
            f"题目：{item.get('title', '')}\n"
            f"要求：{item.get('requirement', '')}\n"
            f"参考答案：\n{item.get('answerCode', '')}"
        )
    options = item.get("options") or []
    return (
        f"题干：{item.get('stem', '')}\n"
        f"选项：{chr(10).join(str(opt) for opt in options) if options else '无'}\n"
        f"答案：{item.get('answer', '')}\n"
        f"解析：{item.get('explanation', '无') or '无'}"
    )


def build_prompt(item: dict) -> str:
    event_shape = ",\n  ".join(f'"{name}": {{ "story": "...", "line": "..." }}' for name in EVENTS)
    return f"""为 C++ OOP 刷题网站的 Galgame 模式生成离线剧情文案。只输出 JSON，不要 Markdown。

风格要求：
- 角色名是“澪”，中文妹妹陪练风格，恋爱喜剧距离感可以明显一些，但不要露骨。
- 这是刷题网站，题干、考点、解析的可读性优先，剧情必须服务于理解。
- 内置好感度系统：答对、掌握、收藏、连胜会升温；答错、连续卡住、取消收藏会降温。
- story 适合右侧剧情面板，40-90 字。
- line 适合底部对白框，25-60 字。
- plan.summary 像路线手账里的考点攻略，短而清楚。

输出格式：
{{
  "key": "{progress_key(item)}",
  "routeTitle": "不超过18字的路线标题",
  "summary": "不超过42字的题目/考点剧情摘要",
  "plan": {{
    "primary": "主考点",
    "related": ["关联考点1", "关联考点2"],
    "lectureHint": "讲义定位提示，可为空字符串",
    "summary": "本题攻略计划"
  }},
  {event_shape}
}}

题目信息：
章节：{item.get('chapter', '综合章节') or '综合章节'}
题型：{item.get('type', 'choice')}
知识点：{knowledge_points(item)}
{item_task(item)}"""


def strip_json_fence(text: str) -> str:
    raw = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, flags=re.S | re.I)
    if match:
        raw = match.group(1).strip()
    if raw.startswith("{") and raw.endswith("}"):
        return raw
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        return raw[start : end + 1]
    return raw


def chat_completion(args: argparse.Namespace, prompt: str) -> dict:
    # base_url 末尾不带斜杠；若已含 /chat/completions 则直接用，否则补 /chat/completions。
    base = args.base_url.rstrip("/")
    if base.endswith("/chat/completions"):
        endpoint = base
    elif base.endswith("/v1"):
        endpoint = base + "/chat/completions"
    else:
        endpoint = base + "/v1/chat/completions"
    payload = {
        "model": args.model,
        "temperature": args.temperature,
        "max_tokens": args.max_tokens,
        "messages": [
            {"role": "system", "content": "You generate compact JSON only. No prose outside JSON."},
            {"role": "user", "content": prompt},
        ],
    }
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {args.api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90, context=build_ssl_context()) as res:
        data = json.loads(res.read().decode("utf-8"))
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    return json.loads(strip_json_fence(content))


def normalize_scenario(item: dict, scenario: dict) -> dict:
    scenario["key"] = str(scenario.get("key") or progress_key(item))
    events = scenario.setdefault("events", {})
    for name in EVENTS:
        direct = scenario.get(name)
        if isinstance(direct, dict):
            events[name] = {
                "story": str(direct.get("story", "")).strip(),
                "line": str(direct.get("line", "")).strip(),
            }
            scenario.pop(name, None)
    return scenario


def merge_existing_items(out_path: Path, new_items: list[dict], replace_output: bool = False) -> list[dict]:
    if replace_output or not out_path.exists():
        return new_items
    try:
        existing = load_json(out_path)
    except (OSError, json.JSONDecodeError):
        return new_items
    source = existing.get("items") if isinstance(existing, dict) else existing
    if not isinstance(source, list):
        return new_items
    merged: dict[str, dict] = {}
    order: list[str] = []
    for item in source + new_items:
        if not isinstance(item, dict):
            continue
        key = str(item.get("key") or "").strip()
        if not key:
            continue
        if key not in merged:
            order.append(key)
        merged[key] = item
    return [merged[key] for key in order]


def main() -> int:
    args = parse_args()
    questions = load_json(ROOT / "data" / "questions.json")
    programming = load_json(ROOT / "data" / "programming.json")
    questions = [dict(item, type=item.get("type") or "choice") for item in questions]
    programming = [dict(item, type="programming") for item in programming]
    all_items = questions + programming

    start = max(0, args.offset)
    limit = max(1, args.limit)
    selected = all_items[start : start + limit]
    if args.dry_run:
        keys = [progress_key(item) for item in selected]
        print(f"Dry run: {len(selected)} item(s), offset={start}, limit={limit}")
        print("Keys:", ", ".join(keys) if keys else "(none)")
        if selected:
            preview = build_prompt(selected[0])
            print("\n--- Prompt preview for first item ---")
            print(preview[:2000])
            if len(preview) > 2000:
                print("... (truncated)")
        return 0

    if not args.base_url or not args.api_key:
        print("Set OPENAI_BASE_URL and OPENAI_API_KEY, or pass --base-url and --api-key.", file=sys.stderr)
        return 2

    out_path = args.out if args.out.is_absolute() else ROOT / args.out
    output = {
        "version": 2,
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "tone": "romance",
        "offset": start,
        "limit": limit,
        "items": [],
    }

    for index, item in enumerate(selected, start=1):
        key = progress_key(item)
        last_error = None
        for attempt in range(args.retries + 1):
            try:
                scenario = chat_completion(args, build_prompt(item))
                output["items"].append(normalize_scenario(item, scenario))
                print(f"[{index}/{len(selected)}] {key} ok")
                last_error = None
                break
            except (json.JSONDecodeError, urllib.error.URLError, TimeoutError, ValueError) as exc:
                last_error = exc
                if attempt < args.retries:
                    time.sleep(args.sleep * (attempt + 1))
        if last_error is not None:
            print(f"[{index}/{len(selected)}] {key} failed: {last_error}", file=sys.stderr)

    output["items"] = merge_existing_items(out_path, output["items"], args.replace_output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(output['items'])} scenarios to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
