/* The figures the Home report is drawn from.

   Each one carries a hover layer, because a chart on a screen that cannot be
   interrogated is a picture of data rather than data. Values are labelled
   directly where there is room; nothing carries a number on every mark. Axes
   and grid lines are recessive — they orient, they do not compete.

   Text never wears the series colour: a coloured mark sits beside ink-coloured
   text, so identity survives being read by someone who cannot separate the hues,
   or printed in grey.

   On small text and grey: the dashboard's habit is slate-400 for hints, which is
   2.9:1 on white — below the 4.5:1 a body-size string needs. Everything here
   that a person actually reads uses slate-500 or darker. */
import { SERIES, INK, GRID } from "../lib/chart.js";

const R = 4;   // rounded data-end, anchored to the baseline

// A bar with only its TOP corners rounded (flat on the baseline) — the shadcn
// multiple-bar look. Rounding all four corners floats a bar's bottom off the
// axis; this keeps it planted.
function barPath(x, y, w, h, r = R) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

export function Figure({ title, sub, children, right, className = "" }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-ash bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {sub && <p className="mt-0.5 text-xs leading-snug text-slate-500">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Nothing to draw yet — say what would fill it, not just that it is empty. */
export function Empty({ children }) {
  return (
    <div className="flex h-full min-h-[96px] items-center justify-center rounded-lg border border-dashed border-ash px-4 py-6">
      <p className="text-center text-xs text-slate-500">{children}</p>
    </div>
  );
}

/* Two counts a day over a fortnight. Grouped bars, not stacked: the question is
   "did we close as many as came in", which compares two lengths from the same
   baseline — stacking would make one of them float and unreadable. */
export function DailyBars({ days, series, height = 200 }) {
  const W = 720, H = height, padL = 26, padR = 8, padT = 10, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = plotW / days.length;
  const barW = Math.min(14, (step - 6) / series.length); // chunkier, shadcn-style
  const y = (v) => padT + plotH - (v / max) * plotH;

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`${series.map((s) => s.label).join(" and ")} per day, last ${days.length} days`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 6} y={y(max * f) + 3.5} textAnchor="end" fontSize="9" fill={INK.secondary}>
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {days.map((d, i) => (
          <g key={d}>
            {/* A full-height target, so the tooltip is reachable without hitting
                a 10px bar — and so a day with nothing still answers. */}
            <rect x={padL + i * step} y={padT} width={step} height={plotH} fill="transparent">
              <title>{`${d}\n${series.map((s) => `${s.label}: ${s.values[i]}`).join("\n")}`}</title>
            </rect>
            {series.map((s, si) => {
              const v = s.values[i];
              if (!v) return null;
              const x = padL + i * step + step / 2 - (series.length * barW + 2) / 2 + si * (barW + 2);
              return (
                <path key={s.label} d={barPath(x, y(v), barW, Math.max(2, y(0) - y(v)))}
                  fill={s.color} pointerEvents="none" />
              );
            })}
            {i % 2 === 0 && (
              <text x={padL + i * step + step / 2} y={H - 7} textAnchor="middle" fontSize="9" fill={INK.secondary}>
                {+d.slice(8)}/{+d.slice(5, 7)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-2"><Legend items={series.map((s) => ({ label: s.label, color: s.color }))} /></div>
    </>
  );
}

/* Ranked magnitudes — who has what, which column holds what. Horizontal,
   because the labels are names and a name reads along a line, not sideways. */
export function RankedBars({ rows, unit = "", color = SERIES[0], empty = "Nothing here yet." }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(76px,124px)_1fr_auto] items-center gap-2">
          <span className="truncate text-xs text-slate-600" title={r.label}>{r.label}</span>
          <span className="h-2.5 rounded-full bg-brand-50" title={`${r.label}: ${r.display ?? r.value}${unit}`}>
            {/* Zero draws NOTHING. A minimum-width sliver for an empty count is a
                mark that says "a little" where the truth is "none". */}
            {r.value > 0 && (
              <span
                className="block h-2.5 rounded-full motion-safe:transition-[width] motion-safe:duration-300"
                style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%`, background: r.color || color }}
              />
            )}
          </span>
          <span className="tabular-nums text-xs font-semibold text-slate-800">{r.display ?? r.value}{unit}</span>
        </li>
      ))}
    </ul>
  );
}

/* One number that is the whole answer.

   `delta` is what turns a number into a report: 12 jobs means nothing until you
   know yesterday was 4. It carries an arrow AND a word, never colour alone —
   red and green are the first thing to go for eight percent of men. */
export function Stat({ label, value, sub, delta, accent = INK.secondary, attention = false }) {
  const up = delta && delta.direction === "up";
  const flat = delta && delta.direction === "flat";
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-4 pl-5 shadow-card ${
      attention ? "border-rose-200" : "border-ash"}`}>
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} aria-hidden="true" />
      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-[28px] font-bold leading-none tracking-tight tabular-nums text-slate-900">{value}</span>
        {delta && (
          <span
            className={`mb-0.5 inline-flex items-center gap-0.5 text-xs font-semibold ${
              flat ? "text-slate-500" : up ? "text-emerald-700" : "text-amber-700"}`}
            aria-label={delta.announce || `${delta.direction} ${delta.text}`}>
            <span aria-hidden="true">{flat ? "→" : up ? "↑" : "↓"}</span>
            <span aria-hidden="true">{delta.text}</span>
          </span>
        )}
      </div>
      {sub && <div className="mt-1.5 text-xs leading-snug text-slate-500">{sub}</div>}
    </div>
  );
}

/* Multiple line chart (shadcn look): 2px monotone-ish strokes, no dots, only
   horizontal gridlines, recessive axis. `series` = [{ label, color, values[] }],
   aligned to `categories`. */
export function LineChart({ categories, series, height = 200, formatY }) {
  const W = 720, H = height, padL = formatY ? 46 : 32, padR = 10, padT = 10, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = categories.length;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const fmt = formatY || ((v) => Math.round(v));
  const x = (i) => (n <= 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v) => padT + plotH - (v / max) * plotH;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`${series.map((s) => s.label).join(" and ")} over ${n} points`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 6} y={y(max * f) + 3.5} textAnchor="end" fontSize="9" fill={INK.secondary}>{fmt(max * f)}</text>
          </g>
        ))}
        {series.map((s) => (
          <path key={s.label} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
            d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} />
        ))}
        {categories.map((c, i) => (n <= 8 || i % 2 === 0) && (
          <text key={c + i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="9" fill={INK.secondary}>{c}</text>
        ))}
        {categories.map((c, i) => (
          <rect key={"t" + i} x={x(i) - plotW / (2 * Math.max(1, n))} y={padT} width={plotW / Math.max(1, n)} height={plotH} fill="transparent">
            <title>{`${c}\n${series.map((s) => `${s.label}: ${fmt(s.values[i])}`).join("\n")}`}</title>
          </rect>
        ))}
      </svg>
      <div className="mt-2"><Legend items={series.map((s) => ({ label: s.label, color: s.color }))} /></div>
    </>
  );
}

