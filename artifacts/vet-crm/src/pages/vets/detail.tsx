import { useGetVet, useGetVetOrders } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getTierBadge } from "@/lib/utils";
import { Loader2, ArrowLeft, Star, ShieldCheck, Mail, Phone, Calendar, Clock, Trophy, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function VetDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: vet, isLoading: vetLoading } = useGetVet(id, { query: { enabled: !!id } });
  const { data: ordersData, isLoading: ordersLoading } = useGetVetOrders(id, { query: { enabled: !!id } });

  if (vetLoading || !vet) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  // Mock tier progress calculation
  const maxOrdersForTier = vet.tier === 'Бронза' ? 30 : vet.tier === 'Серебро' ? 65 : vet.tier === 'Золото' ? 100 : vet.tier === 'Платина' ? 150 : 200;
  const progress = Math.min(100, Math.round((vet.totalCompletedOrders / maxOrdersForTier) * 100));

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/vets" className="p-2 glass-card hover:bg-green-500/10 rounded-md transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">Профиль врача</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 mx-auto rounded-full bg-green-900 border-4 border-green-500/20 flex items-center justify-center font-bold text-4xl overflow-hidden shadow-xl shadow-green-900/50">
                {vet.photoUrl ? (
                  <img src={vet.photoUrl} alt={vet.name} className="w-full h-full object-cover" />
                ) : (
                  vet.name.substring(0, 2).toUpperCase()
                )}
              </div>
              {vet.isVerified && (
                <div className="absolute bottom-0 right-2 bg-background rounded-full p-1 border border-background">
                  <ShieldCheck className="w-8 h-8 text-blue-500" />
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{vet.name}</h2>
            <p className="text-green-400 font-medium text-sm mb-4">{vet.specialization}</p>
            
            <div className={`inline-block px-4 py-1.5 rounded border text-sm font-bold uppercase tracking-wider mb-6 ${getTierBadge(vet.tier)}`}>
              Уровень: {vet.tier}
            </div>

            <div className="space-y-3 text-sm text-left">
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                <Phone className="w-4 h-4 text-green-500/70" />
                <span className="font-mono text-white">{vet.phone}</span>
              </div>
              {vet.email && (
                <div className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                  <Mail className="w-4 h-4 text-green-500/70" />
                  <span className="text-white">{vet.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                <Calendar className="w-4 h-4 text-green-500/70" />
                <span className="text-white">Опыт: {vet.experienceYears} лет</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                <Clock className="w-4 h-4 text-green-500/70" />
                <span className="text-white">В системе с: {formatDate(vet.createdAt).split(' ')[0]}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-green-500/10">
              <button className="btn-primary w-full">Редактировать профиль</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-lg">О себе</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vet.bio || "Описание отсутствует. Врач еще не заполнил информацию о себе."}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <div className="text-muted-foreground text-sm flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" /> Рейтинг
              </div>
              <div className="text-3xl font-bold font-mono">{vet.rating}</div>
              <div className="text-xs text-muted-foreground mt-1">Основано на {vet.reviewsCount} отзывах</div>
            </div>
            
            <div className="glass-card p-5">
              <div className="text-muted-foreground text-sm flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-emerald-500" /> Вызовы
              </div>
              <div className="text-3xl font-bold font-mono">{vet.totalCompletedOrders}</div>
              <div className="text-xs text-muted-foreground mt-1">Успешно завершенных</div>
            </div>

            <div className="glass-card p-5">
              <div className="text-muted-foreground text-sm flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-green-400" /> Заработок
              </div>
              <div className="text-2xl font-bold font-mono text-green-400 truncate">{formatCurrency(vet.totalEarnings)}</div>
              <div className="text-xs text-green-500 mt-1">Комиссия: {vet.commission * 100}%</div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-semibold text-lg">Прогресс уровня</h3>
                <p className="text-sm text-muted-foreground">До следующего уровня осталось {Math.max(0, maxOrdersForTier - vet.totalCompletedOrders)} заказов</p>
              </div>
              <div className="text-2xl font-bold font-mono text-green-400">{progress}%</div>
            </div>
            <div className="h-4 w-full bg-[rgba(10,26,10,0.8)] rounded-full border border-green-500/20 overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
              <span>Текущий: {vet.tier}</span>
              <span>Цель: {maxOrdersForTier}</span>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
              <h3 className="font-semibold text-lg">История заказов</h3>
            </div>
            <div className="overflow-x-auto min-h-[250px]">
              {ordersLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                      <th className="p-4 font-medium">Заказ</th>
                      <th className="p-4 font-medium">Услуга</th>
                      <th className="p-4 font-medium">Статус</th>
                      <th className="p-4 font-medium text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ordersData?.orders || []).map((order) => (
                      <tr key={order.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                        <td className="p-4">
                          <Link href={`/orders/${order.id}`} className="text-sm font-mono text-green-400 hover:underline block mb-1">
                            #{order.id}
                          </Link>
                          <div className="text-xs text-muted-foreground">{formatDate(order.createdAt).split(' ')[0]}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{order.serviceName}</div>
                          <div className="text-xs text-muted-foreground">{order.clientName}</div>
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-mono">{formatCurrency(order.totalPrice)}</div>
                        </td>
                      </tr>
                    ))}
                    {ordersData?.orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                          У врача пока нет заказов
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {ordersData && ordersData.total > 10 && (
              <div className="p-4 border-t border-[rgba(74,222,128,0.1)] text-center">
                <Link href={`/orders?vetId=${vet.id}`} className="text-sm text-green-400 hover:underline">
                  Смотреть все заказы врача ({ordersData.total})
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
