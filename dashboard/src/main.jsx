import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./index.css";

// VITE_DEMO=1 makes a build that always runs on sample data, as one HTML file
// opened from disk — so it uses hash URLs, which work without a server.
const DEMO_BUILD = import.meta.env.VITE_DEMO === "1";
const Router = DEMO_BUILD ? HashRouter : BrowserRouter;

const mount = () =>
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );

/* ?demo=1 runs on sample data with no server, for showing the dashboard.
   Dev builds only — Rollup drops it from production. ?demo=0 turns it off. */
let demo = DEMO_BUILD;
if (import.meta.env.DEV) {
  if (location.search.includes("demo=0")) sessionStorage.removeItem("os_demo");
  else if (location.search.includes("demo=1")) sessionStorage.setItem("os_demo", "1");
  demo = sessionStorage.getItem("os_demo") === "1";
}
if (demo) import("./api/mockApi.js").then(({ installMockApi }) => { installMockApi(); mount(); });
else mount();
