#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

QUARTZ_REPO="${QUARTZ_REPO:-https://github.com/jackyzha0/quartz.git}"
QUARTZ_REF="${QUARTZ_REF:-v5}"
QUARTZ_DIR="$ROOT/.cache/quartz"

if [ ! -d "$QUARTZ_DIR/.git" ]; then
  rm -rf "$QUARTZ_DIR"
  mkdir -p "$(dirname "$QUARTZ_DIR")"
  git clone --depth 1 --branch "$QUARTZ_REF" "$QUARTZ_REPO" "$QUARTZ_DIR"
fi

cd "$QUARTZ_DIR"

git fetch --depth 1 origin "$QUARTZ_REF" >/dev/null 2>&1 || true
git checkout "$QUARTZ_REF" >/dev/null 2>&1 || true

npm ci

rm -rf content
ln -s "$ROOT/content" content

ln -sf "$ROOT/quartz.config.yaml" quartz.config.yaml

if [ -f "$ROOT/quartz.lock.json" ]; then
  ln -sf "$ROOT/quartz.lock.json" quartz.lock.json
fi

npx quartz plugin install --from-config

if [ -f quartz.lock.json ] && [ ! -L quartz.lock.json ]; then
  cp quartz.lock.json "$ROOT/quartz.lock.json"
fi

npx quartz build --output "$ROOT/public" "$@"
