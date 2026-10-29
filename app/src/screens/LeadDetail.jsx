import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSales } from "../store/SalesContext.jsx";
import { api, telUrl, waUrl } from "../lib/api.js";
import { istToday, addDays, dayLabel, timeAgo, rupeeAmt } from "../lib/format.js";
import { LEAD_STEPS, LEAD_META, isOpen } from "../lib/status.js";
import { products } from "../data/catalog.js";
import ScreenHeader, { Chips } from "../components/ScreenHeader.jsx";
import { Card, FLabel, Icon, MSheet, PrimaryButton, GhostButton, PlusMinus, StatusPill, Skeleton, cx, input } from "../components/ui.jsx";

const LOST_REASONS = ["Price zyada", "Dusri company se liya", "Abhi nahi chahiye", "Phone nahi uthaya"];

// The quotation as a WhatsApp message (PDF comes with the WhatsApp integration).
export function quoteText(lead, q) {
  const lines = q.items.map((i) => `• ${i.model}${i.qty > 1 ? ` × ${i.qty}` : ""} — ${rupeeAmt(i.mrp * i.qty)}`);
  return [
    `Namaste ${lead.customer_name} ji,`, "", "Oasis Globe quotation:", ...lines,
    ...(q.discount ? [`Discount: −${rupeeAmt(q.discount)}`] : []),
    `*Total: ${rupeeAmt(q.total)}*`, "", "Free installation. Thank you!",
  ].join("\n");
}

