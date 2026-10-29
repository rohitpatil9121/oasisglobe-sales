import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSales } from "../store/SalesContext.jsx";
import { api } from "../lib/api.js";
import { istToday, rupeeAmt } from "../lib/format.js";
import { isOpen } from "../lib/status.js";
import LeadCard from "../components/LeadCard.jsx";
import { Icon, SectionLabel, EmptyState, SkeletonJobCard } from "../components/ui.jsx";

const Stat = ({ label, value, tone }) => (
  <div className="flex-1 rounded-2xl bg-surface p-3 text-center shadow-card">
    <div className={`tnum text-[22px] font-extrabold ${tone || "text-strong"}`}>{value}</div>
    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
  </div>
);

/* Today's work: follow-ups due (and late ones) first, then fresh leads. */
export default function Home() {
  const { user, leads, err, loadLeads } = useSales();
  const nav = useNavigate();
  const [sum, setSum] = useState(null);
  useEffect(() => { api.summary().then((r) => setSum(r.summary)).catch(() => {}); }, [leads]);

  const t = istToday();
  const due = (leads || []).filter((l) => isOpen(l) && l.next_follow_up && l.next_follow_up <= t)
    .sort((a, b) => a.next_follow_up.localeCompare(b.next_follow_up));
  const fresh = (leads || []).filter((l) => l.status === "new" && !due.includes(l));

  return (
    <div className="pt-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Namaste,</div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-strong">{user?.full_name || "Sales"}</h1>
        </div>
        <button type="button" onClick={loadLeads} aria-label="Refresh" className="grid h-11 w-11 place-items-center rounded-full bg-tonal text-strong">
          <Icon.repeat width={20} height={20} />
        </button>
      </div>

      <div className="mt-4 flex gap-2.5">
        <Stat label="Follow-ups" value={due.length} tone={due.length ? "text-warn-fg" : undefined} />
        <Stat label="New leads" value={fresh.length} />
        <Stat label="Month sale" value={sum ? rupeeAmt(sum.sale) : "—"} tone="text-ok-fg" />
      </div>

      <button type="button" onClick={() => nav("/new")}
        className="mt-4 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-brand text-[17px] font-semibold text-white shadow-sm active:scale-[0.985]">
        <Icon.plus width={20} height={20} /> New Lead
      </button>

      {err && <div role="alert" className="mt-3 rounded-2xl bg-danger-tint px-3.5 py-3 text-sm font-medium text-danger-fg">{err}</div>}

      <SectionLabel>Aaj ke follow-ups</SectionLabel>
      {leads === null ? <><SkeletonJobCard /><SkeletonJobCard /></>
        : due.length ? due.map((l) => <LeadCard key={l.id} lead={l} />)
        : <EmptyState icon={Icon.checkCircle} title="Aaj koi follow-up baaki nahi" />}

      {fresh.length > 0 && (<>
        <SectionLabel>Naye leads</SectionLabel>
        {fresh.map((l) => <LeadCard key={l.id} lead={l} />)}
      </>)}
    </div>
  );
}
