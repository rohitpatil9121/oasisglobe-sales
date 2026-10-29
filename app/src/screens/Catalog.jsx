import { useState } from "react";
import { products } from "../data/catalog.js";
import { rupeeAmt } from "../lib/format.js";
import { Icon, MSheet, cx, input } from "../components/ui.jsx";
import CustomBuilder from "../components/CustomBuilder.jsx";
import { designs } from "../data/custom.js";

/* Product photos + MRP to show the customer on the phone. MRP only. */
export default function Catalog() {
  const [q, setQ] = useState("");
  const [fam, setFam] = useState("");
  const [open, setOpen] = useState(null);
  const [building, setBuilding] = useState(false);
  const families = [...new Set(products.map((p) => p.family))];
  const shown = products.filter((p) => (!fam || p.family === fam) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="pt-5">
      <h1 className="text-[24px] font-extrabold tracking-tight text-strong">Catalog</h1>
      <button type="button" onClick={() => setBuilding(true)}
        className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-3 text-left text-white shadow-card">
        {designs[0]?.image && <img src={designs[0].image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
        <span className="flex-1"><b className="text-[17px]">Apna purifier banao</b><span className="block text-sm opacity-85">Body + andar ke parts, customer ki pasand se</span></span>
        <Icon.chevron width={20} height={20} />
      </button>
      <div className="relative mt-3">
        <Icon.search width={18} height={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input className={cx(input, "pl-11")} placeholder="Model dhundo" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {["", ...families].map((f) => (
          <button key={f || "all"} type="button" onClick={() => setFam(f)}
            className={cx("shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold", fam === f ? "bg-brand text-white" : "bg-tonal text-strong")}>
            {f || "All"}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {shown.map((p) => (
          <button key={p.id} type="button" onClick={() => setOpen(p)} className="overflow-hidden rounded-2xl bg-surface text-left shadow-card">
            <div className="aspect-[4/5] bg-white">{p.image && <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain" />}</div>
            <div className="p-3">
              <div className="truncate font-bold text-strong">{p.name}</div>
              <div className="tnum mt-0.5 text-[15px] font-semibold text-brand-fg">{p.mrp ? rupeeAmt(p.mrp) : "Price on request"}</div>
            </div>
          </button>
        ))}
      </div>
      {building && <CustomBuilder onClose={() => setBuilding(false)} />}
      {open && (
        <MSheet title={open.name} onClose={() => setOpen(null)}>
          {open.image && <img src={open.image} alt="" className="mx-auto max-h-[40vh] object-contain" />}
          <div className="tnum mt-3 text-[22px] font-extrabold text-strong">{open.mrp ? rupeeAmt(open.mrp) : "Price on request"} <span className="text-sm font-medium text-muted">MRP</span></div>
          <div className="mt-1 text-sm font-semibold text-muted">{open.note}</div>
          <p className="mt-2 text-[15px] text-body">{open.desc}</p>
          {open.colours.length > 0 && <p className="mt-2 pb-2 text-sm text-muted">Colours: {open.colours.join(", ")}</p>}
        </MSheet>
      )}
    </div>
  );
}
