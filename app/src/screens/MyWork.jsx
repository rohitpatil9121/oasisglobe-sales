import { useEffect, useState } from "react";
import { useSales } from "../store/SalesContext.jsx";
import { api } from "../lib/api.js";
import { rupeeAmt } from "../lib/format.js";
import { Card, Icon, Skeleton } from "../components/ui.jsx";

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
    <span className="text-[15px] text-muted">{label}</span>
    <span className={`tnum ${strong ? "text-[20px] font-extrabold text-ok-fg" : "text-[17px] font-bold text-strong"}`}>{value}</span>
  </div>
);

/* This month's numbers. Incentive is added once the owner sets the rule. */
export default function MyWork() {
  const { user, signOut } = useSales();
  const [s, setS] = useState(null);
  useEffect(() => { api.summary().then((r) => setS(r.summary)).catch(() => setS({})); }, []);
  const month = s?.month ? new Date(s.month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "";

  return (
    <div className="pt-5">
      <h1 className="text-[24px] font-extrabold tracking-tight text-strong">My Work</h1>
      <p className="text-sm text-muted">{month}</p>
      <Card className="mt-3">
        {!s ? <Skeleton className="h-48" /> : (<>
          <Row label="Total sale" value={rupeeAmt(s.sale)} strong />
          <Row label="Orders" value={s.won ?? 0} />
          <Row label="Advance collected" value={rupeeAmt(s.advance)} />
          <Row label="Naye leads" value={s.leads ?? 0} />
          <Row label="Conversion" value={`${s.conversion ?? 0}%`} />
          <Row label="Follow-ups baaki" value={s.dueToday ?? 0} />
        </>)}
      </Card>
      <Card className="mt-3">
        <div className="text-sm text-muted">Signed in as</div>
        <div className="font-semibold text-strong">{user?.full_name} · {user?.phone}</div>
        <button type="button" onClick={signOut} className="mt-3 flex min-h-[44px] items-center gap-2 font-semibold text-danger-fg">
          <Icon.logout width={18} height={18} /> Logout
        </button>
      </Card>
      <p className="tnum mt-4 text-center text-[11px] text-subtle/80">v{__APP_VERSION__}</p>
    </div>
  );
}
