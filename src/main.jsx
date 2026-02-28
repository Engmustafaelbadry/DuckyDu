import { useState } from "react";
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

  const handleCardSelect = (id) => {
    setSelected(id);
    setConnectMode(true);
  };

  const handleBottomAction = () => {
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
          {connectMode ? (
            <OsCard
              id={selected}
              label={selected === "android" ? "Android" : selected === "ios" ? "iOS" : "Other OS"}
              selected={true}
              onSelect={handleCardSelect}
              className="focus-slot"
              compact={true}
            />
          ) : (
            <>
              <div className="row-main">
                <OsCard id="android" label="Android" selected={selected === "android"} onSelect={handleCardSelect} />
                <OsCard id="ios" label="iOS" selected={selected === "ios"} onSelect={handleCardSelect} />
              </div>

              <OsCard id="other" label="Other OS" selected={selected === "other"} onSelect={handleCardSelect} />
            </>
          )}

          <Card className={`connect-panel${connectMode ? " is-visible" : ""}`}>
            <CardContent className="connect-panel-content">
              <h3 className="connect-via-title">Connect via</h3>

              <div className="connect-option">
                <Icon icon={connectCableIcon} className="connect-method-icon" />
                <h4>Cable</h4>
              </div>

              <div className="connect-option">
                <Icon icon={connectWirelessIcon} className="connect-method-icon" />
                <h4>Wireless</h4>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="cancel-btn" onClick={handleBottomAction}>
            <ArrowLeftSolid className="cancel-icon" />
            {connectMode ? "Back" : "Cancel"}
          </Button>
        </section>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsScreen />);
