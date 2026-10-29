// Sales dashboard API — the owner's view of the sales team.
import { Router } from "express";
import { requireAuth, requireRole } from "../lib/auth.js";
import * as sales from "../services/sales.js";

const router = Router();
router.use(requireAuth, requireRole("owner"));

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); } catch (e) { next(e); }
};

router.get("/overview", wrap(async () => ({ overview: await sales.adminOverview() })));
router.get("/team", wrap(async () => ({ team: await sales.listTeam() })));
router.post("/team", wrap(async (req) => ({ salesperson: await sales.addSalesperson(req.body) })));
router.patch("/team/:id", wrap(async (req) => ({ salesperson: await sales.setSalespersonActive(req.params.id, req.body?.is_active) })));
router.get("/leads", wrap(async () => ({ leads: await sales.adminLeads() })));
router.get("/leads/:id", wrap(async (req) => ({ lead: await sales.adminLead(req.params.id) })));
router.get("/orders", wrap(async () => ({ orders: await sales.adminOrders() })));
router.patch("/orders/:id", wrap(async (req) => ({ order: await sales.adminUpdateOrder(req.params.id, req.body) })));

export default router;
