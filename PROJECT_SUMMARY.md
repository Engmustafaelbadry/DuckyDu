# DuckyDu Kiosk - Project Summary

## 1) Current Goal and Direction
- Project is a kiosk UI for Raspberry Pi 5 touch display.
- Current design direction is **pixel style** using Pixelact UI components and pixel icon libraries.
- Main active screen is **Select OS** with flow-based navigation (no top menu).
- The left vertical menu is shared across screens and extracted as a reusable component.

## 2) Screen / Device Notes
- Physical display target: 800x480.
- Measured visible canvas in browser kiosk context: **780x460** (20px missing in each axis was reported).
- Current layout is built to fill app viewport (`html, body, #app` at 100%).
- Main background is solid black `#000000`.

## 3) Current UX Flow (Implemented)
- Initial screen shows:
  - Android card
  - iOS card
  - Other OS card
  - Bottom action button (`Cancel`)
- Tapping **any OS card** enters connect mode:
  - Selected card folds to compact top card.
  - Other cards are hidden.
  - `Connect via` panel appears with:
    - Cable option (pixel icon + label)
    - Wireless option (pixel icon + label)
  - Bottom action changes from `Cancel` to `Back`.
- Tapping `Back` exits connect mode and restores OS selection screen.

## 4) Shared Vertical Menu (Implemented)
- File: `src/components/VerticalMenu.jsx`
- Contains:
  - Rotated digital clock (updates every second)
  - Battery icon (rotated)
  - WiFi icon
  - Green cloud icon
  - Blinking green live dot (opacity toggles 100% <-> 20%)
  - Bottom icon buttons: Home, Back, Settings
- Menu is imported into main screen and designed to be reusable for all pages.

## 5) Current Visual Rules / Styling
- Main stylesheet: `src/style.css`
- Fonts:
  - English: `Kongtext` (`/fonts/kongtext/...`)
  - Japanese: `Misaki` (`/fonts/misaki_gothic.ttf`)
- Theme:
  - Black background only.
  - Pixel/cut-corner shapes via `clip-path`.
  - No heavy shadows.
  - Status/menu/icons mostly white with green status accents.
- Connect panel:
  - Borderless container.
  - Two inner connect option cards with `2px` white border and pixel-cut corners.
  - Added internal padding to avoid edge touching.

## 6) Icon Sources (Current)
- `@2hoch1/pixel-icon-library-react`
  - Used for menu/nav icons and `Other OS` icon (`Code`) plus back icon in bottom button.
- `@iconify-json/pixel` + `@iconify/react`
  - Used for OS icons:
    - Android (`pixel:android`)
    - iOS (`pixel:ios`)
- `@iconify-json/pixelarticons` + `@iconify/react`
  - Used for status and connect icons:
    - battery-medium, wifi, cloud, link

## 7) File Structure (Core)
- `src/main.jsx`
  - Main Select OS screen and connect-mode state.
- `src/components/VerticalMenu.jsx`
  - Reusable left vertical status/navigation rail.
- `src/style.css`
  - Global + screen layout + animation and pixel styling.

## 8) Dependencies Installed (from package.json)
- Runtime:
  - `react`, `react-dom`
  - Pixel + icon libs: `@2hoch1/pixel-icon-library-react`, `@iconify/react`, `@iconify-json/pixel`, `@iconify-json/pixelarticons`
  - UI system libs already present: Radix packages, shadcn ecosystem utils, etc.
- Dev:
  - `vite`, `@vitejs/plugin-react`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `shadcn`

## 9) Scripts
- `npm run dev` -> local dev server on `0.0.0.0:5173`
- `npm run build` -> production build
- `npm run preview` -> preview server on `0.0.0.0:4173`

## 10) Current Animation Behavior
- Pixel-step style transitions (`steps(12, end)`) used for card/panel transitions.
- Connect panel fade/scale entrance.
- Live green dot uses strict two-level blink (1.0 and 0.2 opacity).

## 11) Known Current Notes
- Build succeeds.
- Vite warns chunk size > 500 kB (non-blocking).
- Some compact icon offsets are manually tuned:
  - generic compact icon offset
  - iOS and Other OS compact icon overrides

## 12) Recommended Next Work Items
1. Add real action handlers for:
   - Home / Back / Settings menu buttons
   - Cable / Wireless connection choices
2. Split Select OS into separate screen components/routes if flow expands.
3. Add kiosk-safe hit areas and touch feedback states for resistive touchscreen.
4. Final pass on exact pixel spacing/alignment using on-device measurements.
