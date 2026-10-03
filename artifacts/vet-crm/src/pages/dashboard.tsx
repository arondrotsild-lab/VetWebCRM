import { 
  useGetDashboardRecentOrders, 
  useGetDashboardTopVets 
} from "@workspace/api-client-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getTierBadge, cn } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowUpRight, TrendingUp, Users, ClipboardList, ActivitySquare, Loader2 } from "lucide-react";
import { dashboardMetrics, formatDashboardCount } from "@/lib/dashboard-metrics";

const activeOrdersShare = dashboardMetrics.activeOrders / dashboardMetrics.ordersToday;
const remainingOrdersToday = dashboardMetrics.ordersToday - dashboardMetrics.activeOrders;

export default function DashboardPage() {
  const { data: recentOrders, isLoading: ordersLoading } = useGetDashboardRecentOrders();
  const { data: topVets, isLoading: vetsLoading } = useGetDashboardTopVets();

  if (ordersLoading || vetsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ключевые показатели работы сервиса</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ClipboardList className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Заказы сегодня</div>
          <div className="text-3xl font-bold mt-2 font-mono">{formatDashboardCount(dashboardMetrics.ordersToday)}</div>
          <div className="text-xs mt-2 text-green-400 flex items-center gap-1">
            <ArrowUpRight size={14} /> Активно: {formatDashboardCount(dashboardMetrics.activeOrders)}
          </div>
        </div>
        
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Выручка сегодня</div>
          <div className="text-3xl font-bold mt-2 font-mono text-green-400">{formatCurrency(dashboardMetrics.revenueToday)}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Всего: {formatCurrency(dashboardMetrics.totalRevenue)}
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ActivitySquare className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Врачи онлайн</div>
          <div className="text-3xl font-bold mt-2 font-mono">{formatDashboardCount(dashboardMetrics.activeVets)}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Из {formatDashboardCount(dashboardMetrics.totalVets)} зарегистрированных
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Всего клиентов</div>
          <div className="text-3xl font-bold mt-2 font-mono">{formatDashboardCount(dashboardMetrics.totalClients)}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Питомцев: {formatDashboardCount(dashboardMetrics.totalPets)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thirty-day revenue summary */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Выручка за 30 дней</h2>
              <p className="text-xs text-muted-foreground mt-1">Сводный показатель за весь период</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center rounded-xl bg-green-500/[0.04] border border-green-500/10 px-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Общая выручка · 30 дней</div>
            <div className="text-4xl sm:text-5xl xl:text-6xl font-bold font-mono text-green-400 mt-4">
              {formatCurrency(dashboardMetrics.revenueLast30Days)}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              В среднем за день: {formatCurrency(Math.round(dashboardMetrics.revenueLast30Days / 30))}
            </div>
            <div className="mt-7 h-1 w-2/3 max-w-sm rounded-full bg-gradient-to-r from-green-950 via-green-500 to-emerald-300" aria-hidden="true" />
          </div>
        </div>

        {/* Today's active orders */}
        <div className="glass-card p-5 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Активность заказов сегодня</h2>
          <p className="text-sm text-muted-foreground">Активные заказы относительно общего числа</p>
          <div className="flex-1 flex flex-col justify-center py-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-mono text-green-400">{formatDashboardCount(dashboardMetrics.activeOrders)}</span>
              <span className="text-muted-foreground">из {formatDashboardCount(dashboardMetrics.ordersToday)} заказов</span>
            </div>
            <div
              className="w-full h-3 rounded-full bg-white/10 mt-6 overflow-hidden"
              role="progressbar"
              aria-label="Доля активных заказов сегодня"
              aria-valuenow={dashboardMetrics.activeOrders}
              aria-valuemin={0}
              aria-valuemax={dashboardMetrics.ordersToday}
            >
              <div className="h-full rounded-full bg-green-400" style={{ width: `${activeOrdersShare * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-3 text-muted-foreground">
              <span>Активно {formatDashboardCount(dashboardMetrics.activeOrders)} ({(activeOrdersShare * 100).toFixed(1)}%)</span>
              <span>Остальные {formatDashboardCount(remainingOrdersToday)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Недавние заказы</h2>
              <p className="text-xs text-muted-foreground mt-1">Последние записи в CRM</p>
            </div>
            <Link href="/orders" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              Все заказы &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground">
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Клиент & Питомец</th>
                  <th className="p-4 font-medium">Услуга</th>
                  <th className="p-4 font-medium">Статус</th>
                  <th className="p-4 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).map((order) => (
                  <tr key={order.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.03)] transition-colors group">
                    <td className="p-4 text-sm font-mono text-green-400/80">
                      <Link href={`/orders/${order.id}`}>#{order.id}</Link>
                    </td>
                    <td className="p-4 text-sm">
                      <div>{order.clientName}</div>
                      <div className="text-xs text-muted-foreground">{order.petName} ({order.petSpecies})</div>
                    </td>
                    <td className="p-4 text-sm">{order.serviceName}</td>
                    <td className="p-4">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono">{formatCurrency(order.totalPrice)}</td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      Нет недавних заказов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vets */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Топ Врачей</h2>
              <p className="text-xs text-muted-foreground mt-1">Рейтинг по фактическим заказам</p>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            {(topVets || []).map((vet, idx) => (
              <Link key={vet.id} href={`/vets/${vet.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-[rgba(74,222,128,0.05)] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[rgba(10,26,10,1)] border border-green-500/20 flex items-center justify-center font-bold text-green-400 relative overflow-hidden">
                  {vet.photoUrl ? (
                    <img src={vet.photoUrl} alt={vet.name} className="w-full h-full object-cover" />
                  ) : (
                    vet.name.substring(0, 2).toUpperCase()
                  )}
                  {idx === 0 && <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-pulse" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold group-hover:text-green-400 transition-colors">{vet.name}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <span>★ {vet.rating}</span>
                    <span>•</span>
                    <span>{vet.completedOrders} заказов</span>
                  </div>
                </div>
                <div>
                  <span className={cn("px-2 py-1 text-[10px] uppercase font-bold rounded border", getTierBadge(vet.tier))}>
                    {vet.tier}
                  </span>
                </div>
              </Link>
            ))}
            {(!topVets || topVets.length === 0) && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Нет данных
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
