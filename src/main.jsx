import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./style.css";

const routeDepth = {
  home: 0,
  work: 1,
  settings: 1,
  reboot: 1,
  shutdown: 1,
  profile: 1,
  language: 1
};

const quickActions = [
  { id: "settings", icon: "ti ti-settings", label: "Settings" },
  { id: "reboot", icon: "ti ti-rotate-clockwise-2", label: "Reboot" },
  { id: "shutdown", icon: "ti ti-power", label: "Shutdown" },
  { id: "profile", icon: "ti ti-user-circle", label: "Profile" },
  { id: "language", icon: "ti ti-language", label: "Language" }
];

function ScreenFrame({ title, subtitle, onBack, children }) {
  return (
    <section className="screen-frame" aria-label={title}>
      <header className="screen-header">
        <button className="pxa-button pxa-back" onClick={onBack} aria-label="Go back">
          <i className="ti ti-arrow-left" aria-hidden="true" />
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
            <i className={item.icon} aria-hidden="true" />
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
          <i className="ti ti-bolt" aria-hidden="true" />
          Quick Start
        </button>
        <button className="pxa-card">
          <i className="ti ti-device-analytics" aria-hidden="true" />
          Diagnostics
        </button>
        <button className="pxa-card">
          <i className="ti ti-clock-play" aria-hidden="true" />
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
        <button className="pxa-button pxa-card">Arabic</button>
        <button className="pxa-button pxa-card">French</button>
        <button className="pxa-button pxa-card">Spanish</button>
      </div>
    </ScreenFrame>
  );
}

function MotionOverlay() {
  return (
    <div className="motion-overlay" aria-hidden="true">
      <div className="motion-slot lottie-slot">Lottie Slot</div>
      <div className="motion-slot ae-slot">AE Icon Slot</div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState("home");
  const [transition, setTransition] = useState({ phase: "idle", next: null, direction: 1 });

  function navigate(next) {
    if (next === route || transition.phase !== "idle") return;
    const direction = (routeDepth[next] ?? 1) >= (routeDepth[route] ?? 1) ? 1 : -1;
    setTransition({ phase: "out", next, direction });
  }

  useEffect(() => {
    if (transition.phase === "out") {
      const timer = setTimeout(() => {
        setRoute(transition.next);
        setTransition((prev) => ({ ...prev, phase: "in" }));
      }, 170);
      return () => clearTimeout(timer);
    }

    if (transition.phase === "in") {
      const timer = setTimeout(() => {
        setTransition({ phase: "idle", next: null, direction: 1 });
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [transition]);

  const screen = useMemo(() => {
    switch (route) {
      case "work":
        return <WorkScreen onBack={() => navigate("home")} />;
      case "settings":
        return <SettingsScreen onBack={() => navigate("home")} />;
      case "reboot":
        return <PowerScreen mode="reboot" onBack={() => navigate("home")} />;
      case "shutdown":
        return <PowerScreen mode="shutdown" onBack={() => navigate("home")} />;
      case "profile":
        return <ProfileScreen onBack={() => navigate("home")} />;
      case "language":
        return <LanguageScreen onBack={() => navigate("home")} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  }, [route]);

  return (
    <main className="kiosk-root">
      <div className="kiosk-shell">
        <MotionOverlay />
        <div className={`screen-layer phase-${transition.phase} dir-${transition.direction > 0 ? "next" : "back"}`}>
          {screen}
        </div>
      </div>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
