// Lead pipeline, in order. Won/Lost close the lead.
export const LEAD_STEPS = ["new", "contacted", "demo", "quoted", "won", "lost"];
export const LEAD_META = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "brand" },
  demo: { label: "Demo / Visit", tone: "warn" },
  quoted: { label: "Quoted", tone: "warn" },
  won: { label: "Won", tone: "ok" },
  lost: { label: "Lost", tone: "danger" },
  booked: { label: "Booked", tone: "info" },
  dispatched: { label: "Dispatched", tone: "warn" },
  installation: { label: "Installation", tone: "warn" },
  completed: { label: "Completed", tone: "ok" },
  cancelled: { label: "Cancelled", tone: "danger" },
};
export const ORDER_STEPS = ["booked", "dispatched", "installation", "completed"];
export const INTERESTS = ["Purifier", "Softener", "Ionizer", "Custom cabinet", "Other"];
export const SOURCES = ["Walk-in", "Call", "Reference", "Dealer", "Website"];
export const isOpen = (l) => !["won", "lost"].includes(l.status);
