import { Router, type IRouter } from "express";
import { query } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getTier(n: number): { tier: string; commission: number } {
  if (n >= 150) return { tier: "Алмаз", commission: 70 };
  if (n >= 100) return { tier: "Платина", commission: 65 };
  if (n >= 65)  return { tier: "Золото",  commission: 60 };
  if (n >= 30)  return { tier: "Серебро", commission: 55 };
  return { tier: "Бронза", commission: 50 };
}

router.get("/finance/summary", async (_req, res): Promise<void> => {
  try {
    const [s] = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status='completed' THEN total_price::numeric ELSE 0 END),0)::float as total_revenue,
        COUNT(CASE WHEN status='completed' THEN 1 END)::int as completed_count,
        COALESCE(AVG(CASE WHEN status='completed' THEN total_price::numeric END),0)::float as avg_order,
        COALESCE(SUM(CASE WHEN status='completed' AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW()) THEN total_price::numeric ELSE 0 END),0)::float as this_month,
        COALESCE(SUM(CASE WHEN status='completed' AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW()-INTERVAL '1 month') THEN total_price::numeric ELSE 0 END),0)::float as last_month
      FROM orders
    `);
    const r = s ?? {};
    const total = Number(r.total_revenue ?? 0);
    const thisMonth = Number(r.this_month ?? 0);
    const lastMonth = Number(r.last_month ?? 0);
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const platformRevenue = total * 0.42;
    res.json({ totalRevenue: total, platformRevenue, vetEarnings: total - platformRevenue, avgOrderValue: Number(r.avg_order ?? 0), completedOrdersCount: Number(r.completed_count ?? 0), revenueThisMonth: thisMonth, revenueLastMonth: lastMonth, growthPercent: Number(growth.toFixed(1)) });
  } catch (err) {
    logger.error({ err }, "GET /finance/summary error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/finance/by-vet", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT v.id as "vetId", u.name as "vetName", v.total_completed_orders as "completedOrders",
        COALESCE(SUM(CASE WHEN o.status='completed' THEN o.total_price::numeric ELSE 0 END),0)::float as "grossEarnings"
      FROM vets v JOIN users u ON v.user_id = u.id LEFT JOIN orders o ON o.vet_id = v.id
      GROUP BY v.id, u.name, v.total_completed_orders ORDER BY "grossEarnings" DESC
    `);
    res.json(rows.map(r => {
      const n = Number(r.completedOrders ?? 0);
      const { tier, commission } = getTier(n);
      const gross = Number(r.grossEarnings ?? 0);
      const net = gross * (commission / 100);
      return { ...r, tier, commission, completedOrders: n, grossEarnings: gross, netEarnings: net, platformFee: gross - net };
    }));
  } catch (err) {
    logger.error({ err }, "GET /finance/by-vet error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/finance/by-service", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT s.id as "serviceId", s.name as "serviceName", s.icon as "serviceIcon",
        COUNT(o.id)::int as "ordersCount",
        COALESCE(SUM(CASE WHEN o.status='completed' THEN o.total_price::numeric ELSE 0 END),0)::float as "totalRevenue",
        COALESCE(AVG(CASE WHEN o.status='completed' THEN o.total_price::numeric END),0)::float as "avgPrice"
      FROM services s LEFT JOIN orders o ON o.service_id = s.id
      GROUP BY s.id ORDER BY "totalRevenue" DESC
    `);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "GET /finance/by-service error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
