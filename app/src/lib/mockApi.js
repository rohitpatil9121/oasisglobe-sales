/* Dev-only in-memory backend so the app can be walked in a browser (?demo=1).
   Any phone + any 6-digit code signs in. Reload = fresh data. */
import { istToday, addDays } from "./format.js";

const T = istToday();
const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const lead = (o) => ({ created_at: now(), updated_at: now(), ...o });
const db = {
  leads: [
    lead({ id: "l1", customer_name: "Sunil Deshmukh", phone: "9822011223", area: "Kothrud", interest: "Purifier", source: "Walk-in", status: "new", next_follow_up: T, note: "Borewell water, wants RO+UV" }),
    lead({ id: "l2", customer_name: "Priya Joshi", phone: "9890123456", area: "Baner", interest: "Softener", source: "Call", status: "demo", next_follow_up: T, note: "Demo at 5 PM" }),
    lead({ id: "l3", customer_name: "Amit Kulkarni", phone: "9765432109", area: "Aundh", interest: "Purifier", source: "Reference", status: "quoted", next_follow_up: addDays(T, -1) }),
    lead({ id: "l4", customer_name: "Meena Patil", phone: "9123456780", area: "Wakad", interest: "Custom cabinet", source: "Website", status: "contacted", next_follow_up: addDays(T, 2) }),
  ],
  events: [], quotations: [], orders: [],
};
const ok = (d) => new Response(JSON.stringify(d), { status: 200, headers: { "Content-Type": "application/json" } });
const bad = (m) => new Response(JSON.stringify({ error: m }), { status: 400 });
const ev = (lead_id, kind, text) => db.events.unshift({ id: id(), lead_id, kind, text, created_at: now() });
const touch = (l, p) => Object.assign(l, p, { updated_at: now() });

export function installMockApi() {
  const real = window.fetch;
  window.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (!u.includes("/api/")) return real(url, opts);
    await new Promise((r) => setTimeout(r, 150));
    const path = u.split("/api")[1];
    const m = opts.method || "GET";
    const b = opts.body ? JSON.parse(opts.body) : {};
    let r;
    if (path === "/auth/otp/request") return ok({ ok: true });
    if (path === "/auth/otp/verify") return ok({ token: "demo", user: { id: "u1", full_name: "Kiran Joshi", phone: b.phone, role: "sales" } });
    if (path === "/auth/me") return ok({ user: {} });
    if (path === "/sales/leads" && m === "GET") return ok({ leads: db.leads });
    if (path === "/sales/leads" && m === "POST") {
      if (!b.customer_name || !/^\d{10}$/.test(b.phone || "")) return bad("Name and 10-digit phone required");
      const l = lead({ id: id(), status: "new", ...b, next_follow_up: b.next_follow_up || T });
      db.leads.unshift(l); ev(l.id, "created", b.note);
      return ok({ lead: l });
    }
    if ((r = path.match(/^\/sales\/leads\/(\w+)$/))) {
      const l = db.leads.find((x) => x.id === r[1]);
      if (m === "PATCH") {
        if (b.status && b.status !== l.status) ev(l.id, "status", b.status + (b.lost_reason ? ` — ${b.lost_reason}` : ""));
        if (b.next_follow_up !== undefined && b.next_follow_up !== l.next_follow_up) ev(l.id, "follow_up", b.next_follow_up);
        if (b.note) ev(l.id, "note", b.note);
        const { note, ...p } = b;
        touch(l, p);
        return ok({ lead: l });
      }
      return ok({ lead: { ...l,
        events: db.events.filter((e) => e.lead_id === l.id),
        quotations: db.quotations.filter((q) => q.lead_id === l.id),
        orders: db.orders.filter((o) => o.lead_id === l.id) } });
    }
    if ((r = path.match(/^\/sales\/leads\/(\w+)\/quotations$/))) {
      const gross = b.items.reduce((s, i) => s + i.mrp * i.qty, 0);
      const q = { id: id(), lead_id: r[1], items: b.items, discount: b.discount || 0, total: gross - (b.discount || 0), created_at: now() };
      db.quotations.unshift(q);
      const l = db.leads.find((x) => x.id === r[1]);
      if (["new", "contacted", "demo"].includes(l.status)) touch(l, { status: "quoted" });
      ev(r[1], "quote", `Quotation ₹${q.total}`);
      return ok({ quotation: q });
    }
    if ((r = path.match(/^\/sales\/leads\/(\w+)\/orders$/))) {
      const q = db.quotations.find((x) => x.id === b.quotation_id);
      const o = { id: id(), lead_id: r[1], quotation_id: b.quotation_id, items: q.items, total: q.total, advance: b.advance || 0, status: "booked", created_at: now() };
      db.orders.unshift(o);
      touch(db.leads.find((x) => x.id === r[1]), { status: "won" });
      ev(r[1], "order", `Order ₹${o.total}, advance ₹${o.advance}`);
      return ok({ order: o });
    }
    if (path === "/sales/orders") return ok({ orders: db.orders.map((o) => ({ ...o, lead: db.leads.find((l) => l.id === o.lead_id) })) });
    if ((r = path.match(/^\/sales\/orders\/(\w+)$/))) {
      const o = db.orders.find((x) => x.id === r[1]);
      Object.assign(o, b);
      return ok({ order: o });
    }
    if (path === "/sales/summary") {
      const won = db.orders.filter((o) => o.status !== "cancelled");
      return ok({ summary: {
        month: T.slice(0, 7), leads: db.leads.length, won: won.length,
        sale: won.reduce((s, o) => s + o.total, 0), advance: won.reduce((s, o) => s + o.advance, 0),
        conversion: Math.round((won.length / db.leads.length) * 100),
        dueToday: db.leads.filter((l) => !["won", "lost"].includes(l.status) && l.next_follow_up <= T).length,
      } });
    }
    return bad("Not in demo: " + path);
  };
}
