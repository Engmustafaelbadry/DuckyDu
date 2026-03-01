#!/usr/bin/env python3
import json
import os
import re
import shutil
import subprocess
import threading
import time
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("USB_BRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("USB_BRIDGE_PORT", "17373"))

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

note_test_state = {
    "running": False,
    "lastStartedAt": None,
    "lastFinishedAt": None,
    "lastResult": None,
    "lastError": None,
}
note_test_lock = threading.Lock()


def encode_adb_input_text(value: str) -> str:
    # "adb shell input text" uses percent-style escapes. URL-encoding keeps literals safe.
    return urllib.parse.quote(value, safe="")


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
        time.sleep(1)
        _adb_cmd(["shell", "input", "text", encode_adb_input_text(NOTE_TEST_TEXT_2)], timeout=10)

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

        if self.path == "/adb/note-test-status":
            with note_test_lock:
                payload = dict(note_test_state)
            payload["adbBin"] = ADB_BIN
            self._write_json(200, payload)
            return

        self._write_json(404, {"error": "not_found"})

    def do_POST(self):
        if self.path != "/adb/note-test":
            self._write_json(404, {"error": "not_found"})
            return

        started = start_adb_note_test()
        if started:
            self._write_json(202, {"accepted": True, "status": "started"})
            return

        self._write_json(409, {"accepted": False, "status": "already_running"})

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
