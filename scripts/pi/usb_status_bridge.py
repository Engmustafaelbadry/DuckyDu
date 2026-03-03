#!/usr/bin/env python3
import json
import os
import re
import shutil
import subprocess
import threading
import time
from pathlib import Path
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("USB_BRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("USB_BRIDGE_PORT", "17373"))
APP_USER = os.environ.get("APP_USER", "duckydu")
APP_REPO_DIR = os.environ.get("APP_REPO_DIR", "/home/duckydu/DuckyDu")
APP_DEPLOY_DIR = os.environ.get("APP_DEPLOY_DIR", "/opt/raspi-launcher")

KNOWN_PHONE_VENDOR_IDS = {
    "05ac",  # Apple
    "04e8",  # Samsung
    "18d1",  # Google
    "2717",  # Xiaomi
    "12d1",  # Huawei
    "2a70",  # OnePlus
    "22d9",  # OPPO
    "2a45",  # vivo
    "2b4c",  # realme
    "17ef",  # Lenovo/Moto
}

MOBILE_KEYWORDS = (
    "android",
    "iphone",
    "apple mobile",
    "samsung",
    "xiaomi",
    "huawei",
    "oneplus",
    "oppo",
    "vivo",
    "realme",
    "mtp",
    "adb",
)

NOTE_TEST_TEXT_1 = os.environ.get("ADB_NOTE_TEST_TEXT_1", "969869")
ADB_BIN = os.environ.get("ADB_BIN") or shutil.which("adb") or "/usr/bin/adb"
NMCLI_BIN = os.environ.get("NMCLI_BIN") or shutil.which("nmcli") or "/usr/bin/nmcli"
GIT_BIN = os.environ.get("GIT_BIN") or shutil.which("git") or "/usr/bin/git"
NPM_BIN = os.environ.get("NPM_BIN") or shutil.which("npm") or "/usr/bin/npm"
LSUSB_BIN = os.environ.get("LSUSB_BIN") or shutil.which("lsusb") or "/usr/bin/lsusb"
SUDO_BIN = os.environ.get("SUDO_BIN") or shutil.which("sudo") or "/usr/bin/sudo"
SYSTEMCTL_BIN = os.environ.get("SYSTEMCTL_BIN") or shutil.which("systemctl") or "/bin/systemctl"
REBOOT_BIN = os.environ.get("REBOOT_BIN") or shutil.which("reboot") or "/sbin/reboot"
SHUTDOWN_BIN = os.environ.get("SHUTDOWN_BIN") or shutil.which("shutdown") or "/sbin/shutdown"
XRANDR_BIN = os.environ.get("XRANDR_BIN") or shutil.which("xrandr") or "/usr/bin/xrandr"
XCALIB_BIN = os.environ.get("XCALIB_BIN") or shutil.which("xcalib") or "/usr/bin/xcalib"
XTERM_BIN = os.environ.get("XTERM_BIN") or shutil.which("xterm") or "/usr/bin/xterm"
PKILL_BIN = os.environ.get("PKILL_BIN") or shutil.which("pkill") or "/usr/bin/pkill"
CHVT_BIN = os.environ.get("CHVT_BIN") or shutil.which("chvt") or "/usr/bin/chvt"
DISPLAY_ENV = os.environ.get("DISPLAY", ":0")
XAUTHORITY_ENV = os.environ.get("XAUTHORITY", f"/home/{APP_USER}/.Xauthority")

note_test_state = {
    "running": False,
    "lastStartedAt": None,
    "lastFinishedAt": None,
    "lastResult": None,
    "lastError": None,
}
note_test_lock = threading.Lock()
display_state = {
    "brightness": 1.0,
    "contrast": 1.0,
    "gamma": 1.0,
    "saturation": 1.0,
}


def encode_adb_input_text(value: str) -> str:
    # "adb shell input text" treats % as an escape prefix and %s as space.
    # Use ADB-style escaping instead of URL encoding.
    return value.replace("%", "%%").replace(" ", "%s")


def parse_lsusb_output(text: str):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    device_lines = [line for line in lines if "linux foundation" not in line.lower()]
    matches = []

    for line in device_lines:
        lower = line.lower()
        id_match = re.search(r"\bid\s+([0-9a-f]{4}):([0-9a-f]{4})\b", lower)
        vendor_id = id_match.group(1) if id_match else None

        if vendor_id and vendor_id in KNOWN_PHONE_VENDOR_IDS:
            matches.append(line)
            continue

        if any(keyword in lower for keyword in MOBILE_KEYWORDS):
            matches.append(line)

    return {
        "connected": len(matches) > 0,
        "detectedCount": len(matches),
        "matches": matches,
    }


def read_text(path: Path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    except Exception:
        return ""


def list_usb_sysfs_devices():
    devices = []
    base = Path("/sys/bus/usb/devices")

    for dev in base.glob("*"):
        vendor = read_text(dev / "idVendor").lower()
        product_id = read_text(dev / "idProduct").lower()
        if not vendor or not product_id:
            continue

        manufacturer = read_text(dev / "manufacturer")
        product_name = read_text(dev / "product")
        serial = read_text(dev / "serial")
        summary = f"{manufacturer} {product_name}".strip().lower()

        devices.append(
            {
                "vendorId": vendor,
                "productId": product_id,
                "manufacturer": manufacturer or "Unknown",
                "productName": product_name or "Unknown",
                "serial": serial,
                "summary": summary,
            }
        )

    return devices


def check_usb_status():
    sys_devices = list_usb_sysfs_devices()
    sys_matches = []

    for dev in sys_devices:
        if dev["vendorId"] in KNOWN_PHONE_VENDOR_IDS:
            sys_matches.append(dev)
            continue

        if any(keyword in dev["summary"] for keyword in MOBILE_KEYWORDS):
            sys_matches.append(dev)

    if sys_matches:
        first = sys_matches[0]
        return {
            "connected": True,
            "detectedCount": len(sys_matches),
            "matches": [f"{d['manufacturer']} {d['productName']}".strip() for d in sys_matches],
            "manufacturer": first["manufacturer"] or "Unknown",
            "productName": first["productName"] or "Unknown",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "sysfs",
        }

    try:
        result = subprocess.run(
            ["lsusb"],
            capture_output=True,
            text=True,
            timeout=2,
            check=False,
        )
    except Exception:
        return {
            "connected": False,
            "detectedCount": 0,
            "matches": [],
            "error": "lsusb_unavailable",
            "manufacturer": "Unknown",
            "productName": "Unknown",
        }

    if result.returncode != 0:
        return {
            "connected": False,
            "detectedCount": 0,
            "matches": [],
            "error": "lsusb_failed",
            "manufacturer": "Unknown",
            "productName": "Unknown",
        }

    parsed = parse_lsusb_output(result.stdout)
    if parsed["matches"]:
        first = parsed["matches"][0]
        id_marker = re.search(r"\bID\s+[0-9a-f]{4}:[0-9a-f]{4}\s+(.+)$", first, flags=re.IGNORECASE)
        descriptor = id_marker.group(1).strip() if id_marker else ""
        parts = descriptor.split()
        parsed["manufacturer"] = " ".join(parts[:2]) if len(parts) >= 2 else (parts[0] if parts else "Unknown")
        parsed["productName"] = descriptor or "Unknown"
    else:
        parsed["manufacturer"] = "Unknown"
        parsed["productName"] = "Unknown"
    parsed["timestamp"] = datetime.now(timezone.utc).isoformat()
    parsed["source"] = "lsusb"
    return parsed


def _run_cmd(command: list[str], timeout: int = 10):
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )
    if result.returncode != 0:
        stderr = (result.stderr or "").strip() or (result.stdout or "").strip() or "command_failed"
        raise RuntimeError(f"{' '.join(command)} failed: {stderr}")


def _adb_cmd(args: list[str], timeout: int = 10):
    _run_cmd([ADB_BIN, *args], timeout=timeout)


def _adb_has_ready_device():
    result = subprocess.run(
        [ADB_BIN, "devices"],
        capture_output=True,
        text=True,
        timeout=8,
        check=False,
    )
    if result.returncode != 0:
        stderr = (result.stderr or "").strip() or "adb_devices_failed"
        raise RuntimeError(f"adb devices failed: {stderr}")

    lines = [line.strip() for line in (result.stdout or "").splitlines()[1:] if line.strip()]
    if not lines:
        raise RuntimeError("no_adb_device_detected")

    if any("\tdevice" in line for line in lines):
        return

    if any("\tunauthorized" in line for line in lines):
        raise RuntimeError("adb_device_unauthorized")

    if any("\tno permissions" in line for line in lines):
        raise RuntimeError("adb_no_permissions")

    raise RuntimeError(f"adb_not_ready: {lines[0]}")


def adb_note_test_worker():
    with note_test_lock:
        note_test_state["running"] = True
        note_test_state["lastStartedAt"] = datetime.now(timezone.utc).isoformat()
        note_test_state["lastResult"] = None
        note_test_state["lastError"] = None

    try:
        _adb_cmd(["start-server"], timeout=8)
        _adb_has_ready_device()
        _adb_cmd(["shell", "input", "text", encode_adb_input_text(NOTE_TEST_TEXT_1)], timeout=10)

        with note_test_lock:
            note_test_state["running"] = False
            note_test_state["lastFinishedAt"] = datetime.now(timezone.utc).isoformat()
            note_test_state["lastResult"] = "ok"
            note_test_state["lastError"] = None
    except Exception as exc:
        with note_test_lock:
            note_test_state["running"] = False
            note_test_state["lastFinishedAt"] = datetime.now(timezone.utc).isoformat()
            note_test_state["lastResult"] = "error"
            note_test_state["lastError"] = str(exc)


def start_adb_note_test():
    with note_test_lock:
        if note_test_state["running"]:
            return False

    worker = threading.Thread(target=adb_note_test_worker, daemon=True)
    worker.start()
    return True


def _run_cmd_capture(command: list[str], timeout: int = 25, cwd: str | None = None, env: dict | None = None):
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
        cwd=cwd,
        env=env,
    )
    stdout = (result.stdout or "").strip()
    stderr = (result.stderr or "").strip()
    return {
        "ok": result.returncode == 0,
        "returncode": result.returncode,
        "stdout": stdout,
        "stderr": stderr,
        "output": stdout or stderr,
    }


