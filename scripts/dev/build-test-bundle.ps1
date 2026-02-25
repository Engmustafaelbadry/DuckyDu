$ErrorActionPreference = "Stop"

$root = Resolve-Path "."
$releaseDir = Join-Path $root "release"
$bundleRoot = Join-Path $releaseDir "DuckyDu-test"
$zipPath = Join-Path $releaseDir "DuckyDu-test.zip"

if (-not (Test-Path "node_modules")) {
  npm install
}

npm run build

if (Test-Path $bundleRoot) {
  Remove-Item -Recurse -Force $bundleRoot
}

New-Item -ItemType Directory -Force -Path $bundleRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $bundleRoot "dist") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $bundleRoot "scripts\\pi") | Out-Null

Copy-Item -Recurse -Force "dist\\*" (Join-Path $bundleRoot "dist")

$piScripts = @(
  "scripts\\pi\\install-kiosk.sh",
  "scripts\\pi\\install-local-test.sh",
  "scripts\\pi\\start-kiosk.sh",
  "scripts\\pi\\raspi-kiosk.service",
  "scripts\\pi\\display-touch-config.txt",
  "scripts\\pi\\touch-calibration-notes.md"
)

foreach ($file in $piScripts) {
  Copy-Item -Force $file (Join-Path $bundleRoot $file)
}

$quickStart = @'
# DuckyDu Test Bundle

On Raspberry Pi (Bookworm with Desktop):

1. Extract this folder to `/home/pi/DuckyDu-test`
2. Run:
   - `cd /home/pi/DuckyDu-test`
   - `sudo bash scripts/pi/install-kiosk.sh /home/pi/DuckyDu-test/dist`
3. Reboot:
   - `sudo reboot`

If touch is off, apply notes:
- `scripts/pi/display-touch-config.txt`
- `scripts/pi/touch-calibration-notes.md`
'@

Set-Content -Path (Join-Path $bundleRoot "QUICKSTART.md") -Value $quickStart -NoNewline

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Compress-Archive -Path "$bundleRoot\\*" -DestinationPath $zipPath
Write-Host "Bundle ready: $zipPath"
