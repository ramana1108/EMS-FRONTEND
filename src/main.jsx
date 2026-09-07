import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const syncViewportHeight = () => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight ?? document.documentElement.clientHeight ?? 800;
  document.documentElement.style.setProperty("--app-vh", `${viewportHeight}px`);
};

syncViewportHeight();
window.addEventListener("resize", syncViewportHeight, { passive: true });
window.visualViewport?.addEventListener("resize", syncViewportHeight, { passive: true });
window.visualViewport?.addEventListener("scroll", syncViewportHeight, { passive: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);