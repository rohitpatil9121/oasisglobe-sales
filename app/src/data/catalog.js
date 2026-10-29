/* The catalogue, from the website's data (same file the sales demo used):
   every Oasis model with its MRP, colours and photo. MRP only — purchase
   price never ships in this app. */
import { oasisFamilies } from "./purifiers.js";

const files = import.meta.glob("../assets/img/oasis/*.jpg", { eager: true, import: "default" });
const byPath = {};
for (const [k, url] of Object.entries(files)) byPath["/images/oasis/" + k.split("/").pop()] = url;

export const products = oasisFamilies.flatMap((f) => f.models.map((m) => ({
  id: m.slug,
  family: f.name,
  kind: f.kind,
  name: m.name,
  note: m.note || f.tag,
  desc: m.desc || f.intro,
  mrp: m.mrp || 0, // 0 = price on request
  colours: m.colours.map((c) => c.name),
  image: m.colours.map((c) => byPath[c.image]).find(Boolean) || null,
})));
