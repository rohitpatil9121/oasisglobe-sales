import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Alert, Button, EmptyState, Field, Icon, Input, Modal, PhoneInput, Spinner } from "../components/ui.jsx";
import { money } from "../lib/chart.js";
import { PageHead, localPhone } from "./shared.jsx";

/* The salespeople: add one (they then sign in to the Sales app with WhatsApp
   OTP on that number), switch one off, and see how each is doing. */
export default function SalesTeam() {
  const [team, setTeam] = useState(null);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const load = useCallback(() => api.salesTeam().then((r) => setTeam(r.team)).catch((e) => { setErr(e.message); setTeam([]); }), []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (p) => {
    try { await api.setSalespersonActive(p.id, p.is_active === false); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <PageHead title="Sales Team" sub="Each salesperson signs in to the Oasis Sales app with their own number."
        right={<Button onClick={() => setAdding(true)}><Icon name="plus" /> Add salesperson</Button>} />
      {err && <Alert>{err}</Alert>}
      {team === null ? <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
        : !team.length ? <EmptyState icon="users" title="No salespeople yet" hint="Add one, then install the Sales app on their phone." />
        : (
          <div className="overflow-x-auto rounded-2xl border border-ash bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ash text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3 text-right">Open leads</th><th className="px-4 py-3 text-right">Late</th><th className="px-4 py-3 text-right">Orders (month)</th><th className="px-4 py-3 text-right">Sale (month)</th><th className="px-4 py-3 text-right">Won / all</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody>
                {team.map((p) => (
                  <tr key={p.id} className={`border-b border-ash last:border-0 ${p.is_active === false ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-900">{p.full_name}</div><div className="text-xs text-slate-500">{localPhone(p.phone)}{p.is_active === false && " · off"}</div></td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.open_leads}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${p.overdue ? "font-semibold text-rose-700" : ""}`}>{p.overdue}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.month_orders}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{money(p.month_sale)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.won} / {p.total_leads}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => toggle(p)}>{p.is_active === false ? "Switch on" : "Switch off"}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {adding && <AddSalesperson onClose={() => setAdding(false)} onAdded={() => { setAdding(false); load(); }} />}
    </div>
  );
}

function AddSalesperson({ onClose, onAdded }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await api.addSalesperson({ full_name: name, phone }); onAdded(); }
    catch (e2) { setErr(e2.message); setBusy(false); }
  };
  return (
    <Modal title="Add salesperson" subtitle="They sign in to the Sales app with a WhatsApp code on this number." onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        {err && <Alert>{err}</Alert>}
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></Field>
        <Field label="Mobile"><PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy} disabled={!name.trim() || String(phone).replace(/\D/g, "").length < 12}>Add</Button>
        </div>
      </form>
    </Modal>
  );
}
