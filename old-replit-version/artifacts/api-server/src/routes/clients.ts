import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CLIENT_SELECT = `
  SELECT u.id, u.name, u.phone, u.email,
    COUNT(o.id)::int as "ordersCount",
    COALESCE(SUM(CASE WHEN o.status='completed' THEN o.total_price::numeric ELSE 0 END), 0)::float as "totalSpent",
    u.created_at as "createdAt"
  FROM users u LEFT JOIN orders o ON o.client_id = u.id
  WHERE u.role = 'client'
`;

router.get("/clients", async (req, res): Promise<void> => {
  try {
    const { search } = req.query as Record<string, string>;
    const params: unknown[] = [];
    const extra = search ? ` AND (u.name ILIKE $1 OR u.phone ILIKE $1 OR u.email ILIKE $1)` : "";
    if (search) params.push(`%${search}%`);
    const rows = await query(`${CLIENT_SELECT}${extra} GROUP BY u.id ORDER BY u.created_at DESC`, params);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /clients error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/clients", async (req, res): Promise<void> => {
  try {
    const { name, phone, email } = req.body;
    const [u] = await query(`INSERT INTO users (name, phone, email, role) VALUES ($1,$2,$3,'client') RETURNING *`, [name, phone, email ?? null]);
    res.status(201).json({ id: u!.id, name: u!.name, phone: u!.phone, email: u!.email, ordersCount: 0, totalSpent: 0, createdAt: u!.created_at });
  } catch (err) {
    logger.error({ err }, "POST /clients error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/clients/:id", async (req, res): Promise<void> => {
  try {
    const row = await queryOne(`${CLIENT_SELECT} AND u.id = $1 GROUP BY u.id`, [Number(req.params.id)]);
    if (!row) { res.status(404).json({ error: "Client not found" }); return; }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "GET /clients/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/clients/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email } = req.body;
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    if (name) { sets.push(`name = $${i++}`); vals.push(name); }
    if (phone) { sets.push(`phone = $${i++}`); vals.push(phone); }
    if (email !== undefined) { sets.push(`email = $${i++}`); vals.push(email); }
    if (!sets.length) { res.status(400).json({ error: "Nothing to update" }); return; }
    sets.push(`updated_at = NOW()`); vals.push(id);
    await query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${i}`, vals);
    const row = await queryOne(`${CLIENT_SELECT} AND u.id = $1 GROUP BY u.id`, [id]);
    res.json(row);
  } catch (err) {
    logger.error({ err }, "PATCH /clients/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/clients/:id", async (req, res): Promise<void> => {
  try {
    await query(`DELETE FROM users WHERE id = $1 AND role = 'client'`, [Number(req.params.id)]);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /clients/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/clients/:id/orders", async (req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT o.id, o.client_id as "clientId", o.vet_id as "vetId", o.pet_id as "petId",
        o.service_id as "serviceId", o.address, o.scheduled_at as "scheduledAt",
        o.status, o.notes, o.total_price::float as "totalPrice",
        o.created_at as "createdAt", o.updated_at as "updatedAt",
        vu.name as "vetName", p.name as "petName", p.species as "petSpecies",
        s.name as "serviceName", s.icon as "serviceIcon"
      FROM orders o LEFT JOIN vets v ON o.vet_id = v.id LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN pets p ON o.pet_id = p.id LEFT JOIN services s ON o.service_id = s.id
      WHERE o.client_id = $1 ORDER BY o.created_at DESC
    `, [Number(req.params.id)]);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /clients/:id/orders error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/clients/:id/pets", async (req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT p.id, p.name, p.species, p.breed, p.age, p.weight::float, p.color, p.notes,
        p.client_id as "clientId", u.name as "clientName", p.created_at as "createdAt"
      FROM pets p JOIN users u ON p.client_id = u.id WHERE p.client_id = $1 ORDER BY p.name
    `, [Number(req.params.id)]);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /clients/:id/pets error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
