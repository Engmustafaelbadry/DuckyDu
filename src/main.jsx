import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/jersey-10";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./style.css";

const navigationItems = [
  { id: "home", label: "Home", icon: "ti ti-home" },
  { id: "refresh", label: "Refresh", icon: "ti ti-refresh" },
  { id: "back", label: "Back", icon: "ti ti-arrow-back-up" },
  { id: "settings", label: "Settings", icon: "ti ti-settings" }
];

const osOptions = [
  { label: "Android", icon: "ti ti-brand-android" },
  { label: "iOS", icon: "ti ti-brand-apple" },
  { label: "Harmony", icon: "ti ti-wave-sine" },
  { label: "Other OS", icon: "ti ti-device-laptop" }
];

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

      <section className="content-panel" aria-label="App content">
        <div className="content-header">
          <div className="brand-glass">
            {logoAvailable ? (
              <img
                src="./Duckydu.png"
                alt="DuckyDu logo"
                className="brand-logo"
                onError={() => setLogoAvailable(false)}
              />
            ) : (
              <div className="logo-fallback" aria-hidden="true">
                DD
              </div>
            )}
          </div>
          <h1 className="page-title">SELECT OS</h1>
          <p className="instructions-text">{instructionText}</p>
        </div>

        <div className="icon-grid" aria-label="Operating system options">
          {osOptions.map((option) => (
            <button
              key={option.label}
              className={`icon-card${selectedOs === option.label ? " is-selected" : ""}`}
              onClick={() => setSelectedOs(option.label)}
            >
              <span className="icon-glass" aria-hidden="true">
                <i className={option.icon} />
              </span>
              <span className="icon-label">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="page-dots" aria-label="Pagination">
          <span className="dot is-active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsPage />);
