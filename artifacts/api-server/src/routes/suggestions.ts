import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/suggestions", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`SELECT id, client_name as "clientName", telegram, comment, status, created_at as "createdAt" FROM suggestions ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /suggestions error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/suggestions/:id/status", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["new", "reviewed", "approved", "rejected"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    const row = await queryOne(
      `UPDATE suggestions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, client_name as "clientName", telegram, comment, status, created_at as "createdAt"`,
      [status, id]
    );
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "PATCH /suggestions/:id/status error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
