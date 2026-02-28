#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/pi/install-kiosk.sh /path/to/dist|/path/to/project"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /absolute/path/to/dist|/absolute/path/to/project"
  exit 1
fi

INPUT_DIR="$(realpath "$1")"
KIOSK_DIR="/opt/raspi-launcher"
APP_USER="${SUDO_USER:-pi}"
DIST_DIR=""

if [[ ! -d "${INPUT_DIR}" ]]; then
  echo "Path not found: ${INPUT_DIR}"
  exit 1
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "User '${APP_USER}' not found. Create user first or run with sudo from target user."
  exit 1
fi

echo "Installing dependencies..."
apt-get update

CHROMIUM_PKG="chromium"
if apt-cache show chromium-browser >/dev/null 2>&1; then
  CHROMIUM_PKG="chromium-browser"
fi

apt-get install -y --no-install-recommends \
  xserver-xorg \
  xinit \
  openbox \
  unclutter \
  x11-xserver-utils \
  python3 \
  usbutils \
  "${CHROMIUM_PKG}"

SCRIPT_SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "${INPUT_DIR}/package.json" ]]; then
  echo "Source project detected at ${INPUT_DIR}, building dist..."
  apt-get install -y --no-install-recommends nodejs npm ca-certificates git
  pushd "${INPUT_DIR}" >/dev/null
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
  npm run build
  popd >/dev/null
  DIST_DIR="${INPUT_DIR}/dist"
  SCRIPT_SOURCE_DIR="${INPUT_DIR}/scripts/pi"
elif [[ -f "${INPUT_DIR}/index.html" ]]; then
  DIST_DIR="${INPUT_DIR}"
else
  echo "Invalid input path: expected dist/ directory or project root with package.json"
  exit 1
fi

echo "Deploying app files..."
mkdir -p "${KIOSK_DIR}"
rm -rf "${KIOSK_DIR:?}/"*
cp -r "${DIST_DIR}/"* "${KIOSK_DIR}/"
chown -R "${APP_USER}:${APP_USER}" "${KIOSK_DIR}"

echo "Installing kiosk launcher..."
install -m 0755 "${SCRIPT_SOURCE_DIR}/start-kiosk.sh" /usr/local/bin/start-kiosk.sh
install -m 0755 "${SCRIPT_SOURCE_DIR}/usb_status_bridge.py" /usr/local/bin/usb-status-bridge

echo "Installing systemd service..."
install -m 0644 "${SCRIPT_SOURCE_DIR}/raspi-kiosk.service" /etc/systemd/system/raspi-kiosk.service
sed -i "s/__APP_USER__/${APP_USER}/g" /etc/systemd/system/raspi-kiosk.service
install -m 0644 "${SCRIPT_SOURCE_DIR}/usb-status-bridge.service" /etc/systemd/system/usb-status-bridge.service
sed -i "s/__APP_USER__/${APP_USER}/g" /etc/systemd/system/usb-status-bridge.service

echo "Enabling service..."
systemctl daemon-reload
systemctl enable raspi-kiosk.service
systemctl enable usb-status-bridge.service
systemctl restart usb-status-bridge.service || true

echo "Applying optional display/touch template notes..."
echo "Read and apply if needed:"
echo "  ${SCRIPT_SOURCE_DIR}/display-touch-config.txt"

echo "Done. Reboot to start kiosk:"
echo "  sudo reboot"
