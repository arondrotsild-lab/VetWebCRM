import {
  useGetFinanceSummary,
  useGetFinanceByService,
  useGetFinanceByVet,
} from "@workspace/api-client-react";
import { formatCurrency, getTierBadge } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area,
} from "recharts";
import {
  Loader2, TrendingUp, TrendingDown, Wallet, Users,
  BarChart2, Sparkles, ArrowUpRight, ArrowDownRight, DollarSign,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
const Chip = ({ up, pct }: { up: boolean; pct: number }) => (
  <span
    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
      up
        ? "bg-green-500/10 text-green-400 border-green-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"
    }`}
  >
    {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
    {Math.abs(pct).toFixed(1)}%
  </span>
);

const tooltipStyle = {
  backgroundColor: "rgba(6,13,6,0.95)",
  borderColor: "rgba(74,222,128,0.2)",
  borderRadius: 8,
  fontSize: 12,
};

// ─── component ──────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { data: summary, isLoading: sl } = useGetFinanceSummary();
  const { data: rawService, isLoading: svl } = useGetFinanceByService();
  const { data: rawVet, isLoading: vl } = useGetFinanceByVet();

  if (sl || svl || vl) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const serviceData = Array.isArray(rawService) ? rawService : [];
  const vetData = Array.isArray(rawVet) ? rawVet : [];

  const s = summary as any ?? {};
  const totalRevenue      = Number(s.totalRevenue       ?? 0);
  const platformRevenue   = Number(s.platformRevenue    ?? 0);
  const vetEarnings       = Number(s.vetEarnings        ?? 0);
  const netProfit         = Number(s.netProfit          ?? 0);
  const operationalCosts  = Number(s.operationalCosts   ?? 0);
  const thisMonth         = Number(s.revenueThisMonth   ?? 0);
  const lastMonth         = Number(s.revenueLastMonth   ?? 0);
  const growth            = Number(s.growthPercent      ?? 0);
  const netProfitThisMonth  = Number(s.netProfitThisMonth  ?? 0);
  const netProfitLastMonth  = Number(s.netProfitLastMonth  ?? 0);
  const netProfitGrowth     = Number(s.netProfitGrowth     ?? 0);
  const avgOrder          = Number(s.avgOrderValue      ?? 0);
  const completedCount    = Number(s.completedOrdersCount ?? 0);

  // month comparison chart data
  const monthChart = [
    { name: "Пред. месяц", revenue: lastMonth, profit: netProfitLastMonth },
    { name: "Тек. месяц",  revenue: thisMonth, profit: netProfitThisMonth },
  ];

  // KPI cards
  const kpis = [
    {
      label: "Валовый оборот",
      sub: "Сумма всех завершённых заказов",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-white",
      accent: "border-green-500/20",
      iconBg: "bg-green-500/10 text-green-400",
    },
    {
      label: "Выручка платформы",
      sub: "42% комиссия от оборота",
      value: formatCurrency(platformRevenue),
      icon: BarChart2,
      color: "text-green-400",
      accent: "border-t-2 border-t-green-400 border-green-500/20",
      iconBg: "bg-green-500/10 text-green-400",
    },
    {
      label: "Чистая прибыль",
      sub: "После операционных расходов",
      value: formatCurrency(netProfit),
      icon: Sparkles,
      color: "text-emerald-300",
      accent: "border-t-2 border-t-emerald-300 border-green-500/20",
      iconBg: "bg-emerald-400/10 text-emerald-300",
      badge: { up: netProfitGrowth >= 0, pct: netProfitGrowth },
    },
    {
      label: "Выплаты врачам",
      sub: "58% — доля ветеринаров",
      value: formatCurrency(vetEarnings),
      icon: Users,
      color: "text-blue-400",
      accent: "border-green-500/20",
      iconBg: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Операционные расходы",
      sub: "18% от оборота",
      value: formatCurrency(operationalCosts),
      icon: Wallet,
      color: "text-orange-400",
      accent: "border-green-500/20",
      iconBg: "bg-orange-500/10 text-orange-400",
    },
    {
      label: "Средний чек",
      sub: `По ${completedCount} завершённым заказам`,
      value: formatCurrency(avgOrder),
      icon: TrendingUp,
      color: "text-purple-400",
      accent: "border-green-500/20",
      iconBg: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Сводка по доходам, комиссиям и чистой прибыли платформы
          </p>
        </div>
        {/* Month comparison badge */}
        <div className="glass-card px-5 py-3 flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-green-400/40 mb-1">Пред. месяц</div>
            <div className="font-mono text-white/70 font-semibold">{formatCurrency(lastMonth)}</div>
          </div>
          <div className="text-2xl text-green-500/30">→</div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-green-400/40 mb-1">Тек. месяц</div>
            <div className="font-mono text-green-400 font-bold">{formatCurrency(thisMonth)}</div>
          </div>
          <Chip up={growth >= 0} pct={growth} />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`glass-card p-5 flex flex-col gap-3 ${k.accent}`}>
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${k.iconBg}`}>
                <k.icon className="w-4 h-4" />
              </div>
              {k.badge && <Chip up={k.badge.up} pct={k.badge.pct} />}
            </div>
            <div>
              <div className={`text-xl font-bold font-mono leading-tight ${k.color}`}>{k.value}</div>
              <div className="text-[11px] font-semibold text-white/60 mt-1">{k.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Month comparison */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold mb-1">Месяц к месяцу</h2>
          <p className="text-xs text-green-400/40 mb-5">Выручка и чистая прибыль</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthChart} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#4ade8040" fontSize={11} tickLine={false} />
              <YAxis stroke="#4ade8040" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" name="Выручка" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit"  name="Чистая прибыль" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By service */}
        <div className="glass-card p-6 lg:col-span-3">
          <h2 className="text-base font-semibold mb-1">Выручка по услугам</h2>
          <p className="text-xs text-green-400/40 mb-5">Топ услуг по объёму выручки</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#4ade8040" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="serviceName" type="category" stroke="#4ade8040" fontSize={11} width={130} tickLine={false} tick={{ fill: "#ffffffaa" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="totalRevenue" name="Выручка" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vet settlements */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(74,222,128,0.08)]">
          <Users className="w-4 h-4 text-green-400" />
          <h2 className="text-base font-semibold">Взаиморасчёты с врачами</h2>
          <span className="ml-auto text-xs text-green-400/40">{vetData.length} врачей</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(74,222,128,0.06)] text-[10px] text-green-400/40 uppercase tracking-wider">
                <th className="px-5 py-3">Врач / Тир</th>
                <th className="px-5 py-3 text-center">Заказов</th>
                <th className="px-5 py-3 text-center">Ставка</th>
                <th className="px-5 py-3 text-right">Оборот</th>
                <th className="px-5 py-3 text-right">Начислено врачу</th>
                <th className="px-5 py-3 text-right">Чистая прибыль</th>
                <th className="px-5 py-3 text-right text-green-400">Доля платформы</th>
              </tr>
            </thead>
            <tbody>
              {vetData.map((vet: any) => {
                const gross   = Number(vet.grossEarnings ?? 0);
                const net     = Number(vet.netEarnings   ?? 0);
                const pfee    = Number(vet.platformFee   ?? 0);
                const vProfit = pfee * 0.6; // чистая прибыль = доля платформы × 60% (после ops)
                return (
                  <tr
                    key={vet.vetId}
                    className="border-b border-[rgba(74,222,128,0.04)] hover:bg-[rgba(74,222,128,0.03)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium leading-tight">{vet.vetName}</div>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getTierBadge(vet.tier)}`}>
                        {vet.tier}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-mono text-sm text-white/70">
                        {Number(vet.completedOrders ?? 0)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-mono text-sm bg-[rgba(10,26,10,0.8)] border border-[rgba(74,222,128,0.15)] px-2.5 py-1 rounded-full text-white/80">
                        {Number(vet.commission ?? 0) * 100}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-white/60">
                      {formatCurrency(gross)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="font-mono text-sm text-blue-400 font-semibold">{formatCurrency(net)}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{Number(vet.commission ?? 0) * 100}% от оборота</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="font-mono text-sm text-emerald-300 font-semibold">{formatCurrency(vProfit)}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">60% от доли платф.</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="font-mono text-sm text-green-400 font-bold">{formatCurrency(pfee)}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {gross > 0 ? (100 - Number(vet.commission ?? 0) * 100).toFixed(0) : 0}% от оборота
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="border-t border-[rgba(74,222,128,0.12)] bg-[rgba(10,26,10,0.4)]">
                <td className="px-5 py-4 text-xs text-green-400/60 font-semibold uppercase tracking-wide" colSpan={3}>
                  Итого
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-white/60 font-bold">
                  {formatCurrency(vetData.reduce((a: number, v: any) => a + Number(v.grossEarnings ?? 0), 0))}
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-blue-400 font-bold">
                  {formatCurrency(vetData.reduce((a: number, v: any) => a + Number(v.netEarnings ?? 0), 0))}
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-emerald-300 font-bold">
                  {formatCurrency(vetData.reduce((a: number, v: any) => a + Number(v.platformFee ?? 0) * 0.6, 0))}
                </td>
                <td className="px-5 py-4 text-right font-mono text-sm text-green-400 font-bold">
                  {formatCurrency(vetData.reduce((a: number, v: any) => a + Number(v.platformFee ?? 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
