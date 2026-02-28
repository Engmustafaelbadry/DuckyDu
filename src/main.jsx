import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 480;

function App() {
  const [metrics, setMetrics] = useState({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    dpr: window.devicePixelRatio
  });

  useEffect(() => {
    function updateMetrics() {
      setMetrics({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        dpr: window.devicePixelRatio
      });
    }

    window.addEventListener("resize", updateMetrics);
    window.addEventListener("orientationchange", updateMetrics);
    updateMetrics();

    return () => {
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("orientationchange", updateMetrics);
    };
  }, []);

  const missingX = TARGET_WIDTH - metrics.innerWidth;
  const missingY = TARGET_HEIGHT - metrics.innerHeight;

  return (
    <main className="calib-root">
      <div className="viewport-border" />
      <div className="crosshair crosshair-x" />
      <div className="crosshair crosshair-y" />

      <div className="target-frame">
        <div className="target-label">{TARGET_WIDTH} x {TARGET_HEIGHT} target</div>
      </div>

      <section className="panel">
        <h1>Screen Calibration</h1>
        <p>Inner (real canvas): {metrics.innerWidth} x {metrics.innerHeight}</p>
        <p>Outer (window): {metrics.outerWidth} x {metrics.outerHeight}</p>
        <p>Device Pixel Ratio: {metrics.dpr}</p>
        <p>Missing X for 800 width: {missingX > 0 ? `${missingX}px` : `0px (extra ${Math.abs(missingX)}px)`}</p>
        <p>Missing Y for 480 height: {missingY > 0 ? `${missingY}px` : `0px (extra ${Math.abs(missingY)}px)`}</p>
        <p className="hint">Take a photo of this screen and share the numbers.</p>
      </section>
    </main>
  );
}

createRoot(document.querySelector("#app")).render(<App />);
