import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type Row = Record<string, unknown>;
function fmt(r: Row) {
  return { ...r, priceFrom: Number(r.priceFrom ?? 0), priceTo: Number(r.priceTo ?? 0), duration: r.duration ? Number(r.duration) : null, ordersCount: Number(r.ordersCount ?? 0), isActive: Boolean(r.isActive) };
}

const SVC_SELECT = `
  SELECT s.id, s.name, s.icon, s.description,
    s.price_from::float as "priceFrom", s.price_to::float as "priceTo",
    s.duration, s.is_active as "isActive",
    COUNT(o.id)::int as "ordersCount"
  FROM services s LEFT JOIN orders o ON o.service_id = s.id
`;

router.get("/services", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`${SVC_SELECT} GROUP BY s.id ORDER BY s.name`);
    res.json(rows.map(fmt));
  } catch (err) {
    logger.error({ err }, "GET /services error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/services", async (req, res): Promise<void> => {
  try {
    const { name, icon, description, priceFrom, priceTo, duration, isActive } = req.body;
    const [svc] = await query(
      `INSERT INTO services (name, icon, description, price_from, price_to, duration, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [name, icon ?? null, description ?? null, priceFrom, priceTo, duration ?? null, isActive ?? true]
    );
    const row = await queryOne(`${SVC_SELECT} WHERE s.id = $1 GROUP BY s.id`, [svc!.id]);
    res.status(201).json(fmt(row!));
  } catch (err) {
    logger.error({ err }, "POST /services error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/services/:id", async (req, res): Promise<void> => {
  try {
    const row = await queryOne(`${SVC_SELECT} WHERE s.id = $1 GROUP BY s.id`, [Number(req.params.id)]);
    if (!row) { res.status(404).json({ error: "Service not found" }); return; }
    res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "GET /services/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/services/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, icon, description, priceFrom, priceTo, duration, isActive } = req.body;
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    if (name) { sets.push(`name = $${i++}`); vals.push(name); }
    if (icon !== undefined) { sets.push(`icon = $${i++}`); vals.push(icon); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (priceFrom !== undefined) { sets.push(`price_from = $${i++}`); vals.push(priceFrom); }
    if (priceTo !== undefined) { sets.push(`price_to = $${i++}`); vals.push(priceTo); }
    if (duration !== undefined) { sets.push(`duration = $${i++}`); vals.push(duration); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) { res.status(400).json({ error: "Nothing to update" }); return; }
    sets.push(`updated_at = NOW()`); vals.push(id);
    await query(`UPDATE services SET ${sets.join(", ")} WHERE id = $${i}`, vals);
    const row = await queryOne(`${SVC_SELECT} WHERE s.id = $1 GROUP BY s.id`, [id]);
    res.json(fmt(row!));
  } catch (err) {
    logger.error({ err }, "PATCH /services/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/services/:id", async (req, res): Promise<void> => {
  try {
    await query(`DELETE FROM services WHERE id = $1`, [Number(req.params.id)]);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /services/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