export default function LeadDetail() {
  const { id } = useParams();
  const { putLead } = useSales();
  const [lead, setLead] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [sheet, setSheet] = useState(null); // "quote" | "order" | "lost"

  const load = useCallback(() => api.lead(id).then((r) => setLead(r.lead)).catch((e) => setErr(e.message)), [id]);
  useEffect(() => { load(); }, [load]);

  const update = async (body) => {
    setErr(""); setBusy(true);
    try { const { lead: l } = await api.updateLead(id, body); putLead(l); await load(); setNote(""); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (!lead) return (<><ScreenHeader title="Lead" /><div className="space-y-3 p-4">{err ? <p className="text-danger-fg">{err}</p> : <><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></>}</div></>);

  const t = istToday();
  const lastQuote = lead.quotations[0];
  const open = isOpen(lead);
  return (
    <>
      <ScreenHeader title={lead.customer_name} right={<StatusPill status={lead.status} />} />
      <main className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        <Card>
          <div className="text-sm text-muted">{[lead.interest, lead.area, lead.source].filter(Boolean).join(" · ")}</div>
          <div className="tnum mt-1 text-[17px] font-semibold text-strong">+91 {lead.phone}</div>
          <div className="mt-3 flex gap-2">
            <a href={telUrl(lead.phone)} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-brand-tint font-semibold text-brand-dark"><Icon.phone width={18} height={18} /> Call</a>
            <a href={waUrl(lead.phone)} target="_blank" rel="noreferrer" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-wa-tint font-semibold text-wa-dark"><Icon.whatsapp width={18} height={18} /> WhatsApp</a>
          </div>
        </Card>

        <Card>
          <FLabel icon={Icon.split}>Status</FLabel>
          <div className="flex flex-wrap gap-2">
            {LEAD_STEPS.filter((s) => s !== "won").map((s) => (
              <button key={s} type="button" disabled={busy}
                onClick={() => (s === "lost" ? setSheet("lost") : update({ status: s }))}
                className={cx("min-h-[40px] rounded-full px-3.5 text-[14px] font-semibold",
                  lead.status === s ? (s === "lost" ? "bg-danger text-white" : "bg-brand text-white") : "bg-tonal text-strong")}>
                {LEAD_META[s].label}
              </button>
            ))}
          </div>
          {lead.status === "won" && <p className="mt-2 text-sm font-semibold text-ok-fg">Order ho gaya 🎉</p>}
        </Card>

        {open && (
          <Card>
            <FLabel icon={Icon.clock}>Next follow-up: {dayLabel(lead.next_follow_up) || "—"}</FLabel>
            <Chips options={[t, addDays(t, 1), addDays(t, 3), addDays(t, 7)]} value={lead.next_follow_up}
              onChange={(v) => v && update({ next_follow_up: v })}
              label={(d) => ({ [t]: "Aaj", [addDays(t, 1)]: "Kal", [addDays(t, 3)]: "3 din", [addDays(t, 7)]: "1 hafta" }[d])} />
          </Card>
        )}

        <Card>
          <FLabel icon={Icon.receipt}>Note likho</FLabel>
          <textarea className={`${input} min-h-[70px] py-3`} placeholder="Customer ne kya bola…" value={note} onChange={(e) => setNote(e.target.value)} />
          <GhostButton className="mt-2 w-full" disabled={!note.trim() || busy} onClick={() => update({ note })}>Save note</GhostButton>
        </Card>

        <div className="grid grid-cols-2 gap-2.5">
          <PrimaryButton onClick={() => setSheet("quote")} disabled={!open}><Icon.receipt width={18} height={18} /> Quotation</PrimaryButton>
          <PrimaryButton className="!bg-ok" onClick={() => setSheet("order")} disabled={!open || !lastQuote}><Icon.checkCircle width={18} height={18} /> Order</PrimaryButton>
        </div>
        {open && !lastQuote && <p className="-mt-1 text-center text-xs text-subtle">Order banane ke liye pehle quotation banao</p>}

        {lead.quotations.map((q) => (
          <Card key={q.id}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-muted">Quotation · {timeAgo(q.created_at)}</div>
              <div className="tnum text-[17px] font-bold text-strong">{rupeeAmt(q.total)}</div>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-body">
              {q.items.map((i, k) => <li key={k}>{i.model}{i.qty > 1 && ` × ${i.qty}`} — {rupeeAmt(i.mrp * i.qty)}</li>)}
              {q.discount > 0 && <li className="text-ok-fg">Discount −{rupeeAmt(q.discount)}</li>}
            </ul>
            <a href={waUrl(lead.phone, quoteText(lead, q))} target="_blank" rel="noreferrer"
              className="mt-3 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-wa-tint font-semibold text-wa-dark">
              <Icon.whatsapp width={17} height={17} /> WhatsApp pe bhejo
            </a>
          </Card>
        ))}

        {lead.orders.map((o) => (
          <Card key={o.id} className="border border-ok/30">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-strong">Order {rupeeAmt(o.total)}</div>
              <StatusPill status={o.status} />
            </div>
            <div className="mt-1 text-sm text-muted">Advance {rupeeAmt(o.advance)} · Baaki {rupeeAmt(o.total - o.advance)}</div>
          </Card>
        ))}

        <Card>
          <FLabel icon={Icon.clock}>History</FLabel>
          <ol className="space-y-2.5">
            {lead.events.map((e) => (
              <li key={e.id} className="border-l-2 border-line pl-3">
                <div className="text-sm text-body">{eventText(e)}</div>
                <div className="text-xs text-subtle">{timeAgo(e.created_at)}</div>
              </li>
            ))}
          </ol>
        </Card>
        {err && <div role="alert" className="rounded-2xl bg-danger-tint px-3.5 py-3 text-sm font-medium text-danger-fg">{err}</div>}
      </main>

      {sheet === "quote" && <QuoteSheet lead={lead} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }} />}
      {sheet === "order" && <OrderSheet lead={lead} quote={lastQuote} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }} />}
      {sheet === "lost" && (
        <MSheet title="Lead lost kyun hua?" onClose={() => setSheet(null)}>
          <div className="space-y-2 pb-2">
            {LOST_REASONS.map((r) => (
              <button key={r} type="button" onClick={() => { setSheet(null); update({ status: "lost", lost_reason: r }); }}
                className="block min-h-[48px] w-full rounded-xl bg-tonal px-4 text-left font-semibold text-strong">{r}</button>
            ))}
          </div>
        </MSheet>
      )}
    </>
  );
}

function eventText(e) {
  switch (e.kind) {
    case "created": return `Lead bana${e.text ? ` — ${e.text}` : ""}`;
    case "status": return `Status: ${LEAD_META[e.text?.split(" — ")[0]]?.label || e.text}${e.text?.includes(" — ") ? ` — ${e.text.split(" — ")[1]}` : ""}`;
    case "follow_up": return `Follow-up: ${dayLabel(e.text)}`;
    default: return e.text;
  }
}

