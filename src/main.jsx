import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/jersey-10";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./style.css";

const navigationItems = [
  { id: "home", label: "Home", icon: "ti ti-home" },
  { id: "refresh", label: "Refresh", icon: "ti ti-refresh" },
  { id: "back", label: "Back", icon: "ti ti-arrow-back-up" },
  { id: "cancel", label: "Cancel", icon: "ti ti-x" }
];

const osOptions = ["Android", "iOS", "Harmony", "Other OS"];

function SelectOsPage() {
  const [selectedOs, setSelectedOs] = useState("");
  const [logoAvailable, setLogoAvailable] = useState(true);

  const instructionText = useMemo(() => {
    if (!selectedOs) return "Select the target operating system to continue.";
    return `${selectedOs} selected. Tap again to confirm and continue to the next page.`;
  }, [selectedOs]);

  return (
    <main className="device-shell" aria-label="Select OS screen">
      <aside className="navigation-grid" aria-label="Navigation grid">
        {navigationItems.map((item) => (
          <button key={item.id} className="nav-icon-btn" aria-label={item.label}>
            <i className={item.icon} aria-hidden="true" />
          </button>
        ))}
      </aside>

      <section className="info-grid" aria-label="Info grid">
        <div className="info-logo-wrap">
          {logoAvailable ? (
            <img
              src="./Duckydu.png"
              alt="DuckyDu logo"
              className="info-logo"
              onError={() => setLogoAvailable(false)}
            />
          ) : (
            <div className="logo-fallback" aria-hidden="true">
              DD
            </div>
          )}
        </div>
        <p className="instructions-text">{instructionText}</p>
      </section>

      <section className="main-grid" aria-label="Main grid">
        <h1 className="page-title">SELECT OS</h1>
        <div className="os-buttons">
          {osOptions.map((option) => (
            <button
              key={option}
              className={`os-btn${selectedOs === option ? " is-selected" : ""}`}
              onClick={() => setSelectedOs(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsPage />);
