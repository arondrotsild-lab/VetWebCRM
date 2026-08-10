import { useListVets } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Loader2, Star, ShieldCheck, Phone, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { getTierBadge } from "@/lib/utils";

export default function VetsPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  
  // Fake pagination state locally as the API might not support it fully or we want to demonstrate it
  const { data: vetsList, isLoading } = useListVets({
    search: search || undefined,
    tier: tierFilter || undefined,
    isVerified: verifiedFilter
  });

  const vets = vetsList?.data || [];
  const tiers = [
    { value: "", label: "Все уровни" },
    { value: "Бронза", label: "Бронза" },
    { value: "Серебро", label: "Серебро" },
    { value: "Золото", label: "Золото" },
    { value: "Платина", label: "Платина" },
    { value: "Алмаз", label: "Алмаз" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Врачи</h1>
          <p className="text-muted-foreground mt-1 text-sm">База ветеринарных врачей платформы</p>
        </div>
        <button className="btn-primary">
          + Добавить врача
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Поиск по имени или телефону..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <select 
            className="input-field py-2 w-auto min-w-[150px]"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            {tiers.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              className="rounded bg-[rgba(10,26,10,0.6)] border-green-500/20 text-green-500 focus:ring-green-500/20"
              checked={verifiedFilter === true}
              onChange={(e) => setVerifiedFilter(e.target.checked ? true : undefined)}
            />
            Только верифицированные
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vets.map(vet => (
            <Link key={vet.id} href={`/vets/${vet.id}`} className="glass-card-hover block group">
              <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-green-900 border-2 border-green-500/20 flex items-center justify-center font-bold text-xl overflow-hidden group-hover:border-green-400/50 transition-colors">
                      {vet.photoUrl ? (
                        <img src={vet.photoUrl} alt={vet.name} className="w-full h-full object-cover" />
                      ) : (
                        vet.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    {vet.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase border ${getTierBadge(vet.tier)}`}>
                    {vet.tier}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg group-hover:text-green-400 transition-colors">{vet.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{vet.specialization}</p>
                
                <div className="space-y-2 mt-auto text-sm">
                  <div className="flex justify-between items-center text-muted-foreground border-t border-green-500/10 pt-3">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> Рейтинг</span>
                    <span className="font-mono text-white">{vet.rating} <span className="text-xs">({vet.reviewsCount})</span></span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Заказов</span>
                    <span className="font-mono text-white">{vet.totalCompletedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> Связь</span>
                    <span className="font-mono text-white">{vet.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-green-500/10 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Статус:</span>
                  {vet.isAvailable ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Принимает вызовы
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full border border-gray-500/20">
                      Недоступен
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {vets.length === 0 && (
            <div className="col-span-full glass-card p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>Врачи не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
