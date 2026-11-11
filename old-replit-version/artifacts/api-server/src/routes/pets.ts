import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PET_SELECT = `
  SELECT p.id, p.name, p.species, p.breed, p.age, p.weight::float, p.color, p.notes,
    p.client_id as "clientId", u.name as "clientName", p.created_at as "createdAt"
  FROM pets p JOIN users u ON p.client_id = u.id
`;

router.get("/pets", async (req, res): Promise<void> => {
  try {
    const { search, species, clientId } = req.query as Record<string, string>;
    const conds: string[] = []; const params: unknown[] = []; let i = 1;
    if (search) { conds.push(`(p.name ILIKE $${i} OR u.name ILIKE $${i})`); params.push(`%${search}%`); i++; }
    if (species) { conds.push(`p.species = $${i++}`); params.push(species); }
    if (clientId) { conds.push(`p.client_id = $${i++}`); params.push(Number(clientId)); }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = await query(`${PET_SELECT} ${where} ORDER BY p.name`, params);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /pets error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/pets", async (req, res): Promise<void> => {
  try {
    const { name, species, breed, age, weight, color, notes, clientId } = req.body;
    const [pet] = await query(
      `INSERT INTO pets (client_id, name, species, breed, age, weight, color, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [clientId, name, species, breed ?? null, age ?? null, weight ?? null, color ?? null, notes ?? null]
    );
    const row = await queryOne(`${PET_SELECT} WHERE p.id = $1`, [pet!.id]);
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "POST /pets error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/pets/:id", async (req, res): Promise<void> => {
  try {
    const row = await queryOne(`${PET_SELECT} WHERE p.id = $1`, [Number(req.params.id)]);
    if (!row) { res.status(404).json({ error: "Pet not found" }); return; }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "GET /pets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/pets/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, species, breed, age, weight, color, notes } = req.body;
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    if (name) { sets.push(`name = $${i++}`); vals.push(name); }
    if (species) { sets.push(`species = $${i++}`); vals.push(species); }
    if (breed !== undefined) { sets.push(`breed = $${i++}`); vals.push(breed); }
    if (age !== undefined) { sets.push(`age = $${i++}`); vals.push(age); }
    if (weight !== undefined) { sets.push(`weight = $${i++}`); vals.push(weight); }
    if (color !== undefined) { sets.push(`color = $${i++}`); vals.push(color); }
    if (notes !== undefined) { sets.push(`notes = $${i++}`); vals.push(notes); }
    if (!sets.length) { res.status(400).json({ error: "Nothing to update" }); return; }
    vals.push(id);
    await query(`UPDATE pets SET ${sets.join(", ")} WHERE id = $${i}`, vals);
    const row = await queryOne(`${PET_SELECT} WHERE p.id = $1`, [id]);
    res.json(row);
  } catch (err) {
    logger.error({ err }, "PATCH /pets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/pets/:id", async (req, res): Promise<void> => {
  try {
    await query(`DELETE FROM pets WHERE id = $1`, [Number(req.params.id)]);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /pets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/pets/:id/medical-records", async (req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT mr.id, mr.pet_id as "petId", mr.order_id as "orderId", mr.vet_id as "vetId",
        u.name as "vetName", mr.diagnosis, mr.treatment, mr.prescription,
        mr.next_visit as "nextVisit", mr.notes, mr.created_at as "createdAt"
      FROM medical_records mr
      LEFT JOIN vets v ON mr.vet_id = v.id LEFT JOIN users u ON v.user_id = u.id
      WHERE mr.pet_id = $1 ORDER BY mr.created_at DESC
    `, [Number(req.params.id)]);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /pets/:id/medical-records error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/pets/:id/medical-records", async (req, res): Promise<void> => {
  try {
    const petId = Number(req.params.id);
    const { orderId, vetId, diagnosis, treatment, prescription, nextVisit, notes } = req.body;
    const [record] = await query(
      `INSERT INTO medical_records (pet_id, order_id, vet_id, diagnosis, treatment, prescription, next_visit, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [petId, orderId ?? null, vetId ?? null, diagnosis, treatment ?? null, prescription ?? null, nextVisit ?? null, notes ?? null]
    );
    res.status(201).json(record);
  } catch (err) {
    logger.error({ err }, "POST /pets/:id/medical-records error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
