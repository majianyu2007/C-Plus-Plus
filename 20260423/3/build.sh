#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CXX="${CXX:-g++}"

CXXFLAGS=(
  -std=c++17
  -Wall
  -Wextra
  -Wpedantic
)

SRC=(
  "$ROOT_DIR/Sources/main.cpp"
  "$ROOT_DIR/Sources/src/CPoint2D.cpp"
  "$ROOT_DIR/Sources/src/CRectangle.cpp"
)

INCLUDES=(
  -I"$ROOT_DIR/headers/include"
)

OUT="$ROOT_DIR/main"

"$CXX" "${CXXFLAGS[@]}" "${SRC[@]}" "${INCLUDES[@]}" -o "$OUT"
echo "Build success: $OUT"

if [[ "${1:-}" == "run" ]]; then
  "$OUT"
fi
