import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  ArrowLeftSolid,
  CogSolid,
  HomeSolid
} from "@2hoch1/pixel-icon-library-react/icons";
import pixelarticons from "@iconify-json/pixelarticons/icons.json";

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

export function VerticalMenu() {
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
  );
}
