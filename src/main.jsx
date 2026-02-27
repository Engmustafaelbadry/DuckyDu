import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return <main className="blank-root">Blank Project</main>;
}

createRoot(document.querySelector("#app")).render(<App />);
