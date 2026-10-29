import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./index.css";

const mount = () =>
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

/* ?demo=1 runs on sample data with no server, for showing the dashboard.
   Dev builds only — Rollup drops it from production. ?demo=0 turns it off. */
let demo = false;
if (import.meta.env.DEV) {
  if (location.search.includes("demo=0")) sessionStorage.removeItem("os_demo");
  else if (location.search.includes("demo=1")) sessionStorage.setItem("os_demo", "1");
  demo = sessionStorage.getItem("os_demo") === "1";
}
if (demo) import("./api/mockApi.js").then(({ installMockApi }) => { installMockApi(); mount(); });
else mount();
