import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Safety net: if anything throws during startup (e.g. a WebGL/GLSL error in the
// Three.js world), show a readable error instead of an endless white screen.
const rootEl = document.getElementById("root")!;
window.addEventListener("error", (e) => {
  if (!rootEl.hasChildNodes()) {
    rootEl.innerHTML =
      '<div style="padding:40px;font-family:monospace;color:#525252">' +
      "<h2 style='color:#000'>Startup error</h2><pre style='white-space:pre-wrap'>" +
      String(e.message) + "</pre></div>";
  }
});

let AppComp: React.ComponentType;

// Load the app inside a promise chain so module-eval crashes (scene bootstrap,
// WebGL issues, etc.) surface visibly rather than leaving a blank page.
import("./App.tsx")
  .then((mod) => {
    AppComp = mod.default;
    ReactDOM.createRoot(rootEl).render(<AppComp />);
  })
  .catch((err) => {
    console.error("Failed to boot app:", err);
    ReactDOM.createRoot(rootEl).render(
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm font-medium">Something went wrong starting the app.</p>
          <pre className="text-xs text-left opacity-60 whitespace-pre-wrap">{String(err)}</pre>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-full border text-sm"
          >
            Reload
          </button>
        </div>
      </div>
    );
  });

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
