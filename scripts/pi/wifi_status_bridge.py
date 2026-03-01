#!/usr/bin/env python3
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("WIFI_BRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("WIFI_BRIDGE_PORT", "17374"))
NMCLI_BIN = os.environ.get("NMCLI_BIN") or shutil.which("nmcli") or "/usr/bin/nmcli"


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

        self._write_json(404, {"error": "not_found"})

    def do_POST(self):
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
    print(f"wifi-status-bridge listening on http://{HOST}:{PORT}/wifi/status")
    server.serve_forever()


if __name__ == "__main__":
    main()