def get_lsusb_output():
    return _run_cmd_capture([LSUSB_BIN], timeout=6)


def restart_adb():
    kill_result = _run_cmd_capture([ADB_BIN, "kill-server"], timeout=8)
    start_result = _run_cmd_capture([ADB_BIN, "start-server"], timeout=8)
    devices_result = _run_cmd_capture([ADB_BIN, "devices"], timeout=8)
    ok = kill_result["ok"] and start_result["ok"] and devices_result["ok"]
    output = "\n".join(
        [
            "adb kill-server:",
            kill_result["output"] or "ok",
            "adb start-server:",
            start_result["output"] or "ok",
            "adb devices:",
            devices_result["output"] or "ok",
        ]
    )
    return {"ok": ok, "output": output}


def restart_bridges_async():
    def worker():
        time.sleep(0.8)
        _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "restart", "wifi-status-bridge.service"], timeout=15)
        _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "restart", "usb-status-bridge.service"], timeout=15)

    threading.Thread(target=worker, daemon=True).start()
    return {"ok": True, "output": "Bridge restart scheduled."}


def restart_kiosk():
    result = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "restart", "raspi-kiosk.service"], timeout=20)
    return {"ok": result["ok"], "output": result["output"] or "kiosk restart requested"}


def stop_kiosk():
    logs = []
    stop_result = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "stop", "raspi-kiosk.service"], timeout=20)
    logs.append(f"systemctl stop: {stop_result['output'] or 'ok'}")

    status_after_stop = _run_cmd_capture([SYSTEMCTL_BIN, "is-active", "raspi-kiosk.service"], timeout=8)
    active_after_stop = status_after_stop["stdout"].strip() == "active"
    logs.append(f"service state after stop: {status_after_stop['stdout'] or status_after_stop['stderr'] or 'unknown'}")

    if active_after_stop and PKILL_BIN and Path(PKILL_BIN).exists():
        for pattern in ("start-kiosk.sh", "chromium --kiosk", "chromium-browser --kiosk", "xinit /usr/local/bin/start-kiosk.sh"):
            kill_result = _run_cmd_capture([PKILL_BIN, "-f", pattern], timeout=6)
            if kill_result["returncode"] in (0, 1):
                logs.append(f"pkill -f '{pattern}': {kill_result['output'] or 'ok'}")
            else:
                logs.append(f"pkill -f '{pattern}' failed: {kill_result['output'] or 'error'}")

        second_stop = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "stop", "raspi-kiosk.service"], timeout=20)
        logs.append(f"systemctl stop retry: {second_stop['output'] or 'ok'}")
        status_after_stop = _run_cmd_capture([SYSTEMCTL_BIN, "is-active", "raspi-kiosk.service"], timeout=8)
        active_after_stop = status_after_stop["stdout"].strip() == "active"
        logs.append(f"service state after retry: {status_after_stop['stdout'] or status_after_stop['stderr'] or 'unknown'}")

    desktop_started = False
    for desktop_service in ("display-manager.service", "display-manager", "lightdm.service", "lightdm"):
        start_desktop = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "start", desktop_service], timeout=20)
        logs.append(f"start {desktop_service}: {start_desktop['output'] or 'ok'}")
        if start_desktop["ok"]:
            desktop_started = True
            break

    # Fallback: request graphical target if direct DM start is unavailable.
    if not desktop_started:
        graphical_result = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "start", "graphical.target"], timeout=20)
        logs.append(f"start graphical.target: {graphical_result['output'] or 'ok'}")
        desktop_started = graphical_result["ok"]

    if CHVT_BIN and Path(CHVT_BIN).exists():
        for vt in ("7", "1", "2"):
            chvt_result = _run_cmd_capture([SUDO_BIN, CHVT_BIN, vt], timeout=6)
            logs.append(f"switch vt{vt}: {chvt_result['output'] or 'ok'}")

    ok = stop_result["ok"] and not active_after_stop
    return {"ok": ok, "output": "\n".join(logs)}


