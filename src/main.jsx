import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon } from "@iconify/react";
import {
  ArrowLeftSolid,
  CogSolid,
  LinkSolid
} from "@2hoch1/pixel-icon-library-react/icons";
import pixelIcons from "@iconify-json/pixel/icons.json";
import pixelarticons from "@iconify-json/pixelarticons/icons.json";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Card, CardContent } from "@/components/ui/pixelact-ui/card";
import { Spinner } from "@/components/ui/pixelact-ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/pixelact-ui/avatar";
import { Input } from "@/components/ui/pixelact-ui/input";
import { VerticalMenu } from "@/components/VerticalMenu";
import "./style.css";

const osIconDefaults = {
  width: pixelIcons.width,
  height: pixelIcons.height
};

const androidOsIcon = {
  ...osIconDefaults,
  ...pixelIcons.icons.android
};

const iosOsIcon = {
  ...osIconDefaults,
  ...pixelIcons.icons.ios
};

const statusIconDefaults = {
  width: pixelarticons.width,
  height: pixelarticons.height
};

const otherOsIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.grid
};

const connectCableIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.link
};

const connectWirelessIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.wifi
};

const arrowRightIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons["arrow-right"]
};

const launchWifiIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.wifi
};

const launchProfileIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.user
};

const launchSettingsIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.sliders
};

const launchUpdateIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons["reload-sharp"]
};

const launchLanguageIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.globe
};

const DEVICE_GROUPS = [
  {
    name: "Decrypt Data",
    items: [
      { label: "Unlock Device", icon: "unlock", source: "art", tone: "green", action: "unlock-device" },
      { label: "Unlock Safe Folder", icon: "inbox-full", source: "art", tone: "blue" },
      { label: "Access Hidden Files", icon: "hidden", source: "art", tone: "purple" },
      { label: "Access Root Files", icon: "terminal-sharp", source: "art", tone: "amber" },
      { label: "Decrypt Security", icon: "grid-3x3-sharp", source: "art", tone: "lime" },
      { label: "Decrypt Biometrics", icon: "ai-scan-sharp", source: "art", tone: "teal" },
      { label: "Decrypt Apps Security", icon: "blocks-sharp", source: "art", tone: "indigo" },
      { label: "Show Passwords", icon: "lock-solid", source: "pixel", tone: "gray" }
    ]
  },
  {
    name: "Data Management",
    items: [
      { label: "Backup Data", icon: "database", source: "art", tone: "cyan" },
      { label: "Delete All Data", icon: "delete-sharp", source: "art", tone: "red" },
      { label: "Hard Reset", icon: "reload-sharp", source: "art", tone: "orange" },
      { label: "Upload Data To Cloud", icon: "cloud-upload", source: "art", tone: "indigo" }
    ]
  },
  {
    name: "Device Management",
    items: [
      { label: "Device Cloud Mirror", icon: "cloud-server", source: "art", tone: "teal" },
      { label: "Install Permissions", icon: "shield", source: "art", tone: "lime" }
    ]
  },
  {
    name: "Delete Encryption",
    items: [
      { label: "Wipe All data", icon: "delete", source: "art", tone: "red" },
      { label: "Hard Reset", icon: "reload-sharp", source: "art", tone: "orange" },
      { label: "Delete Google Account", icon: "google", source: "pixel", tone: "magenta" },
      { label: "Remove Login Credientals", icon: "user-minus-sharp", source: "art", tone: "gray" }
    ]
  }
];

const QUICK_START_ITEMS = [
  {
    id: "unlock",
    area: "unlock",
    title: "Unlock Device",
    subtitle: "Unlock Device PIN Code",
    icon: "unlock",
    source: "art",
    tone: "green",
    action: "unlock-device",
    startPage: 0
  },
  {
    id: "copy",
    area: "copy",
    title: "Copy Files",
    subtitle: "Copy all files to inserted drive",
    icon: "database",
    source: "art",
    tone: "cyan",
    startPage: 1
  },
  {
    id: "install_cloud",
    area: "install",
    title: "Install Cloud Controllers",
    subtitle: "Install permissions controllers",
    icon: "shield",
    source: "art",
    tone: "lime",
    startPage: 2
  },
  {
    id: "mirror",
    area: "mirror",
    title: "Mirror Controller",
    subtitle: "Access device mirror over the cloud",
    icon: "cloud-server",
    source: "art",
    tone: "teal",
    startPage: 2
  },
  {
    id: "wipe",
    area: "wipe",
    title: "Wipe All Data",
    subtitle: "Hard reset the device and delete all files",
    icon: "delete",
    source: "art",
    tone: "red",
    startPage: 3
  },
  {
    id: "more",
    area: "more",
    title: "More Functions",
    subtitle: "Access all features and controllers",
    icon: "grid-3x3-sharp",
    source: "art",
    tone: "gray",
    isMore: true,
    startPage: 0
  }
];

const iconMap = {
  android: { type: "iconify", icon: androidOsIcon },
  ios: { type: "iconify", icon: iosOsIcon },
  other: { type: "iconify", icon: otherOsIcon }
};

const USB_STATUS_URLS = [
  "http://127.0.0.1:17373/usb/mobile-status",
  "http://localhost:17373/usb/mobile-status"
];

const ADB_NOTE_TEST_URLS = [
  "http://127.0.0.1:17373/adb/note-test",
  "http://localhost:17373/adb/note-test"
];

const WIFI_STATUS_URLS = [
  "http://127.0.0.1:17374/wifi/status",
  "http://localhost:17374/wifi/status"
];

const WIFI_NETWORKS_URLS = [
  "http://127.0.0.1:17374/wifi/networks",
  "http://localhost:17374/wifi/networks"
];

const WIFI_SCAN_URLS = [
  "http://127.0.0.1:17374/wifi/scan",
  "http://localhost:17374/wifi/scan"
];

const WIFI_CONNECT_URLS = [
  "http://127.0.0.1:17374/wifi/connect",
  "http://localhost:17374/wifi/connect"
];

const WIFI_DISCONNECT_URLS = [
  "http://127.0.0.1:17374/wifi/disconnect",
  "http://localhost:17374/wifi/disconnect"
];

const WIFI_TOGGLE_URLS = [
  "http://127.0.0.1:17374/wifi/toggle",
  "http://localhost:17374/wifi/toggle"
];

const SYSTEM_LSUSB_URLS = [
  "http://127.0.0.1:17373/system/lsusb",
  "http://localhost:17373/system/lsusb"
];

const SYSTEM_RESTART_ADB_URLS = [
  "http://127.0.0.1:17373/system/restart-adb",
  "http://localhost:17373/system/restart-adb"
];

const SYSTEM_RESTART_BRIDGES_URLS = [
  "http://127.0.0.1:17373/system/restart-bridges",
  "http://localhost:17373/system/restart-bridges"
];

