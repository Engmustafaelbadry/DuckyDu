import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Android, Apple, Code } from "@2hoch1/pixel-icon-library-react/icons";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Card, CardContent } from "@/components/ui/pixelact-ui/card";
import "./style.css";

const iconMap = {
  android: Android,
  ios: Apple,
  other: Code
};

function OsCard({ id, label, selected, onSelect }) {
  const Icon = iconMap[id];
  return (
    <button className={`os-card-btn${selected ? " is-selected" : ""}`} onClick={() => onSelect(id)} aria-pressed={selected}>
      <Card className={`os-card os-${id}`}>
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

  return (
    <main className="select-os-root">
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
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsScreen />);