def start_kiosk():
    result = _run_cmd_capture([SUDO_BIN, SYSTEMCTL_BIN, "start", "raspi-kiosk.service"], timeout=20)
    return {"ok": result["ok"], "output": result["output"] or "kiosk start requested"}


def create_desktop_kiosk_app():
    home_dir = Path(f"/home/{APP_USER}")
    xdg_desktop_dir = home_dir / "Desktop"
    user_dirs_file = home_dir / ".config" / "user-dirs.dirs"

    if user_dirs_file.exists():
        user_dirs_text = read_text(user_dirs_file)
        match = re.search(r'^\s*XDG_DESKTOP_DIR\s*=\s*"?([^"\n]+)"?\s*$', user_dirs_text, flags=re.MULTILINE)
        if match:
            candidate = match.group(1).replace("$HOME", str(home_dir)).replace("${HOME}", str(home_dir)).strip()
            if candidate:
                xdg_desktop_dir = Path(candidate)

    launcher_dirs = [
        xdg_desktop_dir,
        home_dir / "Desktop",
        home_dir / ".local" / "share" / "applications",
    ]

    content = """[Desktop Entry]
Type=Application
Name=Start DuckyDu Kiosk
Comment=Start DuckyDu kiosk service
Exec=/bin/bash -lc "sudo systemctl start raspi-kiosk.service"
Icon=utilities-terminal
Terminal=true
Categories=System;
"""

    created_paths = []
    errors = []

    for launcher_dir in launcher_dirs:
        try:
            launcher_dir.mkdir(parents=True, exist_ok=True)
            launcher_path = launcher_dir / "Start-DuckyDu-Kiosk.desktop"
            launcher_path.write_text(content, encoding="utf-8")
            launcher_path.chmod(0o755)
            created_paths.append(str(launcher_path))
        except Exception as exc:
            errors.append(f"{launcher_dir}: {exc}")

    if created_paths:
        output = "desktop launcher created:\n" + "\n".join(created_paths)
        if errors:
            output += "\npartial errors:\n" + "\n".join(errors)
        return {"ok": True, "output": output}

    return {"ok": False, "output": "failed to create launcher:\n" + "\n".join(errors or ["no_target_dirs"])}


