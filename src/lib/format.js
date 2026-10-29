export const rupeeAmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Today in IST as YYYY-MM-DD — follow-up dates are plain dates.
export const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const addDays = (ymd, n) => {
  const d = new Date(ymd + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const dayLabel = (ymd) => {
  if (!ymd) return "";
  const t = istToday();
  if (ymd === t) return "Today";
  if (ymd === addDays(t, 1)) return "Tomorrow";
  if (ymd === addDays(t, -1)) return "Yesterday";
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
export const timeAgo = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
