// Oasis Sales backend: the Sales app (/api/sales) and the owner's sales dashboard
// (/api/sales-admin), on the same Supabase database as the service side.
import express from "express";
import cors from "cors";
import { config, checkConfig } from "./config.js";
import * as auth from "./lib/auth.js";
import salesRoutes from "./routes/sales.js";
import salesAdminRoutes from "./routes/salesAdmin.js";

checkConfig();
const app = express();
app.use(cors(config.corsOrigins.length ? { origin: config.corsOrigins } : {}));
app.use(express.json({ limit: "1mb" }));

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); } catch (e) { next(e); }
};

app.get("/health", (req, res) => res.json({ ok: true, service: "oasis-sales", commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || null }));

// `scope` is "app" (salespeople) or "dashboard" (owner).
app.post("/api/auth/otp/request", wrap((req) => auth.requestOtp(req.body?.phone, req.body?.scope)));
app.post("/api/auth/otp/verify", wrap((req) => auth.verifyOtp(req.body?.phone, req.body?.code, req.body?.scope)));
app.post("/api/auth/login", wrap((req) => auth.loginPassword(req.body?.phone, req.body?.password)));
app.get("/api/auth/me", auth.requireAuth, wrap(auth.me));

app.use("/api/sales", salesRoutes);
app.use("/api/sales-admin", salesAdminRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && !err.status ? "Something went wrong" : err.message });
});

app.listen(config.port, () => console.log(`Oasis Sales backend on :${config.port}`));