def restart_pi():
    result = _run_cmd_capture([SUDO_BIN, REBOOT_BIN], timeout=8)
    return {"ok": result["ok"], "output": result["output"] or "reboot requested"}


def shutdown_pi():
    result = _run_cmd_capture([SUDO_BIN, SHUTDOWN_BIN, "-h", "now"], timeout=8)
    return {"ok": result["ok"], "output": result["output"] or "shutdown requested"}


def pull_latest_code():
    if not Path(APP_REPO_DIR).exists():
        return {"ok": False, "output": f"repo not found: {APP_REPO_DIR}"}

    result = _run_cmd_capture([GIT_BIN, "pull"], timeout=45, cwd=APP_REPO_DIR)
    return {"ok": result["ok"], "output": result["output"] or "git pull completed"}


def apply_update_pipeline():
    if not Path(APP_REPO_DIR).exists():
        return {"ok": False, "output": f"repo not found: {APP_REPO_DIR}"}

    logs = []

    steps = [
        {"display": f"{GIT_BIN} pull", "command": [GIT_BIN, "pull"], "timeout": 60, "cwd": APP_REPO_DIR},
        {"display": f"{NPM_BIN} install", "command": [NPM_BIN, "install"], "timeout": 120, "cwd": APP_REPO_DIR},
        {"display": f"{NPM_BIN} run build", "command": [NPM_BIN, "run", "build"], "timeout": 180, "cwd": APP_REPO_DIR},
        {
            "display": f"{SUDO_BIN} rm -rf {APP_DEPLOY_DIR}/*",
            "command": ["bash", "-lc", f"{SUDO_BIN} rm -rf {APP_DEPLOY_DIR}/*"],
            "timeout": 20,
            "cwd": None,
        },
        {
            "display": f"{SUDO_BIN} cp -r {APP_REPO_DIR}/dist/* {APP_DEPLOY_DIR}/",
            "command": ["bash", "-lc", f"{SUDO_BIN} cp -r {APP_REPO_DIR}/dist/* {APP_DEPLOY_DIR}/"],
            "timeout": 20,
            "cwd": None,
        },
        {
            "display": f"chown -R {APP_USER} {APP_DEPLOY_DIR}",
            "command": [SUDO_BIN, "chown", "-R", APP_USER, APP_DEPLOY_DIR],
            "timeout": 20,
            "cwd": None,
        },
        {
            "display": f"{SUDO_BIN} {SYSTEMCTL_BIN} restart raspi-kiosk.service",
            "command": [SUDO_BIN, SYSTEMCTL_BIN, "restart", "raspi-kiosk.service"],
            "timeout": 20,
            "cwd": None,
        },
    ]

    for step in steps:
        result = _run_cmd_capture(step["command"], timeout=step["timeout"], cwd=step["cwd"])
        logs.append(f"$ {step['display']}")
        logs.append(result["output"] or "ok")
        if not result["ok"]:
            return {"ok": False, "output": "\n".join(logs)}

    return {"ok": True, "output": "\n".join(logs)}


