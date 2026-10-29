/* Sales app: a salesperson's leads, quotations and orders.
   Every read and write is scoped to the logged-in salesperson; nothing here
   lets one salesperson see another's customers. */
import { supabase } from "../lib/supabase.js";
import { allRows } from "../lib/allRows.js";

export const LEAD_STATUSES = ["new", "contacted", "demo", "quoted", "won", "lost"];
export const ORDER_STATUSES = ["booked", "dispatched", "installation", "completed", "cancelled"];

function fail(status, message) { const e = new Error(message); e.status = status; throw e; }
const str = (v, max = 200) => (v == null ? null : String(v).trim().slice(0, max) || null);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST

async function logEvent(leadId, userId, kind, text) {
  await supabase.from("lead_events").insert({ lead_id: leadId, user_id: userId, kind, text });
}

async function ownLead(userId, id) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).eq("salesperson_id", userId).maybeSingle();
  if (error) throw new Error(`lead: ${error.message}`);
  if (!data) fail(404, "Lead not found");
  return data;
}

export async function listMyLeads(userId) {
  const { data, error } = await allRows(() => supabase.from("leads").select("*").eq("salesperson_id", userId));
  if (error) throw new Error(`leads: ${error.message}`);
  return data.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

export async function getMyLead(userId, id) {
  const lead = await ownLead(userId, id);
  const [ev, qt, od] = await Promise.all([
    supabase.from("lead_events").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("quotations").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("sales_orders").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  return { ...lead, events: ev.data || [], quotations: qt.data || [], orders: od.data || [] };
}

export async function createLead(userId, body = {}) {
  const customer_name = str(body.customer_name, 120);
  const phone = str(body.phone, 20)?.replace(/\D/g, "").slice(-10);
  if (!customer_name) fail(400, "Customer name required");
  if (!phone || phone.length !== 10) fail(400, "10-digit phone required");
  if (body.client_id) {
    const { data: dup } = await supabase.from("leads").select("*").eq("client_id", body.client_id).maybeSingle();
    if (dup) return dup;
  }
  const row = {
    salesperson_id: userId, customer_name, phone,
    area: str(body.area), interest: str(body.interest), source: str(body.source),
    note: str(body.note, 1000), next_follow_up: str(body.next_follow_up, 10) || today(),
    client_id: str(body.client_id, 80),
  };
  const { data, error } = await supabase.from("leads").insert(row).select().single();
  if (error) throw new Error(`create lead: ${error.message}`);
  await logEvent(data.id, userId, "created", row.note);
  return data;
}

/* One endpoint for every edit from Lead Detail: status, follow-up date, note. */
export async function updateLead(userId, id, body = {}) {
  const lead = await ownLead(userId, id);
  const patch = { updated_at: new Date().toISOString() };
  const events = [];
  if (body.status && body.status !== lead.status) {
    if (!LEAD_STATUSES.includes(body.status)) fail(400, "Bad status");
    patch.status = body.status;
    if (body.status === "lost") patch.lost_reason = str(body.lost_reason, 300);
    events.push(["status", body.status + (patch.lost_reason ? ` — ${patch.lost_reason}` : "")]);
  }
  if (body.next_follow_up !== undefined && body.next_follow_up !== lead.next_follow_up) {
    patch.next_follow_up = str(body.next_follow_up, 10);
    events.push(["follow_up", patch.next_follow_up]);
  }
  for (const k of ["area", "interest"]) if (body[k] !== undefined) patch[k] = str(body[k]);
  if (str(body.note, 1000)) events.push(["note", str(body.note, 1000)]);
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select().single();
  if (error) throw new Error(`update lead: ${error.message}`);
  for (const [kind, text] of events) await logEvent(id, userId, kind, text);
  return data;
}

function cleanItems(items) {
  return (Array.isArray(items) ? items : []).slice(0, 30).map((i) => ({
    model: str(i.model, 120), mrp: num(i.mrp), qty: Math.max(1, Math.round(num(i.qty) || 1)),
  })).filter((i) => i.model);
}

export async function createQuotation(userId, leadId, body = {}) {
  const lead = await ownLead(userId, leadId);
  const items = cleanItems(body.items);
  if (!items.length) fail(400, "Add at least one product");
  const gross = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const discount = Math.min(Math.max(0, num(body.discount)), gross);
  const row = { lead_id: leadId, salesperson_id: userId, items, discount, total: gross - discount };
  const { data, error } = await supabase.from("quotations").insert(row).select().single();
  if (error) throw new Error(`quotation: ${error.message}`);
  if (["new", "contacted", "demo"].includes(lead.status))
    await supabase.from("leads").update({ status: "quoted", updated_at: new Date().toISOString() }).eq("id", leadId);
  await logEvent(leadId, userId, "quote", `Quotation ₹${row.total}`);
  return data;
}

export async function createOrder(userId, leadId, body = {}) {
  await ownLead(userId, leadId);
  let items = cleanItems(body.items), total = num(body.total), quotation_id = str(body.quotation_id, 40);
  if (quotation_id) {
    const { data: q } = await supabase.from("quotations").select("*").eq("id", quotation_id).eq("lead_id", leadId).maybeSingle();
    if (!q) fail(404, "Quotation not found");
    items = q.items; total = num(q.total);
  }
  if (!items.length) fail(400, "Order needs products");
  const row = { lead_id: leadId, salesperson_id: userId, quotation_id, items, total, advance: Math.max(0, num(body.advance)) };
  const { data, error } = await supabase.from("sales_orders").insert(row).select().single();
  if (error) throw new Error(`order: ${error.message}`);
  await supabase.from("leads").update({ status: "won", updated_at: new Date().toISOString() }).eq("id", leadId);
  await logEvent(leadId, userId, "order", `Order ₹${total}, advance ₹${row.advance}`);
  return data;
}

export async function listMyOrders(userId) {
  const { data, error } = await allRows(() =>
    supabase.from("sales_orders").select("*, lead:leads(customer_name, phone, area)").eq("salesperson_id", userId));
  if (error) throw new Error(`orders: ${error.message}`);
  return data.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function updateOrder(userId, id, body = {}) {
  const patch = { updated_at: new Date().toISOString() };
  if (body.status) {
    if (!ORDER_STATUSES.includes(body.status)) fail(400, "Bad status");
    patch.status = body.status;
  }
  if (body.advance !== undefined) patch.advance = Math.max(0, num(body.advance));
  const { data, error } = await supabase.from("sales_orders").update(patch)
    .eq("id", id).eq("salesperson_id", userId).select().maybeSingle();
  if (error) throw new Error(`update order: ${error.message}`);
  if (!data) fail(404, "Order not found");
  await logEvent(data.lead_id, userId, "order", `Order ${patch.status || "updated"}`);
  return data;
}

/* My Work: this month's numbers. */
export async function mySummary(userId) {
  const month = today().slice(0, 7);
  const [leads, orders] = await Promise.all([listMyLeads(userId), listMyOrders(userId)]);
  const inMonth = (d) => String(d || "").slice(0, 7) === month;
  const monthOrders = orders.filter((o) => inMonth(o.created_at) && o.status !== "cancelled");
  const monthLeads = leads.filter((l) => inMonth(l.created_at));
  return {
    month,
    leads: monthLeads.length,
    won: monthOrders.length,
    sale: monthOrders.reduce((s, o) => s + num(o.total), 0),
    advance: monthOrders.reduce((s, o) => s + num(o.advance), 0),
    conversion: monthLeads.length ? Math.round((monthLeads.filter((l) => l.status === "won").length / monthLeads.length) * 100) : 0,
    dueToday: leads.filter((l) => !["won", "lost"].includes(l.status) && l.next_follow_up && l.next_follow_up <= today()).length,
  };
}

/* ---------------- Owner: the sales dashboard ----------------
   Same tables, no salesperson scope. Owner-only (see routes/salesAdmin.js). */

const isOpenLead = (l) => !["won", "lost"].includes(l.status);

async function allLeads() {
  const { data, error } = await allRows(() => supabase.from("leads").select("*"));
  if (error) throw new Error(`leads: ${error.message}`);
  return data;
}
async function allOrders() {
  const { data, error } = await allRows(() => supabase.from("sales_orders").select("*"));
  if (error) throw new Error(`orders: ${error.message}`);
  return data;
}
async function namesById() {
  const { data } = await supabase.from("users").select("id, full_name").eq("role", "sales");
  return Object.fromEntries((data || []).map((u) => [u.id, u.full_name]));
}

export async function listTeam() {
  const { data: users, error } = await supabase.from("users")
    .select("id, full_name, phone, is_active, created_at").eq("role", "sales").order("full_name");
  if (error) throw new Error(`team: ${error.message}`);
  const [leads, orders] = await Promise.all([allLeads(), allOrders()]);
  const t = today(), month = t.slice(0, 7);
  return users.map((u) => {
    const mine = leads.filter((l) => l.salesperson_id === u.id);
    const monthOrders = orders.filter((o) => o.salesperson_id === u.id && o.status !== "cancelled" && String(o.created_at).slice(0, 7) === month);
    return {
      ...u,
      open_leads: mine.filter(isOpenLead).length,
      overdue: mine.filter((l) => isOpenLead(l) && l.next_follow_up && l.next_follow_up < t).length,
      month_orders: monthOrders.length,
      month_sale: monthOrders.reduce((s, o) => s + num(o.total), 0),
      total_leads: mine.length,
      won: mine.filter((l) => l.status === "won").length,
    };
  });
}

export async function addSalesperson({ full_name, phone } = {}) {
  const name = str(full_name, 120);
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (!name) fail(400, "Name required");
  if (!/^[6-9]\d{9}$/.test(digits)) fail(400, "10-digit mobile required");
  const e164 = "+91" + digits;
  const { data: existing } = await supabase.from("users").select("id, role").eq("phone", e164).maybeSingle();
  if (existing) fail(409, existing.role === "sales" ? "This number is already a salesperson" : `This number is already a ${existing.role}`);
  const { data, error } = await supabase.from("users").insert({ full_name: name, phone: e164, role: "sales" })
    .select("id, full_name, phone, is_active").single();
  if (error) throw new Error(`add salesperson: ${error.message}`);
  return data;
}

export async function setSalespersonActive(id, active) {
  const { data, error } = await supabase.from("users").update({ is_active: !!active, updated_at: new Date().toISOString() })
    .eq("id", id).eq("role", "sales").select("id, full_name, phone, is_active").maybeSingle();
  if (error) throw new Error(`salesperson: ${error.message}`);
  if (!data) fail(404, "Salesperson not found");
  return data;
}

export async function adminLeads() {
  const [leads, names] = await Promise.all([allLeads(), namesById()]);
  return leads.map((l) => ({ ...l, salesperson: names[l.salesperson_id] || "—" }))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

export async function adminLead(id) {
  const { data } = await supabase.from("leads").select("salesperson_id").eq("id", id).maybeSingle();
  if (!data) fail(404, "Lead not found");
  const lead = await getMyLead(data.salesperson_id, id);
  return { ...lead, salesperson: (await namesById())[data.salesperson_id] || "—" };
}

export async function adminOrders() {
  const [orders, leads, names] = await Promise.all([allOrders(), allLeads(), namesById()]);
  const byId = Object.fromEntries(leads.map((l) => [l.id, l]));
  return orders.map((o) => {
    const l = byId[o.lead_id];
    return { ...o, salesperson: names[o.salesperson_id] || "—", lead: l ? { customer_name: l.customer_name, phone: l.phone, area: l.area } : null };
  }).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function adminUpdateOrder(id, body = {}) {
  const { data } = await supabase.from("sales_orders").select("salesperson_id").eq("id", id).maybeSingle();
  if (!data) fail(404, "Order not found");
  return updateOrder(data.salesperson_id, id, body);
}

/* Overview: this month, the pipeline, lead sources, and a 6-month sale trend. */
export async function adminOverview() {
  const [leads, orders] = await Promise.all([allLeads(), allOrders()]);
  const t = today(), month = t.slice(0, 7);
  const live = orders.filter((o) => o.status !== "cancelled");
  const inMonth = (d, m = month) => String(d || "").slice(0, 7) === m;
  const monthOrders = live.filter((o) => inMonth(o.created_at));
  const monthLeads = leads.filter((l) => inMonth(l.created_at));
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(t + "T00:00:00Z"); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i);
    const m = d.toISOString().slice(0, 7);
    const os = live.filter((o) => inMonth(o.created_at, m));
    trend.push({ month: m, sale: os.reduce((s, o) => s + num(o.total), 0), orders: os.length });
  }
  const sources = {};
  for (const l of leads) {
    const k = l.source || "—";
    sources[k] ||= { source: k, count: 0, won: 0 };
    sources[k].count++; if (l.status === "won") sources[k].won++;
  }
  return {
    month,
    sale: monthOrders.reduce((s, o) => s + num(o.total), 0),
    orders: monthOrders.length,
    advance: monthOrders.reduce((s, o) => s + num(o.advance), 0),
    pending_amount: live.filter((o) => o.status !== "completed").reduce((s, o) => s + num(o.total) - num(o.advance), 0),
    new_leads: monthLeads.length,
    conversion: monthLeads.length ? Math.round((monthLeads.filter((l) => l.status === "won").length / monthLeads.length) * 100) : 0,
    overdue: leads.filter((l) => isOpenLead(l) && l.next_follow_up && l.next_follow_up < t).length,
    pipeline: Object.fromEntries(LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length])),
    by_source: Object.values(sources).sort((a, b) => b.count - a.count),
    trend,
  };
}
