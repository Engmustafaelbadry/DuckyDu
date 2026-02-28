import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon } from "@iconify/react";
import {
  Apple,
  ArrowLeftSolid,
  CogSolid,
  Code,
  HomeSolid,
  RobotSolid
} from "@2hoch1/pixel-icon-library-react/icons";
import pixelarticons from "@iconify-json/pixelarticons/icons.json";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Card, CardContent } from "@/components/ui/pixelact-ui/card";
import "./style.css";

const iconDefaults = {
  width: pixelarticons.width,
  height: pixelarticons.height
};

const wifiIcon = {
  ...iconDefaults,
  ...pixelarticons.icons.wifi
};

const cloudIcon = {
  ...iconDefaults,
  ...pixelarticons.icons.cloud
};

const batteryIcon = {
  ...iconDefaults,
  ...pixelarticons.icons["battery-medium"]
};

const iconMap = {
  android: RobotSolid,
  ios: Apple,
  other: Code
};

function OsCard({ id, label, selected, onSelect }) {
  const Icon = iconMap[id];
  return (
    <button className={`os-card-btn${selected ? " is-selected" : ""}`} onClick={() => onSelect(id)} aria-pressed={selected}>
      <Card className={`os-card os-${id}${id !== "other" ? " os-main" : ""}`}>
        <CardContent className="os-card-content">
          <Icon className="pixel-icon" />
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
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <aside className="side-menu">
          <div className="side-status">
            <div className="clock-vertical">{clock}</div>
            <div className="status-stack">
              <Icon icon={batteryIcon} className="menu-icon battery-vertical" />
              <Icon icon={wifiIcon} className="menu-icon" />
              <Icon icon={cloudIcon} className="menu-icon status-cloud" />
              <span className="live-dot" />
            </div>
          </div>
          <div className="side-nav">
            <button className="menu-btn" aria-label="Home">
              <HomeSolid className="menu-icon" />
            </button>
            <button className="menu-btn" aria-label="Back">
              <ArrowLeftSolid className="menu-icon" />
            </button>
            <button className="menu-btn" aria-label="Settings">
              <CogSolid className="menu-icon" />
            </button>
          </div>
        </aside>

        <section className="select-os-screen">
          <div className="row-main">
            <OsCard id="android" label="Android" selected={selected === "android"} onSelect={setSelected} />
            <OsCard id="ios" label="iOS" selected={selected === "ios"} onSelect={setSelected} />
          </div>

          <OsCard id="other" label="Other OS" selected={selected === "other"} onSelect={setSelected} />

          <Button variant="destructive" className="cancel-btn">
            Cancel
          </Button>
        </section>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsScreen />);
