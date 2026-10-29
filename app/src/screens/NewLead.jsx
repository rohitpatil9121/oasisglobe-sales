import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSales } from "../store/SalesContext.jsx";
import { api } from "../lib/api.js";
import { istToday, addDays } from "../lib/format.js";
import { INTERESTS, SOURCES } from "../lib/status.js";
import ScreenHeader, { Chips } from "../components/ScreenHeader.jsx";
import { Card, FLabel, Icon, PrimaryButton, input } from "../components/ui.jsx";

/* Add a lead in a few taps — like New Call in the technician app. */
export default function NewLead() {
  const { putLead } = useSales();
  const nav = useNavigate();
  const [f, setF] = useState({ customer_name: "", phone: "", area: "", interest: "", source: "", note: "", next_follow_up: istToday() });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const ready = f.customer_name.trim() && /^[6-9]\d{9}$/.test(f.phone);

  const save = async () => {
    setErr(""); setBusy(true);
    try {
      const { lead } = await api.addLead({ ...f, client_id: crypto.randomUUID?.() || String(Date.now()) });
      putLead(lead);
      nav(`/lead/${lead.id}`, { replace: true });
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const t = istToday();
  return (
    <>
      <ScreenHeader title="New Lead" />
      <main className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        <Card>
          <FLabel icon={Icon.person} must>Customer</FLabel>
          <input className={input} placeholder="Naam" value={f.customer_name} onChange={set("customer_name")} autoFocus />
          <input className={`${input} tnum mt-2`} placeholder="Mobile (10 digit)" inputMode="numeric" maxLength={10}
            value={f.phone} onChange={(e) => set("phone")(e.target.value.replace(/\D/g, "").slice(0, 10))} />
          <input className={`${input} mt-2`} placeholder="Area (Kothrud, Baner…)" value={f.area} onChange={set("area")} />
        </Card>
        <Card>
          <FLabel icon={Icon.drop}>Kya chahiye</FLabel>
          <Chips options={INTERESTS} value={f.interest} onChange={set("interest")} />
        </Card>
        <Card>
          <FLabel icon={Icon.info}>Kahan se aaya</FLabel>
          <Chips options={SOURCES} value={f.source} onChange={set("source")} />
        </Card>
        <Card>
          <FLabel icon={Icon.clock}>Follow-up kab</FLabel>
          <Chips options={[t, addDays(t, 1), addDays(t, 3), addDays(t, 7)]} value={f.next_follow_up} onChange={(v) => set("next_follow_up")(v || t)}
            label={(d) => ({ [t]: "Aaj", [addDays(t, 1)]: "Kal", [addDays(t, 3)]: "3 din", [addDays(t, 7)]: "1 hafta" }[d])} />
        </Card>
        <Card>
          <FLabel icon={Icon.receipt}>Note</FLabel>
          <textarea className={`${input} min-h-[80px] py-3`} placeholder="Borewell paani, budget 15k…" value={f.note} onChange={set("note")} />
        </Card>
        {err && <div role="alert" className="rounded-2xl bg-danger-tint px-3.5 py-3 text-sm font-medium text-danger-fg">{err}</div>}
      </main>
      <div className="safe-bottom px-4 pb-4 pt-2">
        <PrimaryButton onClick={save} disabled={!ready} loading={busy}>Save Lead</PrimaryButton>
      </div>
    </>
  );
}