const SYSTEM_RESTART_KIOSK_URLS = [
  "http://127.0.0.1:17373/system/restart-kiosk",
  "http://localhost:17373/system/restart-kiosk"
];

const SYSTEM_RESTART_PI_URLS = [
  "http://127.0.0.1:17373/system/restart-pi",
  "http://localhost:17373/system/restart-pi"
];

const SYSTEM_SHUTDOWN_PI_URLS = [
  "http://127.0.0.1:17373/system/shutdown-pi",
  "http://localhost:17373/system/shutdown-pi"
];

const SYSTEM_PULL_LATEST_URLS = [
  "http://127.0.0.1:17373/system/pull-latest",
  "http://localhost:17373/system/pull-latest"
];

const SYSTEM_APPLY_UPDATE_URLS = [
  "http://127.0.0.1:17373/system/apply-update",
  "http://localhost:17373/system/apply-update"
];

const SYSTEM_DISPLAY_STATUS_URLS = [
  "http://127.0.0.1:17373/system/display-status",
  "http://localhost:17373/system/display-status"
];

const SYSTEM_DISPLAY_APPLY_URLS = [
  "http://127.0.0.1:17373/system/display-apply",
  "http://localhost:17373/system/display-apply"
];

const SYSTEM_OPEN_SUDO_TERMINAL_URLS = [
  "http://127.0.0.1:17373/system/open-sudo-terminal",
  "http://localhost:17373/system/open-sudo-terminal"
];

const SYSTEM_EXIT_KIOSK_URLS = [
  "http://127.0.0.1:17373/system/exit-kiosk",
  "http://localhost:17373/system/exit-kiosk"
];

const SYSTEM_CREATE_KIOSK_DESKTOP_APP_URLS = [
  "http://127.0.0.1:17373/system/create-kiosk-desktop-app",
  "http://localhost:17373/system/create-kiosk-desktop-app"
];

const WIFI_OSK_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
];

const UNLOCK_LOG_LINES = [
  "Initializing secure channel...",
  "Binding device session context...",
  "Verifying USB data transport...",
  "Reading lockscreen service status...",
  "Enumerating authentication endpoints...",
  "Loading secure unlock module...",
  "Checking credential policy rules...",
  "Validating trusted host signature...",
  "Synchronizing unlock pipeline...",
  "Requesting lockscreen focus token...",
  "Switching interaction mode to passcode...",
  "Preparing keypad event channel...",
  "Sending unlock event packet 01...",
  "Sending unlock event packet 02...",
  "Sending unlock event packet 03...",
  "Sending unlock event packet 04...",
  "Sending unlock event packet 05...",
  "Sending unlock event packet 06...",
  "Awaiting lockscreen acknowledgment...",
  "Verifying credential checksum...",
  "Checking anti-replay protection...",
  "Applying unlock state transition...",
  "Validating home-screen readiness...",
  "Refreshing application process map...",
  "Updating security handshake state...",
  "Confirming unlock result code...",
  "Persisting trusted session channel...",
  "Stabilizing post-unlock transport...",
  "Revalidating device access scope...",
  "Finalizing unlock operation..."
];

function parseUsbDeviceInfo(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return { manufacturer: "Unknown", productName: "Unknown" };
  }

  const first = String(matches[0]);
  const idMarker = first.match(/\bID\s+[0-9a-f]{4}:[0-9a-f]{4}\s+(.+)$/i);
  const descriptor = idMarker?.[1]?.trim() || "";

  if (!descriptor) {
    return { manufacturer: "Unknown", productName: "Unknown" };
  }

  const parts = descriptor.split(/\s+/);
  const manufacturer = parts.length >= 2 ? parts.slice(0, 2).join(" ") : parts[0] || "Unknown";
  const productName = descriptor;

  return { manufacturer, productName };
}

function normalizeUsbDeviceInfo(payload) {
  if (payload && (payload.productName || payload.manufacturer)) {
    return {
      manufacturer: payload.manufacturer || "Unknown",
      productName: payload.productName || "Unknown"
    };
  }

  return parseUsbDeviceInfo(payload?.matches);
}

