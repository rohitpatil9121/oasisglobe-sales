import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, setUnauthorizedHandler } from "../api/client.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Session lives in sessionStorage: closing the browser signs the owner out.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const t = sessionStorage.getItem("os_token");
      const u = sessionStorage.getItem("os_user");
      if (t && u) { setToken(t); return JSON.parse(u); }
    } catch { /* private mode */ }
    return null;
  });

  const logout = () => {
    setToken(null);
    try { sessionStorage.removeItem("os_token"); sessionStorage.removeItem("os_user"); } catch { /* ignore */ }
    setUser(null);
  };
  useEffect(() => { setUnauthorizedHandler(logout); }, []);

  const persist = ({ token, user: u }) => {
    setToken(token);
    try { sessionStorage.setItem("os_token", token); sessionStorage.setItem("os_user", JSON.stringify(u)); } catch { /* ignore */ }
    setUser(u);
  };

  const value = {
    user,
    logout,
    loginPassword: async (phone, password) => persist(await api.login(phone, password)),
    verifyOtp: async (phone, code) => persist(await api.verifyOtp(phone, code)),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
