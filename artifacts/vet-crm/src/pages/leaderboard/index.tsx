import { useGetLeaderboard } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatCurrency, getTierBadge } from "@/lib/utils";
import { Loader2, Star, TrendingUp, Award } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaderboardData, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const entries = Array.isArray(leaderboardData) ? leaderboardData : [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // rank configs
  const rankCfg = {
    1: {
      ring: "#FFD700",
      ringGlow: "rgba(255,215,0,0.6)",
      bg: "rgba(255,215,0,0.08)",
      textColor: "#FFD700",
      size: 128,
      platformH: "h-28",
      platformColor: "from-yellow-500/30 to-yellow-900/10",
      platformBorder: "border-yellow-500/40",
      label: "1",
    },
    2: {
      ring: "#C0C0C0",
      ringGlow: "rgba(192,192,192,0.4)",
      bg: "rgba(192,192,192,0.06)",
      textColor: "#C0C0C0",
      size: 100,
      platformH: "h-20",
      platformColor: "from-gray-400/20 to-gray-700/10",
      platformBorder: "border-gray-400/30",
      label: "2",
    },
    3: {
      ring: "#CD7F32",
      ringGlow: "rgba(205,127,50,0.4)",
      bg: "rgba(205,127,50,0.06)",
      textColor: "#CD7F32",
      size: 88,
      platformH: "h-14",
      platformColor: "from-amber-700/20 to-amber-900/10",
      platformBorder: "border-amber-700/30",
      label: "3",
    },
  };

  const PodiumCard = ({ entry, order }: { entry: typeof entries[0]; order: number }) => {
    if (!entry) return <div className="flex-1" />;
    const cfg = rankCfg[entry.rank as 1 | 2 | 3];
    const isFirst = entry.rank === 1;
    const avatarSize = cfg.size;

    return (
      <div className={`flex flex-col items-center ${isFirst ? "z-10" : "z-0"}`} style={{ flex: 1, maxWidth: isFirst ? 260 : 220 }}>
        {/* Avatar area */}
        <div className={`flex flex-col items-center pb-6 ${isFirst ? "pt-0" : "pt-8"}`}>
          {/* Trophy for #1 */}
          {isFirst && (
            <div className="mb-3 flex flex-col items-center">
              <div
                className="text-5xl select-none"
                style={{
                  filter: `drop-shadow(0 0 16px ${cfg.ring}) drop-shadow(0 0 32px ${cfg.ring})`,
                  animation: "glowPulse 2s infinite",
                }}
              >
                🏆
              </div>
            </div>
          )}

          {/* Avatar circle */}
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 0 3px ${cfg.ring}, 0 0 24px ${cfg.ringGlow}, 0 0 48px ${cfg.ringGlow}`,
                borderRadius: "50%",
              }}
            />
            <div
              className="rounded-full flex items-center justify-center font-bold overflow-hidden relative"
              style={{
                width: avatarSize,
                height: avatarSize,
                background: `radial-gradient(circle at 40% 35%, ${cfg.bg}, rgba(6,13,6,0.95))`,
                border: `3px solid ${cfg.ring}`,
                fontSize: isFirst ? 36 : 28,
                color: cfg.textColor,
              }}
            >
              {entry.photoUrl ? (
                <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
              ) : (
                entry.name.substring(0, 2).toUpperCase()
              )}
            </div>

            {/* Rank badge */}
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2"
              style={{
                background: cfg.ring,
                borderColor: "#040a04",
                color: "#040a04",
                fontSize: 13,
                boxShadow: `0 0 8px ${cfg.ringGlow}`,
              }}
            >
              {cfg.label}
            </div>
          </div>

          {/* Name & info */}
          <div className="mt-6 text-center px-2">
            <Link
              href={`/vets/${entry.vetId}`}
              className="font-bold leading-tight block mb-2 hover:opacity-80 transition-opacity"
              style={{ fontSize: isFirst ? 16 : 14, color: "#ffffff" }}
            >
              {entry.name}
            </Link>
            <div className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mb-3 ${getTierBadge(entry.tier)}`}>
              {entry.tier}
            </div>
            <div
              className="text-base font-mono font-bold"
              style={{ color: cfg.textColor, textShadow: `0 0 12px ${cfg.ringGlow}` }}
            >
              {entry.completedOrders} <span className="text-xs font-normal opacity-70">вызовов</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-yellow-400/80">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {entry.rating}
            </div>
          </div>
        </div>

        {/* Platform step */}
        <div
          className={`w-full ${cfg.platformH} rounded-t-xl border-t border-l border-r bg-gradient-to-b ${cfg.platformColor} ${cfg.platformBorder} flex items-center justify-center`}
        >
          <span
            className="text-4xl font-black opacity-20 select-none"
            style={{ color: cfg.ring }}
          >
            {cfg.label}
          </span>
        </div>
      </div>
    );
  };

  // Podium order: 2, 1, 3
  const podiumOrder: Array<{ entry: typeof entries[0]; order: number }> = [
    { entry: top3[1], order: 2 },
    { entry: top3[0], order: 1 },
    { entry: top3[2], order: 3 },
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-4xl md:text-5xl font-black mb-3 tracking-tight"
          style={{
            background: "linear-gradient(90deg, #4ade80 0%, #22c55e 40%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Лидерборд Врачей
        </h1>
        <p className="text-sm text-green-400/50">
          Топ лучших специалистов платформы по количеству успешных заказов
        </p>
      </div>

      {entries.length > 0 ? (
        <>
          {/* Podium */}
          <div className="relative">
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(255,215,0,0.04), transparent)",
              }}
            />
            <div className="flex items-end justify-center gap-0 relative">
              {podiumOrder.map(({ entry, order }) => (
                <PodiumCard key={entry?.vetId ?? order} entry={entry} order={order} />
              ))}
            </div>
          </div>

          {/* Rest of the list */}
          {rest.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[rgba(74,222,128,0.08)]">
                <Award className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Остальные участники</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(74,222,128,0.08)] text-[11px] text-green-400/40 uppercase tracking-wider">
                    <th className="px-5 py-3 w-16 text-center">Ранг</th>
                    <th className="px-5 py-3">Врач</th>
                    <th className="px-5 py-3 text-center">Вызовы</th>
                    <th className="px-5 py-3 text-center">Рейтинг</th>
                    <th className="px-5 py-3 text-right">Заработок</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((entry, i) => (
                    <tr
                      key={entry.vetId}
                      className="border-b border-[rgba(74,222,128,0.04)] hover:bg-[rgba(74,222,128,0.03)] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex w-8 h-8 rounded-full bg-[rgba(10,26,10,0.8)] border border-green-500/15 items-center justify-center font-bold font-mono text-sm text-green-500/50">
                          {entry.rank}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[rgba(10,26,10,1)] border border-[rgba(74,222,128,0.15)] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-green-500">
                            {entry.photoUrl
                              ? <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
                              : entry.name.substring(0, 2).toUpperCase()
                            }
                          </div>
                          <div>
                            <Link href={`/vets/${entry.vetId}`} className="font-semibold text-sm hover:text-green-400 transition-colors block leading-tight mb-1">
                              {entry.name}
                            </Link>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getTierBadge(entry.tier)}`}>
                              {entry.tier}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono text-sm text-green-400 bg-green-400/5 border border-green-400/10 px-2.5 py-1 rounded-full">
                          {entry.completedOrders}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-mono">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {entry.rating}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm text-green-400">
                        {formatCurrency(entry.totalEarnings || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-16 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Нет данных для лидерборда</p>
        </div>
      )}
    </div>
  );
}
