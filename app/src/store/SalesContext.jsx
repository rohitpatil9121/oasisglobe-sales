import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../lib/api.js";

const Ctx = createContext(null);
export const useSales = () => useContext(Ctx);

/* Who is signed in, plus the lead list every tab reads from. */
export function SalesProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return getToken() ? JSON.parse(localStorage.getItem("sales_user") || "null") : null; } catch { return null; }
  });
  const [leads, setLeads] = useState(null);
  const [err, setErr] = useState("");

  const signOut = useCallback(() => {
    setToken(null); localStorage.removeItem("sales_user"); setUser(null); setLeads(null);
  }, []);
  useEffect(() => { setUnauthorizedHandler(signOut); }, [signOut]);

  const loadLeads = useCallback(async () => {
    try { setErr(""); setLeads((await api.leads()).leads); }
    catch (e) { setErr(e.message); setLeads((l) => l || []); }
  }, []);

  const signIn = async (token, u) => {
    if (u.role !== "sales") throw new Error("This number is not set up as a salesperson. Ask the office to add you.");
    setToken(token); localStorage.setItem("sales_user", JSON.stringify(u)); setUser(u);
  };

  // Renew the token and refresh the list on boot.
  useEffect(() => {
    if (!user) return;
    api.me().then((r) => { if (r.token) setToken(r.token); }).catch(() => {});
    loadLeads();
  }, [user, loadLeads]);

  // Write-through: a saved lead replaces its copy in the list.
  const putLead = (lead) => setLeads((ls) => [lead, ...(ls || []).filter((l) => l.id !== lead.id)]);

  return <Ctx.Provider value={{ user, signIn, signOut, leads, loadLeads, putLead, err }}>{children}</Ctx.Provider>;
}
