import { useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
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
  const testScreens = [1, 2, 3, 4];
  const [selectedByScreen, setSelectedByScreen] = useState({});
  const [logoAvailable, setLogoAvailable] = useState(true);

  function getInstructionText(screenId) {
    const selectedOs = selectedByScreen[screenId];
    if (!selectedOs) return `Scroll test screen ${screenId}. Select OS and swipe to test refresh rate.`;
    return `Screen ${screenId}: ${selectedOs} selected. Keep scrolling to stress-test animation smoothness.`;
  }

  function onSelectOs(screenId, label) {
    setSelectedByScreen((prev) => ({ ...prev, [screenId]: label }));
  }

  return (
    <div className="scroll-test-container" aria-label="Scroll animation test screens">
      {testScreens.map((screenId) => (
        <main className="device-shell" aria-label={`Select OS screen ${screenId}`} key={screenId}>
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
              <p className="instructions-text">{getInstructionText(screenId)}</p>
            </div>

            <div className="icon-grid" aria-label="Operating system options">
              {osOptions.map((option) => (
                <button
                  key={option.label}
                  className={`icon-card${selectedByScreen[screenId] === option.label ? " is-selected" : ""}`}
                  onClick={() => onSelectOs(screenId, option.label)}
                >
                  <span className="icon-glass" aria-hidden="true">
                    <i className={option.icon} />
                  </span>
                  <span className="icon-label">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="page-dots" aria-label="Pagination">
              {testScreens.map((dot) => (
                <span key={dot} className={`dot${dot === screenId ? " is-active" : ""}`} />
              ))}
            </div>
          </section>
        </main>
      ))}
    </div>
  );
}

createRoot(document.querySelector("#app")).render(<SelectOsPage />);
