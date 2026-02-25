param(
  [Parameter(Mandatory = $true)]
  [string]$PiHost,
  [string]$PiUser = "pi",
  [string]$TargetDir = "/home/pi/DuckyDu"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path "node_modules")) {
  npm install
}

npm run build

$sshTarget = "$PiUser@$PiHost"

ssh $sshTarget "mkdir -p $TargetDir/scripts/pi"
scp -r dist "$sshTarget`:$TargetDir/"
scp scripts/pi/install-kiosk.sh "$sshTarget`:$TargetDir/scripts/pi/"
scp scripts/pi/start-kiosk.sh "$sshTarget`:$TargetDir/scripts/pi/"
scp scripts/pi/raspi-kiosk.service "$sshTarget`:$TargetDir/scripts/pi/"
scp scripts/pi/display-touch-config.txt "$sshTarget`:$TargetDir/scripts/pi/"
scp scripts/pi/touch-calibration-notes.md "$sshTarget`:$TargetDir/scripts/pi/"

ssh $sshTarget "cd $TargetDir && sudo bash scripts/pi/install-kiosk.sh $TargetDir/dist"

Write-Host "DuckyDu deployed to $sshTarget"
Write-Host "Now reboot the Pi: ssh $sshTarget 'sudo reboot'"
