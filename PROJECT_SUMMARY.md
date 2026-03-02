# DuckyDu Kiosk - Project Summary (Updated)

## 1) Current Product State
- Platform: Raspberry Pi 5 kiosk UI.
- Framework: React + Vite.
- Visual direction: Pixelact-style UI with pixel icon sets and stepped pixel corners.
- Navigation model: flow-based screens, no top menu.
- Shared left vertical menu is present across launch/select/settings/device flows.

## 2) Screen / Resolution Notes
- Target display: 800x480.
- Measured visible kiosk area on device: 780x460.
- App fills viewport (`html, body, #app` 100%).
- No-scroll kiosk rule is still active for all main screens.

## 3) Implemented Screen Flow

### A) Launch screen (new first screen before Select OS)
- Device title shown in Japanese + English:
  - `ピクサチョ`
  - `PIXACHO`
- Subtitle shown in Japanese + English:
  - `ハッキングはただのゲーム`
  - `HACKING IS JUST A GAME`
- Background: `public/assets/Background.gif`.
- Left: main branding + `Start...`.
- Right: icon rail with pages:
  - Settings (coming soon panel)
  - Wi-Fi page
  - Profile page (Pixelact avatar)
  - Update page (coming soon panel)
  - Language toggle icon (`EN` / `JP`) for future translation wiring.
- Version row shown under icons: `Version 2.0.115`.

### B) Select OS screen (refined)
- Header: `Select OS`.
- Uses background GIF overlay styling.
- Main layout:
  - Left 1/3: animation area with `public/assets/samurai.png`.
  - Right 2/3: OS cards.
- OS card structure:
  - Android card (large)
  - iOS card (large)
  - Bottom row: `Other OS` + small `Back` button side by side.
- Samurai animation behavior:
  - Horizontal only (left-right), hard step motion.
  - No vertical bounce.
  - No flip.

### C) Connect mode (Cable path)
- `Connect via` stage: Cable / Wireless.
- Cable wait stage polls:
  - `http://127.0.0.1:17373/usb/mobile-status`
  - `http://localhost:17373/usb/mobile-status`
- Connected state shows product/manufacturer and delayed Access button.
- Access button opens loading screen then Device Management.

### D) Device Management screen
- Uses grouped pages:
  1. Decrypt Data
  2. Data Management
  3. Device Management
  4. Delete Encryption
- 3x3 fixed grid behavior maintained.
- Back/home handling kept context-aware.

### E) Settings screen (now functional)
- Replaced placeholder with operational controls that call local bridge APIs.
- Settings is now page-based (one group per page to avoid UI noise):
  - `Settings` home page with navigation buttons.
  - `Display Settings` page.
  - `Pixacho Configuration` page.
  - `Customization` page.
- Settings home layout now uses 1/3 + 2/3 split:
  - Left 1/3: animated pixel gear.
  - Right 2/3: vertical navigation buttons.
  - Gear animation is stepped loop rotation (non-smooth).
- Display Settings page is wired to Pi display controls (real bridge calls, no mock):
  - Brightness
  - Contrast
  - Gamma
  - Saturation
  - Includes Apply + Reset buttons.
  - Display status reads live xrandr brightness/gamma when available.
- Pixacho Configuration page contains system operation buttons:
  - Show `lsusb`
  - Restart ADB
  - Restart Bridges
  - Restart Kiosk
  - Pull Latest Code (`git pull`)
  - Apply Full Update pipeline
  - Restart Pi
  - Shutdown Pi
- Pixacho Configuration page layout:
  - Left 1/3: command result/terminal output panel
  - Right 2/3: vertical operation buttons
- Customization page:
  - Open sudo terminal over kiosk (touch flow).
  - Exit Kiosk (`systemctl stop raspi-kiosk.service`).
  - Create Desktop Kiosk App launcher on Pi desktop.
- Result/output panel now appears only inside action pages (not on settings home).
- Display page has explicit top header within page content (`Display Settings`) followed by controls.
- Layout tuned to fit kiosk ratio with fixed-height sections and no page-level overflow/scroll.
- Settings UI now uses Pixelact components consistently for navigation/buttons/inputs.

## 4) Wi-Fi System

### A) Dedicated Wi-Fi bridge (separate from USB bridge)
- Script: `scripts/pi/wifi_status_bridge.py`
- Service: `scripts/pi/wifi-status-bridge.service`
- Port: `17374`
- Endpoints:
  - `GET /wifi/status`
  - `GET /wifi/networks`
  - `POST /wifi/scan`
  - `POST /wifi/connect`
  - `POST /wifi/disconnect`
  - `POST /wifi/toggle`

### B) Wi-Fi UI behavior
- Wi-Fi page redesigned for touch usability:
  - Left 1/3 controls (Refresh / On-Off / Connect / Disconnect).
  - Right 2/3 network list + password input.
- Added in-app touchscreen keyboard for password entry (no physical keyboard required):
  - opens when password input is tapped
  - supports key rows, Space, Backspace, Clear, Done.

## 5) USB + ADB + System Control Bridge