def _x11_env():
    env = os.environ.copy()
    env["DISPLAY"] = DISPLAY_ENV
    env["XAUTHORITY"] = XAUTHORITY_ENV
    return env


def _clamp(value: float, min_value: float, max_value: float):
    return max(min_value, min(max_value, value))


def _detect_active_output():
    query = _run_cmd_capture([XRANDR_BIN, "--query"], timeout=8, env=_x11_env())
    if not query["ok"]:
        raise RuntimeError(query["output"] or "xrandr_query_failed")

    lines = query["stdout"].splitlines()
    primary = None
    connected = None

    for line in lines:
        if " connected primary " in line:
            primary = line.split()[0]
            break
        if " connected " in line and connected is None:
            connected = line.split()[0]

    output = primary or connected
    if not output:
        raise RuntimeError("display_output_not_found")
    return output


def _display_status_payload(output_name: str):
    return {
        "output": output_name,
        "brightness": display_state["brightness"],
        "contrast": display_state["contrast"],
        "gamma": display_state["gamma"],
        "saturation": display_state["saturation"],
    }


def _read_xrandr_live_values(output_name: str):
    result = _run_cmd_capture([XRANDR_BIN, "--verbose"], timeout=10, env=_x11_env())
    if not result["ok"]:
        return {}

    lines = result["stdout"].splitlines()
    capture = False
    brightness = None
    gamma = None

    for line in lines:
        stripped = line.strip()
        if line.startswith(output_name + " "):
            capture = True
            continue

        if capture and line and not line.startswith(" "):
            break

        if capture and stripped.startswith("Brightness:"):
            try:
                brightness = float(stripped.split(":", 1)[1].strip())
            except Exception:
                brightness = None

        if capture and stripped.startswith("Gamma:"):
            try:
                gamma_raw = stripped.split(":", 1)[1].strip()
                gamma = float(gamma_raw.split(":")[0])
            except Exception:
                gamma = None

    payload = {}
    if brightness is not None:
        payload["brightness"] = brightness
    if gamma is not None:
        payload["gamma"] = gamma
    return payload


