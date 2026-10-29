import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Alert, EmptyState, Input, Modal, Select, Spinner, timeAgo } from "../components/ui.jsx";
import { money } from "../lib/chart.js";
import { LEAD_STATUSES, PageHead, Pill, istToday, localPhone, shortDate, statusLabel } from "./shared.jsx";

/* Every lead across the team, with filters; a row opens the lead's history. */
export default function SalesLeads() {
  const [params] = useSearchParams();
  const [leads, setLeads] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("open");
  const [person, setPerson] = useState("");
  const [lateOnly, setLateOnly] = useState(params.get("late") === "1");
  const [openId, setOpenId] = useState(null);

  useEffect(() => { api.salesLeads().then((r) => setLeads(r.leads)).catch((e) => { setErr(e.message); setLeads([]); }); }, []);

  const t = istToday();
  const isOpen = (l) => !["won", "lost"].includes(l.status);
  const late = (l) => isOpen(l) && l.next_follow_up && l.next_follow_up < t;
  const people = useMemo(() => [...new Set((leads || []).map((l) => l.salesperson))].sort(), [leads]);
  const shown = (leads || []).filter((l) =>
    (status === "all" || (status === "open" ? isOpen(l) : l.status === status)) &&
    (!person || l.salesperson === person) &&
    (!lateOnly || late(l)) &&
    (!q || `${l.customer_name} ${l.phone} ${l.area || ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageHead title="Leads" sub={`${shown.length} of ${(leads || []).length} leads`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input className="!w-60" placeholder="Name, phone or area" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <Select className="!w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="open">Open</option>
          <option value="all">All</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </Select>
        <Select className="!w-44" value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Salesperson">
          <option value="">All salespeople</option>
          {people.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={lateOnly} onChange={(e) => setLateOnly(e.target.checked)} /> Late follow-ups only
        </label>
      </div>
      {err && <Alert>{err}</Alert>}
      {leads === null ? <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
        : !shown.length ? <EmptyState icon="user" title="No leads here" hint="Leads appear as salespeople add them in the Sales app." />
        : (
          <div className="overflow-x-auto rounded-2xl border border-ash bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ash text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Wants</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Salesperson</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Follow-up</th></tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id} onClick={() => setOpenId(l.id)} className="cursor-pointer border-b border-ash last:border-0 hover:bg-paper">
                    <td className="px-4 py-3"><div className="font-medium text-slate-900">{l.customer_name}</div><div className="text-xs text-slate-500">{localPhone(l.phone)}{l.area && ` · ${l.area}`}</div></td>
                    <td className="px-4 py-3 text-slate-600">{l.interest || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{l.source || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{l.salesperson}</td>
                    <td className="px-4 py-3"><Pill status={l.status} /></td>
                    <td className={`px-4 py-3 ${late(l) ? "font-semibold text-rose-700" : "text-slate-600"}`}>{isOpen(l) ? shortDate(l.next_follow_up) : "—"}{late(l) && " · late"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {openId && <LeadModal id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function LeadModal({ id, onClose }) {
  const [l, setL] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.salesLead(id).then((r) => setL(r.lead)).catch((e) => setErr(e.message)); }, [id]);
  return (
    <Modal title={l?.customer_name || "Lead"} subtitle={l ? `${localPhone(l.phone)} · ${l.salesperson}` : ""} onClose={onClose}>
      {err && <Alert>{err}</Alert>}
      {!l ? <div className="flex justify-center py-8"><Spinner /></div> : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Pill status={l.status} />
            <span className="text-slate-500">{[l.interest, l.area, l.source].filter(Boolean).join(" · ")}</span>
          </div>
          {l.lost_reason && <p className="text-rose-700">Lost: {l.lost_reason}</p>}
          {l.quotations.map((q) => (
            <div key={q.id} className="rounded-xl border border-ash p-3">
              <div className="flex justify-between font-medium"><span>Quotation · {timeAgo(q.created_at)}</span><span>{money(q.total)}</span></div>
              <ul className="mt-1 text-slate-600">{q.items.map((i, k) => <li key={k}>{i.model}{i.qty > 1 && ` × ${i.qty}`} — {money(i.mrp * i.qty)}</li>)}</ul>
              {q.discount > 0 && <div className="text-emerald-700">Discount −{money(q.discount)}</div>}
            </div>
          ))}
          {l.orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <span>Order {money(o.total)} · advance {money(o.advance)}</span><Pill status={o.status} />
            </div>
          ))}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">History</div>
            <ol className="space-y-2">
              {l.events.map((e) => (
                <li key={e.id} className="border-l-2 border-ash pl-3">
                  <div className="text-slate-700">{e.kind === "status" ? `Status: ${statusLabel(e.text?.split(" — ")[0])}${e.text?.includes(" — ") ? ` — ${e.text.split(" — ")[1]}` : ""}` : e.kind === "follow_up" ? `Follow-up: ${shortDate(e.text)}` : e.kind === "created" ? `Lead added${e.text ? ` — ${e.text}` : ""}` : e.text}</div>
                  <div className="text-xs text-slate-400">{timeAgo(e.created_at)}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
}
