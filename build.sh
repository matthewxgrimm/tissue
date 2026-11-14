#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
command -v node >/dev/null || { echo 'Node.js is required.' >&2; exit 1; }
command -v npm >/dev/null || { echo 'npm is required.' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'Python 3 is required.' >&2; exit 1; }
if [[ -f package-lock.json ]]; then
  npm ci --include=dev --no-audit --no-fund
else
  npm install --include=dev --no-audit --no-fund
fi
python3 -m venv .venv
.venv/bin/python -m pip install --disable-pip-version-check -r requirements.txt
export TISSUE_SITEMAP_BASE_URL="${TISSUE_SITEMAP_BASE_URL:-${CF_PAGES_URL:-http://127.0.0.1:8000}}"
if [[ -n "${CF_PAGES:-}" ]]; then export TISSUE_STRICT_SITEMAP=1; fi
.venv/bin/python tissue.py
npm run build:css
if [[ -f fav.svg ]]; then cp fav.svg public/favicon.svg; fi
if [[ -f static/_headers ]]; then cp static/_headers public/_headers; fi
printf '\nBuild complete. Publish the public directory.\n'