### A) USB/ADB bridge
- Script: `scripts/pi/usb_status_bridge.py`
- Service: `scripts/pi/usb-status-bridge.service`
- Port: `17373`
- Existing endpoints maintained (`/usb/mobile-status`, `/adb/note-test`, etc.).

### B) New system control endpoints (on USB bridge)
- `GET /system/lsusb`
- `GET /system/display-status`
- `POST /system/restart-adb`
- `POST /system/restart-bridges`
- `POST /system/restart-kiosk`
- `POST /system/exit-kiosk`
- `POST /system/create-kiosk-desktop-app`
- `POST /system/restart-pi`
- `POST /system/shutdown-pi`
- `POST /system/pull-latest`
- `POST /system/apply-update`
- `POST /system/display-apply`
- `POST /system/open-sudo-terminal`

### D) Kiosk exit + desktop shortcut reliability fixes
- `POST /system/exit-kiosk` now:
  - stops `raspi-kiosk.service`
  - verifies service state with `systemctl is-active`
  - applies process-kill fallback (`start-kiosk.sh` / kiosk chromium / xinit) if still active
  - returns detailed logs for troubleshooting from UI.
- `POST /system/create-kiosk-desktop-app` now creates launcher in multiple user locations:
  - XDG desktop directory from `~/.config/user-dirs.dirs` when available
  - `/home/<user>/Desktop`
  - `/home/<user>/.local/share/applications`
- Launcher `Exec` now runs via bash and sudo systemctl start command for better desktop compatibility.

### C) Apply update pipeline behavior
- Runs project update/deploy sequence from bridge side:
  - git pull
  - npm install
  - npm run build
  - sudo deploy dist to `/opt/raspi-launcher`
  - restart `raspi-kiosk.service`
- Uses configured app paths/env defaults in bridge.
- Follows kiosk deploy command intent:
  - `cd /home/duckydu/DuckyDu && git pull && npm install && npm run build && sudo rm -rf /opt/raspi-launcher/* && sudo cp -r dist/* /opt/raspi-launcher/ && sudo chown -R duckydu:duckydu /opt/raspi-launcher && sudo systemctl restart raspi-kiosk.service`

## 6) Install / Service Scripts
- Added unified bridge installer:
  - `scripts/pi/install-bridges.sh`
- Updated installers to deploy both bridges and enable both services:
  - `scripts/pi/install-kiosk.sh`
  - `scripts/pi/install-usb-bridge-only.sh`
  - `scripts/pi/install-bridges.sh`
- Installers now include additional dependencies for settings/system-display tooling:
  - `xcalib`
  - `xterm`
- Added sudoers template for bridge-managed system actions:
  - `scripts/pi/duckydu-bridge-sudoers`
  - includes both `/bin/systemctl` and `/usr/bin/systemctl` command paths (start/stop/restart) for compatibility.
  - fixed sudoers syntax issue by replacing problematic `chown user:group` rule with `chown -R user`.
  - includes kiosk service `start/stop` permissions for desktop launcher and exit action.

## 7) Vertical Menu Behavior
File: `src/components/VerticalMenu.jsx`
- Rotated clock, battery, Wi-Fi, cloud, live dot.
- Buttons:
  - Home: returns to launch screen.
  - Back: context-aware stage back.
  - Settings: opens system settings screen.

## 8) Back/Home Stage Rules
- Launch sub-pages (`launch-wifi`, `launch-profile`, `launch-settings`, `launch-update`) back to launch.
- Settings back returns to previous screen.
- Device Management/Device Loading back returns to cable wait stage.
- Home always returns to launch base state.

## 9) Key Project Files
- `src/main.jsx` -> app flow + screen routing + Wi-Fi UI + settings system actions.
- `src/style.css` -> all visual system/layout/animations.
- `src/components/VerticalMenu.jsx` -> shared side menu.
- `scripts/pi/usb_status_bridge.py` -> USB, ADB, and system control endpoints.
- `scripts/pi/wifi_status_bridge.py` -> dedicated Wi-Fi endpoints.
- `scripts/pi/install-bridges.sh` -> one-command bridge installer.
- `scripts/pi/duckydu-bridge-sudoers` -> sudoers template for safe command execution.

## 10) npm Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run usb-bridge` (legacy Node bridge script remains)

## 11) Current Known Notes
- Build passes.
- Python bridge syntax checks pass.
- Vite still warns for large chunk size (>500KB), non-blocking.
- System control buttons require proper Pi installation/restart of services and sudoers setup from install scripts.

## 12) Permanent Rules
- Hard UI rule: never allow screen/page expansion that introduces scrolling.
- Summary maintenance rule (new): after finishing any meaningful change, update `PROJECT_SUMMARY.md` in the same task by adding new items and editing outdated ones.

## 13) Suggested Next Steps
1. Wire real translation text switching for `EN/JP` state.
2. Replace samurai placeholder animation area with real lottie runtime if desired.
3. Add confirmation dialogs for destructive system actions (shutdown/reboot/apply update).
4. Add auth gate/role check for system-control buttons.
