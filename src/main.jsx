import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon } from "@iconify/react";
import {
  ArrowLeftSolid,
  Code,
} from "@2hoch1/pixel-icon-library-react/icons";
import pixelIcons from "@iconify-json/pixel/icons.json";
import pixelarticons from "@iconify-json/pixelarticons/icons.json";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Card, CardContent } from "@/components/ui/pixelact-ui/card";
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

const connectCableIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.link
};

const connectWirelessIcon = {
  ...statusIconDefaults,
  ...pixelarticons.icons.wifi
};

const iconMap = {
  android: { type: "iconify", icon: androidOsIcon },
  ios: { type: "iconify", icon: iosOsIcon },
  other: { type: "component", icon: Code }
};

const USB_STATUS_URLS = [
  "http://127.0.0.1:17373/usb/mobile-status",
  "http://localhost:17373/usb/mobile-status"
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
  let manufacturer = descriptor;
  let productName = "Unknown";

  if (parts.length >= 2) {
    manufacturer = parts.slice(0, 2).join(" ");
    productName = parts.slice(2).join(" ").trim() || "Unknown";
  }

  return { manufacturer, productName };
}

function OsCard({ id, label, selected, onSelect, className = "", compact = false }) {
  const iconConfig = iconMap[id];
  const iconClassName = `pixel-icon${id === "other" ? " pixel-icon-small" : ""}${compact ? " pixel-icon-compact" : ""}`;
  const ComponentIcon = iconConfig.type === "component" ? iconConfig.icon : null;

  const iconElement =
    iconConfig.type === "iconify" ? (
      <Icon icon={iconConfig.icon} className={iconClassName} />
    ) : (
      <ComponentIcon className={iconClassName} />
    );

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
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function SelectOsScreen() {
  const [selected, setSelected] = useState("android");
  const [connectMode, setConnectMode] = useState(false);
  const [connectStage, setConnectStage] = useState("choose");
  const [usbConnected, setUsbConnected] = useState(false);
  const [usbBridgeOnline, setUsbBridgeOnline] = useState(true);
  const [usbDeviceInfo, setUsbDeviceInfo] = useState({ manufacturer: "Unknown", productName: "Unknown" });

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
            setUsbDeviceInfo(parseUsbDeviceInfo(data.matches));
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

  const handleCardSelect = (id) => {
    setSelected(id);
    setConnectMode(true);
    setConnectStage("choose");
  };

  const handleBottomAction = () => {
    if (connectStage === "cable_wait") {
      setConnectStage("choose");
      return;
    }

    if (connectMode) {
      setConnectMode(false);
      return;
    }
  };

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu />

        <section className={`select-os-screen${connectMode ? " is-connect-mode" : ""}`}>
          <div className={`focus-slot-wrap${connectMode ? " is-visible" : ""}`}>
            <OsCard
              id={selected}
              label={selected === "android" ? "Android" : selected === "ios" ? "iOS" : "Other OS"}
              selected={true}
              onSelect={handleCardSelect}
              className="focus-slot"
              compact={true}
            />
          </div>

          <div className={`os-selection-group${connectMode ? " is-hidden" : ""}`}>
            <div className="row-main">
              <OsCard id="android" label="Android" selected={selected === "android"} onSelect={handleCardSelect} />
              <OsCard id="ios" label="iOS" selected={selected === "ios"} onSelect={handleCardSelect} />
            </div>

            <OsCard id="other" label="Other OS" selected={selected === "other"} onSelect={handleCardSelect} />
          </div>

          {connectMode ? (
            <Card className="connect-panel is-visible">
              <CardContent className="connect-panel-content">
                {connectStage === "choose" ? (
                  <>
                    <h3 className="connect-via-title">Connect via</h3>

                    <button className="connect-option" onClick={() => setConnectStage("cable_wait")} aria-label="Connect via Cable">
                      <Icon icon={connectCableIcon} className="connect-method-icon" />
                      <h4>Cable</h4>
                    </button>

                    <div className="connect-option">
                      <Icon icon={connectWirelessIcon} className="connect-method-icon" />
                      <h4>Wireless</h4>
                    </div>
                  </>
                ) : (
                  <div className="connect-waiting">
                    {usbConnected ? (
                      <div className="connected-details">
                        <p className="connect-state is-connected">Connected</p>
                        <p className="device-info-line">Product Name: {usbDeviceInfo.productName}</p>
                        <p className="device-info-line">Manufacturer: {usbDeviceInfo.manufacturer}</p>
                        <Button className="access-device-btn">Access Device</Button>
                      </div>
                    ) : (
                      <>
                        <p>Please connect device through Cable.</p>
                        <Icon icon={connectCableIcon} className="wait-cable-lib-icon" aria-hidden="true" />
                        <p className="connect-state">Waiting...</p>
                      </>
                    )}
                    {!usbBridgeOnline ? <p className="connect-state-note">USB bridge offline</p> : null}
                    <Button variant="destructive" className="panel-cancel-btn" onClick={() => setConnectStage("choose")}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {connectStage !== "cable_wait" ? (
            <Button variant="destructive" className="cancel-btn" onClick={handleBottomAction}>
              <ArrowLeftSolid className="cancel-icon" />
              Back
            </Button>
          ) : null}
        </section>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsScreen />);
