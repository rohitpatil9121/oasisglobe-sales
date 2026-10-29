// The three things we provide, shown under the home hero: a button, a photo
// and one line each. The header menu carries the same three. The parts price
// list is not a topic of its own — it is reached from the Service page.
// `image` files live in public/images/ (4:3); swap the file to change a photo.
export const topics = [
  { name: "Branded purifiers", link: "/purifiers/", image: "/images/topic-branded.jpg", alt: "Oasis, Kent and Aquaguard water purifiers side by side", body: "Oasis Globe, Kent and Aquaguard. New purifiers, fitted by us." },
  { name: "Ionizer", link: "/ionizer/", image: "/images/topic-ionizer.jpg", alt: "Bluvé alkaline water ionizer with a glass of water", body: "Bluvé alkaline water ionizer for home and business. Free demo at home." },
  { name: "Water softener", link: "/water-softener/", image: "/images/topic-softener.jpg", alt: "ORG and Oasis water softeners side by side", body: "ORG and Oasis softeners. No more white marks on taps and tiles." },
  { name: "Custom", link: "/custom/", image: "/images/topic-custom.jpg", alt: "Three Oasis purifier cabinets in different designs", body: "Choose the model, cabinet and filters. We build it." },
  { name: "Service", link: "/service/", image: "/images/topic-service.jpg", alt: "Technician checking water with a TDS meter beside an opened purifier", body: "Repair, installation and filter change. Parts price list inside." },
];

