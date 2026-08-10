import { useListServices } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Edit2, ActivitySquare, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ServicesPage() {
  const { data: servicesList, isLoading } = useListServices();
  const services = servicesList?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Услуги</h1>
          <p className="text-muted-foreground mt-1 text-sm">Управление каталогом ветеринарных услуг</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Добавить услугу
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="glass-card flex flex-col relative overflow-hidden group">
              {/* Status indicator line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${service.isActive ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              
              <div className="p-6 pl-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded bg-[rgba(10,26,10,0.8)] border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-2xl group-hover:border-green-400 transition-colors">
                    {service.icon || '🩺'}
                  </div>
                  <div className="flex gap-2">
                    {service.isActive ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Активна
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                        <XCircle className="w-3 h-3" /> Скрыта
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 pr-8">{service.name}</h3>
                
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                  {service.description || 'Описание отсутствует'}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-end p-3 rounded bg-[rgba(10,26,10,0.5)] border border-[rgba(74,222,128,0.05)]">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Стоимость (₽)</div>
                      <div className="font-mono text-green-400 font-bold text-lg">
                        {service.priceFrom === service.priceTo 
                          ? formatCurrency(service.priceFrom)
                          : `${service.priceFrom} - ${service.priceTo}`
                        }
                      </div>
                    </div>
                    {service.duration && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Время</div>
                        <div className="font-mono text-sm">~{service.duration} мин</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-[rgba(74,222,128,0.1)]">
                    <span className="text-muted-foreground">Оказано раз: <strong className="text-white ml-1">{service.ordersCount || 0}</strong></span>
                    <button className="text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
                      <Edit2 className="w-4 h-4" /> Настроить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full glass-card p-12 flex flex-col items-center justify-center text-muted-foreground">
              <ActivitySquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Услуги не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
