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
  - Main Android/iOS cards now include subtitle lines:
    - Android: `Android OS based devices`
    - iOS: `Apple iPhone and iOS devices`
- Samurai animation behavior:
  - Horizontal only (left-right), hard step motion.
  - No vertical bounce.
  - No flip.

### C) Connect mode (Cable path)
- `Connect via` stage: Cable / Wireless.
- Connect via UI now follows Select OS visual ratio:
  - 2/3 left + 1/3 right.
  - Stage headers added:
    - `Connect via`
    - `Connect via = Cable`
  - Left stack: `Cable` (top), `Wireless` (middle), `Back` (bottom) with Select OS back-button sizing.
  - Cable and Wireless options now include simplified technical subtitle lines (no `+` phrasing).
  - Connect-via back button is left-aligned and half-width of card area.
  - Right side: animated pixel-library connect icon.
  - Connect icon animation size reduced.
  - Cable/Wireless cards use 50% background opacity.
- Cable wait stage polls:
  - `http://127.0.0.1:17373/usb/mobile-status`
  - `http://localhost:17373/usb/mobile-status`
- Removed folded selected-OS slot from connect-mode pages.
- Cable wait page is now full-screen panel with 50% transparent background and no folded OS card.
- Cable wait page action button changed back to small left-aligned `Cancel` button.
- Cable stage now includes a `Test` bypass button that opens Quick Start/Device Management flow without requiring an actual connected device (for UI/testing).
- Connect-mode pages now use the same outer header row position as Select OS (header moved outside panel) for identical top/start alignment.
- Connect panel content now starts/ends on the same rhythm as Select OS content area (matched row/gap/padding bounds).
- Connect-mode wrapper no longer uses Pixel card container; it now renders as page-level layout container (no card frame/shadow/clip-path).
- Connect-via inner content padding removed and left column top-packing removed so bottom Back-row alignment matches Select OS end gap.
- Connect/cable stage headers use same visual sizing as Select OS header.
- Connect/cable stage header sizing now uses the exact same shared CSS selector as Select OS header to prevent drift.
- Connect/cable stage headers now also reuse `select-os-header` class in JSX for exact visual parity.
- Connect/cable headers include local visual-size override to match Select OS appearance on device (optical parity, not only equal px).
- Connect-via back button keeps half-width placement while matching Select OS back button height/font.
- Connect-via back button now reuses `select-back-small` class directly and only overrides width/alignment.
- Connect-via back button metrics are explicitly locked (`height/font/padding`) to ensure parity across both layouts.
- Normalized connect-panel top padding so Select OS / Connect via / Connect via = Cable headers align to same top position.
- Back/Cancel subtitles removed from connect/select navigation buttons (returned to single-line labels).
- Select OS / Connect via / Connect via = Cable headers are now synchronized at larger display size for visual parity.
- Main Select OS Android/iOS card label sizes now match Connect-via option label sizing.
- Added larger icon-to-title spacing on Android/iOS main cards to match Connect-via option spacing style.
- Android/iOS and Cable/Wireless cards now share unified typography/spacing tokens (title/subtitle/icon paddings) for connected visual flow.
- Cable-stage `Cancel` button is centered.
- Connected state shows product/manufacturer and delayed Access button.
- Access button opens loading screen then Device Management.

### D) Device Management screen
- Added a new **Quick Start** stage before full Device Management (shown after Access Device loading).
- Quick Start layout is a 3x3 card grid with custom spans:
  - Row 1: `Unlock Device` spans 2 cells + `Copy Files` in the 3rd cell.
  - Row 2: `Install Cloud Controllers`, `Mirror Controller`, `Wipe All Data`.
  - Row 3: `More Functions` spans all 3 cells.
- Quick Start cards and actions:
  - `Unlock Device` -> enters existing Unlock Device flow directly.
  - `Install Cloud Controllers` -> opens Device Management on relevant group page.
  - `Copy Files` -> opens Device Management on relevant group page.
  - `Mirror Controller` -> opens Device Management on relevant group page.
  - `Wipe All Data` -> opens Device Management on relevant group page.
  - `More Functions` -> opens full Device Management groups view.
- Quick Start uses Pixel-style cards/icons and inherits the visual language of Device Management.
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
  - Gear now uses Pixel icon-library component style (white, slower stepped loop, no left-panel border/background).
  - Home buttons are top-aligned with tighter spacing, leaving free space below for future additions.
  - Home labels updated:
    - `Pixacho Display`
    - `Pixacho Configuration`
    - `Pixacho Terminal`
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
  - Right 2/3: 2-column operation grid (2 buttons per row) to fit full button set in page height.
- Customization page:
  - Open sudo terminal over kiosk (touch flow).
  - Exit Kiosk (`systemctl stop raspi-kiosk.service`).
  - Create Desktop Kiosk App launcher on Pi desktop.
- Result/output panel now appears only inside action pages (not on settings home).
- Display page has explicit top header within page content (`Display Settings`) followed by controls.
- Display page duplicate inner header removed; only the top settings page header remains (with back button).
- Fixed legacy CSS overlap: removed forced grid-row placement from display card so header stays pinned at top.
- Layout tuned to fit kiosk ratio with fixed-height sections and no page-level overflow/scroll.
- Settings UI now uses Pixelact components consistently for navigation/buttons/inputs.
- Launch screen settings icon now opens real `Settings` screen directly (not placeholder page).

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
  - tries desktop startup using multiple units (`display-manager.service`, `display-manager`, `lightdm.service`, `lightdm`) with fallback `graphical.target`
  - switches virtual terminal sequence (`vt7`, `vt1`, `vt2`) to avoid remaining on kiosk TTY error/log page
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
  - includes desktop return permissions for kiosk exit flow (`display-manager(.service)`, `lightdm(.service)`, `graphical.target`, `chvt 7/1/2`).
  - includes kiosk service `start/stop` permissions for desktop launcher and exit action.
- `raspi-kiosk.service` now includes `SuccessExitStatus=143 SIGTERM` so expected stop signals from Exit Kiosk are treated as normal exits.

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
- Connection/error text areas are now font-locked to Kongtext/Misaki (Wi-Fi bridge errors and cable status notes), and custom fonts use `font-display: block` to reduce fallback font switching.

## 12) Permanent Rules
- Hard UI rule: never allow screen/page expansion that introduces scrolling.
- Summary maintenance rule (new): after finishing any meaningful change, update `PROJECT_SUMMARY.md` in the same task by adding new items and editing outdated ones.

## 13) Suggested Next Steps
1. Wire real translation text switching for `EN/JP` state.
2. Replace samurai placeholder animation area with real lottie runtime if desired.
3. Add confirmation dialogs for destructive system actions (shutdown/reboot/apply update).
4. Add auth gate/role check for system-control buttons.
