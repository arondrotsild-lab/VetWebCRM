import { Router, type IRouter } from "express";
import { query, queryOne } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getTier(n: number): { tier: string; commission: number } {
  if (n >= 150) return { tier: "Алмаз", commission: 70 };
  if (n >= 100) return { tier: "Платина", commission: 65 };
  if (n >= 65)  return { tier: "Золото",  commission: 60 };
  if (n >= 30)  return { tier: "Серебро", commission: 55 };
  return { tier: "Бронза", commission: 50 };
}

type Row = Record<string, unknown>;
function fmt(r: Row) {
  const n = Number(r.totalCompletedOrders ?? 0);
  return { ...r, totalCompletedOrders: n, totalEarnings: Number(r.totalEarnings ?? 0), rating: String(r.rating ?? "5.00"), reviewsCount: Number(r.reviewsCount ?? 0), experienceYears: Number(r.experienceYears ?? 1), isAvailable: Boolean(r.isAvailable), isVerified: Boolean(r.isVerified), ...getTier(n) };
}

const VET_SELECT = `
  SELECT v.id, u.name, u.phone, u.email,
    v.specialization, v.experience_years as "experienceYears",
    v.rating, v.reviews_count as "reviewsCount",
    v.bio, v.photo_url as "photoUrl",
    v.is_available as "isAvailable", v.is_verified as "isVerified",
    v.total_completed_orders as "totalCompletedOrders",
    v.total_earnings::float as "totalEarnings",
    v.created_at as "createdAt"
  FROM vets v JOIN users u ON v.user_id = u.id
`;

router.get("/vets", async (req, res): Promise<void> => {
  try {
    const { search, isVerified, isAvailable, tier } = req.query as Record<string, string>;
    const conds: string[] = []; const params: unknown[] = []; let i = 1;
    if (search) { conds.push(`(u.name ILIKE $${i} OR v.specialization ILIKE $${i})`); params.push(`%${search}%`); i++; }
    if (isVerified !== undefined) { conds.push(`v.is_verified = $${i++}`); params.push(isVerified === "true"); }
    if (isAvailable !== undefined) { conds.push(`v.is_available = $${i++}`); params.push(isAvailable === "true"); }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = await query(`${VET_SELECT} ${where} ORDER BY v.total_completed_orders DESC`, params);
    let result = rows.map(fmt);
    if (tier) result = result.filter(v => v.tier === tier);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "GET /vets error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/vets", async (req, res): Promise<void> => {
  try {
    const { name, phone, email, specialization, experienceYears, bio, photoUrl, isAvailable, isVerified } = req.body;
    const [user] = await query(`INSERT INTO users (name, phone, email, role) VALUES ($1,$2,$3,'vet') RETURNING id`, [name, phone, email ?? null]);
    const [vet] = await query(
      `INSERT INTO vets (user_id, specialization, experience_years, bio, photo_url, is_available, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [user!.id, specialization, experienceYears ?? 1, bio ?? null, photoUrl ?? null, isAvailable ?? true, isVerified ?? false]
    );
    const row = await queryOne(`${VET_SELECT} WHERE v.id = $1`, [vet!.id]);
    res.status(201).json(fmt(row!));
  } catch (err) {
    logger.error({ err }, "POST /vets error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/vets/:id", async (req, res): Promise<void> => {
  try {
    const row = await queryOne(`${VET_SELECT} WHERE v.id = $1`, [Number(req.params.id)]);
    if (!row) { res.status(404).json({ error: "Vet not found" }); return; }
    res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "GET /vets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/vets/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email, specialization, experienceYears, bio, photoUrl, isAvailable, isVerified } = req.body;
    const userSets: string[] = []; const userVals: unknown[] = []; let ui = 1;
    const vetSets: string[] = []; const vetVals: unknown[] = []; let vi = 1;
    if (name) { userSets.push(`name = $${ui++}`); userVals.push(name); }
    if (phone) { userSets.push(`phone = $${ui++}`); userVals.push(phone); }
    if (email !== undefined) { userSets.push(`email = $${ui++}`); userVals.push(email); }
    if (specialization) { vetSets.push(`specialization = $${vi++}`); vetVals.push(specialization); }
    if (experienceYears !== undefined) { vetSets.push(`experience_years = $${vi++}`); vetVals.push(experienceYears); }
    if (bio !== undefined) { vetSets.push(`bio = $${vi++}`); vetVals.push(bio); }
    if (photoUrl !== undefined) { vetSets.push(`photo_url = $${vi++}`); vetVals.push(photoUrl); }
    if (isAvailable !== undefined) { vetSets.push(`is_available = $${vi++}`); vetVals.push(isAvailable); }
    if (isVerified !== undefined) { vetSets.push(`is_verified = $${vi++}`); vetVals.push(isVerified); }
    if (userSets.length) { userVals.push(id); await query(`UPDATE users SET ${userSets.join(", ")}, updated_at = NOW() WHERE id = (SELECT user_id FROM vets WHERE id = $${ui})`, userVals); }
    if (vetSets.length) { vetVals.push(id); await query(`UPDATE vets SET ${vetSets.join(", ")}, updated_at = NOW() WHERE id = $${vi}`, vetVals); }
    const row = await queryOne(`${VET_SELECT} WHERE v.id = $1`, [id]);
    res.json(fmt(row!));
  } catch (err) {
    logger.error({ err }, "PATCH /vets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/vets/:id", async (req, res): Promise<void> => {
  try {
    await query(`DELETE FROM vets WHERE id = $1`, [Number(req.params.id)]);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /vets/:id error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/vets/:id/orders", async (req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT o.id, o.client_id as "clientId", o.vet_id as "vetId", o.pet_id as "petId",
        o.service_id as "serviceId", o.address, o.scheduled_at as "scheduledAt",
        o.status, o.notes, o.total_price::float as "totalPrice",
        o.created_at as "createdAt", o.updated_at as "updatedAt",
        u.name as "clientName", u.phone as "clientPhone",
        p.name as "petName", p.species as "petSpecies", p.breed as "petBreed",
        s.name as "serviceName", s.icon as "serviceIcon"
      FROM orders o JOIN users u ON o.client_id = u.id
      LEFT JOIN pets p ON o.pet_id = p.id LEFT JOIN services s ON o.service_id = s.id
      WHERE o.vet_id = $1 ORDER BY o.created_at DESC
    `, [Number(req.params.id)]);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /vets/:id/orders error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/vets/:id/verify", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await query(`UPDATE vets SET is_verified = $1, updated_at = NOW() WHERE id = $2`, [req.body.isVerified, id]);
    const row = await queryOne(`${VET_SELECT} WHERE v.id = $1`, [id]);
    res.json(fmt(row!));
  } catch (err) {
    logger.error({ err }, "PATCH /vets/:id/verify error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
