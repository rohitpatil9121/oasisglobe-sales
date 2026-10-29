import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { SalesProvider } from "./store/SalesContext.jsx";
import "./index.css";

/* Browser demo: ?demo=1 swaps the backend for an in-memory stub so the app is
   walkable without a server. Dev builds only — Rollup drops it from the APK. */
const DEMO_KEY = "og-sales-demo";
// VITE_DEMO=1 makes a build that always runs on sample data (the HTML file sent to clients).
let wantsDemo = import.meta.env.VITE_DEMO === "1";
if (import.meta.env.DEV) {
  if (location.search.includes("demo=0")) localStorage.removeItem(DEMO_KEY);
  else if (location.search.includes("demo=1")) localStorage.setItem(DEMO_KEY, "1");
  wantsDemo = localStorage.getItem(DEMO_KEY) === "1";
}

const mount = () =>
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <HashRouter>
        <SalesProvider>
          <App />
        </SalesProvider>
      </HashRouter>
    </React.StrictMode>
  );

if (wantsDemo) import("./lib/mockApi.js").then(({ installMockApi }) => { installMockApi(); mount(); });
else mount();