/* Pick products from the catalogue, set qty and discount → quotation. */
function QuoteSheet({ lead, onClose, onDone }) {
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const gross = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const add = (p) => setItems((xs) => xs.some((x) => x.model === p.name) ? xs : [...xs, { model: p.name, mrp: p.mrp, qty: 1 }]);
  const setQty = (k, d) => setItems((xs) => xs.flatMap((x, i) => i !== k ? [x] : x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]));
  const list = products.filter((p) => p.mrp && (!q || p.name.toLowerCase().includes(q.toLowerCase())));

  const save = async () => {
    setBusy(true); setErr("");
    try { await api.addQuotation(lead.id, { items, discount: Math.min(discount, gross) }); onDone(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <MSheet title="Quotation" onClose={onClose}
      footer={<PrimaryButton onClick={save} disabled={!items.length} loading={busy}>Save · {rupeeAmt(gross - Math.min(discount, gross))}</PrimaryButton>}>
      {items.map((i, k) => (
        <div key={i.model} className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-brand-tint/50 px-3 py-2">
          <div className="min-w-0"><div className="truncate font-semibold text-strong">{i.model}</div><div className="tnum text-xs text-muted">{rupeeAmt(i.mrp)}</div></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setQty(k, -1)} className="grid h-9 w-9 place-items-center rounded-full bg-surface"><Icon.minus width={16} height={16} /></button>
            <span className="tnum w-5 text-center font-bold">{i.qty}</span>
            <button type="button" onClick={() => setQty(k, 1)} className="grid h-9 w-9 place-items-center rounded-full bg-surface"><Icon.plus width={16} height={16} /></button>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div className="mb-3 mt-1">
          <div className="mb-1 text-sm font-semibold text-muted">Discount</div>
          <PlusMinus value={discount} onDelta={(d) => setDiscount((v) => Math.max(0, Math.min(gross, v + d)))} onInput={(v) => setDiscount(Math.max(0, Math.min(gross, v)))} step={500} max={gross} format={rupeeAmt} wide />
        </div>
      )}
      <input className={input} placeholder="Product dhundo" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-2 max-h-[38vh] space-y-1 overflow-y-auto">
        {list.map((p) => (
          <button key={p.id} type="button" onClick={() => add(p)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-tonal">
            {p.image ? <img src={p.image} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-tonal" />}
            <div className="min-w-0 flex-1"><div className="truncate font-semibold text-strong">{p.name}</div><div className="truncate text-xs text-muted">{p.note}</div></div>
            <div className="tnum text-sm font-bold text-strong">{rupeeAmt(p.mrp)}</div>
          </button>
        ))}
      </div>
      {err && <p className="mt-2 text-sm text-danger-fg">{err}</p>}
    </MSheet>
  );
}

/* Won: turn the latest quotation into an order and record the advance. */
function OrderSheet({ lead, quote, onClose, onDone }) {
  const [advance, setAdvance] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    setBusy(true); setErr("");
    try { await api.addOrder(lead.id, { quotation_id: quote.id, advance }); onDone(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <MSheet title="Order book karo" onClose={onClose}
      footer={<PrimaryButton className="!bg-ok" onClick={save} loading={busy}>Confirm Order</PrimaryButton>}>
      <div className="rounded-xl bg-tonal px-4 py-3">
        <div className="text-sm text-muted">Quotation total</div>
        <div className="tnum text-[22px] font-extrabold text-strong">{rupeeAmt(quote.total)}</div>
      </div>
      <div className="mb-1 mt-4 text-sm font-semibold text-muted">Advance mila</div>
      <PlusMinus value={advance} onDelta={(d) => setAdvance((v) => Math.max(0, Math.min(quote.total, v + d)))} onInput={(v) => setAdvance(Math.max(0, Math.min(quote.total, v)))} step={500} max={quote.total} format={rupeeAmt} wide />
      <p className="mt-2 text-sm text-muted">Baaki: <b className="tnum">{rupeeAmt(quote.total - advance)}</b></p>
      {err && <p className="mt-2 text-sm text-danger-fg">{err}</p>}
    </MSheet>
  );
}