def get_display_status():
    output_name = _detect_active_output()
    payload = _display_status_payload(output_name)
    live = _read_xrandr_live_values(output_name)
    payload.update(live)
    return payload


def apply_display_controls(payload: dict):
    brightness = _clamp(float(payload.get("brightness", display_state["brightness"])), 0.4, 1.6)
    contrast = _clamp(float(payload.get("contrast", display_state["contrast"])), 0.5, 1.5)
    gamma = _clamp(float(payload.get("gamma", display_state["gamma"])), 0.6, 2.0)
    saturation = _clamp(float(payload.get("saturation", display_state["saturation"])), 0.5, 1.5)

    output_name = _detect_active_output()
    x11_env = _x11_env()

    xrandr_result = _run_cmd_capture(
        [
            XRANDR_BIN,
            "--output",
            output_name,
            "--brightness",
            f"{brightness:.2f}",
            "--gamma",
            f"{gamma:.2f}:{gamma:.2f}:{gamma:.2f}",
        ],
        timeout=10,
        env=x11_env,
    )
    if not xrandr_result["ok"]:
        raise RuntimeError(xrandr_result["output"] or "display_apply_failed")

    contrast_result = _run_cmd_capture(
        [XCALIB_BIN, "-d", DISPLAY_ENV, "-co", str(int(contrast * 100)), "-a"],
        timeout=10,
        env=x11_env,
    )
    if not contrast_result["ok"]:
        raise RuntimeError(contrast_result["output"] or "contrast_apply_failed")

    saturation_prop = str(int((saturation - 1.0) * 100))
    saturation_result = _run_cmd_capture(
        [XRANDR_BIN, "--output", output_name, "--set", "Saturation", saturation_prop],
        timeout=10,
        env=x11_env,
    )

    saturation_note = "applied"
    if not saturation_result["ok"]:
        saturation_note = "saturation_property_unavailable"

    display_state["brightness"] = brightness
    display_state["contrast"] = contrast
    display_state["gamma"] = gamma
    display_state["saturation"] = saturation

    return {
        "ok": True,
        "output": f"display applied on {output_name} (saturation: {saturation_note})",
        **_display_status_payload(output_name),
    }


