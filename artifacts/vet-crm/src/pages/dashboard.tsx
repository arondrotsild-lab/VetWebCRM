import { 
  useGetDashboardStats, 
  useGetDashboardRevenueChart, 
  useGetDashboardOrdersByStatus, 
  useGetDashboardRecentOrders, 
  useGetDashboardTopVets 
} from "@workspace/api-client-react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getTierBadge, cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Link } from "wouter";
import { ArrowUpRight, TrendingUp, Users, ClipboardList, ActivitySquare, Loader2 } from "lucide-react";

const PIE_COLORS = ['#3b82f6', '#22c55e', '#10b981', '#f59e0b', '#6b7280'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetDashboardRevenueChart();
  const { data: statusData, isLoading: statusLoading } = useGetDashboardOrdersByStatus();
  const { data: recentOrders, isLoading: ordersLoading } = useGetDashboardRecentOrders();
  const { data: topVets, isLoading: vetsLoading } = useGetDashboardTopVets();

  if (statsLoading || chartLoading || statusLoading || ordersLoading || vetsLoading) {
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
          <p className="text-muted-foreground mt-1 text-sm">Главные метрики за сегодня</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ClipboardList className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Заказы сегодня</div>
          <div className="text-3xl font-bold mt-2 font-mono">{stats?.ordersToday || 0}</div>
          <div className="text-xs mt-2 text-green-400 flex items-center gap-1">
            <ArrowUpRight size={14} /> Активно: {stats?.activeOrders || 0}
          </div>
        </div>
        
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Выручка сегодня</div>
          <div className="text-3xl font-bold mt-2 font-mono text-green-400">{formatCurrency(stats?.revenueToday || 0)}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Всего: {formatCurrency(stats?.totalRevenue || 0)}
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ActivitySquare className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Врачи онлайн</div>
          <div className="text-3xl font-bold mt-2 font-mono">{stats?.activeVets || 0}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Из {stats?.totalVets || 0} зарегистрированных
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-green-400" />
          </div>
          <div className="text-muted-foreground text-sm font-medium">Всего клиентов</div>
          <div className="text-3xl font-bold mt-2 font-mono">{stats?.totalClients || 0}</div>
          <div className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
            Питомцев: {stats?.totalPets || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Выручка за 30 дней</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.split('-').slice(1).join('.')} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(74,222,128,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(10,26,10,0.9)', borderColor: 'rgba(74,222,128,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#4ade80' }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#fff', marginBottom: '4px' }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut */}
        <div className="glass-card p-5 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Статусы заказов</h2>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="status"
                  stroke="none"
                >
                  {(statusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,26,10,0.9)', borderColor: 'rgba(74,222,128,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number, name: string) => [val, getStatusLabel(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold font-mono">{stats?.activeOrders || 0}</span>
              <span className="text-xs text-muted-foreground">Активных</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
            <h2 className="text-lg font-semibold">Недавние заказы</h2>
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
            <h2 className="text-lg font-semibold">Топ Врачей</h2>
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
