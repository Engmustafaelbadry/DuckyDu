#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash install-online.sh <repo_url> [branch] [target_dir]"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <repo_url> [branch] [target_dir]"
  exit 1
fi

REPO_URL="$1"
BRANCH="${2:-main}"
TARGET_DIR="${3:-/opt/duckydu-src}"
APP_USER="${SUDO_USER:-pi}"

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "User '${APP_USER}' not found. Run with sudo from the target login user."
  exit 1
fi

echo "Installing git..."
apt-get update
apt-get install -y --no-install-recommends git ca-certificates

if [[ -d "${TARGET_DIR}/.git" ]]; then
  echo "Updating existing repo in ${TARGET_DIR}..."
  git -C "${TARGET_DIR}" fetch origin "${BRANCH}"
  git -C "${TARGET_DIR}" checkout "${BRANCH}"
  git -C "${TARGET_DIR}" reset --hard "origin/${BRANCH}"
else
  echo "Cloning ${REPO_URL} (${BRANCH}) into ${TARGET_DIR}..."
  rm -rf "${TARGET_DIR}"
  git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${TARGET_DIR}"
fi

echo "Running kiosk installer..."
bash "${TARGET_DIR}/scripts/pi/install-kiosk.sh" "${TARGET_DIR}"

echo "Install complete. Reboot to launch kiosk:"
echo "  sudo reboot"
