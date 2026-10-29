import { useEffect, useState } from "react";
import { api, telUrl } from "../lib/api.js";
import { rupeeAmt, timeAgo } from "../lib/format.js";
import { ORDER_STEPS, LEAD_META } from "../lib/status.js";
import { Card, Icon, StatusPill, EmptyState, SkeletonJobCard, cx } from "../components/ui.jsx";

/* Orders I booked, and moving each one along: Booked → Dispatched → Installation → Completed. */
export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  const load = () => api.orders().then((r) => setOrders(r.orders)).catch((e) => { setErr(e.message); setOrders([]); });
  useEffect(() => { load(); }, []);

  const move = async (o, status) => {
    try { await api.updateOrder(o.id, { status }); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="pt-5">
      <h1 className="text-[24px] font-extrabold tracking-tight text-strong">Orders</h1>
      {err && <div role="alert" className="mt-3 rounded-2xl bg-danger-tint px-3.5 py-3 text-sm font-medium text-danger-fg">{err}</div>}
      <div className="mt-3">
        {orders === null ? <SkeletonJobCard />
          : !orders.length ? <EmptyState icon={Icon.receipt} title="Abhi koi order nahi" sub="Lead pe quotation banake Order dabao" />
          : orders.map((o) => {
            const at = ORDER_STEPS.indexOf(o.status);
            const next = ORDER_STEPS[at + 1];
            return (
              <Card key={o.id} className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[17px] font-bold text-strong">{o.lead?.customer_name}</div>
                    <div className="text-sm text-muted">{o.items.map((i) => i.model).join(", ")}</div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted">{timeAgo(o.created_at)}</span>
                  <span className="tnum font-semibold text-strong">{rupeeAmt(o.total)} <span className="font-normal text-muted">· baaki {rupeeAmt(o.total - o.advance)}</span></span>
                </div>
                <div className="mt-3 flex gap-1">
                  {ORDER_STEPS.map((s, i) => <div key={s} className={cx("h-1.5 flex-1 rounded-full", i <= at ? "bg-ok" : "bg-line")} />)}
                </div>
                <div className="mt-3 flex gap-2">
                  {o.lead?.phone && <a href={telUrl(o.lead.phone)} className="grid h-11 w-11 place-items-center rounded-full bg-brand-tint text-brand-dark" aria-label="Call"><Icon.phone width={18} height={18} /></a>}
                  {next && (
                    <button type="button" onClick={() => move(o, next)} className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-tonal font-semibold text-strong">
                      Mark {LEAD_META[next].label} <Icon.chevron width={16} height={16} />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