/* Donut (shadcn interactive-pie look): ring segments with a bold total in the
   middle and a labelled legend beside it. `segments` = [{ label, value, color,
   display? }]. A zero total shows the empty grey ring. */
export function Donut({ segments, centerLabel, centerValue, size = 150, thickness = 24 }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let acc = 0;
  const arcs = total > 0
    ? segments.filter((s) => s.value > 0).map((s) => {
      const frac = s.value / total, seg = { s, len: frac * C, off: -acc * C };
      acc += frac; return seg;
    })
    : [];
  return (
    <div className="flex min-w-0 flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shrink-0"
        role="img" aria-label={centerLabel || "breakdown"}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRID} strokeWidth={thickness} />
        {arcs.map(({ s, len, off }, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`}>
            <title>{`${s.label}: ${s.display ?? s.value}`}</title>
          </circle>
        ))}
        {centerValue != null && (
          <>
            <text x={cx} y={cy - 1} textAnchor="middle" dominantBaseline="middle" fontSize="19" fontWeight="700" fill={INK.primary}>{centerValue}</text>
            {centerLabel && <text x={cx} y={cy + 17} textAnchor="middle" fontSize="10" fill={INK.secondary}>{centerLabel}</text>}
          </>
        )}
      </svg>
      <ul className="w-full min-w-0 space-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
            <span className="min-w-0 break-words leading-tight text-slate-600" title={s.label}>{s.label}</span>
            <span className="ml-auto shrink-0 pl-3 font-semibold tabular-nums text-slate-800">{s.display ?? s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Stacked bars (shadcn look): segments stacked per category, only the top of
   each stack rounded. `series` = [{ label, color, values[] }]. */
export function StackedBars({ categories, series, height = 200, formatY }) {
  const W = 720, H = height, padL = 32, padR = 8, padT = 10, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const totals = categories.map((_, i) => series.reduce((s, se) => s + (se.values[i] || 0), 0));
  const max = Math.max(1, ...totals);
  const step = plotW / categories.length;
  const barW = Math.min(28, step - 10);
  const y = (v) => padT + plotH - (v / max) * plotH;
  const fmt = formatY || ((v) => Math.round(v));
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`${series.map((s) => s.label).join(" and ")}, stacked per ${categories.length} points`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 6} y={y(max * f) + 3.5} textAnchor="end" fontSize="9" fill={INK.secondary}>{fmt(max * f)}</text>
          </g>
        ))}
        {categories.map((c, i) => {
          const topIdx = series.reduce((last, se, si) => ((se.values[i] || 0) > 0 ? si : last), -1);
          let base = 0;
          const x = padL + i * step + step / 2 - barW / 2;
          return (
            <g key={c}>
              <rect x={padL + i * step} y={padT} width={step} height={plotH} fill="transparent">
                <title>{`${c}\n${series.map((s) => `${s.label}: ${fmt(s.values[i] || 0)}`).join("\n")}\nTotal: ${fmt(totals[i])}`}</title>
              </rect>
              {series.map((se, si) => {
                const v = se.values[i] || 0;
                if (!v) return null;
                const yTop = y(base + v), h = Math.max(2, y(base) - y(base + v));
                base += v;
                return si === topIdx
                  ? <path key={se.label} d={barPath(x, yTop, barW, h)} fill={se.color} pointerEvents="none" />
                  : <rect key={se.label} x={x} y={yTop} width={barW} height={h} fill={se.color} pointerEvents="none" />;
              })}
              {(categories.length <= 8 || i % 2 === 0) && (
                <text x={padL + i * step + step / 2} y={H - 7} textAnchor="middle" fontSize="9" fill={INK.secondary}>{c}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2"><Legend items={series.map((s) => ({ label: s.label, color: s.color }))} /></div>
    </>
  );
}
