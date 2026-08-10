import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ORDER_JOIN = `
  SELECT
    o.id, o.client_id as "clientId", o.vet_id as "vetId", o.pet_id as "petId",
    o.service_id as "serviceId", o.address, o.scheduled_at as "scheduledAt",
    o.status, o.notes, o.total_price::float as "totalPrice",
    o.created_at as "createdAt", o.updated_at as "updatedAt",
    u.name as "clientName", u.phone as "clientPhone",
    vu.name as "vetName",
    p.name as "petName", p.species as "petSpecies", p.breed as "petBreed",
    s.name as "serviceName", s.icon as "serviceIcon",
    s.price_from::float as "priceFrom", s.price_to::float as "priceTo"
  FROM orders o
  JOIN users u ON o.client_id = u.id
  LEFT JOIN vets v ON o.vet_id = v.id
  LEFT JOIN users vu ON v.user_id = vu.id
  LEFT JOIN pets p ON o.pet_id = p.id
  LEFT JOIN services s ON o.service_id = s.id
`;

router.get("/orders", async (req, res): Promise<void> => {
  try {
    const { status, search, vetId, page = "1", limit = "20" } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (status) { conditions.push(`o.status = $${i++}`); params.push(status); }
    if (vetId) { conditions.push(`o.vet_id = $${i++}`); params.push(Number(vetId)); }
    if (search) { conditions.push(`(u.name ILIKE $${i} OR s.name ILIKE $${i} OR o.address ILIKE $${i})`); params.push(`%${search}%`); i++; }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [countRow] = await query(
      `SELECT COUNT(*)::int as total FROM orders o JOIN users u ON o.client_id = u.id LEFT JOIN services s ON o.service_id = s.id ${where}`,
      params
    );
    const total = Number(countRow?.total ?? 0);

    params.push(Number(limit), offset);
    const rows = await query(
      `${ORDER_JOIN} ${where} ORDER BY o.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      params
    );
    res.json({ orders: rows, total });
  } catch (err) {
    logger.error({ err }, "GET /orders error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/orders", async (req, res): Promise<void> => {
  try {
    const { clientId, vetId, petId, serviceId, address, scheduledAt, notes, totalPrice } = req.body;
    const [order] = await query(
      `INSERT INTO orders (client_id, vet_id, pet_id, service_id, address, scheduled_at, notes, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [clientId, vetId ?? null, petId ?? null, serviceId, address, scheduledAt ?? null, notes ?? null, totalPrice]
    );
    res.status(201).json(order);
  } catch (err) {
    logger.error({ err }, "POST /orders error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const order = await queryOne(`${ORDER_JOIN} WHERE o.id = $1`, [id]);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch (err) {
    logger.error({ err }, "GET /orders/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { vetId, petId, address, scheduledAt, notes, totalPrice } = req.body;
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (vetId !== undefined) { sets.push(`vet_id = $${i++}`); vals.push(vetId); }
    if (petId !== undefined) { sets.push(`pet_id = $${i++}`); vals.push(petId); }
    if (address !== undefined) { sets.push(`address = $${i++}`); vals.push(address); }
    if (scheduledAt !== undefined) { sets.push(`scheduled_at = $${i++}`); vals.push(scheduledAt); }
    if (notes !== undefined) { sets.push(`notes = $${i++}`); vals.push(notes); }
    if (totalPrice !== undefined) { sets.push(`total_price = $${i++}`); vals.push(totalPrice); }
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const [order] = await query(`UPDATE orders SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch (err) {
    logger.error({ err }, "PATCH /orders/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/orders/:id", async (req, res): Promise<void> => {
  try {
    await query(`DELETE FROM orders WHERE id = $1`, [Number(req.params.id)]);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /orders/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const [order] = await query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, id]);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    if (status === "completed" && order.vet_id) {
      await query(
        `UPDATE vets SET total_completed_orders = total_completed_orders + 1, total_earnings = total_earnings + $1, updated_at = NOW() WHERE id = $2`,
        [Number(order.total_price ?? 0), order.vet_id]
      );
    }
    res.json(order);
  } catch (err) {
    logger.error({ err }, "PATCH /orders/:id/status error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/orders/:id/assign", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { vetId } = req.body;
    const [order] = await query(
      `UPDATE orders SET vet_id = $1, status = 'confirmed', updated_at = NOW() WHERE id = $2 RETURNING *`,
      [vetId, id]
    );
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch (err) {
    logger.error({ err }, "PATCH /orders/:id/assign error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
