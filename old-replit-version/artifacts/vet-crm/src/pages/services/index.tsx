import { useListServices } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import {
  Loader2, Plus, Edit2, Clock, CheckCircle2, XCircle, ActivitySquare,
  Stethoscope, ShieldPlus, Bone, Scissors, ScanLine, Droplets,
  Layers, Heart, Eye, HeartHandshake, Brain, Microscope,
  Radar, Radiation, TestTube2, Zap, Footprints, PersonStanding,
  ScanSearch, FlaskConical, type LucideIcon,
} from "lucide-react";

// ── icon registry ─────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope, ShieldPlus, Bone, Scissors, ScanLine, Droplets,
  Layers, Heart, Eye, HeartHandshake, Brain, Microscope,
  Radar, Radiation, TestTube2, Zap, Footprints, PersonStanding,
  ScanSearch, FlaskConical,
};

// ── per-service gradient / colour accents ────────────────────────────────
const ACCENT: Record<number, { from: string; to: string; glow: string; text: string }> = {
  1:  { from: "#22c55e", to: "#15803d", glow: "rgba(34,197,94,0.3)",  text: "text-green-400"  },
  2:  { from: "#3b82f6", to: "#1d4ed8", glow: "rgba(59,130,246,0.3)", text: "text-blue-400"   },
  3:  { from: "#f59e0b", to: "#b45309", glow: "rgba(245,158,11,0.3)", text: "text-amber-400"  },
  4:  { from: "#ef4444", to: "#991b1b", glow: "rgba(239,68,68,0.3)",  text: "text-red-400"    },
  5:  { from: "#06b6d4", to: "#0e7490", glow: "rgba(6,182,212,0.3)",  text: "text-cyan-400"   },
  6:  { from: "#a855f7", to: "#7e22ce", glow: "rgba(168,85,247,0.3)", text: "text-purple-400" },
  7:  { from: "#f97316", to: "#c2410c", glow: "rgba(249,115,22,0.3)", text: "text-orange-400" },
  8:  { from: "#ec4899", to: "#9d174d", glow: "rgba(236,72,153,0.3)", text: "text-pink-400"   },
  9:  { from: "#14b8a6", to: "#0f766e", glow: "rgba(20,184,166,0.3)", text: "text-teal-400"   },
  10: { from: "#8b5cf6", to: "#5b21b6", glow: "rgba(139,92,246,0.3)", text: "text-violet-400" },
  11: { from: "#06b6d4", to: "#164e63", glow: "rgba(6,182,212,0.3)",  text: "text-cyan-400"   },
  12: { from: "#22c55e", to: "#14532d", glow: "rgba(34,197,94,0.25)", text: "text-green-400"  },
  13: { from: "#3b82f6", to: "#1e3a8a", glow: "rgba(59,130,246,0.3)", text: "text-blue-400"   },
  14: { from: "#f59e0b", to: "#78350f", glow: "rgba(245,158,11,0.3)", text: "text-amber-400"  },
  15: { from: "#ef4444", to: "#7f1d1d", glow: "rgba(239,68,68,0.3)",  text: "text-red-400"    },
  16: { from: "#eab308", to: "#713f12", glow: "rgba(234,179,8,0.3)",  text: "text-yellow-400" },
  17: { from: "#ec4899", to: "#831843", glow: "rgba(236,72,153,0.3)", text: "text-pink-400"   },
  18: { from: "#a855f7", to: "#581c87", glow: "rgba(168,85,247,0.3)", text: "text-purple-400" },
  19: { from: "#14b8a6", to: "#042f2e", glow: "rgba(20,184,166,0.3)", text: "text-teal-400"   },
  20: { from: "#84cc16", to: "#365314", glow: "rgba(132,204,22,0.3)", text: "text-lime-400"   },
};

const DEFAULT_ACCENT = { from: "#22c55e", to: "#15803d", glow: "rgba(34,197,94,0.3)", text: "text-green-400" };

