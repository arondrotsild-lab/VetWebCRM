import { useGetVet, useGetVetOrders } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor, getTierBadge } from "@/lib/utils";
import { Loader2, ArrowLeft, Star, ShieldCheck, Mail, Phone, Calendar, Clock, Trophy, Wallet, CheckCircle2, XCircle } from "lucide-react";

function formatExperienceYears(years: number) {
  const remainder100 = years % 100;
  const remainder10 = years % 10;
  const unit = remainder100 >= 11 && remainder100 <= 14
    ? "лет"
    : remainder10 === 1
      ? "год"
      : remainder10 >= 2 && remainder10 <= 4
        ? "года"
        : "лет";

  return `${years} ${unit}`;
}

export default function VetDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: vet, isLoading: vetLoading, isError: vetError } = useGetVet(id);
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useGetVetOrders(id);
  const orders = ordersData ?? [];

  if (vetLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="glass-card p-8 max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">{vetError ? "Не удалось загрузить профиль" : "Врач не найден"}</h1>
        <p className="text-muted-foreground">
          {vetError ? "Проверьте соединение и попробуйте ещё раз." : "Возможно, карточка врача была удалена."}
        </p>
        <Link href="/vets" className="inline-flex items-center gap-2 text-green-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> К списку врачей
        </Link>
      </div>
    );
  }

  const nextTierGoal: Partial<Record<string, number>> = {
    "Бронза": 30,
    "Серебро": 65,
    "Золото": 100,
    "Платина": 150,
  };
  const maxOrdersForTier = nextTierGoal[vet.tier];
  const progress = maxOrdersForTier
    ? Math.min(100, Math.round((vet.totalCompletedOrders / maxOrdersForTier) * 100))
    : 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/vets" className="p-2 glass-card hover:bg-green-500/10 rounded-md transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">Профиль врача</h1>
          <p className="text-sm text-muted-foreground mt-1">{vet.name} · {vet.specialization}</p>
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

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border ${vet.isAvailable ? "text-green-300 bg-green-500/10 border-green-400/20" : "text-gray-300 bg-gray-500/10 border-gray-400/20"}`}>
                {vet.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {vet.isAvailable ? "Принимает вызовы" : "Не принимает вызовы"}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border ${vet.isVerified ? "text-blue-300 bg-blue-500/10 border-blue-400/20" : "text-amber-300 bg-amber-500/10 border-amber-400/20"}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {vet.isVerified ? "Проверен" : "Не проверен"}
              </span>
            </div>

            <div className="space-y-3 text-sm text-left">
              <a href={`tel:${vet.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                <Phone className="w-4 h-4 text-green-500/70" />
                <span className="font-mono text-white">{vet.phone}</span>
              </a>
              {vet.email ? (
                <a href={`mailto:${vet.email}`} className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                  <Mail className="w-4 h-4 text-green-500/70" />
                  <span className="text-white">{vet.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground p-2">
                  <Mail className="w-4 h-4 text-green-500/70" />
                  <span>Email не указан</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground p-2 rounded hover:bg-green-500/5 transition-colors">
                <Calendar className="w-4 h-4 text-green-500/70" />
                <span className="text-white">Опыт: {formatExperienceYears(vet.experienceYears)}</span>
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
              <div className="text-xs text-green-500 mt-1">Доля врача: {vet.commission}%</div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-semibold text-lg">Прогресс уровня</h3>
                <p className="text-sm text-muted-foreground">
                  {maxOrdersForTier
                    ? `До следующего уровня осталось ${Math.max(0, maxOrdersForTier - vet.totalCompletedOrders)} заказов`
                    : "Достигнут максимальный уровень"}
                </p>
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
              <span>{maxOrdersForTier ? `Цель: ${maxOrdersForTier}` : "Максимальный уровень"}</span>
            </div>
          </div>

          {/* Complete order history */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
              <h3 className="font-semibold text-lg">История заказов ({orders.length})</h3>
            </div>
            <div className="overflow-x-auto min-h-[250px]">
              {ordersLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                </div>
              ) : ordersError ? (
                <div className="flex items-center justify-center min-h-[200px] text-sm text-amber-300">
                  Не удалось загрузить историю заказов врача.
                </div>
              ) : orders.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px] text-sm text-muted-foreground">
                  У врача пока нет заказов.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                      <th className="p-4 font-medium">Заказ</th>
                      <th className="p-4 font-medium">Клиент и питомец</th>
                      <th className="p-4 font-medium">Услуга</th>
                      <th className="p-4 font-medium">Статус</th>
                      <th className="p-4 font-medium text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                        <td className="p-4">
                          <Link href={`/orders/${order.id}`} className="text-sm font-mono text-green-400 hover:underline block mb-1">
                            #{order.id}
                          </Link>
                          <div className="text-xs text-muted-foreground">{formatDate(order.createdAt).split(' ')[0]}</div>
                          {order.scheduledAt && (
                            <div className="text-xs text-muted-foreground mt-1">Вызов: {formatDate(order.scheduledAt)}</div>
                          )}
                        </td>
                        <td className="p-4">
                          {order.clientId ? (
                            <Link href={`/clients/${order.clientId}`} className="text-sm hover:text-green-400">
                              {order.clientName || "Клиент"}
                            </Link>
                          ) : (
                            <div className="text-sm">{order.clientName || "Клиент"}</div>
                          )}
                          {order.clientPhone && <div className="text-xs text-muted-foreground">{order.clientPhone}</div>}
                          {order.petName && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {order.petName}{order.petSpecies ? ` · ${order.petSpecies}` : ""}{order.petBreed ? `, ${order.petBreed}` : ""}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{order.serviceName || "Услуга не указана"}</div>
                          <div className="text-xs text-muted-foreground">{order.address}</div>
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
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
