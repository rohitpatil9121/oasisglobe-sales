import { useNavigate } from "react-router-dom";
import { Icon } from "./ui.jsx";

// Header for a full screen: back arrow + title.
export default function ScreenHeader({ title, right }) {
  const nav = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center gap-2 bg-sunken px-2 py-2">
      <button type="button" onClick={() => nav(-1)} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full text-strong">
        <Icon.back width={22} height={22} />
      </button>
      <h1 className="flex-1 truncate text-[20px] font-bold text-strong">{title}</h1>
      {right}
    </header>
  );
}

// Row of choice chips (interest, source, status…).
export const Chips = ({ options, value, onChange, label = (o) => o }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button key={o} type="button" onClick={() => onChange(o === value ? "" : o)}
        className={`min-h-[40px] rounded-full px-3.5 text-[14px] font-semibold ${o === value ? "bg-brand text-white" : "bg-tonal text-strong"}`}>
        {label(o)}
      </button>
    ))}
  </div>
);
