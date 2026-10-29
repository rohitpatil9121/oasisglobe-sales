import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSales } from "../store/SalesContext.jsx";
import { LEAD_STEPS, LEAD_META } from "../lib/status.js";
import LeadCard from "../components/LeadCard.jsx";
import { Icon, EmptyState, SkeletonJobCard, cx, input } from "../components/ui.jsx";

/* Every lead, filtered by pipeline status and a name/phone search. */
export default function Leads() {
  const { leads } = useSales();
  const nav = useNavigate();
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");

  const count = (s) => (leads || []).filter((l) => (s === "open" ? !["won", "lost"].includes(l.status) : l.status === s)).length;
  const shown = (leads || [])
    .filter((l) => (tab === "open" ? !["won", "lost"].includes(l.status) : l.status === tab))
    .filter((l) => !q || `${l.customer_name} ${l.phone} ${l.area || ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-extrabold tracking-tight text-strong">Leads</h1>
        <button type="button" onClick={() => nav("/new")} className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand px-4 text-[15px] font-semibold text-white">
          <Icon.plus width={18} height={18} /> New
        </button>
      </div>
      <div className="relative mt-3">
        <Icon.search width={18} height={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input className={cx(input, "pl-11")} placeholder="Naam, phone ya area" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {["open", ...LEAD_STEPS].map((s) => (
          <button key={s} type="button" onClick={() => setTab(s)}
            className={cx("shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold", tab === s ? "bg-brand text-white" : "bg-tonal text-strong")}>
            {s === "open" ? "Open" : LEAD_META[s].label} <span className="tnum opacity-70">{count(s)}</span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        {leads === null ? <SkeletonJobCard />
          : shown.length ? shown.map((l) => <LeadCard key={l.id} lead={l} />)
          : <EmptyState icon={Icon.person} title="Koi lead nahi" />}
      </div>
    </div>
  );
}
