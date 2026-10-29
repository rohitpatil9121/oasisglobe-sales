import { useNavigate } from "react-router-dom";
import { Icon, StatusPill, cx } from "./ui.jsx";
import { telUrl, waUrl } from "../lib/api.js";
import { dayLabel, istToday } from "../lib/format.js";
import { isOpen } from "../lib/status.js";

/* One lead: name, what they want, follow-up day, and Call / WhatsApp / Open. */
export default function LeadCard({ lead }) {
  const nav = useNavigate();
  const overdue = isOpen(lead) && lead.next_follow_up && lead.next_follow_up < istToday();
  const btn = "flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold";
  return (
    <div className="mb-3 rounded-2xl bg-surface p-4 shadow-card">
      <button type="button" onClick={() => nav(`/lead/${lead.id}`)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[17px] font-bold text-strong">{lead.customer_name}</div>
            <div className="mt-0.5 text-sm text-muted">
              {[lead.interest, lead.area].filter(Boolean).join(" · ") || lead.phone}
            </div>
          </div>
          <StatusPill status={lead.status} />
        </div>
        {lead.note && <div className="mt-2 line-clamp-2 text-sm text-body">{lead.note}</div>}
        {isOpen(lead) && lead.next_follow_up && (
          <div className={cx("mt-2 flex items-center gap-1.5 text-xs font-semibold", overdue ? "text-danger-fg" : "text-muted")}>
            <Icon.clock width={14} height={14} /> Follow-up: {dayLabel(lead.next_follow_up)}{overdue && " (late)"}
          </div>
        )}
      </button>
      <div className="mt-3 flex gap-2">
        <a href={telUrl(lead.phone)} className={cx(btn, "bg-brand-tint text-brand-dark")}><Icon.phone width={17} height={17} /> Call</a>
        <a href={waUrl(lead.phone)} target="_blank" rel="noreferrer" className={cx(btn, "bg-wa-tint text-wa-dark")}><Icon.whatsapp width={17} height={17} /> WhatsApp</a>
        <button type="button" onClick={() => nav(`/lead/${lead.id}`)} className={cx(btn, "bg-tonal text-strong")}><Icon.check width={17} height={17} /> Update</button>
      </div>
    </div>
  );
}
