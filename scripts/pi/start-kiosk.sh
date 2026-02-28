#!/usr/bin/env bash
set -euo pipefail

export DISPLAY=:0
export XAUTHORITY="${HOME}/.Xauthority"

xset s off
xset -dpms
xset s noblank

unclutter -idle 0.1 -root &

URL="file:///opt/raspi-launcher/index.html"

if command -v pkill >/dev/null 2>&1; then
  pkill -f "usb_status_bridge.py" >/dev/null 2>&1 || true
fi

if [[ -x /usr/local/bin/usb-status-bridge ]]; then
  /usr/local/bin/usb-status-bridge >/tmp/usb-status-bridge.log 2>&1 &
fi

CHROMIUM_BIN="chromium"
if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium-browser"
fi

exec "${CHROMIUM_BIN}" \
  --kiosk \
  --app="${URL}" \
  --incognito \
  --check-for-update-interval=31536000 \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-networking \
  --disable-component-update \
  --disable-default-apps \
  --disable-domain-reliability \
  --disable-sync \
  --metrics-recording-only \
  --mute-audio \
  --disk-cache-size=10485760 \
  --media-cache-size=10485760 \
  --renderer-process-limit=2 \
  --disable-features=Translate,MediaRouter,OptimizationHints,AutofillServerCommunication \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --noerrdialogs \
  --overscroll-history-navigation=0
