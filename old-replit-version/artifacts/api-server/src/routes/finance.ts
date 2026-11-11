import { Router, type IRouter } from "express";
import { query } from "../lib/db-exec";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getTier(n: number): { tier: string; commission: number } {
  if (n >= 150) return { tier: "Алмаз",   commission: 70 };
  if (n >= 100) return { tier: "Платина", commission: 65 };
  if (n >= 65)  return { tier: "Золото",  commission: 60 };
  if (n >= 30)  return { tier: "Серебро", commission: 55 };
  return           { tier: "Бронза",  commission: 50 };
}

router.get("/finance/summary", async (_req, res): Promise<void> => {
  try {
    const [s] = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status='completed' THEN total_price::numeric ELSE 0 END),0)::float          AS total_revenue,
        COUNT(CASE WHEN status='completed' THEN 1 END)::int                                                 AS completed_count,
        COALESCE(AVG(CASE WHEN status='completed' THEN total_price::numeric END),0)::float                  AS avg_order,
        COALESCE(SUM(CASE WHEN status='completed'
          AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW())
          THEN total_price::numeric ELSE 0 END),0)::float                                                   AS this_month,
        COALESCE(SUM(CASE WHEN status='completed'
          AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW()-INTERVAL '1 month')
          THEN total_price::numeric ELSE 0 END),0)::float                                                   AS last_month,
        COUNT(DISTINCT CASE WHEN status='completed'
          AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW())
          THEN client_id END)::int                                                                           AS clients_this_month,
        COUNT(*)::int                                                                                        AS total_orders
      FROM orders
    `);

    const r            = s ?? {};
    const total        = Number(r.total_revenue     ?? 0);
    const thisMonth    = Number(r.this_month        ?? 0);
    const lastMonth    = Number(r.last_month        ?? 0);
    const growth       = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // ── Revenue split ─────────────────────────────────────────────────────
    const platformRevenue = total * 0.42;       // 42 % комиссия
    const vetEarnings     = total * 0.58;       // 58 % врачам

    // ── Expenses breakdown (month) ────────────────────────────────────────
    const expStaff    = thisMonth * 0.08;   // Зарплата сотрудников
    const expMarketing= thisMonth * 0.05;   // Маркетинг и реклама
    const expIT       = thisMonth * 0.03;   // IT-инфраструктура
    const expAdmin    = thisMonth * 0.015;  // Административные
    const expOther    = thisMonth * 0.005;  // Прочие
    const expTotal    = expStaff + expMarketing + expIT + expAdmin + expOther; // 18 %

    // ── Same for last month ───────────────────────────────────────────────
    const expLastMonth = lastMonth * 0.18;

    // ── Net profit ────────────────────────────────────────────────────────
    const netProfitThisMonth  = thisMonth  * 0.42 - expTotal;
    const netProfitLastMonth  = lastMonth  * 0.42 - expLastMonth;
    const netProfitGrowth     = netProfitLastMonth > 0
      ? ((netProfitThisMonth - netProfitLastMonth) / netProfitLastMonth) * 100 : 0;

    const operationalCosts = total * 0.18;
    const netProfit        = platformRevenue - operationalCosts;

    res.json({
      // totals
      totalRevenue: total,
      platformRevenue,
      vetEarnings,
      netProfit,
      operationalCosts,
      avgOrderValue: Number(r.avg_order       ?? 0),
      completedOrdersCount: Number(r.completed_count ?? 0),
      totalOrders:   Number(r.total_orders    ?? 0),
      // month
      revenueThisMonth:  thisMonth,
      revenueLastMonth:  lastMonth,
      growthPercent:     Number(growth.toFixed(1)),
      clientsThisMonth:  Number(r.clients_this_month ?? 0),
      netProfitThisMonth,
      netProfitLastMonth,
      netProfitGrowth: Number(netProfitGrowth.toFixed(1)),
      // expense breakdown (current month)
      expenses: {
        total:   expTotal,
        staff:   expStaff,
        marketing: expMarketing,
        it:      expIT,
        admin:   expAdmin,
        other:   expOther,
        lastMonth: expLastMonth,
      },
    });
  } catch (err) {
    logger.error({ err }, "GET /finance/summary error");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/finance/by-vet", async (_req, res): Promise<void> => {
  try {
    const rows = await query(`
      SELECT v.id as "vetId", u.name as "vetName", v.total_completed_orders as "completedOrders",
        v.monthly_salary::float AS "monthlySalary",
        COALESCE(SUM(CASE WHEN o.status='completed' THEN o.total_price::numeric ELSE 0 END),0)::float AS "grossEarnings",
        COALESCE(SUM(CASE WHEN o.status='completed'
          AND DATE_TRUNC('month',o.created_at)=DATE_TRUNC('month',NOW())
          THEN o.total_price::numeric ELSE 0 END),0)::float AS "grossThisMonth",
        COUNT(CASE WHEN o.status='completed' THEN 1 END)::int AS "ordersCompleted"
      FROM vets v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN orders o ON o.vet_id = v.id
      GROUP BY v.id, u.name, v.total_completed_orders, v.monthly_salary
      ORDER BY "grossEarnings" DESC
    `);
    res.json(rows.map(r => {
      const n     = Number(r.completedOrders ?? 0);
      const { tier, commission } = getTier(n);
      const gross = Number(r.grossEarnings  ?? 0);
      const net   = gross * (commission / 100);
      return {
        ...r,
        tier, commission,
        completedOrders: n,
        ordersCompleted: Number(r.ordersCompleted ?? 0),
        grossEarnings:   gross,
        grossThisMonth:  Number(r.grossThisMonth ?? 0),
        monthlySalary:   Number(r.monthlySalary  ?? 90000),
        netEarnings:     net,
        platformFee:     gross - net,
      };
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
        COUNT(o.id)::int                                                                   AS "ordersCount",
        COALESCE(SUM(CASE WHEN o.status='completed' THEN o.total_price::numeric ELSE 0 END),0)::float AS "totalRevenue",
        COALESCE(AVG(CASE WHEN o.status='completed' THEN o.total_price::numeric END),0)::float        AS "avgPrice",
        COALESCE(SUM(CASE WHEN o.status='completed'
          AND DATE_TRUNC('month',o.created_at)=DATE_TRUNC('month',NOW())
          THEN o.total_price::numeric ELSE 0 END),0)::float AS "revenueThisMonth"
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
