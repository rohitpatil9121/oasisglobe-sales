import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { Alert, Button, Field, Input, Logo, PhoneInput } from "../components/ui.jsx";

/* Owner sign-in: the service dashboard's password, or a WhatsApp code. */
export default function Login() {
  const { loginPassword, verifyOtp } = useAuth();
  const [mode, setMode] = useState("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = (fn) => async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await fn(); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  const submit = mode === "password"
    ? run(() => loginPassword(phone, password))
    : sent ? run(() => verifyOtp(phone, code)) : run(async () => { await api.requestOtp(phone); setSent(true); });

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-ash bg-white p-6 shadow-card">
        <div className="text-center">
          <Logo className="mx-auto h-10" />
          <p className="mt-2 text-sm text-slate-500">Sales Dashboard</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-paper p-1">
          {[["password", "Password"], ["otp", "WhatsApp code"]].map(([k, label]) => (
            <button key={k} type="button" onClick={() => { setMode(k); setErr(""); setSent(false); }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${mode === k ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}>{label}</button>
          ))}
        </div>
        {err && <Alert>{err}</Alert>}
        <Field label="Phone"><PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} autoFocus /></Field>
        {mode === "password" && <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>}
        {mode === "otp" && sent && <Field label="Code" hint="Sent on WhatsApp"><Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></Field>}
        <Button type="submit" className="w-full" loading={busy}>
          {mode === "password" ? "Sign in" : sent ? "Verify" : "Send code"}
        </Button>
      </form>
    </div>
  );
}
