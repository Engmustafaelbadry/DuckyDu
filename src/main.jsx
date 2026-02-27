import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowLeft,
  Globe2,
  Languages,
  Power,
  RotateCcw,
  Settings,
  Sparkles,
  Timer,
  UserRound,
  Volume2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./style.css";

const actions = [
  { id: "settings", icon: Settings, label: "Settings", variant: "secondary" },
  { id: "reboot", icon: RotateCcw, label: "Reboot", variant: "outline" },
  { id: "shutdown", icon: Power, label: "Shutdown", variant: "destructive" },
  { id: "profile", icon: UserRound, label: "Profile", variant: "secondary" },
  { id: "language", icon: Languages, label: "Language", variant: "secondary" }
];

function ScreenFrame({ title, subtitle, onBack, children }) {
  return (
    <section className="screen-frame">
      <header className="screen-header">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="screen-content">{children}</div>
    </section>
  );
}

function HomeScreen({ onNavigate }) {
  return (
    <section className="home-screen">
      <Card className="hero-card">
        <CardHeader className="hero-header">
          <Badge className="hero-badge"><Sparkles size={12} />DuckyDu</Badge>
          <CardTitle>Smart Kiosk Panel</CardTitle>
        </CardHeader>
        <CardContent className="hero-content">
          <Button size="lg" className="w-full" onClick={() => onNavigate("work")}>
            GET TO WORK
          </Button>
          <div className="action-grid">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className="action-button"
                  onClick={() => onNavigate(action.id)}
                >
                  <Icon size={16} />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function WorkScreen({ onBack }) {
  return (
    <ScreenFrame title="Work Mode" subtitle="Live operational controls" onBack={onBack}>
      <div className="grid-2">
        <Card>
          <CardHeader><CardTitle>Quick Start</CardTitle></CardHeader>
          <CardContent><Button className="w-full"><Sparkles size={16} />Start Routine</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Diagnostics</CardTitle></CardHeader>
          <CardContent><Button variant="secondary" className="w-full"><Activity size={16} />Run Check</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Scheduler</CardTitle></CardHeader>
          <CardContent><Button variant="secondary" className="w-full"><Timer size={16} />Start Timer</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="row">
            <Badge>Online</Badge>
            <Badge variant="secondary">Idle</Badge>
          </CardContent>
        </Card>
      </div>
    </ScreenFrame>
  );
}

function SettingsScreen({ onBack }) {
  return (
    <ScreenFrame title="Settings" subtitle="Device preferences and behavior" onBack={onBack}>
      <Card className="full-height">
        <CardContent className="stack">
          <div className="row">
            <span>Brightness</span>
            <Badge variant="secondary">80%</Badge>
          </div>
          <Input defaultValue="DuckyDu Kiosk" placeholder="Kiosk title" />
          <Select defaultValue="high">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Animation Quality: High</SelectItem>
              <SelectItem value="mid">Animation Quality: Medium</SelectItem>
              <SelectItem value="low">Animation Quality: Low</SelectItem>
            </SelectContent>
          </Select>
          <label className="row"><span>Touch sound</span><Checkbox defaultChecked /></label>
          <label className="row"><span>System volume</span><Volume2 size={16} /></label>
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
    </ScreenFrame>
  );
}

function PowerScreen({ mode, onBack }) {
  const reboot = mode === "reboot";
  return (
    <ScreenFrame title={reboot ? "Reboot Device" : "Shutdown Device"} subtitle="Power management" onBack={onBack}>
      <Card className="full-height">
        <CardHeader><CardTitle>{reboot ? "Restart system now?" : "Power off safely?"}</CardTitle></CardHeader>
        <CardContent className="stack">
          <Button variant={reboot ? "secondary" : "destructive"} className="w-full">
            {reboot ? <RotateCcw size={16} /> : <Power size={16} />}
            {reboot ? "Confirm Reboot" : "Confirm Shutdown"}
          </Button>
          <Button variant="outline" className="w-full" onClick={onBack}>Cancel</Button>
        </CardContent>
      </Card>
    </ScreenFrame>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <ScreenFrame title="Profile" subtitle="Operator identity" onBack={onBack}>
      <Card className="full-height">
        <CardContent className="profile">
          <Avatar className="h-16 w-16">
            <AvatarFallback>DD</AvatarFallback>
          </Avatar>
          <strong>DuckyDu Operator</strong>
          <Badge>Connected</Badge>
        </CardContent>
      </Card>
    </ScreenFrame>
  );
}

function LanguageScreen({ onBack }) {
  return (
    <ScreenFrame title="Language" subtitle="Locale and language selection" onBack={onBack}>
      <Card className="full-height">
        <CardContent className="stack">
          <div className="row"><Globe2 size={16} /><span>Language</span></div>
          <Select defaultValue="en">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid-2">
            <Button className="w-full">Apply</Button>
            <Button variant="outline" className="w-full" onClick={onBack}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </ScreenFrame>
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
      const timer = setTimeout(() => {
        setRouteStack((prev) => (transition.action === "push" ? [...prev, transition.next] : prev.slice(0, -1)));
        setTransition((prev) => ({ ...prev, phase: "in" }));
      }, 180);
      return () => clearTimeout(timer);
    }

    if (transition.phase === "in") {
      const timer = setTimeout(() => setTransition({ phase: "idle", next: null, direction: 1, action: "push" }), 220);
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
    <main className="app-root dark">
      <section className="app-shell">
        <div className={`screen-layer phase-${transition.phase} dir-${transition.direction > 0 ? "next" : "back"}`}>
          {screen}
        </div>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
