/* Sign-in for the sales side, on the shared `users` table:
   - salespeople: WhatsApp OTP, from the Sales app;
   - the owner: phone + password (the same one as the service dashboard) or OTP,
     on the sales dashboard.
   Only these two roles get a token here; everyone else is turned away. */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { supabase } from "./supabase.js";
import { sendOtp } from "./whatsapp.js";

const ROLES = { app: ["sales"], dashboard: ["owner"] };

export function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length >= 10 ? "+91" + digits.slice(-10) : "";
}

function fail(status, message) { const e = new Error(message); e.status = status; throw e; }

async function findByPhone(phone) {
  const { data, error } = await supabase.from("users")
    .select("id, full_name, phone, role, is_active, password_hash, otp_code, otp_expires_at")
    .eq("phone", normalizePhone(phone)).maybeSingle();
  if (error) fail(503, "Sign-in is temporarily unavailable. Please try again shortly.");
  return data;
}

const publicUser = (u) => ({ id: u.id, full_name: u.full_name, phone: u.phone, role: u.role });

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, full_name: user.full_name, phone: user.phone },
    config.jwtSecret,
    { expiresIn: user.role === "sales" ? config.appJwtExpiresIn : config.dashboardJwtExpiresIn }
  );
}

function assertScope(user, scope) {
  if (!(ROLES[scope] || ROLES.app).includes(user.role))
    fail(403, scope === "dashboard" ? "This dashboard is for the owner." : "This number is not set up as a salesperson. Ask the office to add you.");
}

// Generate a 6-digit code, store its hash, and WhatsApp it. Says "sent" either
// way so the form does not reveal which numbers have accounts.
export async function requestOtp(phone, scope = "app") {
  const user = await findByPhone(phone);
  if (!user || !user.is_active || !(ROLES[scope] || ROLES.app).includes(user.role)) return { sent: true };
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await supabase.from("users").update({
    otp_code: await bcrypt.hash(code, 10),
    otp_expires_at: new Date(Date.now() + config.otpTtlSeconds * 1000).toISOString(),
  }).eq("id", user.id);
  await sendOtp(user.phone, code);
  return { sent: true };
}

export async function verifyOtp(phone, code, scope = "app") {
  const user = await findByPhone(phone);
  if (!user || !user.is_active || !user.otp_code || new Date(user.otp_expires_at).getTime() < Date.now()
    || !(await bcrypt.compare(String(code), user.otp_code))) fail(401, "Invalid or expired code");
  assertScope(user, scope);
  await supabase.from("users").update({ otp_code: null, otp_expires_at: null }).eq("id", user.id);
  return { token: signToken(user), user: publicUser(user) };
}

export async function loginPassword(phone, password) {
  const user = await findByPhone(phone);
  if (!user || !user.is_active || !user.password_hash || !(await bcrypt.compare(String(password), user.password_hash)))
    fail(401, "Invalid credentials");
  assertScope(user, "dashboard");
  return { token: signToken(user), user: publicUser(user) };
}

/* ------------------------------- middleware ------------------------------- */

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });
  try { req.user = jwt.verify(token, config.jwtSecret); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: "Insufficient role" });

/* A long-lived token cannot be taken back, so check the account is still on —
   at most once a minute per user. A switched-off salesperson is signed out. */
const activeCache = new Map();
export async function requireActive(req, res, next) {
  const id = req.user?.id;
  const hit = activeCache.get(id);
  if (hit && Date.now() - hit.at < 60_000)
    return hit.ok ? next() : res.status(401).json({ error: "This account is no longer active" });
  const { data, error } = await supabase.from("users").select("is_active").eq("id", id).maybeSingle();
  if (error) return next(); // a database blip should not sign everyone out
  const ok = !!data && data.is_active !== false;
  activeCache.set(id, { ok, at: Date.now() });
  return ok ? next() : res.status(401).json({ error: "This account is no longer active" });
}

export async function me(req) {
  const { data } = await supabase.from("users").select("id, full_name, phone, role").eq("id", req.user.id).maybeSingle();
  // Renew the app's token once it is a day old, so a salesperson who works never sees the login again.
  const renew = req.user.role === "sales" && Date.now() / 1000 - (req.user.iat || 0) > 86400;
  return { user: data, ...(renew && data ? { token: signToken({ ...data, role: req.user.role }) } : {}) };
}
