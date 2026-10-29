/* Custom purifier options, from the website's custom.json: base design, body
   (cabinet), inner parts (purification stages) and extra filters.
   The website marks this data `sample`: the RO/UV/UF prices below are
   placeholders until the owner gives the real ones. */
import custom from "./custom.json";

const files = import.meta.glob("../assets/img/**/*.jpg", { eager: true, import: "default" });
const img = (p) => files["../assets/img/" + String(p).replace(/^\/images\//, "")] || null;

export const PRICES_ARE_SAMPLE = !!custom.sample;
const STAGE_PRICE = { pre: 0, sediment: 0, carbon: 0, ro: 2500, uv: 1500, uf: 900 };
export const REQUIRED_STAGES = ["pre", "sediment", "carbon"];

export const designs = custom.designs.map((d) => ({ ...d, image: img(d.image) }));
export const tanks = custom.tanks;
export const cabinets = custom.cabinets.map((c) => ({ ...c, image: img(c.image) }));
export const stages = custom.filters.map((f) => ({ ...f, price: STAGE_PRICE[f.id] ?? 0, required: REQUIRED_STAGES.includes(f.id) }));
export const extras = custom.groups.flatMap((g) => g.options);
export const included = custom.included;

export const emptyBuild = () => ({ design: designs[0]?.id, cabinet: null, stages: [...REQUIRED_STAGES, "ro", "uv"], extras: [] });

export function buildPrice(b) {
  const d = designs.find((x) => x.id === b.design)?.price || 0;
  const s = stages.filter((x) => b.stages.includes(x.id)).reduce((t, x) => t + x.price, 0);
  const e = extras.filter((x) => b.extras.includes(x.id)).reduce((t, x) => t + x.price, 0);
  return d + s + e;
}

// "Custom Wall model · RO + UV + UF · Black Wave"
export function buildName(b) {
  const d = designs.find((x) => x.id === b.design)?.name || "purifier";
  const s = stages.filter((x) => b.stages.includes(x.id) && !x.required).map((x) => x.name).join(" + ");
  const c = cabinets.find((x) => x.id === b.cabinet)?.name;
  return ["Custom " + d, s, c].filter(Boolean).join(" · ");
}

// Every stage the water goes through, in order, for the summary.
export function buildStages(b) {
  return [...stages.filter((x) => b.stages.includes(x.id)), ...extras.filter((x) => b.extras.includes(x.id))].map((x) => x.stage);
}
