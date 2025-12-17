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

createRoot(document.getElementById("root")).render(
  <IonApp>
    <App />
  </IonApp>
);
