// Sales App API — all routes scoped to the logged-in salesperson.
import { Router } from "express";
import { requireAuth, requireActive, requireRole } from "../lib/auth.js";
import * as sales from "../services/sales.js";

const router = Router();
router.use(requireAuth, requireRole("sales"), requireActive);

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); } catch (e) { next(e); }
};

router.get("/leads", wrap(async (req) => ({ leads: await sales.listMyLeads(req.user.id) })));
router.post("/leads", wrap(async (req) => ({ lead: await sales.createLead(req.user.id, req.body) })));
router.get("/leads/:id", wrap(async (req) => ({ lead: await sales.getMyLead(req.user.id, req.params.id) })));
router.patch("/leads/:id", wrap(async (req) => ({ lead: await sales.updateLead(req.user.id, req.params.id, req.body) })));
router.post("/leads/:id/quotations", wrap(async (req) => ({ quotation: await sales.createQuotation(req.user.id, req.params.id, req.body) })));
router.post("/leads/:id/orders", wrap(async (req) => ({ order: await sales.createOrder(req.user.id, req.params.id, req.body) })));
router.get("/orders", wrap(async (req) => ({ orders: await sales.listMyOrders(req.user.id) })));
router.patch("/orders/:id", wrap(async (req) => ({ order: await sales.updateOrder(req.user.id, req.params.id, req.body) })));
router.get("/summary", wrap(async (req) => ({ summary: await sales.mySummary(req.user.id) })));

export default router;
