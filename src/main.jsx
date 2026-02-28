import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon } from "@iconify/react";
import {
  ArrowLeftSolid,
  Code,
} from "@2hoch1/pixel-icon-library-react/icons";
import pixelIcons from "@iconify-json/pixel/icons.json";
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

const iconMap = {
  android: { type: "iconify", icon: androidOsIcon },
  ios: { type: "iconify", icon: iosOsIcon },
  other: { type: "component", icon: Code }
};

function OsCard({ id, label, selected, onSelect }) {
  const iconConfig = iconMap[id];
  const iconClassName = `pixel-icon${id === "other" ? " pixel-icon-small" : ""}`;
  const ComponentIcon = iconConfig.type === "component" ? iconConfig.icon : null;

  const iconElement =
    iconConfig.type === "iconify" ? (
      <Icon icon={iconConfig.icon} className={iconClassName} />
    ) : (
      <ComponentIcon className={iconClassName} />
    );

  return (
    <button className={`os-card-btn${selected ? " is-selected" : ""}`} onClick={() => onSelect(id)} aria-pressed={selected}>
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

  return (
    <main className="select-os-root">
      <section className="layout-shell">
        <VerticalMenu />

        <section className="select-os-screen">
          <div className="row-main">
            <OsCard id="android" label="Android" selected={selected === "android"} onSelect={setSelected} />
            <OsCard id="ios" label="iOS" selected={selected === "ios"} onSelect={setSelected} />
          </div>

          <OsCard id="other" label="Other OS" selected={selected === "other"} onSelect={setSelected} />

          <Button variant="destructive" className="cancel-btn">
            <ArrowLeftSolid className="cancel-icon" />
            Cancel
          </Button>
        </section>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsScreen />);
