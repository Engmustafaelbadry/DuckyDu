#!/usr/bin/env node
import { createServer } from "node:http";
import { execFile } from "node:child_process";

const PORT = Number(process.env.USB_BRIDGE_PORT || 17373);
const HOST = process.env.USB_BRIDGE_HOST || "127.0.0.1";

const KNOWN_PHONE_VENDOR_IDS = new Set([
  "05ac", // Apple
  "04e8", // Samsung
  "18d1", // Google
  "2717", // Xiaomi
  "12d1", // Huawei
  "2a70", // OnePlus
  "22d9", // OPPO
  "2a45", // vivo
  "2b4c", // realme
  "17ef" // Lenovo/Moto
]);

const MOBILE_KEYWORDS = [
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
  "adb"
];

function parseLsusbOutput(output) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const deviceLines = lines.filter((line) => !line.toLowerCase().includes("linux foundation"));

  const matches = deviceLines.filter((line) => {
    const lower = line.toLowerCase();
    const idMatch = lower.match(/\bid\s+([0-9a-f]{4}):([0-9a-f]{4})\b/);
    const vendorId = idMatch?.[1];

    if (vendorId && KNOWN_PHONE_VENDOR_IDS.has(vendorId)) {
      return true;
    }

    return MOBILE_KEYWORDS.some((keyword) => lower.includes(keyword));
  });

  return {
    connected: matches.length > 0,
    detectedCount: matches.length,
    matches
  };
}

function checkUsbStatus() {
  return new Promise((resolve) => {
    execFile("lsusb", [], { timeout: 2000 }, (error, stdout) => {
      if (error) {
        resolve({
          connected: false,
          detectedCount: 0,
          matches: [],
          error: "lsusb_unavailable"
        });
        return;
      }

      resolve(parseLsusbOutput(stdout));
    });
  });
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/usb/mobile-status") {
    const status = await checkUsbStatus();
    writeJson(res, 200, {
      ...status,
      timestamp: new Date().toISOString(),
      source: "lsusb"
    });
    return;
  }

  writeJson(res, 404, { error: "not_found" });
});

server.listen(PORT, HOST, () => {
  console.log(`usb-status-bridge listening on http://${HOST}:${PORT}/usb/mobile-status`);
});
