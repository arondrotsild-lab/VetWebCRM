/**
 * User-provided dashboard snapshot.
 *
 * This is intentionally separate from PostgreSQL records: displaying these
 * aggregate business figures must not create or rewrite orders, clients, pets,
 * or veterinarian profiles.
 */
export const dashboardMetrics = {
  ordersToday: 250,
  activeOrders: 26,
  revenueToday: 860_000,
  totalRevenue: 3_857_600,
  activeVets: 68,
  totalVets: 110,
  totalClients: 18_933,
  totalPets: 25_600,
  revenueLast30Days: 82_670_000,
} as const;

export const formatDashboardCount = (value: number) =>
  value.toLocaleString("ru-RU");