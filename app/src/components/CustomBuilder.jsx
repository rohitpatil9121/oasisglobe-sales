import { useState } from "react";
import { createPortal } from "react-dom";
import { designs, tanks, cabinets, stages, extras, included, emptyBuild, buildPrice, buildName, buildStages, PRICES_ARE_SAMPLE } from "../data/custom.js";
import { rupeeAmt } from "../lib/format.js";
import { Icon, PrimaryButton, cx } from "./ui.jsx";

const STEPS = ["Design", "Body", "Inner parts", "Extras"];

/* Build a purifier with the customer: base design → body (cabinet) → inner
   parts (stages) → extra filters, with the price updating as they choose.
   `onDone(item)` gets { model, mrp, qty } for the quotation; without it the
   builder is just for showing (from the Catalog). */
export default function CustomBuilder({ onClose, onDone }) {
  const [b, setB] = useState(emptyBuild);
  const [step, setStep] = useState(0);
  const [tank, setTank] = useState("");
  const price = buildPrice(b);
  const set = (k, v) => setB((x) => ({ ...x, [k]: v }));
  const toggle = (k, id) => setB((x) => ({ ...x, [k]: x[k].includes(id) ? x[k].filter((y) => y !== id) : [...x[k], id] }));
  const cab = cabinets.find((c) => c.id === b.cabinet);
  const design = designs.find((d) => d.id === b.design);

  // Portalled to <body>: opened from inside the quotation sheet, a fixed
  // overlay would otherwise be laid out inside the sheet's transformed box.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/40">
      <div className="safe-x flex h-full w-full max-w-[440px] flex-col bg-sunken">
        <header className="safe-top flex items-center gap-2 bg-sunken px-2 py-2">
          <button type="button" onClick={step ? () => setStep(step - 1) : onClose} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full text-strong">
            <Icon.back width={22} height={22} />
          </button>
          <h1 className="flex-1 text-[20px] font-bold text-strong">Customize purifier</h1>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full text-muted">✕</button>
        </header>

        {/* Step tabs: tap any to jump back and change it. */}
        <div className="flex gap-1.5 px-4 pb-2">
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => setStep(i)}
              className={cx("flex-1 rounded-full py-1.5 text-[12px] font-bold", i === step ? "bg-brand text-white" : i < step ? "bg-ok/15 text-ok-fg" : "bg-tonal text-muted")}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-4">
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Purifier kahan lagega?</p>
              {designs.map((d) => (
                <button key={d.id} type="button" onClick={() => { set("design", d.id); setStep(1); }}
                  className={cx("flex w-full gap-3 overflow-hidden rounded-2xl bg-surface p-3 text-left shadow-card ring-2", b.design === d.id ? "ring-brand" : "ring-transparent")}>
                  {d.image && <img src={d.image} alt="" className="h-24 w-24 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-[17px] font-bold text-strong">{d.name}</div>
                    <div className="mt-0.5 text-sm text-muted">{d.note}</div>
                    <div className="tnum mt-2 font-semibold text-brand-fg">{rupeeAmt(d.price)} se</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted">Body (cabinet) chuno. Customer ko photo dikhao.</p>
              <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
                {[{ id: "", name: "All" }, ...tanks].map((t) => (
                  <button key={t.id || "all"} type="button" onClick={() => setTank(t.id)}
                    className={cx("shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold", tank === t.id ? "bg-brand text-white" : "bg-tonal text-strong")}>{t.name}</button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {cabinets.filter((c) => !tank || c.tank === tank).map((c) => (
                  <button key={c.id} type="button" onClick={() => set("cabinet", c.id)}
                    className={cx("relative overflow-hidden rounded-2xl bg-surface text-left shadow-card ring-2", b.cabinet === c.id ? "ring-brand" : "ring-transparent")}>
                    <div className="aspect-[4/5] bg-white">{c.image && <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-contain" />}</div>
                    <div className="p-2.5">
                      <div className="truncate text-[14px] font-bold text-strong">{c.name}</div>
                      <div className="text-xs text-muted">{tanks.find((t) => t.id === c.tank)?.name}</div>
                    </div>
                    {b.cabinet === c.id && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-brand text-white"><Icon.check width={16} height={16} /></span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="text-sm text-muted">Paani ke hisaab se andar ke parts chuno.</p>
              {stages.map((s) => {
                const on = b.stages.includes(s.id);
                return (
                  <button key={s.id} type="button" disabled={s.required} onClick={() => toggle("stages", s.id)}
                    className={cx("flex w-full items-start gap-3 rounded-2xl bg-surface p-3.5 text-left shadow-card ring-2", on ? "ring-brand/60" : "ring-transparent")}>
                    <span className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2", on ? "border-brand bg-brand text-white" : "border-subtle")}>
                      {on && <Icon.check width={14} height={14} strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-strong">{s.name} <span className="text-xs font-medium text-muted">{s.note}</span></span>
                        <span className="tnum shrink-0 text-sm font-semibold text-strong">{s.required ? "Included" : `+${rupeeAmt(s.price)}`}</span>
                      </div>
                      <div className="mt-0.5 text-sm text-muted">{s.info}</div>
                    </div>
                  </button>
                );
              })}
              <div className="rounded-2xl bg-ok/10 p-3.5 text-sm text-ok-fg">
                <b>Har purifier mein:</b> {included.join(", ")}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <p className="text-sm text-muted">Extra filters (zaroori nahi).</p>
              {extras.map((e) => {
                const on = b.extras.includes(e.id);
                return (
                  <button key={e.id} type="button" onClick={() => toggle("extras", e.id)}
                    className={cx("flex w-full items-start gap-3 rounded-2xl bg-surface p-3.5 text-left shadow-card ring-2", on ? "ring-brand/60" : "ring-transparent")}>
                    <span className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2", on ? "border-brand bg-brand text-white" : "border-subtle")}>
                      {on && <Icon.check width={14} height={14} strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-strong">{e.name}</span>
                        <span className="tnum shrink-0 text-sm font-semibold text-strong">+{rupeeAmt(e.price)}</span>
                      </div>
                      <div className="mt-0.5 text-sm text-muted">{e.note}</div>
                    </div>
                  </button>
                );
              })}

              {/* The finished build, for the customer to see before it goes on the quotation. */}
              <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-card">
                <div className="flex gap-3 p-3">
                  {(cab?.image || design?.image) && <img src={cab?.image || design?.image} alt="" className="h-24 w-20 rounded-lg bg-white object-contain" />}
                  <div className="min-w-0">
                    <div className="font-bold text-strong">{buildName(b)}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted">{buildStages(b).join(" → ")}</div>
                  </div>
                </div>
                {!b.cabinet && <div className="bg-warn/10 px-3 py-2 text-xs font-semibold text-warn-fg">Body abhi chuni nahi — step 2 pe jao.</div>}
              </div>
            </div>
          )}
        </main>

        <footer className="safe-bottom border-t border-line bg-surface px-4 pb-4 pt-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-muted">Price{PRICES_ARE_SAMPLE && " (approx.)"}</span>
            <span className="tnum text-[22px] font-extrabold text-strong">{rupeeAmt(price)}</span>
          </div>
          {step < 3 ? (
            <PrimaryButton onClick={() => setStep(step + 1)} disabled={step === 1 && !b.cabinet}>
              {step === 1 && !b.cabinet ? "Body chuno" : "Next"} <Icon.chevron width={18} height={18} />
            </PrimaryButton>
          ) : onDone ? (
            <PrimaryButton disabled={!b.cabinet} onClick={() => onDone({ model: buildName(b), mrp: price, qty: 1 })}>
              <Icon.plus width={18} height={18} /> Quotation mein jodo
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
