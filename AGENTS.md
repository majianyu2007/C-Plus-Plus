# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this branch is

This is the **`web` branch**, which holds a self-contained, dependency-free static web app: **"C++ OOP 复习工具"** — a C++ object-oriented-programming exam review tool (题库 / 讲义 / 进度). All UI text is Simplified Chinese.

**The repo is split by branch and the two roots share no files:**
- **`main`** — the actual C++ practice source (`Chapter/`, `template/` `.cpp` files, `.clang-format`). This is the default PR target per git config, but it is *unrelated* to the web app.
- **`web`** (here) — only the web app. There is no C++ source on this branch. Don't go looking for `.cpp` files or try to reconcile with `main`; web-app work stays on `web`.

There is **no build system, no framework, no package.json, no tests, no lint**. It is vanilla HTML/CSS/JS loaded directly by the browser and deployed via **GitHub Pages** (`.nojekyll`, root `index.html`).

## Running locally

Must be served over HTTP — opening `index.html` as `file://` breaks the `fetch()` of `data/*.json`.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Critical conventions

- **Cache-busting is manual.** `index.html` references `assets/app.js?v=1.5.7` and `assets/style.css?v=1.5.7`. When you edit either asset, **bump the `?v=` version in `index.html`** (and `manifest.json`'s `start_url` if relevant) — there is no content hashing, and stale caches are otherwise served.
- **No service worker at runtime.** `sw.js` is a deliberate *self-destruct* worker (clears caches + unregisters), and `index.html` also unregisters any SW on load. This exists to undo an earlier caching trap. **Do not reintroduce a caching service worker** without a strong reason.
- **`DESIGN.md` governs all UI work.** It is the Anthropic brand design-system spec (cream canvas `#faf9f5`, coral `#cc785c`, dark navy `#181715`, serif display + humanist sans, spacing/radius/typography tokens, component specs, do's & don'ts). **Any visual or UI change — new components, layout, colors, type, spacing, states — must follow `DESIGN.md`.** Read the relevant section *first*, reuse its tokens (never inline ad-hoc hex/sizes), and match its component patterns; `assets/style.css` already implements these tokens.

## Architecture

- **`index.html`** — single-page shell with three pages (`#page-quiz` 题库训练, `#page-knowledge` 知识讲义, `#page-progress` 进度概览). The inline `<script>` at the top reads theme/font from `localStorage` *before* paint to prevent FOUC. Many controls call handlers via inline `onclick="window.foo()"`.
- **`assets/app.js`** (~3000 lines) — the entire app, wrapped in one `'use strict'` IIFE. A single central `state` object holds questions/filters/progress. Functions invoked from HTML are attached to `window.*` (e.g. `window._goToPage`, `window._selectOption`, `window._runAiAnalysis`). Section banners (`// ====`) divide it: 状态管理 → 数据加载 → 进度/SRS → 主题/设置 → Markdown 渲染 → 筛选与渲染 → 答题 → 统计/进度页. Start at `loadAllData()`.
- **`assets/style.css`** (~4000 lines) — design tokens as CSS variables, light/dark themes, responsive.
- **`data/*.json`** — the real product (hand-curated content), fetched at runtime. See below.

## Data model (`data/`)

The JSON files **are the content** and are the most frequently edited part of this branch (recent history is almost entirely data cleaning/dedup).

- **`questions.json`** (463) — `{ id:number, type: "choice"|"truefalse"|"fillin"|"coding", chapter, stem, options[], answer, explanation (markdown), knowledgePoints[], knowledgePointsNormalized[], source, difficulty, explanation_status, audit_status }`.
- **`programming.json`** (41) — 程序设计题: `{ id:"P1"…, chapter, title, requirement, answerCode, keyPoints[], knowledgePoints[], explanation, … }`. `type:"programming"` is added at load time.
- **`knowledge.json`** (15 chapters) — lecture content: `{ title, fullTitle, content, markdown, points[] }`.
- **`kp_vocab.json`** — controlled vocabulary of ~48 exam-oriented knowledge-point tags (`points[]` with `id`, `name`, `aliases[]`, `lectureChapterHint`). **Every question's `knowledgePoints` must use a `name` from this vocabulary**; `lectureChapterHint` powers knowledge-point → lecture jumps.
- **`metadata.json`** — stats + a data-cleaning provenance/audit log. It is denormalized (several overlapping stat blocks) and recomputed from the JSON, not authored independently. Its `cleaning.rules` are the **data invariants** to preserve when editing content:
  - choice questions have **exactly four** non-empty options; non-choice questions carry **no** options
  - `answer`, `explanation`, `knowledgePoints`, `chapter`, `source`, `difficulty` are required
  - no duplicate normalized stems / duplicate code stems
  - `metadata.json` stats must be recomputed to match actual JSON contents (counts: 463 questions + 41 programming = 504 total)

In code, items are keyed `q_<id>` for questions and the uppercased `P…` id for programming; `attempts`, `questionStats`, and `favorites` all key off these.

## Persistence & SRS (all `localStorage`, no backend)

Keys: `oop_review_progress` (`{id: "mastered"|"review"|"wrong"}`), `oop_settings`, `oop_favorites`, `oop_attempts` (last 200), `oop_question_stats`, plus `oop_theme` / `oop_font_family` / `oop_font_size` / `oop_active_page` / view-scroll state. Progress is import/export-able as JSON from the 进度 page.

- **SRS** (`updateSrs`): streak-based, intervals `[1,3,7,14,30,60]` days, streak capped at 6; a wrong answer resets streak and bumps `wrongCount`. "待复习" = items whose `nextReviewTs <= now`.
- **Seeded shuffle**: an LCG (`createSeededRandom`/`seededShuffle`) orders questions so a shared numeric seed reproduces the exact same order across users.
- **No LLM integration.** The "获取讲解提示词" / AI-analysis buttons *build a prompt string and copy it to the clipboard* (`copyPromptAndNotify`) for the user to paste into their own model — nothing is sent anywhere.