// Our own models, as the owner filed them in the catalogue folder (catelog/,
// one folder per model, one render per cabinet colour — 11 Oct 2026). Grouped
// by range: /purifiers/ shows one card per model, and each model has its own
// page (/purifiers/oasis/<model slug>/) where the customer picks the colour. Photos live in public/images/oasis/<model>-<colour>.jpg.
// `facts` are as printed in the owner's Prospera-10 and Inspera-10 leaflets;
// the other ranges have no leaflet yet, so they say only what is printed on
// the unit. `desc` is one or two lines about the model, from the owner's
// catalogue PDF and leaflets and from what the render itself shows. Prices (`mrp`) only where the owner has given one (Prospera, 11 Oct 2026); the
// rest are quoted on WhatsApp. No invented specs.
const COMMON_FACTS = [
  "Philips UV-C lamp and Philips ballast (254 nm) in a reflector chamber, to kill bacteria in the water.",
  "Hollow fibre UF membrane, 0.01 micron.",
  "Water first passes a sediment filter, then Oasis sediment and activated carbon filters.",
  "Stops by itself when there is no water coming in or the tank is full, and uses no power when it is not running.",
  "LED indicator, and you can see the water level.",
  "Pre-filter unit free with the purifier.",
  "Made by an ISO 9001:2015 certified company.",
];
export const oasisFamilies = [
  {
    slug: "prospera", name: "Prospera", tag: "RO + UV + UF + TDS", kind: "water purifier",
    intro: "For borewell, tanker or mixed water. 7 stage purification that removes salts and germs and gives pure water with minerals. A compact purifier that looks good in the kitchen.",
    facts: ["Oasis 100 GPD RO membrane and booster pump. The membrane supports high TDS water.", ...COMMON_FACTS],
    models: [
      { slug: "prospera-max", mrp: 19000, name: "Prospera MAX", note: "RO + UV + UF + TDS",
        desc: "RO + UV purifier with a Philips UV lamp and a copper-winding pump. For borewell and tanker water.", colours: [
        { slug: "prospera-max-black", name: "Black", image: "/images/oasis/prospera-max-black.jpg", w: 577, h: 800 },
        { slug: "prospera-max-aqua", name: "Aqua", image: "/images/oasis/prospera-max-aqua.jpg", w: 576, h: 800 },
      ] },
      { slug: "prospera-plus", mrp: 21000, name: "Prospera Plus", note: "",
        desc: "RO + UV purifier in a slim cabinet. Lights on the front show power, purifying and tank full. For borewell and tanker water.", colours: [
        { slug: "prospera-plus-black-rose-gold", name: "Black Rose Gold", image: "/images/oasis/prospera-plus-black-rose-gold.jpg", w: 667, h: 800 },
        { slug: "prospera-plus-graphite", name: "Graphite", image: "/images/oasis/prospera-plus-graphite.jpg", w: 599, h: 800 },
      ] },
      { slug: "prospera-10l", mrp: 19000, name: "Prospera 10L", note: "10 litre tank · RO + UV + UF + TDS",
        desc: "RO + UV purifier with a 10 litre see-through tank. For borewell and tanker water.", colours: [
        { slug: "prospera-10l-blue", name: "Blue", image: "/images/oasis/prospera-10l-blue.jpg", w: 577, h: 800 },
        { slug: "prospera-10l-blue-gold", name: "Blue Gold", image: "/images/oasis/prospera-10l-blue-gold.jpg", w: 581, h: 800 },
        { slug: "prospera-10l-teal", name: "Teal", image: "/images/oasis/prospera-10l-teal.jpg", w: 594, h: 800 },
        { slug: "prospera-10l-black", name: "Black", image: "/images/oasis/prospera-10l-black.jpg", w: 667, h: 800 },
      ] },
      { slug: "prospera-9l", mrp: 16000, name: "Prospera 9L", note: "9 litre detachable tank",
        desc: "RO + UV purifier with a 9 litre tank you can take out and clean. For borewell and tanker water.", colours: [
        { slug: "prospera-9l-white-blue", name: "White Blue", image: "/images/oasis/prospera-9l-white-blue.jpg", w: 669, h: 800 },
        { slug: "prospera-9l-white-black", name: "White Black", image: "/images/oasis/prospera-9l-white-black.jpg", w: 800, h: 731 },
        { slug: "prospera-9l-purple", name: "Purple", image: "/images/oasis/prospera-9l-purple.jpg", w: 800, h: 731 },
      ] },
      // Same cabinet as Inspera 6.5L (the owner filed the same renders under both).
      { slug: "prospera-6-5l", mrp: 18000, name: "Prospera 6.5L", note: "6.5 litre tank",
        desc: "RO + UV purifier with a 6.5 litre tank. Small size for small kitchens. For borewell and tanker water.", colours: [
        { slug: "prospera-6-5l-black", name: "Black", image: "/images/oasis/inspera-6-5l-black.jpg", w: 667, h: 800 },
        { slug: "prospera-6-5l-white", name: "White", image: "/images/oasis/inspera-6-5l-white.jpg", w: 667, h: 800 },
        { slug: "prospera-6-5l-marble", name: "Marble", image: "/images/oasis/inspera-6-5l-marble.jpg", w: 650, h: 800 },
      ] },
      { slug: "prospera-alkaline", mrp: 21000, name: "Prospera + Alkaline", note: "RO + UV + UF + TDS + alkaline",
        desc: "RO + UV purifier with an extra alkaline filter at the end. For borewell and tanker water.", colours: [
        { slug: "prospera-alkaline-black", name: "Black", image: "/images/oasis/prospera-alkaline-black.jpg", w: 682, h: 800 },
        { slug: "prospera-alkaline-purple", name: "Purple", image: "/images/oasis/prospera-alkaline-purple.jpg", w: 667, h: 800 },
        { slug: "prospera-alkaline-white", name: "White", image: "/images/oasis/prospera-alkaline-white.jpg", w: 667, h: 800 },
      ] },
      { slug: "prospera-utc", mrp: 18000, name: "Prospera UTC", note: "No storage tank · RO + UV + UF + TDS",
        desc: "RO + UV purifier with no storage tank. Water is cleaned fresh when you open the tap, so there is no tank to clean.", colours: [
        { slug: "prospera-utc-black", name: "Black", image: "/images/oasis/prospera-utc-black.jpg", w: 647, h: 800 },
        { slug: "prospera-utc-white", name: "White", image: "/images/oasis/prospera-utc-white.jpg", w: 667, h: 800 },
        { slug: "prospera-utc-red", name: "Red", image: "/images/oasis/prospera-utc-red.jpg", w: 667, h: 800 },
      ] },
      // The Fonix cabinet, renamed by the owner (22 Oct 2026) as in the catalogue.
      { slug: "prospera-utc-plus", mrp: 22500, name: "Prospera UTC+", note: "Separate 8 or 12 L tank · RO + UV + UF + TDS",
        desc: "RO + UV purifier with a separate 8 or 12 litre storage tank and its own faucet. For borewell and tanker water.", colours: [
        { slug: "prospera-utc-plus-white", name: "White", image: "/images/oasis/fonix-white.jpg", w: 800, h: 533 },
      ] },
    ],
  },
  {
    slug: "inspera", name: "Inspera", tag: "UV + UF", kind: "water purifier",
    intro: "For corporation water. 5 stage purification that kills germs. It does not remove salts. A compact purifier that looks good in the kitchen.",
    facts: COMMON_FACTS,
    models: [
      { slug: "inspera-6-5l", mrp: 13000, name: "Inspera 6.5L", note: "6.5 litre tank",
        desc: "UV + UF purifier with a 6.5 litre tank. Small size for small kitchens.", colours: [
        { slug: "inspera-6-5l-white", name: "White", image: "/images/oasis/inspera-6-5l-white.jpg", w: 667, h: 800 },
        { slug: "inspera-6-5l-black", name: "Black", image: "/images/oasis/inspera-6-5l-black.jpg", w: 667, h: 800 },
        { slug: "inspera-6-5l-marble", name: "Marble", image: "/images/oasis/inspera-6-5l-marble.jpg", w: 650, h: 800 },
      ] },
      // Same cabinets as the Prospera models of the same name, so the same catalogue renders.
      { slug: "inspera-max", mrp: 15000, name: "Inspera MAX", note: "",
        desc: "UV + UF purifier with a see-through tank, in the same cabinet as the Prospera MAX.", colours: [
        { slug: "inspera-max-black", name: "Black", image: "/images/oasis/prospera-max-black.jpg", w: 577, h: 800 },
        { slug: "inspera-max-aqua", name: "Aqua", image: "/images/oasis/prospera-max-aqua.jpg", w: 576, h: 800 },
      ] },
      // Same cabinet as Prospera Plus (the owner filed the same renders under both).
      { slug: "inspera-plus", mrp: 17000, name: "Inspera Plus", note: "",
        desc: "UV + UF purifier in a slim cabinet. Lights on the front show power, purifying and tank full.", colours: [
        { slug: "inspera-plus-black-rose-gold", name: "Black Rose Gold", image: "/images/oasis/prospera-plus-black-rose-gold.jpg", w: 667, h: 800 },
        { slug: "inspera-plus-graphite", name: "Graphite", image: "/images/oasis/prospera-plus-graphite.jpg", w: 599, h: 800 },
      ] },
      { slug: "inspera-10l", mrp: 15000, name: "Inspera 10L", note: "10 litre tank",
        desc: "UV + UF purifier with a 10 litre see-through tank. You can take the tank out and wash it.", colours: [
        { slug: "inspera-10l-blue", name: "Blue", image: "/images/oasis/prospera-10l-blue.jpg", w: 577, h: 800 },
        { slug: "inspera-10l-blue-gold", name: "Blue Gold", image: "/images/oasis/prospera-10l-blue-gold.jpg", w: 581, h: 800 },
        { slug: "inspera-10l-teal", name: "Teal", image: "/images/oasis/prospera-10l-teal.jpg", w: 594, h: 800 },
        { slug: "inspera-10l-black", name: "Black", image: "/images/oasis/prospera-10l-black.jpg", w: 667, h: 800 },
      ] },
      { slug: "inspera-utc", mrp: 14000, name: "Inspera UTC", note: "No storage tank",
        desc: "UV + UF purifier with no storage tank. Water is cleaned fresh when you open the tap, so there is no tank to clean.", colours: [
        { slug: "inspera-utc-black", name: "Black", image: "/images/oasis/prospera-utc-black.jpg", w: 647, h: 800 },
        { slug: "inspera-utc-white", name: "White", image: "/images/oasis/prospera-utc-white.jpg", w: 667, h: 800 },
        { slug: "inspera-utc-red", name: "Red", image: "/images/oasis/prospera-utc-red.jpg", w: 667, h: 800 },
      ] },
      { slug: "inspera-utc-plus", mrp: 18500, name: "Inspera UTC+", note: "Separate 8 or 12 L tank",
        desc: "UV + UF purifier with a separate 8 or 12 litre storage tank and its own faucet. For corporation water.", colours: [
        { slug: "inspera-utc-plus-white", name: "White", image: "/images/oasis/fonix-white.jpg", w: 800, h: 533 },
      ] },
      { slug: "inspera-9l", mrp: 12000, name: "Inspera 9L", note: "9 litre detachable tank",
        desc: "UV + UF purifier with a 9 litre tank you can take out and clean.", colours: [
        { slug: "inspera-9l-white-blue", name: "White Blue", image: "/images/oasis/prospera-9l-white-blue.jpg", w: 669, h: 800 },
        { slug: "inspera-9l-white-black", name: "White Black", image: "/images/oasis/prospera-9l-white-black.jpg", w: 800, h: 731 },
        { slug: "inspera-9l-purple", name: "Purple", image: "/images/oasis/prospera-9l-purple.jpg", w: 800, h: 731 },
      ] },
    ],
  },
  {
    slug: "spectra", name: "Spectra", tag: "UV", kind: "water purifier",
    intro: "A UV purifier without a storage tank, in six cabinet colours.",
    facts: [],
    models: [
      { slug: "spectra", mrp: 12000, name: "Spectra", note: "UV",
        desc: "Water is cleaned fresh when you open the tap, so nothing is stored. For corporation water. It kills germs but does not remove salts.", colours: [
        { slug: "spectra-marble-gray-brown", name: "Marble Gray Brown", image: "/images/oasis/spectra-marble-gray-brown.jpg", w: 587, h: 800 },
        { slug: "spectra-marble-brown", name: "Marble Brown", image: "/images/oasis/spectra-marble-brown.jpg", w: 642, h: 800 },
        { slug: "spectra-black-marble", name: "Black Marble", image: "/images/oasis/spectra-black-marble.jpg", w: 667, h: 800 },
        { slug: "spectra-blue-granite", name: "Blue Granite", image: "/images/oasis/spectra-blue-granite.jpg", w: 648, h: 800 },
        { slug: "spectra-lavender", name: "Lavender", image: "/images/oasis/spectra-lavender.jpg", w: 647, h: 800 },
        { slug: "spectra-marble-gray", name: "Marble Gray", image: "/images/oasis/spectra-marble-gray.jpg", w: 667, h: 800 },
      ] },
    ],
  },
  {
    slug: "more", name: "More purifiers", tag: "", kind: "water purifier", plain: true,
    intro: "",
    facts: [],
    models: [
      { slug: "hot-cold", name: "Hot & Cold", note: "Hot and cold water taps",
        desc: "RO + UV purifier with two taps, one for hot and one for cold water. The hot tap has a safety lock. 8 litres: hot 1 litre, cold 1 litre, normal 6 litres.", colours: [
        { slug: "hot-cold-navy", name: "Navy", image: "/images/oasis/hot-cold-navy.jpg", w: 800, h: 625 },
      ] },
    ],
  },
  {
    slug: "water-softener", name: "Water softeners", tag: "", kind: "water softener", plain: true,
    intro: "",
    facts: [],
    models: [
      // Names and prices as the owner sent them on WhatsApp (11 Oct 2026). The 1200L
      // shows the whole-house filter photo (owner, 11 Oct 2026); the 600L the blue Oasis one.
      { slug: "org-water-softener-1200l", mrp: 19000, name: "ORG Water Softener 1200L", note: "For washing machine and bathroom",
        desc: "Hard water leaves white marks on taps, tiles and buckets. A softener stops this. It also helps your geyser and washing machine last longer. Made by ORG. Sold and fitted by Oasis Globe.", colours: [
        { slug: "org-water-softener-1200l-white", name: "White", image: "/images/oasis/softener-large-white.jpg", w: 533, h: 800 },
      ] },
      { slug: "org-water-softener-600l", mrp: 14000, name: "ORG Water Softener 600L", note: "For washing machine and bathroom",
        desc: "Hard water leaves white marks on taps, tiles and buckets. A softener stops this. It also helps your geyser and washing machine last longer. Made by ORG. Sold and fitted by Oasis Globe.", colours: [
        { slug: "org-water-softener-600l-white", name: "White", image: "/images/oasis/softener-mini-white.jpg", w: 250, h: 746 },
      ] },
      { slug: "oasis-water-softener-1200l", mrp: 16000, name: "Oasis Water Softener 1200L", note: "For washing machine and bathroom",
        desc: "Hard water leaves white marks on taps, tiles and buckets. A softener stops this. It also helps your geyser and washing machine last longer.", colours: [
        { slug: "oasis-water-softener-1200l-blue", name: "Blue", image: "/images/oasis/whole-house-filter-clear.jpg", w: 667, h: 800 },
      ] },
      { slug: "oasis-water-softener-600l", mrp: 10000, name: "Oasis Water Softener 600L", note: "For washing machine and bathroom",
        desc: "Hard water leaves white marks on taps, tiles and buckets. A softener stops this. It also helps your geyser and washing machine last longer.", colours: [
        { slug: "oasis-water-softener-600l-blue", name: "Blue", image: "/images/oasis/softener-blue-blue.jpg", w: 533, h: 800 },
      ] },
    ],
  },
];

