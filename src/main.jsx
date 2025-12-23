import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IonApp } from "@ionic/react";
import "./index.css";
import App from "./App.jsx";
/* Ionic core styles */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

// /* Tailwind */
// import "./styles/tailwind.css";

// Global error handler for debugging white screen issues
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", { message, source, lineno, colno, error });
  // Show error on screen for debugging
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h2>App Error</h2>
        <p>${message}</p>
        <p>Source: ${source}</p>
        <p>Line: ${lineno}:${colno}</p>
      </div>
    `;
  }
  return false;
};

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

createRoot(document.getElementById("root")).render(
  <IonApp>
    <App />
  </IonApp>
);
