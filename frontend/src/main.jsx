import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { requestPersistentStorage } from "./storage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Save the app for offline use. Production builds only: the dev server
// changes files constantly, and a saved copy would just get in the way.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => console.error("Couldn't set up offline support", err));
  });
}

requestPersistentStorage();
