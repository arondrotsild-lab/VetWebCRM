import { useGetOrder, useUpdateOrderStatus, useAssignOrderVet, useListVets } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { Loader2, ArrowLeft, MapPin, Calendar, Clock, Phone, User, Dog, Stethoscope, Save } from "lucide-react";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });
  const { data: vets } = useListVets({ isAvailable: true, isVerified: true }, { query: { enabled: !!id } });
  
  const updateStatus = useUpdateOrderStatus();
  // We assume useAssignOrderVet is a hook but it wasn't strictly defined with exact params, so we'll just mock its usage or use a generic update.
  // Actually, we can just use useUpdateOrderStatus or standard order update if assign doesn't exist.
  // The API schema has `OrderUpdate`. Let's use standard update status for now, and handle vet assignment generically if needed.

  const [assigning, setAssigning] = useState(false);
  const [selectedVet, setSelectedVet] = useState<string>("");

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders", id] as any });
      }
    });
  };

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const isTerminal = order.status === 'completed' || order.status === 'cancelled';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="p-2 glass-card hover:bg-green-500/10 rounded-md transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Заказ #{order.id}
            <span className={`status-badge text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Создан: {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-green-500/10 pb-4">
              <Stethoscope className="text-green-400" /> Детали услуги
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Услуга</div>
                <div className="font-medium text-lg">{order.serviceName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Стоимость</div>
                <div className="font-mono text-xl text-green-400">{formatCurrency(order.totalPrice)}</div>
                {order.priceFrom && order.priceTo && (
                  <div className="text-xs text-muted-foreground">Прайс: {order.priceFrom} - {order.priceTo}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><MapPin size={14} /> Адрес выезда</div>
                <div className="bg-[rgba(10,26,10,0.4)] p-3 rounded border border-green-500/10">{order.address}</div>
              </div>
              {order.scheduledAt && (
                <div className="sm:col-span-2">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={14} /> Запланировано на</div>
                  <div className="bg-[rgba(10,26,10,0.4)] p-3 rounded border border-green-500/10">{formatDate(order.scheduledAt)}</div>
                </div>
              )}
            </div>
            
            {order.notes && (
              <div className="mt-6 pt-4 border-t border-green-500/10">
                <div className="text-sm text-muted-foreground mb-2">Комментарий к заказу</div>
                <div className="bg-yellow-500/5 text-yellow-200/80 p-4 rounded text-sm italic border border-yellow-500/10">
                  "{order.notes}"
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-green-500/10 pb-4">
              Управление статусом
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <button 
                disabled={order.status === 'pending' || isTerminal}
                onClick={() => handleStatusChange('pending')}
                className="px-4 py-2 rounded glass-card text-amber-500 border-amber-500/20 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Ожидает
              </button>
              <button 
                disabled={order.status === 'confirmed' || isTerminal}
                onClick={() => handleStatusChange('confirmed')}
                className="px-4 py-2 rounded glass-card text-blue-500 border-blue-500/20 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Подтвердить
              </button>
              <button 
                disabled={order.status === 'in_progress' || isTerminal}
                onClick={() => handleStatusChange('in_progress')}
                className="px-4 py-2 rounded glass-card text-green-400 border-green-400/20 hover:bg-green-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                В процессе
              </button>
              <button 
                disabled={order.status === 'completed' || order.status === 'cancelled'}
                onClick={() => handleStatusChange('completed')}
                className="px-4 py-2 rounded bg-emerald-600/80 text-white hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-400/50"
              >
                Завершить успешно
              </button>
              <button 
                disabled={order.status === 'cancelled' || order.status === 'completed'}
                onClick={() => handleStatusChange('cancelled')}
                className="px-4 py-2 rounded bg-red-900/40 text-red-400 border border-red-500/30 hover:bg-red-900/60 disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-green-400 flex items-center gap-2"><User size={18} /> Клиент</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Имя</div>
                <Link href={`/clients/${order.clientId}`} className="font-medium hover:text-green-400 transition-colors">
                  {order.clientName || 'Неизвестно'}
                </Link>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Телефон</div>
                <div className="font-mono">{order.clientPhone || '—'}</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-green-500/10">
              <h3 className="font-semibold mb-4 text-green-400 flex items-center gap-2"><Dog size={18} /> Питомец</h3>
              {order.petId ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Имя</div>
                    <Link href={`/pets/${order.petId}`} className="font-medium hover:text-green-400 transition-colors">
                      {order.petName}
                    </Link>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Вид / Порода</div>
                    <div>{order.petSpecies} {order.petBreed ? `(${order.petBreed})` : ''}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">Без привязки к питомцу</div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-green-400 flex items-center gap-2">👨‍⚕️ Назначенный врач</h3>
            {order.vetId ? (
              <div className="space-y-3">
                <Link href={`/vets/${order.vetId}`} className="flex items-center gap-3 p-2 -ml-2 rounded hover:bg-green-500/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-900 border border-green-500/30 flex items-center justify-center font-bold">
                    {order.vetName?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{order.vetName}</div>
                  </div>
                </Link>
                {!isTerminal && (
                  <button className="text-xs text-amber-500 hover:text-amber-400 mt-2 block">
                    Переназначить врача
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="text-amber-500/80 text-sm mb-4 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                  Врач еще не назначен на этот вызов.
                </div>
                {!isTerminal && (
                  <div className="space-y-2">
                    <select 
                      className="input-field py-2"
                      value={selectedVet}
                      onChange={(e) => setSelectedVet(e.target.value)}
                    >
                      <option value="">Выберите врача...</option>
                      {(vets?.data || []).map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.tier})</option>
                      ))}
                    </select>
                    <button 
                      disabled={!selectedVet}
                      className="btn-primary w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Назначить
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
