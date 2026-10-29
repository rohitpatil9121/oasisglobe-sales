/* Dev-only in-memory backend so the dashboard can be shown without a server
   (?demo=1). Any phone and password sign in. Reload = fresh data. */
const now = Date.now();
const ago = (d) => new Date(now - d * 86400e3).toISOString();
// Calendar days in IST, like the backend and the pages.
const day = (d) => new Date(now - d * 86400e3).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const team = [
  { id: "s1", full_name: "Kiran Joshi", phone: "+919822011223", is_active: true },
  { id: "s2", full_name: "Neha Kulkarni", phone: "+919890123456", is_active: true },
  { id: "s3", full_name: "Aditya Patil", phone: "+919765400001", is_active: true },
];
const names = Object.fromEntries(team.map((t) => [t.id, t.full_name]));
const L = (id, sp, customer_name, area, interest, source, status, follow, ageDays) =>
  ({ id, salesperson_id: sp, customer_name, phone: "+9198" + id.padStart(8, "0").slice(-8), area, interest, source, status, next_follow_up: follow, created_at: ago(ageDays), updated_at: ago(ageDays / 2) });
const leads = [
  L("1", "s1", "Sunil Deshmukh", "Kothrud", "Purifier", "Walk-in", "quoted", day(2), 6),
  L("2", "s2", "Priya Joshi", "Baner", "Softener", "Call", "demo", day(0), 3),
  L("3", "s1", "Amit Kulkarni", "Aundh", "Purifier", "Reference", "won", null, 12),
  L("4", "s3", "Meena Patil", "Wakad", "Custom cabinet", "Website", "contacted", day(-2), 2),
  L("5", "s2", "Rahul Shinde", "Hadapsar", "Purifier", "Walk-in", "won", null, 9),
  L("6", "s1", "Kavita Rao", "Pashan", "Ionizer", "Reference", "new", day(0), 1),
  L("7", "s3", "Vikas More", "Hinjewadi", "Purifier", "Dealer", "lost", null, 15),
  L("8", "s1", "Snehal Gokhale", "Erandwane", "Purifier", "Walk-in", "won", null, 20),
  L("9", "s2", "Ganesh Pawar", "Kharadi", "Softener", "Call", "quoted", day(1), 5),
  L("10", "s3", "Pooja Iyer", "Viman Nagar", "Purifier", "Website", "won", null, 7),
];
leads[6].lost_reason = "Dusri company se liya";
const O = (id, lead, total, advance, status, ageDays, model) =>
  ({ id, lead_id: lead.id, salesperson_id: lead.salesperson_id, items: [{ model, mrp: total, qty: 1 }], total, advance, status, created_at: ago(ageDays) });
const orders = [
  O("o1", leads[2], 19000, 5000, "installation", 4, "Prospera MAX"),
  O("o2", leads[4], 21000, 21000, "completed", 6, "Prospera Plus"),
  O("o3", leads[7], 16000, 3000, "booked", 1, "Prospera 9L"),
  O("o4", leads[9], 15000, 5000, "dispatched", 2, "Inspera MAX"),
];

const ok = (d) => new Response(JSON.stringify(d), { status: 200, headers: { "Content-Type": "application/json" } });
const lead = (l) => ({ ...l, salesperson: names[l.salesperson_id] });
const withLead = (o) => { const l = leads.find((x) => x.id === o.lead_id); return { ...o, salesperson: names[o.salesperson_id], lead: { customer_name: l.customer_name, phone: l.phone, area: l.area } }; };
const today = day(0);
const open = (l) => !["won", "lost"].includes(l.status);

