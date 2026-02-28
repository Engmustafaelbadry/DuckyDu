# DuckyDu Kiosk - Project Summary (Updated)

## 1) Current Product State
- Platform: Raspberry Pi 5 kiosk UI.
- Framework: React + Vite.
- Visual direction: Pixelact-style UI with pixel icon sets and stepped pixel corners.
- Navigation model: flow-based screens, no top menu; shared left vertical menu on all screens.

## 2) Screen / Resolution Notes
- Target display: 800x480.
- Measured visible kiosk area on device: 780x460.
- App fills viewport (`html, body, #app` 100%).
- Main background: pure black (`#000000`).

## 3) Implemented Screen Flow

### A) Select OS screen
- Cards: Android, iOS, Other OS.
- Tap any card -> enters connect mode.
- Selected card folds to compact top card.
- Other cards hide.

### B) Connect mode (Cable path)
- `Connect via` stage: Cable / Wireless cards.
- Tap `Cable` -> cable waiting stage.
- Waiting stage polls local USB bridge endpoint:
  - `http://127.0.0.1:17373/usb/mobile-status`
  - `http://localhost:17373/usb/mobile-status`
- If no endpoint: shows `USB bridge offline`.
- If connected:
  - Status label: `Status: Connected` (green, larger)
  - Product Name and Manufacturer lines
  - Access slot behavior:
    - shows spinner for 3 seconds
    - then shows `Access Device` button in the same slot (no layout shift)

### C) Device Management screen
- Opened by pressing `Access Device`.
- Uses shared vertical menu.
- Top-right label shows current product name.
- Grouped pages with one group per page:
  1. Decrypt Data
  2. Data Management
  3. Device Management
  4. Delete Encryption
- Card layout is fixed 3x3, no scroll.
- Footer navigation:
  - Previous group button (from page 2 onward) on left
  - Next group button on right
  - equal button widths and one-line labels (ellipsis if long)
- Circle pagination buttons (numbered) for direct page jump.

### D) Settings screen
- Placeholder page implemented.
- Opened by left menu Settings button.
- Content intentionally minimal for future fill.

## 4) Vertical Menu Behavior
File: `src/components/VerticalMenu.jsx`

- Status area:
  - Rotated digital clock
  - Battery icon (rotated)
  - WiFi icon
  - Green cloud icon
  - Blinking green live dot (opacity 1.0 <-> 0.2)
- Menu buttons now wired:
  - Home: always returns to Select OS
  - Back: goes back one stage (context-aware)
  - Settings: opens Settings page

## 5) Back/Home Stage Rules
- From Device Management -> Back returns to connected-device cable stage.
- From cable stage -> Back returns to `Connect via` stage.
- From connect mode choose stage -> Back returns to Select OS normal mode.
- From Settings -> Back returns to previous screen.
- Home always returns to Select OS base state.

## 6) Device Management Groups and Cards

### Decrypt Data
- Unlock Device
- Unlock Safe Folder
- Access Hidden Files
- Access Root Files
- Decrypt Security
- Decrypt Biometrics
- Decrypt Apps Security
- Show Passwords

### Data Management
- Backup Data
- Delete All Data
- Hard Reset
- Upload Data To Cloud

### Device Management
- Device Cloud Mirror
- Install Permissions

### Delete Encryption
- Wipe All data
- Hard Reset
- Delete G Account
- Remove Login Credientals

## 7) Icon Mapping (Current)
Libraries used:
- `@iconify-json/pixel`
- `@iconify-json/pixelarticons`
- `@2hoch1/pixel-icon-library-react`

Examples:
- OS cards: `pixel:android`, `pixel:ios`, `Code` component for Other OS
- Status: battery / wifi / cloud
- Connect and group cards: pixelart/pixel icons mapped per card
- Show Passwords now uses a pixel password-style icon (not star-composition)

## 8) Styling Rules in Effect
File: `src/style.css`

- Pixel-step corner style (`--pixel-step`) with stepped `clip-path` corners.
- Pixel shadow framing (`--pixel-box-shadow`) on cards/buttons.
- No page scrolling behavior for card groups.
- **Hard UI rule:** never allow screen/page expansion that introduces scrolling.
  - For progressive logs (like Unlock Device), content must stay inside fixed-height containers.
  - Extra lines are clipped/contained; viewport must remain static with no scrollbars.
- Device cards tuned to fit fixed 3x3 grid.
- Prev/Next group buttons aligned left/right with equal width.

## 9) USB Detection Bridge

### Frontend usage
- UI polls local bridge every ~1.2s in cable wait stage.
- Connected state is driven by bridge JSON response.

### Bridge code
- `scripts/pi/usb_status_bridge.py`
- Endpoint: `/usb/mobile-status` on `127.0.0.1:17373`
- Detection strategy:
  - Prefer `/sys/bus/usb/devices` info for `manufacturer` and `productName`
  - Fallback to `lsusb` parsing

### Service files / install
- `scripts/pi/usb-status-bridge.service`
- `scripts/pi/install-usb-bridge-only.sh`
- `scripts/pi/install-kiosk.sh` updated to install/enable bridge
- `scripts/pi/start-kiosk.sh` has bridge launch support

## 10) Key Project Files
- `src/main.jsx` -> app flow + screens + USB polling + navigation logic
- `src/style.css` -> all layout/theme/animation styles
- `src/components/VerticalMenu.jsx` -> shared menu component
- `scripts/pi/usb_status_bridge.py` -> USB status local bridge
- `scripts/pi/usb-status-bridge.service` -> systemd unit
- `scripts/pi/install-usb-bridge-only.sh` -> targeted bridge installer

## 11) npm Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run usb-bridge` (Node bridge script remains available in repo)

## 12) Current Known Notes
- Build passes.
- Vite warns about large chunk size (>500KB), non-blocking.
- Samsung S24 Ultra was not detected on this setup; another phone was detected successfully.
- If `USB bridge offline` appears, service is missing/not running on Pi.

## 13) Next Suggested Steps
1. Wire actual actions for each management card.
2. Implement Wireless flow behavior (currently card present, no deeper flow).
3. Connect `Access Device` to backend task execution/auth gate if needed.
4. Optional optimization: split large bundle via route/code-splitting.
