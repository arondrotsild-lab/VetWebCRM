import { useListOrders } from "@workspace/api-client-react";
import { useState } from "react";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { Search, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const limit = 15;

  const { data, isLoading } = useListOrders({
    page,
    limit,
    status: statusFilter,
    search: search || undefined
  });

  const statuses = [
    { value: undefined, label: "Все" },
    { value: "pending", label: "Ожидают" },
    { value: "confirmed", label: "Подтверждены" },
    { value: "in_progress", label: "В процессе" },
    { value: "completed", label: "Завершены" },
    { value: "cancelled", label: "Отменены" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Заказы</h1>
          <p className="text-muted-foreground mt-1 text-sm">Управление всеми вызовами и назначениями</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>+</span> Новый заказ
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Поиск по клиенту или телефону..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {statuses.map(s => (
            <button
              key={s.label}
              onClick={() => { setStatusFilter(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                statusFilter === s.value 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-[rgba(10,26,10,0.6)] text-muted-foreground border border-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.05)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                  <th className="p-4 font-medium">ID / Дата</th>
                  <th className="p-4 font-medium">Клиент</th>
                  <th className="p-4 font-medium">Питомец</th>
                  <th className="p-4 font-medium">Услуга</th>
                  <th className="p-4 font-medium">Врач</th>
                  <th className="p-4 font-medium">Статус</th>
                  <th className="p-4 font-medium text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {(data?.orders || []).map((order) => (
                  <tr key={order.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                    <td className="p-4">
                      <Link href={`/orders/${order.id}`} className="text-sm font-mono text-green-400 hover:underline block mb-1">
                        #{order.id}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{order.clientName}</div>
                      <div className="text-xs text-muted-foreground">{order.clientPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{order.petName}</div>
                      <div className="text-xs text-muted-foreground">{order.petSpecies} {order.petBreed ? `· ${order.petBreed}` : ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm max-w-[200px] truncate" title={order.serviceName || ''}>{order.serviceName}</div>
                    </td>
                    <td className="p-4">
                      {order.vetName ? (
                        <span className="text-sm text-green-400/80">{order.vetName}</span>
                      ) : (
                        <span className="text-xs text-amber-500/70 italic">Не назначен</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-mono font-bold">{formatCurrency(order.totalPrice)}</div>
                    </td>
                  </tr>
                ))}
                {data?.orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Заказы не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {data && data.total > limit && (
          <div className="p-4 border-t border-[rgba(74,222,128,0.1)] flex items-center justify-between bg-[rgba(10,26,10,0.4)]">
            <div className="text-sm text-muted-foreground">
              Показано {Math.min((page - 1) * limit + 1, data.total)} - {Math.min(page * limit, data.total)} из {data.total}
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded glass-card hover:bg-[rgba(74,222,128,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft w={16} h={16} />
              </button>
              <button 
                disabled={page * limit >= data.total}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded glass-card hover:bg-[rgba(74,222,128,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight w={16} h={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
