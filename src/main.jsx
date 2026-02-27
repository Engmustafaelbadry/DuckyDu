import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { PixelIcon } from "@2hoch1/pixel-icon-library-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/pixelact-ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/pixelact-ui/avatar";
import { Badge } from "@/components/ui/pixelact-ui/badge";
import { Button } from "@/components/ui/pixelact-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/pixelact-ui/card";
import { Checkbox } from "@/components/ui/pixelact-ui/checkbox";
import { Input } from "@/components/ui/pixelact-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/pixelact-ui/select";
import "font-misaki/misaki_gothic.css";
import "./style.css";

const actions = [
  { id: "settings", icon: "cog-solid", label: "Settings", variant: "secondary" },
  { id: "reboot", icon: "refresh-solid", label: "Reboot", variant: "warning" },
  { id: "shutdown", icon: "window-close-solid", label: "Shutdown", variant: "destructive" },
  { id: "profile", icon: "user-solid", label: "Profile", variant: "secondary" },
  { id: "language", icon: "translate-solid", label: "Language", variant: "secondary" }
];

function PxIcon({ name, size = 16 }) {
  return <PixelIcon name={name} size={size} color="currentColor" aria-hidden="true" />;
}

function Frame({ title, hint, onBack, children }) {
  return (
    <section className="screen-frame">
      <header className="screen-header">
        <Button variant="secondary" size="sm" className="back-btn" onClick={onBack}>
          <PxIcon name="arrow-left-solid" />
          Back
        </Button>
        <div>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
      </header>
      <div className="screen-body">{children}</div>
    </section>
  );
}

function HomeScreen({ onNavigate }) {
  return (
    <section className="home-screen">
      <Card className="hero-card">
        <CardHeader className="hero-head">
          <Badge>DuckyDu</Badge>
          <CardTitle>DUCKYDU KIOSK</CardTitle>
        </CardHeader>
        <CardContent className="hero-body">
          <Button size="lg" className="full" onClick={() => onNavigate("work")}>
            GET TO WORK
          </Button>
          <div className="action-grid">
            {actions.map((item) => (
              <Button key={item.id} variant={item.variant} className="action-btn" onClick={() => onNavigate(item.id)}>
                <PxIcon name={item.icon} />
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function WorkScreen({ onBack }) {
  return (
    <Frame title="Work Mode" hint="Choose a process to start" onBack={onBack}>
      <div className="grid-2">
        <Card>
          <CardHeader><CardTitle>Quick Start</CardTitle></CardHeader>
          <CardContent><Button className="full"><PxIcon name="bolt-solid" />Start Routine</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Diagnostics</CardTitle></CardHeader>
          <CardContent><Button variant="secondary" className="full"><PxIcon name="analytics-solid" />Run Check</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Scheduler</CardTitle></CardHeader>
          <CardContent><Button variant="secondary" className="full"><PxIcon name="clock-solid" />Start Timer</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="row"><Badge variant="secondary">Online</Badge><Badge variant="default">Idle</Badge></CardContent>
        </Card>
      </div>
    </Frame>
  );
}

function SettingsScreen({ onBack }) {
  return (
    <Frame title="Settings" hint="Device and display preferences" onBack={onBack}>
      <Card className="full-h">
        <CardContent className="settings-stack">
          <div className="row"><span>Brightness</span><Badge>80%</Badge></div>
          <Input placeholder="Kiosk title" defaultValue="DuckyDu Kiosk" />
          <Select defaultValue="high">
            <SelectTrigger><SelectValue placeholder="Animation quality" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="mid">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <label className="row"><span>Touch Sound</span><Checkbox defaultChecked /></label>
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced</AccordionTrigger>
              <AccordionContent>
                <div className="stack-sm">
                  <label className="row"><span>Kiosk lock</span><Checkbox defaultChecked /></label>
                  <label className="row"><span>Auto refresh</span><Checkbox /></label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </Frame>
  );
}

function PowerScreen({ mode, onBack }) {
  const reboot = mode === "reboot";
  return (
    <Frame title={reboot ? "Reboot Device" : "Shutdown Device"} hint="Power controls" onBack={onBack}>
      <Card className="power-card">
        <CardHeader><CardTitle>{reboot ? "System restart required?" : "Power off safely?"}</CardTitle></CardHeader>
        <CardContent className="stack-sm">
          <Button variant={reboot ? "warning" : "destructive"} className="full">
            <PxIcon name={reboot ? "refresh-solid" : "window-close-solid"} />
            {reboot ? "Confirm Reboot" : "Confirm Shutdown"}
          </Button>
          <Button variant="secondary" className="full" onClick={onBack}>Cancel</Button>
        </CardContent>
      </Card>
    </Frame>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <Frame title="Profile" hint="Operator identity" onBack={onBack}>
      <Card className="profile-card">
        <CardContent className="profile-content">
          <Avatar size="large" variant="square"><AvatarFallback>DD</AvatarFallback></Avatar>
          <div className="stack-sm center">
            <Badge variant="secondary">Operator</Badge>
            <strong>DuckyDu Admin</strong>
            <Badge>Connected</Badge>
          </div>
        </CardContent>
      </Card>
    </Frame>
  );
}

function LanguageScreen({ onBack }) {
  return (
    <Frame title="Language" hint="Interface language and locale" onBack={onBack}>
      <Card className="full-h">
        <CardContent className="settings-stack">
          <Select defaultValue="en">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid-2">
            <Button className="full">Apply</Button>
            <Button variant="secondary" className="full" onClick={onBack}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </Frame>
  );
}

function App() {
  const [routeStack, setRouteStack] = useState(["home"]);
  const [transition, setTransition] = useState({ phase: "idle", next: null, direction: 1, action: "push" });
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
      const t = setTimeout(() => {
        setRouteStack((prev) => (transition.action === "push" ? [...prev, transition.next] : prev.slice(0, -1)));
        setTransition((p) => ({ ...p, phase: "in" }));
      }, 180);
      return () => clearTimeout(t);
    }
    if (transition.phase === "in") {
      const t = setTimeout(() => setTransition({ phase: "idle", next: null, direction: 1, action: "push" }), 220);
      return () => clearTimeout(t);
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
      <section className="kiosk-shell">
        <div className={`screen-layer phase-${transition.phase} dir-${transition.direction > 0 ? "next" : "back"}`}>
          {screen}
        </div>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
