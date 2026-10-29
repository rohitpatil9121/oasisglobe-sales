import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { Alert, Spinner } from "../components/ui.jsx";
import { Figure, RankedBars, Stat } from "../components/charts.jsx";
import { SERIES, money, shortMoney } from "../lib/chart.js";
import { LEAD_STATUSES, PageHead, statusLabel } from "./shared.jsx";

/* Sales at a glance: this month, the pipeline, where leads come from, the trend,
   and who is selling. */
export default function SalesOverview() {
  const [o, setO] = useState(null);
  const [team, setTeam] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    Promise.all([api.salesOverview(), api.salesTeam()])
      .then(([a, b]) => { setO(a.overview); setTeam(b.team); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <Alert>{err}</Alert>;
  if (!o) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7" label="Loading sales" /></div>;

  const monthName = new Date(o.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return (
    <div>
      <PageHead title="Sales Overview" sub={monthName} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sale this month" value={shortMoney(o.sale)} sub={`${o.orders} orders · advance ${money(o.advance)}`} accent={SERIES[1]} />
        <Stat label="New leads" value={o.new_leads} sub={`${o.conversion}% converted`} accent={SERIES[0]} />
        <Stat label="Follow-ups late" value={o.overdue} sub={o.overdue ? <Link to="/leads?late=1" className="font-semibold text-brand">See them</Link> : "All on time"} attention={o.overdue > 0} accent={SERIES[4]} />
        <Stat label="Balance to collect" value={shortMoney(o.pending_amount)} sub="Open orders, after advance" accent={SERIES[2]} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Figure title="Pipeline" sub="Every lead by where it stands now">
          <RankedBars rows={LEAD_STATUSES.map((s, i) => ({ label: statusLabel(s), value: o.pipeline[s] || 0, color: s === "lost" ? SERIES[4] : s === "won" ? SERIES[1] : SERIES[0] }))} />
        </Figure>
        <Figure title="Sale by month" sub="Last six months, cancelled orders left out">
          <RankedBars rows={o.trend.map((t) => ({
            label: new Date(t.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
            value: t.sale, display: `${shortMoney(t.sale)} · ${t.orders}` }))} color={SERIES[1]} />
        </Figure>
        <Figure title="Lead sources" sub="Leads and how many were won">
          <RankedBars rows={o.by_source.map((s) => ({ label: s.source, value: s.count, display: `${s.count} · ${s.won} won` }))} color={SERIES[3]} empty="No leads yet." />
        </Figure>
        <Figure title="Salespeople this month" sub="Sale booked" right={<Link to="/team" className="text-xs font-semibold text-brand">Team</Link>}>
          <RankedBars rows={team.filter((t) => t.is_active !== false).map((t) => ({ label: t.full_name, value: t.month_sale, display: `${shortMoney(t.month_sale)} · ${t.month_orders}` }))}
            color={SERIES[1]} empty="Add a salesperson under Sales Team." />
        </Figure>
      </div>
    </div>
  );
}
