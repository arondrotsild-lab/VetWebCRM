import { Router, type IRouter } from "express";
import { query } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getTier(completedOrders: number): { tier: string; commission: number } {
  if (completedOrders >= 150) return { tier: "Алмаз", commission: 70 };
  if (completedOrders >= 100) return { tier: "Платина", commission: 65 };
  if (completedOrders >= 65) return { tier: "Золото", commission: 60 };
  if (completedOrders >= 30) return { tier: "Серебро", commission: 55 };
  return { tier: "Бронза", commission: 50 };
}

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  try {
    const [orderStats] = await query(`
      SELECT
        COUNT(*)::int as total_orders,
        COUNT(*) FILTER (WHERE status IN ('pending','confirmed','in_progress'))::int as active_orders,
        COUNT(*) FILTER (WHERE status = 'completed')::int as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price::numeric ELSE 0 END), 0)::float as total_revenue,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::int as orders_today,
        COALESCE(SUM(CASE WHEN status = 'completed' AND DATE(created_at) = CURRENT_DATE THEN total_price::numeric ELSE 0 END), 0)::float as revenue_today
      FROM orders
    `);
    const [vetStats] = await query(`
      SELECT
        COUNT(*)::int as total_vets,
        COUNT(*) FILTER (WHERE is_available = true)::int as active_vets,
        COUNT(*) FILTER (WHERE is_verified = true)::int as verified_vets,
        COALESCE(AVG(rating::numeric), 5.0)::float as avg_rating
      FROM vets
    `);
    const [clientStats] = await query(`SELECT COUNT(*)::int as total_clients FROM users WHERE role = 'client'`);
    const [petStats] = await query(`SELECT COUNT(*)::int as total_pets FROM pets`);

    const s = orderStats ?? {};
    const v = vetStats ?? {};
    const c = clientStats ?? {};
    const p = petStats ?? {};

    const totalRevenue = Number(s.total_revenue ?? 0);
    const platformRevenue = totalRevenue * 0.42;

    res.json({
      totalOrders: Number(s.total_orders ?? 0),
      activeOrders: Number(s.active_orders ?? 0),
      completedOrders: Number(s.completed_orders ?? 0),
      cancelledOrders: Number(s.cancelled_orders ?? 0),
      totalRevenue,
      platformRevenue,
      totalVets: Number(v.total_vets ?? 0),
      activeVets: Number(v.active_vets ?? 0),
      verifiedVets: Number(v.verified_vets ?? 0),
      totalClients: Number(c.total_clients ?? 0),
      totalPets: Number(p.total_pets ?? 0),
      avgRating: Number(v.avg_rating ?? 5.0),
      ordersToday: Number(s.orders_today ?? 0),
      revenueToday: Number(s.revenue_today ?? 0),
    });
  } catch (err) {
    logger.error({ err }, "dashboard/stats error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/dashboard/orders-by-status", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`SELECT status, COUNT(*)::int as count FROM orders GROUP BY status ORDER BY count DESC`);
    res.json(rows.map((r) => ({ status: r.status, count: Number(r.count) })));
  } catch (err) {
    logger.error({ err }, "dashboard/orders-by-status error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/dashboard/revenue-chart", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT
        DATE(created_at)::text as date,
        COALESCE(SUM(CASE WHEN status='completed' THEN total_price::numeric ELSE 0 END), 0)::float as revenue,
        COUNT(*)::int as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);
    res.json(rows.map((r) => ({ date: r.date, revenue: Number(r.revenue), orders: Number(r.orders) })));
  } catch (err) {
    logger.error({ err }, "dashboard/revenue-chart error");
    res.status(500).json({ error: "Internal error" });
  }
});

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

router.get("/dashboard/recent-orders", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`${ORDER_JOIN} ORDER BY o.created_at DESC LIMIT 10`);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "dashboard/recent-orders error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/dashboard/top-vets", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT v.id, u.name, v.total_completed_orders as "completedOrders", v.rating, v.photo_url as "photoUrl"
      FROM vets v JOIN users u ON v.user_id = u.id
      ORDER BY v.total_completed_orders DESC LIMIT 5
    `);
    res.json(rows.map((r) => ({
      ...r,
      completedOrders: Number(r.completedOrders ?? 0),
      rating: String(r.rating ?? "5.00"),
      ...getTier(Number(r.completedOrders ?? 0)),
    })));
  } catch (err) {
    logger.error({ err }, "dashboard/top-vets error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