/* "Your questions, answered" and the three free things, as printed in the
   owner's "Oasis Globe Catalogue Directions" PDF (11 Oct 2026). What the PDF
   leaves as [CONFIRM] is not shown, and its MRPs are not used — the prices
   above are the newer ones he sent. Models the PDF has no page for (Plus,
   6.5L, the other Inspera sizes) take their range's answers from its "which
   purifier uses which steps" page: Prospera = all 7 steps, Inspera = 5 steps,
   no RO. The softeners' "What is it for?" is the owner's WhatsApp line. */
const PERKS = ["Free pre-filter", "No service charge for 1st year", "Free installation"];
const RO = [
  ["What water is it for?", "Borewell, tanker or mixed water"],
  ["What does it remove?", "Salts, germs, sand, mud, rust and chlorine smell"],
];
const RO_STEPS = ["How does it clean?", "7 steps: Pre-filter → Sediment → Carbon → RO → UV → UF → TDS controller"];
const INSPERA = [
  ["What water is it for?", "Corporation water"],
  ["What does it remove?", "Germs, sand, mud, rust and chlorine smell. Does not remove salts."],
  ["How does it clean?", "5 steps: Pre-filter → Sediment → Carbon → UV → UF"],
];
const UV = [
  ["What water is it for?", "Corporation water"],
  ["What does it remove?", "Kills germs (bacteria and viruses). Does not remove salts."],
  ["How does it clean?", "UV lamp"],
];
const NO_TANK = ["Tank size", "No tank. Nothing is stored, so there is no tank to clean."];
const TANK_9 = ["Tank size", "9 litres. You can take the tank out to clean it."];
const TANK_10 = ["Tank size", "10 litres, see-through"];
const SOFTENER = [
  ["What is it for?", "Washing machine and bathroom water"],
  ["What does it do?", "Stops the white marks hard water leaves on taps, tiles and buckets"],
  ["What does it protect?", "Your geyser and washing machine. They last longer."],
];
const ORG = ["Who makes it?", "Made by ORG. Sold and fitted by Oasis Globe."];
const QA = {
  "prospera-max": [...RO, RO_STEPS, ["Fitting", "Wall or counter-top"]],
  "prospera-plus": [...RO, RO_STEPS],
  "prospera-10l": [...RO, RO_STEPS, TANK_10],
  "prospera-9l": [...RO, RO_STEPS, TANK_9],
  "prospera-6-5l": [...RO, RO_STEPS, ["Tank size", "6.5 litres"]],
  "prospera-alkaline": [...RO, ["How does it clean?", "7 steps, plus an alkaline filter at the end"]],
  "prospera-utc": [...RO, RO_STEPS, NO_TANK],
  "prospera-utc-plus": [...RO, RO_STEPS, ["Tank size", "8 or 12 litre storage tank, with its own faucet"]],
  "inspera-6-5l": [...INSPERA, ["Tank size", "6.5 litres"]],
  "inspera-max": INSPERA,
  "inspera-plus": INSPERA,
  "inspera-10l": [...INSPERA, TANK_10],
  "inspera-utc": [...INSPERA, NO_TANK],
  "inspera-utc-plus": [...INSPERA, ["Tank size", "8 or 12 litre storage tank, with its own faucet"]],
  "inspera-9l": [...INSPERA, TANK_9],
  "spectra": [...UV, ["Tank size", "No tank. Nothing is stored."]],
  "hot-cold": [...RO, RO_STEPS, ["Tank size", "8 litres: hot 1 L, cold 1 L, normal 6 L"]],
  "org-water-softener-1200l": [...SOFTENER, ORG],
  "org-water-softener-600l": [...SOFTENER, ORG],
  "oasis-water-softener-1200l": SOFTENER,
  "oasis-water-softener-600l": SOFTENER,
};
for (const f of oasisFamilies) for (const m of f.models) {
  m.qa = QA[m.slug] || [];
  // The PDF prints the three free things beside every purifier, not beside softeners and filters.
  m.perks = f.kind === "water purifier" ? PERKS : [];
}

// Every model, flat — for the counts and the product list given to search engines.
export const oasisModels = oasisFamilies.flatMap((f) => f.models.map((m) => ({
  slug: m.colours[0].slug, image: m.colours[0].image, id: m.slug, mrp: m.mrp, name: m.name, note: m.note, colours: m.colours.length, w: m.colours[0].w, h: m.colours[0].h, family: f.slug,
})));

// Kent and Aquaguard models live in kent.json and aquaguard.json, built from
// the two company brochures (names, specs and MRP as printed there).
