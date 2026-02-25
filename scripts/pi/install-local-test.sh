#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DIST_DIR="${PROJECT_ROOT}/dist"

if [[ ! -d "${DIST_DIR}" ]]; then
  echo "dist not found at ${DIST_DIR}"
  echo "Run: npm run build"
  exit 1
fi

cd "${PROJECT_ROOT}"
sudo bash scripts/pi/install-kiosk.sh "${DIST_DIR}"
