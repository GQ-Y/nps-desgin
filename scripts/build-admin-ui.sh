#!/usr/bin/env bash
# 将 nps-desgin 构建到 web/static/spa，供 nps 通过 /static/spa/ 提供新管理端。
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/web/static/spa"
mkdir -p "$OUT"
# 清空旧构建，保留 .gitkeep（避免从仓库删掉占位文件）
find "$OUT" -mindepth 1 ! -name '.gitkeep' -exec rm -rf {} + 2>/dev/null || true
cd "$ROOT/nps-desgin"
# 安装阶段必须装上 devDependencies（tailwindcss、typescript 等）；若全局 NODE_ENV=production，pnpm/npm 会跳过。
if command -v pnpm >/dev/null 2>&1; then
  ( unset NODE_ENV; pnpm install --frozen-lockfile )
  NODE_ENV=production pnpm exec vite build --base /static/spa/ --outDir "$OUT"
else
  ( unset NODE_ENV; npm ci )
  NODE_ENV=production npx vite build --base /static/spa/ --outDir "$OUT"
fi
echo "Admin UI -> $ROOT/web/static/spa"