// ─────────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { data: servicesList, isLoading } = useListServices();
  const services = Array.isArray(servicesList) ? servicesList : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Услуги</h1>
          <p className="text-muted-foreground mt-1 text-sm">Каталог ветеринарных услуг платформы</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Добавить услугу
        </button>
      </div>

      {/* Stats bar */}
      <div className="glass-card px-5 py-3 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-white/60">Активных:</span>
          <span className="font-bold text-green-400">{services.filter(s => s.isActive).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-gray-400" />
          <span className="text-white/60">Скрытых:</span>
          <span className="font-bold text-white/60">{services.filter(s => !s.isActive).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-blue-400" />
          <span className="text-white/60">Всего оказано:</span>
          <span className="font-bold text-blue-400">{services.reduce((a, s) => a + (s.ordersCount || 0), 0)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {services.map(service => {
            const IconComp = ICON_MAP[service.icon ?? ""] ?? Stethoscope;
            const acc      = ACCENT[service.id ?? 0] ?? DEFAULT_ACCENT;

            return (
              <div
                key={service.id}
                className="glass-card flex flex-col overflow-hidden group cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
                style={{ boxShadow: `0 0 0 1px rgba(74,222,128,0.07)` }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 24px ${acc.glow}, 0 0 0 1px ${acc.from}40`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 1px rgba(74,222,128,0.07)`)}
              >
                {/* Coloured top strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${acc.from}, ${acc.to})` }}
                />

                <div className="p-5 flex flex-col flex-1">
                  {/* Icon + status */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Large themed icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${acc.from}30, ${acc.to}18)`,
                        border: `1.5px solid ${acc.from}35`,
                        boxShadow: `0 0 16px ${acc.glow}`,
                      }}
                    >
                      {/* subtle radial glow behind icon */}
                      <div
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle, ${acc.from}15 0%, transparent 70%)` }}
                      />
                      <IconComp
                        className="relative z-10"
                        style={{ color: acc.from, width: 26, height: 26, strokeWidth: 1.6 }}
                      />
                    </div>

                    {/* Active badge */}
                    {service.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Активна
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 font-medium">
                        <XCircle className="w-2.5 h-2.5" /> Скрыта
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className={`font-bold text-base leading-tight mb-1 group-hover:${acc.text} transition-colors`}>
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-white/35 mb-4 line-clamp-2 min-h-[32px]">
                    {service.description || "Профессиональная ветеринарная помощь на дому"}
                  </p>

                  {/* Price + Duration */}
                  <div
                    className="mt-auto rounded-xl p-3 flex justify-between items-end"
                    style={{
                      background: `linear-gradient(135deg, ${acc.from}08, transparent)`,
                      border: `1px solid ${acc.from}18`,
                    }}
                  >
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Стоимость</div>
                      <div className={`font-mono font-bold text-base ${acc.text}`}>
                        {service.priceFrom === service.priceTo
                          ? formatCurrency(service.priceFrom)
                          : `${formatCurrency(service.priceFrom)} – ${formatCurrency(service.priceTo)}`}
                      </div>
                    </div>
                    {service.duration && (
                      <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-wide mb-1 flex items-center gap-1 justify-end">
                          <Clock className="w-2.5 h-2.5" /> Время
                        </div>
                        <div className="font-mono text-sm text-white/60">{service.duration} мин</div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <span className="text-[11px] text-white/30">
                      Оказано: <strong className="text-white/60">{service.ordersCount || 0}</strong>
                    </span>
                    <button
                      className="flex items-center gap-1 text-[11px] transition-colors"
                      style={{ color: acc.from + "aa" }}
                      onMouseEnter={e => (e.currentTarget.style.color = acc.from)}
                      onMouseLeave={e => (e.currentTarget.style.color = acc.from + "aa")}
                    >
                      <Edit2 className="w-3 h-3" /> Настроить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {services.length === 0 && (
            <div className="col-span-full glass-card p-16 flex flex-col items-center justify-center text-white/20">
              <ActivitySquare className="w-16 h-16 mb-4" />
              <p className="text-lg">Услуги не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
