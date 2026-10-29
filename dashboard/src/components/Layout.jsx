import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Icon, Logo } from "./ui.jsx";

const NAV = [
  { to: "/", label: "Overview", icon: "grid", end: true },
  { to: "/leads", label: "Leads", icon: "user" },
  { to: "/orders", label: "Orders", icon: "file" },
  { to: "/team", label: "Sales Team", icon: "users" },
];

const linkCls = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-paper hover:text-ink"}`;

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ash bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link to="/"><Logo className="h-7" badge="h-7 w-7 rounded-lg text-xs" /></Link>
          <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">Sales</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}><Icon name={n.icon} className="h-4 w-4" />{n.label}</NavLink>)}
        </nav>
        <div className="border-t border-ash p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{initials}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium text-ink">{user?.full_name}</div>
              <div className="truncate text-xs capitalize text-slate-500">{user?.role}</div>
            </div>
            <button onClick={logout} aria-label="Log out" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-paper hover:text-ink">
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ash bg-white/90 px-4 backdrop-blur lg:hidden">
          <Logo className="h-7" badge="h-7 w-7 rounded-lg text-xs" />
          <span className="text-sm font-semibold text-slate-700">Sales</span>
          <button onClick={logout} aria-label="Log out" className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-slate-500"><Icon name="logout" className="h-4 w-4" /></button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-ash bg-white px-4 py-2 lg:hidden">
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={(s) => `${linkCls(s)} min-h-[44px] shrink-0`}><Icon name={n.icon} className="h-4 w-4" />{n.label}</NavLink>)}
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
