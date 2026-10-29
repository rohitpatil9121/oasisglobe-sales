import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Alert, EmptyState, Select, Spinner } from "../components/ui.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { money } from "../lib/chart.js";
import { ORDER_STATUSES, PageHead, Pill, localPhone, shortDate, statusLabel } from "./shared.jsx";

/* Every order the team booked. The owner can move an order along from here. */
export default function SalesOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("open");
  const load = () => api.salesOrders().then((r) => setOrders(r.orders)).catch((e) => { setErr(e.message); setOrders([]); });
  useEffect(() => { load(); }, []);

  const setStatus = async (o, status) => {
    try { await api.updateSalesOrder(o.id, { status }); load(); }
    catch (e) { toast.error(e.message); }
  };

  const shown = (orders || []).filter((o) => filter === "all" || (filter === "open" ? !["completed", "cancelled"].includes(o.status) : o.status === filter));
  const total = shown.reduce((s, o) => s + Number(o.total || 0), 0);
  const balance = shown.reduce((s, o) => s + Number(o.total || 0) - Number(o.advance || 0), 0);

  return (
    <div>
      <PageHead title="Orders" sub={`${shown.length} orders · ${money(total)} · balance ${money(balance)}`}
        right={
          <Select className="!w-40" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter orders">
            <option value="open">Open</option>
            <option value="all">All</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </Select>
        } />
      {err && <Alert>{err}</Alert>}
      {orders === null ? <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
        : !shown.length ? <EmptyState icon="file" title="No orders here" hint="An order appears when a salesperson marks a lead won." />
        : (
          <div className="overflow-x-auto rounded-2xl border border-ash bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ash text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Salesperson</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Advance</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id} className="border-b border-ash last:border-0">
                    <td className="px-4 py-3 text-slate-600">{shortDate(o.created_at)}</td>
                    <td className="px-4 py-3"><div className="font-medium text-slate-900">{o.lead?.customer_name || "—"}</div><div className="text-xs text-slate-500">{localPhone(o.lead?.phone)}{o.lead?.area && ` · ${o.lead.area}`}</div></td>
                    <td className="px-4 py-3 text-slate-600">{o.items.map((i) => `${i.model}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join(", ")}</td>
                    <td className="px-4 py-3 text-slate-600">{o.salesperson}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{money(o.total)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{money(o.advance)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Pill status={o.status} />
                        <Select size="sm" className="!w-36" value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label="Change status">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
