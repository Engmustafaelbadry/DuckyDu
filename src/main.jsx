import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { PixelIcon } from "@2hoch1/pixel-icon-library-react";
import { Button } from "@/components/ui/pixelact-ui/button";
import "font-misaki/misaki_gothic.css";
import "./style.css";

const quickActions = [
  { id: "settings", icon: "cog-solid", label: "Settings", variant: "secondary" },
  { id: "reboot", icon: "refresh-solid", label: "Reboot", variant: "warning" },
  { id: "shutdown", icon: "window-close-solid", label: "Shutdown", variant: "destructive" },
  { id: "profile", icon: "user-solid", label: "Profile", variant: "secondary" },
  { id: "language", icon: "translate-solid", label: "Language", variant: "secondary" }
];

function PxIcon({ name, size = 18 }) {
  return <PixelIcon name={name} size={size} color="currentColor" aria-hidden="true" />;
}

function ScreenFrame({ title, subtitle, onBack, children }) {
  return (
    <section className="screen-frame" aria-label={title}>
      <header className="screen-header">
        <Button variant="secondary" size="sm" className="back-button" onClick={onBack}>
          <PxIcon name="arrow-left-solid" />
          Back
        </Button>
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
      </div>

      <Button size="lg" className="work-button" onClick={() => onNavigate("work")}>
        GET TO WORK
      </Button>

      <div className="quick-grid" aria-label="Quick actions">
        {quickActions.map((item) => (
          <Button key={item.id} variant={item.variant} className="tile-button" onClick={() => onNavigate(item.id)}>
            <PxIcon name={item.icon} size={16} />
            {item.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

function WorkScreen({ onBack }) {
  return (
    <ScreenFrame title="Work Mode" subtitle="Select a flow to begin" onBack={onBack}>
      <div className="card-grid">
        <Button variant="secondary" className="card-button">
          <PxIcon name="bolt-solid" />
          Quick Start
        </Button>
        <Button variant="secondary" className="card-button">
          <PxIcon name="analytics-solid" />
          Diagnostics
        </Button>
        <Button variant="secondary" className="card-button">
          <PxIcon name="clock-solid" />
          Timed Routine
        </Button>
      </div>
    </ScreenFrame>
  );
}

function SettingsScreen({ onBack }) {
  return (
    <ScreenFrame title="Settings" subtitle="Display, sound, and device behavior" onBack={onBack}>
      <div className="settings-grid">
        <Button variant="secondary" className="setting-item">Display Brightness 80%</Button>
        <Button variant="secondary" className="setting-item">Touch Sound Enabled</Button>
        <Button variant="secondary" className="setting-item">Animation Quality High</Button>
      </div>
    </ScreenFrame>
  );
}

function PowerScreen({ mode, onBack }) {
  return (
    <ScreenFrame
      title={mode === "reboot" ? "Reboot Device" : "Shutdown Device"}
      subtitle="Confirm before running this action"
      onBack={onBack}
    >
      <div className="power-grid">
        <Button variant={mode === "reboot" ? "warning" : "destructive"} className="work-button">
          {mode === "reboot" ? "Confirm Reboot" : "Confirm Shutdown"}
        </Button>
        <Button variant="secondary" onClick={onBack}>Cancel</Button>
      </div>
    </ScreenFrame>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <ScreenFrame title="Profile" subtitle="Operator identity and status" onBack={onBack}>
      <div className="profile-box">
        <span className="avatar-box">DD</span>
        <span>DuckyDu Operator</span>
      </div>
    </ScreenFrame>
  );
}

function LanguageScreen({ onBack }) {
  return (
    <ScreenFrame title="Language" subtitle="Choose interface language" onBack={onBack}>
      <div className="card-grid">
        <Button className="card-button">English</Button>
        <Button variant="secondary" className="card-button lang-ja">日本語</Button>
        <Button variant="secondary" className="card-button">Arabic</Button>
        <Button variant="secondary" className="card-button">French</Button>
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
    if (transition.phase !== "idle") return;
    setTransition({ phase: "out", next, direction: 1, action: "push" });
  }

  function goBack() {
    if (routeStack.length <= 1 || transition.phase !== "idle") return;
    setTransition({ phase: "out", next: routeStack[routeStack.length - 2], direction: -1, action: "pop" });
  }

  useEffect(() => {
    if (transition.phase === "out") {
      const timer = setTimeout(() => {
        setRouteStack((prev) => (transition.action === "push" ? [...prev, transition.next] : prev.slice(0, -1)));
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
    <main className="kiosk-root dark">
      <div className="kiosk-shell">
        <div className={`screen-layer phase-${transition.phase} dir-${transition.direction > 0 ? "next" : "back"}`}>
          {screen}
        </div>
      </div>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