def open_sudo_terminal():
    command = [
        SUDO_BIN,
        XTERM_BIN,
        "-fa",
        "Monospace",
        "-fs",
        "12",
        "-bg",
        "black",
        "-fg",
        "#2dff73",
        "-e",
        "bash",
        "-lc",
        "sudo -s",
    ]
    result = _run_cmd_capture(command, timeout=8, env=_x11_env())
    return {"ok": result["ok"], "output": result["output"] or "sudo terminal requested"}


def _read_json_body(handler: BaseHTTPRequestHandler):
    length_header = handler.headers.get("Content-Length", "0").strip()
    if not length_header:
        return {}

    try:
        length = int(length_header)
    except Exception:
        return {}

    if length <= 0:
        return {}

    raw = handler.rfile.read(length)
    if not raw:
        return {}

    try:
        parsed = json.loads(raw.decode("utf-8"))
    except Exception:
        return {}

    return parsed if isinstance(parsed, dict) else {}


def _run_nmcli(args: list[str], timeout: int = 12):
    if not NMCLI_BIN or not Path(NMCLI_BIN).exists():
        raise RuntimeError("nmcli_unavailable")

    result = subprocess.run(
        [NMCLI_BIN, *args],
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )

    if result.returncode != 0:
        stderr = (result.stderr or "").strip() or (result.stdout or "").strip() or "nmcli_failed"
        raise RuntimeError(stderr)

    return (result.stdout or "").strip()


def _parse_nmcli_multiline_blocks(output: str):
    blocks = []
    current = {}

    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line:
            if current:
                blocks.append(current)
                current = {}
            continue

        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        current[key.strip().lower()] = value.strip()

    if current:
        blocks.append(current)

    return blocks


def _get_wifi_interface():
    output = _run_nmcli(["-t", "-f", "DEVICE,TYPE", "device", "status"])
    for line in output.splitlines():
        parts = line.split(":")
        if len(parts) >= 2 and parts[1] == "wifi":
            return parts[0]
    return ""


def _get_ip_for_interface(interface_name: str):
    if not interface_name:
        return ""

    try:
        output = subprocess.run(
            ["ip", "-4", "addr", "show", "dev", interface_name],
            capture_output=True,
            text=True,
            timeout=4,
            check=False,
        )
    except Exception:
        return ""

    if output.returncode != 0:
        return ""

    match = re.search(r"\binet\s+(\d+\.\d+\.\d+\.\d+)", output.stdout or "")
    return match.group(1) if match else ""


def get_wifi_status():
    enabled_raw = _run_nmcli(["-t", "-f", "WIFI", "general"]).lower()
    enabled = enabled_raw == "enabled"

    interface_name = _get_wifi_interface()
    device_output = _run_nmcli(["-t", "-f", "DEVICE,TYPE,STATE,CONNECTION", "device", "status"])
    connected = False
    connection_name = ""

    for line in device_output.splitlines():
        parts = line.split(":")
        if len(parts) < 4:
            continue
        if parts[1] != "wifi":
            continue

        state = parts[2].lower()
        connection_name = parts[3].strip()
        connected = state == "connected" and connection_name not in {"--", ""}
        break

    return {
        "enabled": enabled,
        "connected": connected,
        "ssid": connection_name if connected else "",
        "interface": interface_name,
        "ipAddress": _get_ip_for_interface(interface_name) if connected else "",
    }


def list_wifi_networks(rescan_mode: str = "auto"):
    output = _run_nmcli(
        [
            "-m",
            "multiline",
            "-f",
            "ACTIVE,SSID,SECURITY,SIGNAL,BARS",
            "device",
            "wifi",
            "list",
            "--rescan",
            rescan_mode,
        ],
        timeout=18,
    )
    blocks = _parse_nmcli_multiline_blocks(output)
    networks = []

    for block in blocks:
        ssid = block.get("ssid", "").strip()
        if not ssid:
            continue

        signal_raw = block.get("signal", "0").strip()
        try:
            signal = int(signal_raw)
        except Exception:
            signal = 0

        networks.append(
            {
                "ssid": ssid,
                "active": block.get("active", "").lower().startswith("yes"),
                "security": block.get("security", "").strip(),
                "signal": signal,
                "bars": block.get("bars", "").strip(),
            }
        )

    networks.sort(key=lambda n: (n["active"], n["signal"]), reverse=True)
    return {"networks": networks}