function OsCard({ id, label, subtitle = "", selected, onSelect, className = "", compact = false }) {
  const iconConfig = iconMap[id];
  const iconClassName = `pixel-icon${id === "other" ? " pixel-icon-small" : ""}${compact ? " pixel-icon-compact" : ""}`;
  const iconElement = <Icon icon={iconConfig.icon} className={iconClassName} />;

  return (
    <button
      className={`os-card-btn${selected ? " is-selected" : ""} ${className}`}
      onClick={() => onSelect(id)}
      aria-pressed={selected}
    >
      <Card className={`os-card os-${id}${id !== "other" ? " os-main" : ""}`}>
        <CardContent className="os-card-content">
          {iconElement}
          <div className="os-text">
            <h2>{label}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function buildFeatureIcon(item) {
  return item.source === "pixel"
    ? { width: pixelIcons.width, height: pixelIcons.height, ...pixelIcons.icons[item.icon] }
    : { ...statusIconDefaults, ...pixelarticons.icons[item.icon] };
}

async function requestBridgeJson(urls, options) {
  let lastError = new Error("bridge_unreachable");

  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        let payload = {};
        try {
          payload = await response.json();
        } catch {
          payload = {};
        }
        throw new Error(payload.error || `bridge_http_${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("bridge_http_")) {
        throw error;
      }
      if (error instanceof Error && error.message !== "Failed to fetch") {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("bridge_unreachable");
    }
  }

  throw new Error(lastError.message || "bridge_unreachable");
}

function WifiSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [bridgeOnline, setBridgeOnline] = useState(true);
  const [status, setStatus] = useState({
    enabled: true,
    connected: false,
    ssid: "",
    ipAddress: "",
    interface: ""
  });
  const [networks, setNetworks] = useState([]);
  const [selectedSsid, setSelectedSsid] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const selectedNetwork = networks.find((item) => item.ssid === selectedSsid) || null;
  const selectedNeedsPassword = Boolean(selectedNetwork && selectedNetwork.security && selectedNetwork.security !== "--");

  const loadStatus = useCallback(async () => {
    const data = await requestBridgeJson(WIFI_STATUS_URLS);
    setStatus({
      enabled: Boolean(data.enabled),
      connected: Boolean(data.connected),
      ssid: data.ssid || "",
      ipAddress: data.ipAddress || "",
      interface: data.interface || ""
    });
  }, []);

  const loadNetworks = useCallback(async () => {
    const data = await requestBridgeJson(WIFI_NETWORKS_URLS);
    const nextNetworks = Array.isArray(data.networks) ? data.networks.filter((item) => item.ssid) : [];
    setNetworks(nextNetworks);

    const connectedNetwork = nextNetworks.find((item) => item.active);
    if (connectedNetwork) {
      setSelectedSsid(connectedNetwork.ssid);
      return;
    }

    if (nextNetworks.length > 0 && !nextNetworks.some((item) => item.ssid === selectedSsid)) {
      setSelectedSsid(nextNetworks[0].ssid);
    }
  }, [selectedSsid]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadStatus(), loadNetworks()]);
      setBridgeOnline(true);
    } catch (error) {
      setBridgeOnline(false);
      setMessage(error instanceof Error ? error.message : "Wi-Fi bridge is offline.");
    } finally {
      setLoading(false);
    }
  }, [loadNetworks, loadStatus]);

  useEffect(() => {
    refreshAll();
    const timer = setInterval(refreshAll, 8000);
    return () => clearInterval(timer);
  }, [refreshAll]);

  const runAction = async (action) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await refreshAll();
    } catch (error) {
      const isOffline = error instanceof Error && error.message === "bridge_unreachable";
      setBridgeOnline(!isOffline);
      setMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleScan = () =>
    runAction(async () => {
      await requestBridgeJson(WIFI_SCAN_URLS, { method: "POST", headers: { "Content-Type": "application/json" } });
      setMessage("Wi-Fi list refreshed.");
    });

  const handleToggle = () =>
    runAction(async () => {
      await requestBridgeJson(WIFI_TOGGLE_URLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !status.enabled })
      });
      setMessage(!status.enabled ? "Wi-Fi enabled." : "Wi-Fi disabled.");
    });

  const handleConnect = () =>
    runAction(async () => {
      if (!selectedSsid) {
        setMessage("Select a network first.");
        return;
      }

      await requestBridgeJson(WIFI_CONNECT_URLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid: selectedSsid, password: password || undefined })
      });
      setPassword("");
      setMessage(`Connected request sent to ${selectedSsid}.`);
    });

  const handleDisconnect = () =>
    runAction(async () => {
      await requestBridgeJson(WIFI_DISCONNECT_URLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      setMessage("Disconnected from Wi-Fi.");
    });

  const prettyMessage = (raw) =>
    String(raw || "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const appendPasswordKey = (key) => setPassword((value) => `${value}${key}`);
  const backspacePassword = () => setPassword((value) => value.slice(0, -1));
  const clearPassword = () => setPassword("");

  return (
    <Card className="launch-panel-card wifi-panel-card">
      <CardContent className="launch-panel-content wifi-panel-content">
        <div className="wifi-header-row">
          <h3>Wi-Fi Settings</h3>
          <span className={`wifi-chip${status.connected ? " is-online" : status.enabled ? " is-idle" : " is-off"}`}>
            {status.connected ? "ONLINE" : status.enabled ? "IDLE" : "OFF"}
          </span>
        </div>

        <div className="wifi-meta-grid">
          <p><span>SSID</span>{status.ssid || "-"}</p>
          <p><span>IP</span>{status.ipAddress || "-"}</p>
          <p><span>Interface</span>{status.interface || "-"}</p>
        </div>

        {loading ? (
          <div className="launch-panel-loading">
            <Spinner />
          </div>
        ) : (
          <div className="wifi-workspace">
            <section className="wifi-left-actions">
              <Button className="launch-action-btn" onClick={handleScan} disabled={busy}>
                Refresh
              </Button>
              <Button className="launch-action-btn" onClick={handleToggle} disabled={busy}>
                {status.enabled ? "Turn Off" : "Turn On"}
              </Button>
              <Button className="launch-action-btn" onClick={handleConnect} disabled={busy || !status.enabled || !selectedNetwork}>
                Connect
              </Button>
              <Button variant="destructive" className="launch-action-btn" onClick={handleDisconnect} disabled={busy || !status.connected}>
                Disconnect
              </Button>
            </section>

            <section className="wifi-right-pane">
              <div className="wifi-network-list">
                {networks.length === 0 ? (
                  <p className="wifi-list-empty">No networks found. Press Refresh.</p>
                ) : (
                  networks.map((item) => (
                    <button
                      key={`${item.ssid}-${item.security}`}
                      className={`wifi-network-item${selectedSsid === item.ssid ? " is-selected" : ""}${item.active ? " is-active" : ""}`}
                      onClick={() => setSelectedSsid(item.ssid)}
                      disabled={!status.enabled || busy}
                    >
                      <span className="wifi-network-name">{item.ssid}</span>
                      <span className="wifi-network-meta">{item.signal}% {item.security || "open"} {item.active ? "| connected" : ""}</span>
                    </button>
                  ))
                )}
              </div>

              <Input
                type="password"
                value={password}
                readOnly
                onFocus={() => setShowKeyboard(true)}
                onClick={() => setShowKeyboard(true)}
                className="wifi-password-input"
                placeholder={selectedNeedsPassword ? "Tap to enter password" : "No password needed for selected network"}
                disabled={busy || !status.enabled || !selectedNeedsPassword}
              />

              {showKeyboard && selectedNeedsPassword ? (
                <div className="wifi-osk">
                  {WIFI_OSK_ROWS.map((row) => (
                    <div className="wifi-osk-row" key={row.join("-")}>
                      {row.map((key) => (
                        <button key={key} className="wifi-osk-key" onClick={() => appendPasswordKey(key)}>
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}

                  <div className="wifi-osk-row wifi-osk-row-actions">
                    <button className="wifi-osk-key" onClick={() => appendPasswordKey(" ")}>
                      Space
                    </button>
                    <button className="wifi-osk-key" onClick={backspacePassword}>
                      Backspace
                    </button>
                    <button className="wifi-osk-key" onClick={clearPassword}>
                      Clear
                    </button>
                    <button className="wifi-osk-key wifi-osk-key-done" onClick={() => setShowKeyboard(false)}>
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        )}

        {!bridgeOnline ? <p className="wifi-message error">Wi-Fi bridge offline on port 17374.</p> : null}
        {message ? <p className="wifi-message">{prettyMessage(message)}</p> : null}
      </CardContent>
    </Card>
  );
}

function ProfilePanel() {
  return (
    <Card className="launch-panel-card">
      <CardContent className="launch-panel-content profile-panel-content">
        <h3>Profile</h3>
        <Avatar size="large" variant="square" className="profile-avatar">
          <AvatarFallback>PX</AvatarFallback>
        </Avatar>
        <p>PIXACHO Operator</p>
      </CardContent>
    </Card>
  );
}

function SettingsComingSoonPanel() {
  return (
    <Card className="launch-panel-card">
      <CardContent className="launch-panel-content profile-panel-content">
        <h3>Settings</h3>
        <p>Coming soon.</p>
      </CardContent>
    </Card>
  );
}

function UpdatePanel() {
  return (
    <Card className="launch-panel-card">
      <CardContent className="launch-panel-content profile-panel-content">
        <h3>Update</h3>
        <p>Update center coming soon.</p>
      </CardContent>
    </Card>
  );
}

function LaunchScreen({
  onStart,
  onOpenWifi,
  onOpenProfile,
  onOpenQuickSettings,
  onOpenUpdate,
  onHome,
  onBack,
  onSettings,
  uiLanguage,
  onToggleLanguage
}) {
  return (
    <main className="launch-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={onBack} onSettings={onSettings} />

        <section className="launch-screen">
          <section className="launch-left">
            <div className="launch-title-wrap">
              <h1 className="launch-title-jp">ピクサチョ</h1>
              <h2 className="launch-title-en">PIXACHO</h2>
              <p className="launch-subtitle-jp">ハッキングはただのゲーム</p>
              <p className="launch-subtitle-en">HACKING IS JUST A GAME</p>
            </div>

            <Button className="launch-start-btn" onClick={onStart}>
              Start...
            </Button>
          </section>

          <section className="launch-right">
            <div className="launch-icon-column">
              <button
                className="launch-icon-btn"
                onClick={onOpenQuickSettings}
                aria-label="Settings"
              >
                <Icon icon={launchSettingsIcon} />
              </button>
              <button
                className="launch-icon-btn"
                onClick={onOpenWifi}
                aria-label="Wi-Fi Settings"
              >
                <Icon icon={launchWifiIcon} />
              </button>
              <button
                className="launch-icon-btn"
                onClick={onOpenProfile}
                aria-label="Profile"
              >
                <Icon icon={launchProfileIcon} />
              </button>
              <button
                className="launch-icon-btn"
                onClick={onOpenUpdate}
                aria-label="Update"
              >
                <Icon icon={launchUpdateIcon} />
              </button>
              <button
                className="launch-icon-btn launch-lang-btn"
                onClick={onToggleLanguage}
                aria-label="Language"
              >
                <Icon icon={launchLanguageIcon} />
                <span>{uiLanguage}</span>
              </button>
            </div>

            <div className="launch-version-row" aria-label="Version">
              <Icon icon={launchUpdateIcon} className="launch-version-icon" />
              <span>Version 2.0.115</span>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function LaunchSubScreen({ title, children, onHome, onBack, onSettings }) {
  return (
    <main className="launch-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={onBack} onSettings={onSettings} />

        <section className="launch-subscreen">
          <header className="launch-subscreen-header">
            <h2>{title}</h2>
            <Button variant="destructive" className="launch-subscreen-back" onClick={onBack}>
              Back
            </Button>
          </header>
          <section className="launch-subscreen-content">{children}</section>
        </section>
      </section>
    </main>
  );
}

function DeviceManagementScreen({
  productName,
  onHome,
  onBack,
  onSettings,
  initialPageIndex = 0,
  initialTask = null
}) {
  const [pageIndex, setPageIndex] = useState(Math.max(0, Math.min(DEVICE_GROUPS.length - 1, Number(initialPageIndex) || 0)));
  const [activeTask, setActiveTask] = useState(initialTask);
  const [activeTaskTitle, setActiveTaskTitle] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [taskPhase, setTaskPhase] = useState("idle");
  const currentGroup = DEVICE_GROUPS[pageIndex];
  const hasPrev = pageIndex > 0;
  const hasNext = pageIndex < DEVICE_GROUPS.length - 1;
  const prevGroupName = hasPrev ? DEVICE_GROUPS[pageIndex - 1].name : "";
  const nextGroupName = hasNext ? DEVICE_GROUPS[pageIndex + 1].name : "";

  useEffect(() => {
    const safePageIndex = Math.max(0, Math.min(DEVICE_GROUPS.length - 1, Number(initialPageIndex) || 0));
    setPageIndex(safePageIndex);
    setActiveTask(initialTask);
    setTaskPhase("idle");
    setVisibleLines(0);
    setProgress(0);
  }, [initialPageIndex, initialTask]);

  useEffect(() => {
    if (!activeTask) {
      setActiveTaskTitle("");
      return;
    }

    for (const group of DEVICE_GROUPS) {
      const match = group.items.find((item) => item.action === activeTask);
      if (match) {
        setActiveTaskTitle(match.label);
        return;
      }
    }

    setActiveTaskTitle("Task");
  }, [activeTask]);

  useEffect(() => {
    if (activeTask !== "unlock-device") {
      return;
    }

    setTaskPhase("running");
    setVisibleLines(0);
    setProgress(0);

    const totalMs = 10000;
    const weights = UNLOCK_LOG_LINES.map(() => 0.5 + Math.random());
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const durations = weights.map((weight) => (weight / totalWeight) * totalMs);

    let cumulative = 0;
    const timeouts = [];

    durations.forEach((duration, idx) => {
      cumulative += duration;
      const t = setTimeout(() => {
        setVisibleLines(idx + 1);
        setProgress(Math.round(((idx + 1) / UNLOCK_LOG_LINES.length) * 100));
      }, Math.round(cumulative));
      timeouts.push(t);
    });

    const doneTimeout = setTimeout(() => {
      setTaskPhase("dispatching");
    }, totalMs + 120);
    timeouts.push(doneTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [activeTask]);

  useEffect(() => {
    if (activeTask !== "unlock-device" || taskPhase !== "dispatching") {
      return;
    }

    let active = true;

    const triggerAdbNoteTest = async () => {
      for (const url of ADB_NOTE_TEST_URLS) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "note_test" })
          });
          if (response.ok || response.status === 409) {
            break;
          }
        } catch {
          // Try next URL
        }
      }
    };

    triggerAdbNoteTest();

    const timer = setTimeout(() => {
      if (!active) {
        return;
      }
      setTaskPhase("success");
    }, 3000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeTask, taskPhase]);

  const successIcon = {
    ...statusIconDefaults,
    ...pixelarticons.icons["checkbox-on-sharp"]
  };

  const startTask = (item) => {
    if (!item.action) {
      return;
    }
    setActiveTask(item.action);
    setActiveTaskTitle(item.label);
  };

  const closeTask = () => {
    setActiveTask(null);
    setActiveTaskTitle("");
    setTaskPhase("idle");
    setVisibleLines(0);
    setProgress(0);
  };

  const handleMenuBack = () => {
    if (activeTask) {
      closeTask();
      return;
    }
    onBack();
  };

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={handleMenuBack} onSettings={onSettings} />

        <section className="device-screen">
          <header className="device-header">
            <h2>{activeTask ? activeTaskTitle : currentGroup.name}</h2>
            <div className="device-product-label">Device: {productName || "Unknown"}</div>
          </header>

          {activeTask === "unlock-device" ? (
            <Card className="unlock-task-card">
              <CardContent className="unlock-task-content">
                {taskPhase === "running" ? (
                  <>
                    <div className="unlock-log-list">
                      {UNLOCK_LOG_LINES.slice(Math.max(0, visibleLines - 12), visibleLines).map((line, idx) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    <div className="unlock-progress-wrap">
                      <div className="unlock-progress-track">
                        <div className="unlock-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p>{progress}%</p>
                    </div>
                  </>
                ) : taskPhase === "dispatching" ? (
                  <div className="unlock-dispatching">
                    <Spinner className="unlock-dispatch-spinner" />
                    <p>Sending request to device...</p>
                  </div>
                ) : (
                  <div className="unlock-success">
                    <Icon icon={successIcon} className="unlock-success-icon" />
                    <h3>Unlocked</h3>
                    <Button className="unlock-back-btn" onClick={closeTask}>
                      Back
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="device-cards-grid">
                {currentGroup.items.map((item) => {
                  const itemIcon = buildFeatureIcon(item);

                  return (
                    <button key={item.label} className="device-card-btn" onClick={() => startTask(item)}>
                      <Card className={`device-card tone-${item.tone}`}>
                        <CardContent className="device-card-content">
                          <Icon icon={itemIcon} className="device-card-icon" />
                          <p>{item.label}</p>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>

              <footer className="device-footer">
                <div className="group-nav-buttons">
                  {hasPrev ? (
                    <button className="next-group-btn prev-group-btn nav-btn-left" onClick={() => setPageIndex((idx) => idx - 1)}>
                      <Icon icon={arrowRightIcon} className="next-group-icon prev-group-icon" />
                      <span>{prevGroupName}</span>
                    </button>
                  ) : (
                    <div className="group-nav-placeholder" />
                  )}

                  {hasNext ? (
                    <button className="next-group-btn nav-btn-right" onClick={() => setPageIndex((idx) => idx + 1)}>
                      <span>{nextGroupName}</span>
                      <Icon icon={arrowRightIcon} className="next-group-icon" />
                    </button>
                  ) : (
                    <div className="group-nav-placeholder" />
                  )}
                </div>

                <div className="device-pagination">
                  {DEVICE_GROUPS.map((group, idx) => (
                    <button
                      key={group.name}
                      className={`page-dot${idx === pageIndex ? " is-active" : ""}`}
                      onClick={() => setPageIndex(idx)}
                      aria-label={`Go to page ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </footer>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function DeviceQuickStartScreen({
  productName,
  onHome,
  onBack,
  onSettings,
  onOpenMoreFunctions,
  onOpenUnlockFlow,
  onOpenGroup
}) {
  const handleQuickStartClick = (item) => {
    if (item.isMore) {
      onOpenMoreFunctions();
      return;
    }
    if (item.action === "unlock-device") {
      onOpenUnlockFlow();
      return;
    }
    onOpenGroup(item.startPage ?? 0);
  };

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={onBack} onSettings={onSettings} />

        <section className="device-screen">
          <header className="device-header">
            <h2>Quick Start</h2>
            <div className="device-product-label">Device: {productName || "Unknown"}</div>
          </header>

          <div className="quickstart-grid">
            {QUICK_START_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`device-card-btn quickstart-card-btn quickstart-area-${item.area}`}
                onClick={() => handleQuickStartClick(item)}
              >
                <Card className={`device-card quickstart-card tone-${item.tone}`}>
                  <CardContent className="quickstart-card-content">
                    <Icon icon={buildFeatureIcon(item)} className="quickstart-bg-icon" />
                    <div className="quickstart-text">
                      <p className="quickstart-title">{item.title}</p>
                      <p className="quickstart-subtitle">{item.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function DeviceLoadingScreen({ productName, onHome, onBack, onSettings, onDone }) {
  const loadingLines = [
    "Initializing device session...",
    "Reading supported feature set...",
    "Binding secure data channels...",
    "Loading tool permissions...",
    "Preparing device management modules..."
  ];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const lineTimer = setInterval(() => {
      setVisibleCount((count) => Math.min(count + 1, loadingLines.length));
    }, 650);

    const doneTimer = setTimeout(() => {
      onDone();
    }, 4000);

    return () => {
      clearInterval(lineTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={onBack} onSettings={onSettings} />

        <section className="device-loading-screen">
          <Card className="device-loading-card">
            <CardContent className="device-loading-content">
              <h2>Connecting Device</h2>
              <p className="device-loading-product">Device Name: {productName || "Unknown"}</p>
              <Spinner className="device-loading-spinner" />
              <div className="device-loading-lines">
                {loadingLines.map((line, idx) => (
                  <p key={line} className={idx < visibleCount ? "" : "loading-line-placeholder"}>
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}

function SettingsScreen({ onHome, onBack, onSettings }) {
  const DISPLAY_LIMITS = {
    brightness: { min: 0.4, max: 1.6, step: 0.01 },
    contrast: { min: 0.5, max: 1.5, step: 0.01 },
    gamma: { min: 0.6, max: 2.0, step: 0.01 },
    saturation: { min: 0.5, max: 1.5, step: 0.01 }
  };

  const [settingsPage, setSettingsPage] = useState("home");
  const [busyKey, setBusyKey] = useState("");
  const [resultLog, setResultLog] = useState("No command run yet.");
  const [displayControls, setDisplayControls] = useState({
    brightness: 1,
    contrast: 1,
    gamma: 1,
    saturation: 1
  });

  const setDisplayValue = (key, value) => {
    const bounds = DISPLAY_LIMITS[key];
    const safeValue = Number.isFinite(value) ? Math.max(bounds.min, Math.min(bounds.max, value)) : bounds.min;
    setDisplayControls((prev) => ({ ...prev, [key]: safeValue }));
  };

  const nudgeDisplayValue = (key, direction) => {
    const bounds = DISPLAY_LIMITS[key];
    const current = displayControls[key];
    setDisplayValue(key, Number((current + bounds.step * direction).toFixed(2)));
  };

  const setDisplayValueFromInput = (key, raw) => {
    if (raw === "" || raw === "-" || raw === ".") {
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      setDisplayValue(key, parsed);
    }
  };

  const loadDisplayStatus = useCallback(async () => {
    try {
      const payload = await requestBridgeJson(SYSTEM_DISPLAY_STATUS_URLS, { method: "GET" });
      setDisplayControls({
        brightness: Number(payload?.brightness ?? 1),
        contrast: Number(payload?.contrast ?? 1),
        gamma: Number(payload?.gamma ?? 1),
        saturation: Number(payload?.saturation ?? 1)
      });
    } catch {
      // Keep defaults if status endpoint is unavailable.
    }
  }, []);

  useEffect(() => {
    loadDisplayStatus();
  }, [loadDisplayStatus]);

  const runSystemAction = async (label, urls) => {
    setBusyKey(label);
    setResultLog(`Running ${label}...`);
    try {
      const payload = await requestBridgeJson(urls, { method: "POST", headers: { "Content-Type": "application/json" } });
      setResultLog(payload?.output || `${label} completed.`);
    } catch (error) {
      setResultLog(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusyKey("");
    }
  };

  const applyDisplay = async () => {
    setBusyKey("apply display");
    setResultLog("Applying display controls...");
    try {
      const payload = await requestBridgeJson(SYSTEM_DISPLAY_APPLY_URLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(displayControls)
      });
      setResultLog(payload?.output || "Display controls applied.");
      await loadDisplayStatus();
    } catch (error) {
      setResultLog(error instanceof Error ? error.message : "Apply display failed");
    } finally {
      setBusyKey("");
    }
  };

  const resetDisplay = async () => {
    const resetValues = { brightness: 1, contrast: 1, gamma: 1, saturation: 1 };
    setDisplayControls(resetValues);
    setBusyKey("reset display");
    setResultLog("Resetting display controls...");
    try {
      const payload = await requestBridgeJson(SYSTEM_DISPLAY_APPLY_URLS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetValues)
      });
      setResultLog(payload?.output || "Display controls reset.");
      await loadDisplayStatus();
    } catch (error) {
      setResultLog(error instanceof Error ? error.message : "Reset display failed");
    } finally {
      setBusyKey("");
    }
  };

  const runLsusb = async () => {
    setBusyKey("lsusb");
    setResultLog("Running lsusb...");
    try {
      const payload = await requestBridgeJson(SYSTEM_LSUSB_URLS, { method: "GET" });
      setResultLog(payload?.output || "No lsusb output.");
    } catch (error) {
      setResultLog(error instanceof Error ? error.message : "lsusb failed");
    } finally {
      setBusyKey("");
    }
  };

  const pageTitle =
    settingsPage === "display"
      ? "Display Settings"
      : settingsPage === "pixacho"
        ? "Pixacho Configuration"
        : settingsPage === "customization"
          ? "Customization"
          : "Settings";

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu onHome={onHome} onBack={onBack} onSettings={onSettings} />

        <section className="settings-screen">
          <Card className="settings-card">
            <CardContent className="settings-card-content">
              <div className="settings-page-header">
                <h2>{pageTitle}</h2>
                {settingsPage !== "home" ? (
                  <Button className="settings-page-back-btn" onClick={() => setSettingsPage("home")} disabled={Boolean(busyKey)}>
                    Back
                  </Button>
                ) : null}
              </div>

              {settingsPage === "home" ? (
                <div className="settings-home-layout">
                  <div className="settings-home-gear-wrap">
                    <CogSolid className="settings-home-gear" />
                  </div>
                  <div className="settings-home-grid">
                    <Button className="settings-home-btn" onClick={() => setSettingsPage("display")}>Pixacho Display</Button>
                    <Button className="settings-home-btn" onClick={() => setSettingsPage("pixacho")}>Pixacho Configuration</Button>
                    <Button className="settings-home-btn" onClick={() => setSettingsPage("customization")}>Pixacho Terminal</Button>
                  </div>
                </div>
              ) : null}

              {settingsPage === "display" ? (
                <section className="settings-section-card display-section-card settings-page-content">
                  <div className="display-control-input">
                    <label>Brightness</label>
                    <div className="display-input-wrap">
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("brightness", -1)} disabled={Boolean(busyKey)}>-</Button>
                      <Input
                        type="number"
                        className="display-number-input"
                        min={DISPLAY_LIMITS.brightness.min}
                        max={DISPLAY_LIMITS.brightness.max}
                        step={DISPLAY_LIMITS.brightness.step}
                        value={displayControls.brightness.toFixed(2)}
                        onChange={(event) => setDisplayValueFromInput("brightness", event.target.value)}
                        disabled={Boolean(busyKey)}
                      />
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("brightness", 1)} disabled={Boolean(busyKey)}>+</Button>
                    </div>
                  </div>

                  <div className="display-control-input">
                    <label>Contrast</label>
                    <div className="display-input-wrap">
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("contrast", -1)} disabled={Boolean(busyKey)}>-</Button>
                      <Input
                        type="number"
                        className="display-number-input"
                        min={DISPLAY_LIMITS.contrast.min}
                        max={DISPLAY_LIMITS.contrast.max}
                        step={DISPLAY_LIMITS.contrast.step}
                        value={displayControls.contrast.toFixed(2)}
                        onChange={(event) => setDisplayValueFromInput("contrast", event.target.value)}
                        disabled={Boolean(busyKey)}
                      />
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("contrast", 1)} disabled={Boolean(busyKey)}>+</Button>
                    </div>
                  </div>

                  <div className="display-control-input">
                    <label>Gamma</label>
                    <div className="display-input-wrap">
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("gamma", -1)} disabled={Boolean(busyKey)}>-</Button>
                      <Input
                        type="number"
                        className="display-number-input"
                        min={DISPLAY_LIMITS.gamma.min}
                        max={DISPLAY_LIMITS.gamma.max}
                        step={DISPLAY_LIMITS.gamma.step}
                        value={displayControls.gamma.toFixed(2)}
                        onChange={(event) => setDisplayValueFromInput("gamma", event.target.value)}
                        disabled={Boolean(busyKey)}
                      />
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("gamma", 1)} disabled={Boolean(busyKey)}>+</Button>
                    </div>
                  </div>

                  <div className="display-control-input">
                    <label>Saturation</label>
                    <div className="display-input-wrap">
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("saturation", -1)} disabled={Boolean(busyKey)}>-</Button>
                      <Input
                        type="number"
                        className="display-number-input"
                        min={DISPLAY_LIMITS.saturation.min}
                        max={DISPLAY_LIMITS.saturation.max}
                        step={DISPLAY_LIMITS.saturation.step}
                        value={displayControls.saturation.toFixed(2)}
                        onChange={(event) => setDisplayValueFromInput("saturation", event.target.value)}
                        disabled={Boolean(busyKey)}
                      />
                      <Button className="display-adjust-btn" onClick={() => nudgeDisplayValue("saturation", 1)} disabled={Boolean(busyKey)}>+</Button>
                    </div>
                  </div>

                  <div className="settings-actions-grid display-action-row">
                    <Button className="settings-action-btn" disabled={Boolean(busyKey)} onClick={applyDisplay}>
                      {busyKey === "apply display" ? "Running..." : "Apply Display"}
                    </Button>
                    <Button className="settings-action-btn" disabled={Boolean(busyKey)} onClick={resetDisplay}>
                      {busyKey === "reset display" ? "Running..." : "Reset Display"}
                    </Button>
                  </div>
                </section>
              ) : null}

              {settingsPage === "pixacho" ? (
                <section className="settings-section-card settings-page-content">
                  <div className="settings-config-layout">
                    <div className="settings-result-box settings-result-box-config">{resultLog}</div>
                    <div className="settings-actions-grid settings-actions-grid-two-col">
                      <Button className="settings-action-btn" disabled={Boolean(busyKey)} onClick={runLsusb}>
                        {busyKey === "lsusb" ? "Running..." : "Show lsusb"}
                      </Button>
                      <Button
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("restart adb", SYSTEM_RESTART_ADB_URLS)}
                      >
                        {busyKey === "restart adb" ? "Running..." : "Restart ADB"}
                      </Button>
                      <Button
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("restart bridges", SYSTEM_RESTART_BRIDGES_URLS)}
                      >
                        {busyKey === "restart bridges" ? "Running..." : "Restart Bridges"}
                      </Button>
                      <Button
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("restart kiosk", SYSTEM_RESTART_KIOSK_URLS)}
                      >
                        {busyKey === "restart kiosk" ? "Running..." : "Restart Kiosk"}
                      </Button>
                      <Button
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("pull latest", SYSTEM_PULL_LATEST_URLS)}
                      >
                        {busyKey === "pull latest" ? "Running..." : "Pull Latest Code"}
                      </Button>
                      <Button
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("apply update", SYSTEM_APPLY_UPDATE_URLS)}
                      >
                        {busyKey === "apply update" ? "Running..." : "Apply Full Update"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("restart pi", SYSTEM_RESTART_PI_URLS)}
                      >
                        {busyKey === "restart pi" ? "Running..." : "Restart Pi"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="settings-action-btn"
                        disabled={Boolean(busyKey)}
                        onClick={() => runSystemAction("shutdown pi", SYSTEM_SHUTDOWN_PI_URLS)}
                      >
                        {busyKey === "shutdown pi" ? "Running..." : "Shutdown Pi"}
                      </Button>
                    </div>
                  </div>
                </section>
              ) : null}

              {settingsPage === "customization" ? (
                <section className="settings-section-card settings-page-content">
                  <div className="settings-actions-grid">
                    <Button
                      className="settings-action-btn"
                      disabled={Boolean(busyKey)}
                      onClick={() => runSystemAction("exit kiosk", SYSTEM_EXIT_KIOSK_URLS)}
                    >
                      {busyKey === "exit kiosk" ? "Running..." : "Exit Kiosk"}
                    </Button>
                    <Button
                      className="settings-action-btn"
                      disabled={Boolean(busyKey)}
                      onClick={() => runSystemAction("create desktop app", SYSTEM_CREATE_KIOSK_DESKTOP_APP_URLS)}
                    >
                      {busyKey === "create desktop app" ? "Running..." : "Create Desktop Kiosk App"}
                    </Button>
                  </div>
                  <Button
                    className="settings-action-btn customization-terminal-btn"
                    disabled={Boolean(busyKey)}
                    onClick={() => runSystemAction("open sudo terminal", SYSTEM_OPEN_SUDO_TERMINAL_URLS)}
                  >
                    {busyKey === "open sudo terminal" ? "Running..." : "Open Sudo Terminal"}
                  </Button>
                </section>
              ) : null}

              {settingsPage === "display" ? <div className="settings-result-box">{resultLog}</div> : null}
              {settingsPage === "customization" ? <div className="settings-result-box">{resultLog}</div> : null}
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState("launch");
  const [uiLanguage, setUiLanguage] = useState("EN");
  const [lastScreenBeforeSettings, setLastScreenBeforeSettings] = useState("select");
  const [selected, setSelected] = useState("android");
  const [connectMode, setConnectMode] = useState(false);
  const [connectStage, setConnectStage] = useState("choose");
  const [usbConnected, setUsbConnected] = useState(false);
  const [usbBridgeOnline, setUsbBridgeOnline] = useState(true);
  const [usbDeviceInfo, setUsbDeviceInfo] = useState({ manufacturer: "Unknown", productName: "Unknown" });
  const [accessReady, setAccessReady] = useState(false);
  const [deviceManagementStartPage, setDeviceManagementStartPage] = useState(0);
  const [deviceManagementStartTask, setDeviceManagementStartTask] = useState(null);

  useEffect(() => {
    if (connectStage !== "cable_wait") {
      setUsbConnected(false);
      setUsbBridgeOnline(true);
      setUsbDeviceInfo({ manufacturer: "Unknown", productName: "Unknown" });
      return;
    }

    let isActive = true;

    const pollUsbStatus = async () => {
      let reachable = false;

      for (const url of USB_STATUS_URLS) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          reachable = true;

          if (isActive) {
            setUsbConnected(Boolean(data.connected));
            setUsbBridgeOnline(true);
            setUsbDeviceInfo(normalizeUsbDeviceInfo(data));
          }
          break;
        } catch {
          // Try next URL
        }
      }

      if (!reachable && isActive) {
        setUsbConnected(false);
        setUsbBridgeOnline(false);
      }
    };

    pollUsbStatus();
    const timer = setInterval(pollUsbStatus, 1200);

    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, [connectStage]);

  useEffect(() => {
    if (!usbConnected || connectStage !== "cable_wait") {
      setAccessReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setAccessReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [usbConnected, connectStage]);

  const handleCardSelect = (id) => {
    setSelected(id);
    setConnectMode(true);
    setConnectStage("choose");
  };

  const handleSettingsOpen = () => {
    setLastScreenBeforeSettings(screen);
    setScreen("settings");
  };
  const handleDeviceLoadingDone = useCallback(() => {
    setDeviceManagementStartPage(0);
    setDeviceManagementStartTask(null);
    setScreen("device-quickstart");
  }, []);

  const openDeviceManagement = useCallback((startPage = 0, startTask = null) => {
    setDeviceManagementStartPage(startPage);
    setDeviceManagementStartTask(startTask);
    setScreen("device-management");
  }, []);

  const handleHome = () => {
    setScreen("launch");
    setConnectMode(false);
    setConnectStage("choose");
    setAccessReady(false);
  };

  const handleBack = () => {
    if (screen === "launch-wifi" || screen === "launch-profile" || screen === "launch-settings" || screen === "launch-update") {
      setScreen("launch");
      return;
    }

    if (screen === "settings") {
      setScreen(lastScreenBeforeSettings);
      return;
    }

    if (screen === "device-management") {
      setScreen("select");
      setConnectMode(true);
      setConnectStage("cable_wait");
      return;
    }

    if (screen === "device-quickstart") {
      setScreen("select");
      setConnectMode(true);
      setConnectStage("cable_wait");
      return;
    }

    if (screen === "device-loading") {
      setScreen("select");
      setConnectMode(true);
      setConnectStage("cable_wait");
      return;
    }

    if (connectStage === "cable_wait") {
      setConnectStage("choose");
      return;
    }

    if (connectMode) {
      setConnectMode(false);
      return;
    }

    setScreen("launch");
  };

  if (screen === "launch") {
    return (
      <LaunchScreen
        onStart={() => setScreen("select")}
        onOpenWifi={() => setScreen("launch-wifi")}
        onOpenProfile={() => setScreen("launch-profile")}
        onOpenQuickSettings={handleSettingsOpen}
        onOpenUpdate={() => setScreen("launch-update")}
        onHome={handleHome}
        onBack={handleBack}
        onSettings={handleSettingsOpen}
        uiLanguage={uiLanguage}
        onToggleLanguage={() => setUiLanguage((value) => (value === "EN" ? "JP" : "EN"))}
      />
    );
  }

  if (screen === "launch-wifi") {
    return (
      <LaunchSubScreen title="Wi-Fi Settings" onBack={handleBack} onHome={handleHome} onSettings={handleSettingsOpen}>
        <WifiSettingsPanel />
      </LaunchSubScreen>
    );
  }

  if (screen === "launch-profile") {
    return (
      <LaunchSubScreen title="Profile" onBack={handleBack} onHome={handleHome} onSettings={handleSettingsOpen}>
        <ProfilePanel />
      </LaunchSubScreen>
    );
  }

  if (screen === "launch-settings") {
    return (
      <LaunchSubScreen title="Settings" onBack={handleBack} onHome={handleHome} onSettings={handleSettingsOpen}>
        <SettingsComingSoonPanel />
      </LaunchSubScreen>
    );
  }

  if (screen === "launch-update") {
    return (
      <LaunchSubScreen title="Update" onBack={handleBack} onHome={handleHome} onSettings={handleSettingsOpen}>
        <UpdatePanel />
      </LaunchSubScreen>
    );
  }

  if (screen === "settings") {
    return <SettingsScreen onHome={handleHome} onBack={handleBack} onSettings={handleSettingsOpen} />;
  }

  if (screen === "device-management") {
    return (
      <DeviceManagementScreen
        productName={usbDeviceInfo.productName}
        onHome={handleHome}
        onBack={handleBack}
        onSettings={handleSettingsOpen}
        initialPageIndex={deviceManagementStartPage}
        initialTask={deviceManagementStartTask}
      />
    );
  }

  if (screen === "device-quickstart") {
    return (
      <DeviceQuickStartScreen
        productName={usbDeviceInfo.productName}
        onHome={handleHome}
        onBack={handleBack}
        onSettings={handleSettingsOpen}
        onOpenMoreFunctions={() => openDeviceManagement(0, null)}
        onOpenUnlockFlow={() => openDeviceManagement(0, "unlock-device")}
        onOpenGroup={(pageIndex) => openDeviceManagement(pageIndex, null)}
      />
    );
  }

  if (screen === "device-loading") {
    return (
      <DeviceLoadingScreen
        productName={usbDeviceInfo.productName}
        onHome={handleHome}
        onBack={handleBack}
        onSettings={handleSettingsOpen}
        onDone={handleDeviceLoadingDone}
      />
    );
  }

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu onHome={handleHome} onBack={handleBack} onSettings={handleSettingsOpen} />

        <section className={`select-os-screen${connectMode ? " is-connect-mode" : ""}`}>
          {!connectMode ? (
            <>
              <header className="select-os-header">
                <h2>Select OS</h2>
              </header>

              <div className="select-main-layout">
                <Card className="select-lottie-card">
                  <CardContent className="select-lottie-content">
                    <img src="/assets/samurai.png" alt="Samurai" className="select-lottie-samurai" />
                  </CardContent>
                </Card>

                <div className="select-right-grid">
                  <OsCard
                    id="android"
                    label="Android"
                    subtitle="Android OS based devices"
                    selected={selected === "android"}
                    onSelect={handleCardSelect}
                    className="select-os-card-main"
                  />
                  <OsCard
                    id="ios"
                    label="iOS"
                    subtitle="Apple iPhone and iOS devices"
                    selected={selected === "ios"}
                    onSelect={handleCardSelect}
                    className="select-os-card-main"
                  />
                  <div className="select-small-row">
                    <OsCard id="other" label="Other OS" selected={selected === "other"} onSelect={handleCardSelect} className="select-os-card-small" />
                    <Button variant="destructive" className="select-back-small" onClick={handleBack}>
                      <ArrowLeftSolid className="cancel-icon" />
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {connectMode ? (
            <>
              <header className="select-os-header connect-stage-header">
                <h2>{connectStage === "choose" ? "Connect via" : "Connect via = Cable"}</h2>
              </header>
              <div className="connect-panel is-visible">
                <div className="connect-panel-content">
                  {connectStage === "choose" ? (
                    <div className="connect-choose-layout">
                      <div className="connect-choose-left">
                        <button className="connect-option" onClick={() => setConnectStage("cable_wait")} aria-label="Connect via Cable">
                          <Icon icon={connectCableIcon} className="connect-method-icon" />
                          <h4>Cable</h4>
                          <p className="connect-option-subtitle">USB data transport direct device handshake</p>
                        </button>

                        <button className="connect-option" disabled aria-label="Wireless (coming soon)">
                          <Icon icon={connectWirelessIcon} className="connect-method-icon" />
                          <h4>Wireless</h4>
                          <p className="connect-option-subtitle">Wi-Fi channel pairing remote session bridge</p>
                        </button>

                        <Button variant="destructive" className="select-back-small connect-back-btn" onClick={handleBack}>
                          <ArrowLeftSolid className="cancel-icon" />
                          Back
                        </Button>
                      </div>

                      <div className="connect-choose-right">
                        <div className="connect-link-anim-wrap" aria-hidden="true">
                          <LinkSolid className="connect-link-anim-icon" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="connect-waiting-layout">
                      <div className="connect-waiting">
                        {usbConnected ? (
                          <div className="connected-details">
                            <p className="connect-state-label">
                              Status: <span className="connect-state is-connected">Connected</span>
                            </p>
                            <p className="device-info-line">Product Name: {usbDeviceInfo.productName}</p>
                            <p className="device-info-line">Manufacturer: {usbDeviceInfo.manufacturer}</p>
                            <div className="access-device-slot">
                              {accessReady ? (
                                <Button className="access-device-btn" onClick={() => setScreen("device-loading")}>
                                  Access Device
                                </Button>
                              ) : (
                                <Spinner className="access-spinner" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>Please connect device through Cable.</p>
                            <Icon icon={connectCableIcon} className="wait-cable-lib-icon" aria-hidden="true" />
                            <p className="connect-state">Waiting...</p>
                          </>
                        )}
                        {!usbBridgeOnline ? <p className="connect-state-note">USB bridge offline</p> : null}
                      </div>
                      <div className="connect-waiting-actions">
                        <Button variant="destructive" className="panel-cancel-btn" onClick={() => setConnectStage("choose")}>
                          Cancel
                        </Button>
                        <Button className="panel-test-btn" onClick={() => setScreen("device-quickstart")}>
                          Test
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
