#!/usr/bin/env python3
import json
import os
import re
import subprocess
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


def check_usb_status():
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
        }

    if result.returncode != 0:
        return {
            "connected": False,
            "detectedCount": 0,
            "matches": [],
            "error": "lsusb_failed",
        }

    parsed = parse_lsusb_output(result.stdout)
    parsed["timestamp"] = datetime.now(timezone.utc).isoformat()
    parsed["source"] = "lsusb"
    return parsed


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path != "/usb/mobile-status":
            self._write_json(404, {"error": "not_found"})
            return
        self._write_json(200, check_usb_status())

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
