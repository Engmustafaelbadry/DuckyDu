import "./style.css";

const apps = [
  { id: "backup", name: "Backup", code: "BK" },
  { id: "cloud", name: "Cloud", code: "CL" },
  { id: "apps", name: "App Install", code: "AP" },
  { id: "repair", name: "Repair", code: "RP" },
  { id: "flash", name: "Flash Tool", code: "FL" },
  { id: "diagnostics", name: "Diagnostics", code: "DG" },
  { id: "device-info", name: "Device Info", code: "DI" },
  { id: "file-sync", name: "File Sync", code: "FS" },
  { id: "network", name: "Network", code: "NW" },
  { id: "power", name: "Power", code: "PW" }
];

const appRoot = document.querySelector("#app");

appRoot.innerHTML = `
  <main class="device-shell">
    <header class="topbar">
      <div class="topbar-left">
        <span class="device-name">DuckyDu</span>
        <span class="resolution">Phone Manager • 800x480</span>
      </div>
      <div class="topbar-right">
        <span id="network-state" class="pill">Network: checking</span>
        <span id="clock" class="pill">--:--</span>
      </div>
    </header>
    <section class="menu-grid" id="menu-grid"></section>
    <footer class="hintbar" id="hintbar">
      DuckyDu is running in lightweight mode for Pi Zero 2 W (512MB).
    </footer>
  </main>
`;

const grid = document.querySelector("#menu-grid");
const clock = document.querySelector("#clock");
const networkState = document.querySelector("#network-state");
const hintbar = document.querySelector("#hintbar");

function renderApps() {
  grid.innerHTML = apps
    .map(
      (app) => `
      <button class="menu-item" data-app-id="${app.id}" aria-label="${app.name}">
        <span class="menu-icon">${app.code}</span>
        <span class="menu-label">${app.name}</span>
      </button>
    `
    )
    .join("");
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateClock() {
  clock.textContent = formatClock(new Date());
}

function updateNetworkState() {
  const online = navigator.onLine;
  networkState.textContent = online ? "Network: online" : "Network: offline";
}

function onAppTap(event) {
  const button = event.target.closest(".menu-item");
  if (!button) return;

  const appId = button.dataset.appId;
  const app = apps.find((item) => item.id === appId);
  if (!app) return;

  hintbar.textContent = `${app.name} selected. We will connect real functionality next.`;
}

renderApps();
updateClock();
updateNetworkState();

setInterval(updateClock, 15_000);
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
grid.addEventListener("click", onAppTap);
