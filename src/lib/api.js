// Thin API client for the sales backend (/api/sales/*). Same backend and
// WhatsApp OTP login as the technician app; the account's role decides access.

const TOKEN_KEY = "sales_token";

// Empty in dev (Vite proxies /api → :3000). For the APK set VITE_API_BASE to
// https://oasis-service-automation.onrender.com
const BASE = import.meta.env.VITE_API_BASE || "";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

async function req(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth && token) {
      onUnauthorized?.();
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  requestOtp: (phone) => req("/auth/otp/request", { method: "POST", body: { phone }, auth: false }),
  verifyOtp: (phone, code) => req("/auth/otp/verify", { method: "POST", body: { phone, code }, auth: false }),
  me: () => req("/auth/me"),

  leads: () => req("/sales/leads"),
  lead: (id) => req(`/sales/leads/${id}`),
  addLead: (body) => req("/sales/leads", { method: "POST", body }),
  updateLead: (id, body) => req(`/sales/leads/${id}`, { method: "PATCH", body }),
  addQuotation: (id, body) => req(`/sales/leads/${id}/quotations`, { method: "POST", body }),
  addOrder: (id, body) => req(`/sales/leads/${id}/orders`, { method: "POST", body }),
  orders: () => req("/sales/orders"),
  updateOrder: (id, body) => req(`/sales/orders/${id}`, { method: "PATCH", body }),
  summary: () => req("/sales/summary"),
};

// Opening phone / WhatsApp from a card.
export const telUrl = (phone) => `tel:+91${phone}`;
export const waUrl = (phone, text = "") => `https://wa.me/91${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