function overview() {
  const month = today.slice(0, 7);
  const mo = orders.filter((o) => o.status !== "cancelled" && o.created_at.slice(0, 7) === month);
  const ml = leads.filter((l) => l.created_at.slice(0, 7) === month);
  const src = {};
  for (const l of leads) { src[l.source] ||= { source: l.source, count: 0, won: 0 }; src[l.source].count++; if (l.status === "won") src[l.source].won++; }
  const sale = mo.reduce((s, o) => s + o.total, 0);
  return {
    month, sale, orders: mo.length, advance: mo.reduce((s, o) => s + o.advance, 0),
    pending_amount: orders.filter((o) => o.status !== "completed").reduce((s, o) => s + o.total - o.advance, 0),
    new_leads: ml.length, conversion: ml.length ? Math.round((ml.filter((l) => l.status === "won").length / ml.length) * 100) : 0,
    overdue: leads.filter((l) => open(l) && l.next_follow_up && l.next_follow_up < today).length,
    pipeline: Object.fromEntries(["new", "contacted", "demo", "quoted", "won", "lost"].map((s) => [s, leads.filter((l) => l.status === s).length])),
    by_source: Object.values(src).sort((a, b) => b.count - a.count),
    trend: [5, 4, 3, 2, 1, 0].map((i, k) => {
      const d = new Date(today); d.setDate(1); d.setMonth(d.getMonth() - i);
      return { month: d.toISOString().slice(0, 7), sale: i === 0 ? sale : [38000, 52000, 47000, 61000, 70000][k], orders: i === 0 ? mo.length : [2, 3, 3, 4, 4][k] };
    }),
  };
}
function teamStats() {
  const month = today.slice(0, 7);
  return team.map((u) => {
    const mine = leads.filter((l) => l.salesperson_id === u.id);
    const mo = orders.filter((o) => o.salesperson_id === u.id && o.status !== "cancelled" && o.created_at.slice(0, 7) === month);
    return { ...u, open_leads: mine.filter(open).length, overdue: mine.filter((l) => open(l) && l.next_follow_up && l.next_follow_up < today).length,
      month_orders: mo.length, month_sale: mo.reduce((s, o) => s + o.total, 0), total_leads: mine.length, won: mine.filter((l) => l.status === "won").length };
  });
}

export function installMockApi() {
  const real = window.fetch;
  window.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (!u.includes("/api/")) return real(url, opts);
    await new Promise((r) => setTimeout(r, 120));
    const path = u.split("/api")[1].split("?")[0];
    const m = opts.method || "GET";
    const b = opts.body ? JSON.parse(opts.body) : {};
    let r;
    if (path === "/auth/login" || path === "/auth/otp/verify") return ok({ token: "demo", user: { id: "o", full_name: "Bhushan Patil", role: "owner" } });
    if (path === "/auth/otp/request") return ok({ sent: true });
    if (path === "/sales-admin/overview") return ok({ overview: overview() });
    if (path === "/sales-admin/team" && m === "GET") return ok({ team: teamStats() });
    if (path === "/sales-admin/team" && m === "POST") {
      const p = { id: "s" + (team.length + 1), full_name: b.full_name, phone: b.phone, is_active: true };
      team.push(p); names[p.id] = p.full_name; return ok({ salesperson: p });
    }
    if ((r = path.match(/^\/sales-admin\/team\/(\w+)$/))) { const p = team.find((t) => t.id === r[1]); p.is_active = b.is_active; return ok({ salesperson: p }); }
    if (path === "/sales-admin/leads") return ok({ leads: leads.map(lead).sort((a, b2) => b2.updated_at.localeCompare(a.updated_at)) });
    if ((r = path.match(/^\/sales-admin\/leads\/(\w+)$/))) {
      const l = leads.find((x) => x.id === r[1]);
      const os = orders.filter((o) => o.lead_id === l.id);
      const quotations = ["quoted", "won"].includes(l.status) ? [{ id: "q" + l.id, items: os[0]?.items || [{ model: "Prospera MAX", mrp: 19000, qty: 1 }], discount: 0, total: os[0]?.total || 19000, created_at: ago(3) }] : [];
      const events = [
        { id: "e1", kind: "created", text: "Customer ne shop pe enquiry ki", created_at: l.created_at },
        ...(l.status !== "new" ? [{ id: "e2", kind: "status", text: l.status + (l.lost_reason ? ` — ${l.lost_reason}` : ""), created_at: l.updated_at }] : []),
      ].reverse();
      return ok({ lead: { ...lead(l), quotations, orders: os, events } });
    }
    if (path === "/sales-admin/orders") return ok({ orders: orders.map(withLead).sort((a, b2) => b2.created_at.localeCompare(a.created_at)) });
    if ((r = path.match(/^\/sales-admin\/orders\/(\w+)$/))) { const o = orders.find((x) => x.id === r[1]); Object.assign(o, b); return ok({ order: o }); }
    return new Response(JSON.stringify({ error: "Not in demo: " + path }), { status: 404 });
  };
}
