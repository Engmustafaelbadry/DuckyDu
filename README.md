# DuckyDu

Lightweight phone-management launcher for Raspberry Pi, now focused on Raspberry Pi 5 terminal-based install.

Touch-first landscape launcher (800x480) with a Ducky yellow theme, top status bar, and icon menu.

## 1) Local live development (your PC)

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

This gives real-time updates while we build the menu and features together.

## 1.5) Build a portable test bundle for Pi

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev/build-test-bundle.ps1
```

Output:
- `release/DuckyDu-test/`
- `release/DuckyDu-test.zip`

Copy `DuckyDu-test.zip` to Pi and extract it.

## 2) Production build

```bash
npm run build
```

Build output goes to `dist/`.

## 3) Install on Raspberry Pi 5 (terminal)

### Option A: Clone on Pi and install

```bash
cd /path/to/Raspberry-project
sudo bash scripts/pi/install-kiosk.sh /path/to/Raspberry-project
```

This path builds `dist/` on the Pi, installs kiosk dependencies, deploys the app to `/opt/raspi-launcher`, and enables the `raspi-kiosk.service`.

### Option B: Fast install from prebuilt `dist/`

```bash
sudo bash scripts/pi/install-kiosk.sh /path/to/Raspberry-project/dist
```

### Option C: Online install directly from repo URL

Run this on the Pi:

```bash
curl -fsSL https://raw.githubusercontent.com/<YOUR_ORG>/<YOUR_REPO>/main/scripts/pi/install-online.sh | sudo bash -s -- https://github.com/<YOUR_ORG>/<YOUR_REPO>.git main
```

After any install:

```bash
sudo reboot
```

The launcher auto-starts in Chromium kiosk mode on boot.

Fast install from extracted bundle:

```bash
cd /home/pi/DuckyDu-test
sudo bash scripts/pi/install-kiosk.sh /home/pi/DuckyDu-test/dist
sudo reboot
```

Remote deploy from your Windows PC (optional):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev/deploy-to-pi.ps1 -PiHost 192.168.1.50
```

## 4) Service checks on Pi

```bash
systemctl status raspi-kiosk.service
journalctl -u raspi-kiosk.service -n 100 --no-pager
```

## Notes

- Touch controller tuning differs by hardware revision. Use `scripts/pi/touch-calibration-notes.md`.
- Current phone-management icon actions are placeholders. We will wire real functionality next.
