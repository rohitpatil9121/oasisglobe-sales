// API client for the sales backend. Set VITE_API_BASE to its URL in production.
export const BASE = import.meta.env.VITE_API_BASE || "";

let authToken = null;
export function setToken(t) { authToken = t; }

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && authToken) {
      onUnauthorized?.();
      throw new Error("Your session has expired. Please sign in again.");
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (phone, password) => request("/auth/login", { method: "POST", body: { phone, password } }),
  requestOtp: (phone) => request("/auth/otp/request", { method: "POST", body: { phone, scope: "dashboard" } }),
  verifyOtp: (phone, code) => request("/auth/otp/verify", { method: "POST", body: { phone, code, scope: "dashboard" } }),

  salesOverview: () => request("/sales-admin/overview"),
  salesTeam: () => request("/sales-admin/team"),
  addSalesperson: (body) => request("/sales-admin/team", { method: "POST", body }),
  setSalespersonActive: (id, is_active) => request(`/sales-admin/team/${id}`, { method: "PATCH", body: { is_active } }),
  salesLeads: () => request("/sales-admin/leads"),
  salesLead: (id) => request(`/sales-admin/leads/${id}`),
  salesOrders: () => request("/sales-admin/orders"),
  updateSalesOrder: (id, body) => request(`/sales-admin/orders/${id}`, { method: "PATCH", body }),
};
