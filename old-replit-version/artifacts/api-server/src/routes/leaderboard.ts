import { Router, type IRouter } from "express";
import { query } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getTier(n: number): string {
  if (n >= 150) return "Алмаз";
  if (n >= 100) return "Платина";
  if (n >= 65)  return "Золото";
  if (n >= 30)  return "Серебро";
  return "Бронза";
}

router.get("/leaderboard", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT ROW_NUMBER() OVER (ORDER BY v.total_completed_orders DESC, v.rating DESC)::int as rank,
        v.id as "vetId", u.name, v.specialization,
        v.total_completed_orders as "completedOrders",
        v.rating, v.reviews_count as "reviewsCount",
        v.total_earnings::float as "totalEarnings", v.photo_url as "photoUrl"
      FROM vets v JOIN users u ON v.user_id = u.id
      ORDER BY v.total_completed_orders DESC, v.rating DESC
    `);
    res.json(rows.map(r => ({
      ...r,
      rank: Number(r.rank),
      completedOrders: Number(r.completedOrders ?? 0),
      rating: String(r.rating ?? "5.00"),
      reviewsCount: Number(r.reviewsCount ?? 0),
      totalEarnings: Number(r.totalEarnings ?? 0),
      tier: getTier(Number(r.completedOrders ?? 0)),
    })));
  } catch (err) {
    logger.error({ err }, "GET /leaderboard error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
