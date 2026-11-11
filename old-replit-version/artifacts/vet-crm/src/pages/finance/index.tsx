import {
  useGetFinanceSummary,
  useGetFinanceByService,
  useGetFinanceByVet,
} from "@workspace/api-client-react";
import { formatCurrency, getTierBadge } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Loader2, TrendingUp, TrendingDown, Wallet, Users, BarChart2,
  Sparkles, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag,
  Megaphone, Monitor, FileText, MoreHorizontal,
} from "lucide-react";

// ─── tiny helpers ─────────────────────────────────────────────────────────
const Chip = ({ up, pct }: { up: boolean; pct: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
    up
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20"
  }`}>
    {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
    {Math.abs(pct).toFixed(1)}%
  </span>
);

const tt = {
  backgroundColor: "rgba(6,13,6,0.97)",
  borderColor: "rgba(74,222,128,0.2)",
  borderRadius: 8,
  fontSize: 12,
};

const PIE_COLORS = ["#22c55e","#3b82f6","#a855f7","#f97316","#ec4899"];

// ─── expense config ───────────────────────────────────────────────────────
const EXP_CFG = [
  { key: "staff",     label: "Зарплата сотрудников", icon: Users,        color: "#22c55e", pct: "8%" },
  { key: "marketing", label: "Маркетинг и реклама",  icon: Megaphone,    color: "#3b82f6", pct: "5%" },
  { key: "it",        label: "IT-инфраструктура",    icon: Monitor,      color: "#a855f7", pct: "3%" },
  { key: "admin",     label: "Административные",     icon: FileText,     color: "#f97316", pct: "1.5%" },
  { key: "other",     label: "Прочие расходы",       icon: MoreHorizontal,color:"#ec4899", pct: "0.5%" },
];

// ─── component ────────────────────────────────────────────────────────────
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
  const vetData     = Array.isArray(rawVet)     ? rawVet     : [];
  const s           = (summary as any) ?? {};

  const totalRevenue     = Number(s.totalRevenue        ?? 0);
  const platformRevenue  = Number(s.platformRevenue     ?? 0);
  const vetEarnings      = Number(s.vetEarnings         ?? 0);
  const netProfit        = Number(s.netProfit           ?? 0);
  const thisMonth        = Number(s.revenueThisMonth    ?? 0);
  const lastMonth        = Number(s.revenueLastMonth    ?? 0);
  const growth           = Number(s.growthPercent       ?? 0);
  const netProfitThis    = Number(s.netProfitThisMonth  ?? 0);
  const netProfitLast    = Number(s.netProfitLastMonth  ?? 0);
  const netProfitGrowth  = Number(s.netProfitGrowth     ?? 0);
  const avgOrder         = Number(s.avgOrderValue       ?? 0);
  const completedCount   = Number(s.completedOrdersCount?? 0);
  const clientsThisMonth = Number(s.clientsThisMonth    ?? 0);
  const exp              = (s.expenses as any)          ?? {};
  const expTotal         = Number(exp.total   ?? totalRevenue * 0.18);

  // month bar data
  const monthChart = [
    { name: "Пред. месяц", revenue: lastMonth, profit: netProfitLast, expenses: lastMonth * 0.18 },
    { name: "Тек. месяц",  revenue: thisMonth, profit: netProfitThis, expenses: Number(exp.total ?? thisMonth * 0.18) },
  ];

  // pie data for expenses
  const pieData = EXP_CFG.map(e => ({
    name: e.label,
    value: Number(exp[e.key] ?? 0),
    color: e.color,
  })).filter(d => d.value > 0);

  // KPI cards
  const kpis = [
    { label: "Валовый оборот",       sub: "Все завершённые заказы",        value: totalRevenue,    color: "text-white",     iconBg: "bg-green-500/10 text-green-400",   icon: DollarSign,  accent: "" },
    { label: "Выручка платформы",    sub: "42% комиссия",                  value: platformRevenue, color: "text-green-400", iconBg: "bg-green-500/10 text-green-400",   icon: BarChart2,   accent: "border-t-2 border-t-green-400" },
    { label: "Чистая прибыль",       sub: "После всех расходов",           value: netProfit,       color: "text-emerald-300",iconBg:"bg-emerald-400/10 text-emerald-300",icon: Sparkles,  accent: "border-t-2 border-t-emerald-300", badge: { up: netProfitGrowth >= 0, pct: netProfitGrowth } },
    { label: "Выплаты врачам",       sub: "58% — доля ветеринаров",        value: vetEarnings,     color: "text-blue-400",  iconBg: "bg-blue-500/10 text-blue-400",     icon: Users,       accent: "" },
    { label: "Все расходы (месяц)",  sub: "18% от месячного оборота",      value: expTotal,        color: "text-orange-400",iconBg: "bg-orange-500/10 text-orange-400", icon: Wallet,      accent: "", badge: { up: false, pct: 18 } },
    { label: "Средний чек",          sub: `${completedCount} заказов`,     value: avgOrder,        color: "text-purple-400",iconBg: "bg-purple-500/10 text-purple-400", icon: ShoppingBag, accent: "" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground mt-1 text-sm">Доходы, расходы и чистая прибыль платформы</p>
        </div>
        <div className="glass-card px-5 py-3 flex items-center gap-5 text-sm flex-wrap">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-green-400/40 mb-1">Пред. месяц</div>
            <div className="font-mono text-white/60 font-semibold">{formatCurrency(lastMonth)}</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-green-500/40" />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-green-400/40 mb-1">Тек. месяц</div>
            <div className="font-mono text-green-400 font-bold text-lg">{formatCurrency(thisMonth)}</div>
          </div>
          <Chip up={growth >= 0} pct={growth} />
          <div className="h-8 w-px bg-green-500/10" />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-green-400/40 mb-1">Клиентов</div>
            <div className="font-mono text-white/70 font-semibold">{clientsThisMonth}</div>
          </div>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={`glass-card p-4 flex flex-col gap-3 border-green-500/10 ${k.accent}`}>
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${k.iconBg}`}><k.icon className="w-4 h-4" /></div>
              {k.badge && <Chip up={k.badge.up} pct={k.badge.pct} />}
            </div>
            <div>
              <div className={`text-lg font-bold font-mono leading-tight ${k.color}`}>{formatCurrency(k.value)}</div>
              <div className="text-[11px] font-semibold text-white/60 mt-1">{k.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Month-to-month */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-0.5">Месяц к месяцу</h2>
          <p className="text-[11px] text-green-400/40 mb-4">Выручка · Прибыль · Расходы</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthChart} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.07)" vertical={false} />
              <XAxis dataKey="name" stroke="#4ade8030" fontSize={11} tickLine={false} />
              <YAxis stroke="#4ade8030" fontSize={11} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tt} formatter={(v: number) => formatCurrency(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue"  name="Выручка"   fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="profit"   name="Прибыль"   fill="#34d399" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Расходы"   fill="#f97316" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By service */}
        <div className="glass-card p-5 lg:col-span-3">
          <h2 className="font-semibold mb-0.5">Выручка по услугам</h2>
          <p className="text-[11px] text-green-400/40 mb-4">Топ по объёму</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={serviceData.slice(0,10)} layout="vertical" margin={{ left:0, right:16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.07)" horizontal={false} />
              <XAxis type="number" stroke="#4ade8030" fontSize={11} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="serviceName" type="category" stroke="#4ade8030" fontSize={10} width={130} tickLine={false} tick={{ fill:"#ffffff99" }} />
              <Tooltip contentStyle={tt} formatter={(v:number)=>formatCurrency(v)} />
              <Bar dataKey="totalRevenue" name="Выручка" fill="#22c55e" radius={[0,4,4,0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── EXPENSES SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Pie */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <h2 className="font-semibold mb-0.5">Структура расходов</h2>
          <p className="text-[11px] text-green-400/40 mb-2">Текущий месяц · {formatCurrency(expTotal)}</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="rgba(4,10,4,0.8)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tt} formatter={(v:number)=>formatCurrency(v)} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense table */}
        <div className="glass-card overflow-hidden lg:col-span-3 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(74,222,128,0.08)]">
            <Wallet className="w-4 h-4 text-orange-400" />
            <h2 className="font-semibold">Все расходы по категориям</h2>
            <span className="ml-auto text-xs text-green-400/40">% от выручки месяца</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.06)] text-[10px] text-green-400/40 uppercase tracking-wider">
                  <th className="px-5 py-3">Категория</th>
                  <th className="px-5 py-3 text-center">Доля</th>
                  <th className="px-5 py-3 text-right">Сумма</th>
                  <th className="px-5 py-3 text-right">от выручки</th>
                  <th className="px-5 py-3 text-right text-orange-400/70">Тренд</th>
                </tr>
              </thead>
              <tbody>
                {EXP_CFG.map((e) => {
                  const amount = Number(exp[e.key] ?? 0);
                  const share  = expTotal > 0 ? (amount / expTotal) * 100 : 0;
                  const ofRev  = thisMonth > 0 ? (amount / thisMonth) * 100 : 0;
                  return (
                    <tr key={e.key} className="border-b border-[rgba(74,222,128,0.04)] hover:bg-[rgba(74,222,128,0.025)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg" style={{ backgroundColor: e.color + "18" }}>
                            <e.icon className="w-3.5 h-3.5" style={{ color: e.color }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{e.label}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">{e.pct} от оборота</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {/* mini bar */}
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: e.color }} />
                          </div>
                          <span className="text-xs font-mono text-white/50 w-8">{share.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm" style={{ color: e.color }}>
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs font-mono text-white/40">
                        {ofRev.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400 bg-orange-400/5 border border-orange-400/10 px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-2.5 h-2.5" /> норма
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[rgba(74,222,128,0.12)] bg-[rgba(10,26,10,0.5)]">
                  <td className="px-5 py-4 text-xs text-orange-400/70 font-bold uppercase tracking-wide" colSpan={2}>
                    Итого расходов
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-orange-400 font-bold">
                    {formatCurrency(expTotal)}
                  </td>
                  <td className="px-5 py-4 text-right text-xs font-mono text-white/40">18.0%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Vet settlements ── */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(74,222,128,0.08)]">
          <Users className="w-4 h-4 text-green-400" />
          <h2 className="font-semibold">Взаиморасчёты с врачами</h2>
          <span className="ml-auto text-xs text-green-400/40">{vetData.length} врачей</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(74,222,128,0.06)] text-[10px] text-green-400/40 uppercase tracking-wider">
                <th className="px-4 py-3">Врач / Тир</th>
                <th className="px-4 py-3 text-center">Заказов</th>
                <th className="px-4 py-3 text-center">Ставка</th>
                <th className="px-4 py-3 text-right">Оборот</th>
                <th className="px-4 py-3 text-right">В этом мес.</th>
                <th className="px-4 py-3 text-right">Начислено врачу</th>
                <th className="px-4 py-3 text-right text-emerald-300/70">Чистая прибыль</th>
                <th className="px-4 py-3 text-right text-green-400/70">Доля платформы</th>
              </tr>
            </thead>
            <tbody>
              {vetData.map((vet: any) => {
                const gross      = Number(vet.grossEarnings  ?? 0);
                const pfee       = Number(vet.platformFee    ?? 0);
                const grossMonth = Number(vet.grossThisMonth ?? 0);
                const salary     = Number(vet.monthlySalary  ?? 90000);
                const commission = Number(vet.commission     ?? 0); // уже целое число: 50-70
                const vProfit    = pfee * 0.60;
                const platformPct = gross > 0 ? (100 - commission) : 0;
                return (
                  <tr key={vet.vetId} className="border-b border-[rgba(74,222,128,0.03)] hover:bg-[rgba(74,222,128,0.025)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium leading-tight">{vet.vetName}</div>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getTierBadge(vet.tier)}`}>
                        {vet.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-white/60">
                      {Number(vet.completedOrders ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs bg-[rgba(10,26,10,0.8)] border border-[rgba(74,222,128,0.15)] px-2 py-0.5 rounded-full">
                        {commission}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-white/50">{formatCurrency(gross)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-white/70">{formatCurrency(grossMonth)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono text-sm text-blue-400 font-semibold">{formatCurrency(salary)}</div>
                      <div className="text-[10px] text-white/25 mt-0.5">фиксированная ставка</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono text-sm text-emerald-300 font-semibold">{formatCurrency(vProfit)}</div>
                      <div className="text-[10px] text-white/25 mt-0.5">60% от доли платф.</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono text-sm text-green-400 font-bold">{formatCurrency(pfee)}</div>
                      <div className="text-[10px] text-white/25 mt-0.5">
                        {platformPct.toFixed(0)}% от оборота
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[rgba(74,222,128,0.12)] bg-[rgba(10,26,10,0.4)]">
                <td className="px-4 py-4 text-xs text-green-400/50 font-bold uppercase tracking-wide" colSpan={3}>Итого</td>
                <td className="px-4 py-4 text-right font-mono text-sm text-white/50 font-bold">
                  {formatCurrency(vetData.reduce((a:number,v:any)=>a+Number(v.grossEarnings??0),0))}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-white/60 font-bold">
                  {formatCurrency(vetData.reduce((a:number,v:any)=>a+Number(v.grossThisMonth??0),0))}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-blue-400 font-bold">
                  {formatCurrency(vetData.reduce((a:number,v:any)=>a+Number(v.monthlySalary??90000),0))}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-emerald-300 font-bold">
                  {formatCurrency(vetData.reduce((a:number,v:any)=>a+Number(v.platformFee??0)*0.60,0))}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm text-green-400 font-bold">
                  {formatCurrency(vetData.reduce((a:number,v:any)=>a+Number(v.platformFee??0),0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
