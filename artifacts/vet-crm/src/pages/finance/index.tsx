import { useGetFinanceSummary, useGetFinanceByService, useGetFinanceByVet } from "@workspace/api-client-react";
import { formatCurrency, getTierBadge } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, DollarSign, ArrowUpRight, ArrowDownRight, Briefcase, UserPlus, ActivitySquare } from "lucide-react";

export default function FinancePage() {
  const { data: summary, isLoading: summaryLoading } = useGetFinanceSummary();
  const { data: serviceData, isLoading: serviceLoading } = useGetFinanceByService();
  const { data: vetData, isLoading: vetLoading } = useGetFinanceByVet();

  if (summaryLoading || serviceLoading || vetLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const isGrowthPositive = (summary?.growthPercent || 0) >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground mt-1 text-sm">Сводка по доходам платформы и комиссиям</p>
        </div>
        <div className="bg-[rgba(10,26,10,0.8)] px-4 py-2 rounded-lg border border-green-500/20 text-sm font-mono flex items-center gap-3">
          <span className="text-muted-foreground">Сумма в текущем месяце:</span>
          <span className="text-green-400 font-bold">{formatCurrency(summary?.revenueThisMonth || 0)}</span>
          <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${isGrowthPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isGrowthPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(summary?.growthPercent || 0)}%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" /> Оборот (Gross)
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">{formatCurrency(summary?.totalRevenue || 0)}</div>
          <div className="text-xs text-muted-foreground">Общая сумма всех заказов</div>
        </div>
        
        <div className="glass-card p-6 border-t-2 border-t-green-400">
          <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-green-400" /> Выручка платформы (Net)
          </div>
          <div className="text-2xl font-bold font-mono text-green-400 mb-1">{formatCurrency(summary?.platformRevenue || 0)}</div>
          <div className="text-xs text-muted-foreground">Доход после вычета комиссий</div>
        </div>

        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-400" /> Выплаты врачам
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mb-1">{formatCurrency(summary?.vetEarnings || 0)}</div>
          <div className="text-xs text-muted-foreground">Сумма всех комиссий врачей</div>
        </div>

        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-purple-400" /> Средний чек
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mb-1">{formatCurrency(summary?.avgOrderValue || 0)}</div>
          <div className="text-xs text-muted-foreground">По {summary?.completedOrdersCount} завершенным заказам</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-6">Выручка по услугам</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData?.data || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis dataKey="serviceName" type="category" stroke="#9ca3af" fontSize={12} width={100} tick={{fill: '#fff'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(74,222,128,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(10,26,10,0.9)', borderColor: 'rgba(74,222,128,0.2)', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="totalRevenue" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={24} name="Выручка" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vet Commission Table */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[rgba(74,222,128,0.1)]">
            <h2 className="text-lg font-semibold">Взаиморасчеты с врачами</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                  <th className="p-4 font-medium">Врач</th>
                  <th className="p-4 font-medium text-center">Комиссия</th>
                  <th className="p-4 font-medium text-right">Начислено врачу</th>
                  <th className="p-4 font-medium text-right text-green-400">Доля платформы</th>
                </tr>
              </thead>
              <tbody>
                {(vetData?.data || []).map((vet) => (
                  <tr key={vet.vetId} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)]">
                    <td className="p-4">
                      <div className="text-sm font-medium">{vet.vetName}</div>
                      <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${getTierBadge(vet.tier)}`}>
                        {vet.tier}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-sm bg-[rgba(10,26,10,0.8)] border border-[rgba(74,222,128,0.2)] px-2 py-1 rounded">
                        {vet.commission * 100}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-mono text-white">{formatCurrency(vet.netEarnings)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Оборот: {formatCurrency(vet.grossEarnings)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-mono text-green-400 font-bold">{formatCurrency(vet.platformFee)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
