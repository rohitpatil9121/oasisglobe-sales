// Labels and pills shared by the sales dashboard pages (match the sales app).
export const LEAD_STATUSES = ["new", "contacted", "demo", "quoted", "won", "lost"];
export const ORDER_STATUSES = ["booked", "dispatched", "installation", "completed", "cancelled"];

const META = {
  new: ["New", "bg-blue-50 text-blue-700"],
  contacted: ["Contacted", "bg-indigo-50 text-indigo-700"],
  demo: ["Demo / Visit", "bg-amber-50 text-amber-800"],
  quoted: ["Quoted", "bg-orange-50 text-orange-800"],
  won: ["Won", "bg-emerald-50 text-emerald-700"],
  lost: ["Lost", "bg-rose-50 text-rose-700"],
  booked: ["Booked", "bg-blue-50 text-blue-700"],
  dispatched: ["Dispatched", "bg-amber-50 text-amber-800"],
  installation: ["Installation", "bg-orange-50 text-orange-800"],
  completed: ["Completed", "bg-emerald-50 text-emerald-700"],
  cancelled: ["Cancelled", "bg-rose-50 text-rose-700"],
};
export const statusLabel = (s) => META[s]?.[0] || s;

export function Pill({ status }) {
  const [label, cls] = META[status] || [status, "bg-slate-100 text-slate-600"];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const shortDate = (ymd) =>
  ymd ? new Date(String(ymd).slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
export const localPhone = (p) => String(p || "").replace(/^\+91/, "");

export function PageHead({ title, sub, right }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
