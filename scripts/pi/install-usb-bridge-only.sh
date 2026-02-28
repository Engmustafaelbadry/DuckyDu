#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/pi/install-usb-bridge-only.sh [app_user]"
  exit 1
fi

APP_USER="${1:-${SUDO_USER:-pi}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "User '${APP_USER}' not found."
  exit 1
fi

echo "Installing bridge dependencies..."
apt-get update
apt-get install -y --no-install-recommends python3 usbutils

echo "Installing bridge binary..."
install -m 0755 "${SCRIPT_DIR}/usb_status_bridge.py" /usr/local/bin/usb-status-bridge

echo "Installing bridge service..."
install -m 0644 "${SCRIPT_DIR}/usb-status-bridge.service" /etc/systemd/system/usb-status-bridge.service
sed -i "s/__APP_USER__/${APP_USER}/g" /etc/systemd/system/usb-status-bridge.service

echo "Enabling + starting service..."
systemctl daemon-reload
systemctl enable usb-status-bridge.service
systemctl restart usb-status-bridge.service

echo "Bridge installed."
echo "Check status:"
echo "  systemctl status usb-status-bridge.service --no-pager -l"
echo "  curl http://127.0.0.1:17373/usb/mobile-status"
