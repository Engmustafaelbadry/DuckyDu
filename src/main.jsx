import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { PixelIcon } from "@2hoch1/pixel-icon-library-react";
import "font-misaki/misaki_gothic.css";
import "./style.css";

const quickActions = [
  { id: "settings", icon: "cog-solid", label: "Settings" },
  { id: "reboot", icon: "refresh-solid", label: "Reboot" },
  { id: "shutdown", icon: "window-close-solid", label: "Shutdown" },
  { id: "profile", icon: "user-solid", label: "Profile" },
  { id: "language", icon: "translate-solid", label: "Language" }
];

function PxIcon({ name, size = 18 }) {
  return <PixelIcon name={name} size={size} color="currentColor" aria-hidden="true" />;
}

function ScreenFrame({ title, subtitle, onBack, children }) {
  return (
    <section className="screen-frame" aria-label={title}>
      <header className="screen-header">
        <button className="pxa-button pxa-back" onClick={onBack} aria-label="Go back">
          <PxIcon name="arrow-left-solid" />
          Back
        </button>
        <div className="screen-heading">
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>
      <div className="screen-content">{children}</div>
    </section>
  );
}

function HomeScreen({ onNavigate }) {
  return (
    <section className="home-screen" aria-label="DuckyDu Home">
      <div className="brand-block">
        <h1>DuckyDu</h1>
        <p>Smart kiosk control panel</p>
      </div>

      <button className="pxa-button pxa-main" onClick={() => onNavigate("work")}>
        GET TO WORK
      </button>

      <div className="quick-grid" aria-label="Quick actions">
        {quickActions.map((item) => (
          <button key={item.id} className="pxa-button pxa-tile" onClick={() => onNavigate(item.id)}>
            <PxIcon name={item.icon} size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkScreen({ onBack }) {
  return (
    <ScreenFrame title="Work Mode" subtitle="Select a flow to begin" onBack={onBack}>
      <div className="pixel-grid">
        <button className="pxa-card">
          <PxIcon name="bolt-solid" size={20} />
          Quick Start
        </button>
        <button className="pxa-card">
          <PxIcon name="analytics-solid" size={20} />
          Diagnostics
        </button>
        <button className="pxa-card">
          <PxIcon name="clock-solid" size={20} />
          Timed Routine
        </button>
      </div>
    </ScreenFrame>
  );
}

function SettingsScreen({ onBack }) {
  return (
    <ScreenFrame title="Settings" subtitle="Display, sound, and device behavior" onBack={onBack}>
      <div className="settings-list">
        <div className="list-row">
          <span>Display Brightness</span>
          <span>80%</span>
        </div>
        <div className="list-row">
          <span>Touch Sound</span>
          <span>Enabled</span>
        </div>
        <div className="list-row">
          <span>Animation Quality</span>
          <span>High</span>
        </div>
      </div>
    </ScreenFrame>
  );
}

function PowerScreen({ mode, onBack }) {
  const label = mode === "reboot" ? "Reboot Device" : "Shutdown Device";
  const hint = mode === "reboot" ? "Restarts Raspberry Pi 5 now" : "Powers off Raspberry Pi 5 safely";

  return (
    <ScreenFrame title={label} subtitle={hint} onBack={onBack}>
      <div className="power-panel">
        <p>Confirm action before proceeding.</p>
        <div className="power-actions">
          <button className="pxa-button pxa-main">{mode === "reboot" ? "Confirm Reboot" : "Confirm Shutdown"}</button>
          <button className="pxa-button" onClick={onBack}>
            Cancel
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <ScreenFrame title="Profile" subtitle="Operator identity and status" onBack={onBack}>
      <div className="profile-card">
        <div className="avatar">DD</div>
        <div>
          <h3>DuckyDu Operator</h3>
          <p>Connected and ready</p>
        </div>
      </div>
    </ScreenFrame>
  );
}

function LanguageScreen({ onBack }) {
  return (
    <ScreenFrame title="Language" subtitle="Choose interface language" onBack={onBack}>
      <div className="language-grid">
        <button className="pxa-button pxa-card is-active">English</button>
        <button className="pxa-button pxa-card lang-ja">日本語</button>
        <button className="pxa-button pxa-card">Arabic</button>
        <button className="pxa-button pxa-card">French</button>
      </div>
    </ScreenFrame>
  );
}

function App() {
  const [routeStack, setRouteStack] = useState(["home"]);
  const [transition, setTransition] = useState({
    phase: "idle",
    next: null,
    direction: 1,
    action: "push"
  });
  const route = routeStack[routeStack.length - 1];

  function navigate(next) {
    if (next === route || transition.phase !== "idle") return;
    setTransition({ phase: "out", next, direction: 1, action: "push" });
  }

  function goBack() {
    if (routeStack.length <= 1 || transition.phase !== "idle") return;
    setTransition({
      phase: "out",
      next: routeStack[routeStack.length - 2],
      direction: -1,
      action: "pop"
    });
  }

  useEffect(() => {
    if (transition.phase === "out") {
      const timer = setTimeout(() => {
        setRouteStack((prev) => {
          if (transition.action === "push") return [...prev, transition.next];
          if (prev.length <= 1) return prev;
          return prev.slice(0, -1);
        });
        setTransition((prev) => ({ ...prev, phase: "in" }));
      }, 180);
      return () => clearTimeout(timer);
    }

    if (transition.phase === "in") {
      const timer = setTimeout(() => {
        setTransition({ phase: "idle", next: null, direction: 1, action: "push" });
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [transition]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" || event.key === "Backspace") {
        event.preventDefault();
        goBack();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [routeStack, transition.phase]);

  const screen = useMemo(() => {
    switch (route) {
      case "work":
        return <WorkScreen onBack={goBack} />;
      case "settings":
        return <SettingsScreen onBack={goBack} />;
      case "reboot":
        return <PowerScreen mode="reboot" onBack={goBack} />;
      case "shutdown":
        return <PowerScreen mode="shutdown" onBack={goBack} />;
      case "profile":
        return <ProfileScreen onBack={goBack} />;
      case "language":
        return <LanguageScreen onBack={goBack} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  }, [route]);

  return (
    <main className="kiosk-root">
      <div className="kiosk-shell">
        <div className={`screen-layer phase-${transition.phase} dir-${transition.direction > 0 ? "next" : "back"}`}>
          {screen}
        </div>
      </div>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