def connect_wifi(ssid: str, password: str):
    if not ssid:
        raise RuntimeError("ssid_required")

    args = ["device", "wifi", "connect", ssid]
    if password:
        args.extend(["password", password])

    _run_nmcli(args, timeout=30)
    return {"ok": True, "ssid": ssid}


def disconnect_wifi():
    interface_name = _get_wifi_interface()
    if not interface_name:
        raise RuntimeError("wifi_interface_not_found")

    _run_nmcli(["device", "disconnect", interface_name], timeout=15)
    return {"ok": True, "interface": interface_name}


def toggle_wifi(enabled: bool):
    _run_nmcli(["radio", "wifi", "on" if enabled else "off"], timeout=10)
    return {"ok": True, "enabled": enabled}


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/usb/mobile-status":
            self._write_json(200, check_usb_status())
            return

        if self.path == "/wifi/status":
            try:
                self._write_json(200, get_wifi_status())
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/wifi/networks":
            try:
                self._write_json(200, list_wifi_networks("auto"))
            except Exception as exc:
                self._write_json(500, {"error": str(exc), "networks": []})
            return

        if self.path == "/system/lsusb":
            result = get_lsusb_output()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/display-status":
            try:
                self._write_json(200, get_display_status())
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/adb/note-test-status":
            with note_test_lock:
                payload = dict(note_test_state)
            payload["adbBin"] = ADB_BIN
            self._write_json(200, payload)
            return

        self._write_json(404, {"error": "not_found"})

    def do_POST(self):
        if self.path == "/adb/note-test":
            started = start_adb_note_test()
            if started:
                self._write_json(202, {"accepted": True, "status": "started"})
                return

            self._write_json(409, {"accepted": False, "status": "already_running"})
            return

        if self.path == "/wifi/scan":
            try:
                self._write_json(200, list_wifi_networks("yes"))
            except Exception as exc:
                self._write_json(500, {"error": str(exc), "networks": []})
            return

        if self.path == "/wifi/connect":
            body = _read_json_body(self)
            ssid = str(body.get("ssid", "")).strip()
            password = str(body.get("password", "")).strip()
            try:
                self._write_json(200, connect_wifi(ssid, password))
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/wifi/disconnect":
            try:
                self._write_json(200, disconnect_wifi())
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/wifi/toggle":
            body = _read_json_body(self)
            enabled = bool(body.get("enabled", True))
            try:
                self._write_json(200, toggle_wifi(enabled))
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/system/restart-adb":
            result = restart_adb()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/restart-bridges":
            result = restart_bridges_async()
            self._write_json(202, result)
            return

        if self.path == "/system/restart-kiosk":
            result = restart_kiosk()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/exit-kiosk":
            result = stop_kiosk()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/create-kiosk-desktop-app":
            result = create_desktop_kiosk_app()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/restart-pi":
            result = restart_pi()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/shutdown-pi":
            result = shutdown_pi()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/pull-latest":
            result = pull_latest_code()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/apply-update":
            result = apply_update_pipeline()
            self._write_json(200 if result["ok"] else 500, result)
            return

        if self.path == "/system/display-apply":
            body = _read_json_body(self)
            try:
                self._write_json(200, apply_display_controls(body))
            except Exception as exc:
                self._write_json(500, {"error": str(exc)})
            return

        if self.path == "/system/open-sudo-terminal":
            result = open_sudo_terminal()
            self._write_json(200 if result["ok"] else 500, result)
            return

        self._write_json(404, {"error": "not_found"})

    def _write_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        return


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"usb-status-bridge listening on http://{HOST}:{PORT}/usb/mobile-status")
    server.serve_forever()


if __name__ == "__main__":
    main()
