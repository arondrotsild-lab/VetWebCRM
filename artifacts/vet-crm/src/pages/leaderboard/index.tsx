import { useGetLeaderboard } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatCurrency, getTierBadge } from "@/lib/utils";
import { Loader2, Trophy, Medal, Star, CheckCircle2 } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaderboardData, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const entries = leaderboardData?.data || [];

  const getRankStyle = (rank: number) => {
    switch(rank) {
      case 1: return { color: "text-yellow-400", border: "border-yellow-400/50", bg: "bg-yellow-500/10", shadow: "shadow-[0_0_20px_rgba(250,204,21,0.2)]" };
      case 2: return { color: "text-gray-300", border: "border-gray-400/50", bg: "bg-gray-500/10", shadow: "" };
      case 3: return { color: "text-[#cd7f32]", border: "border-[#cd7f32]/50", bg: "bg-[#cd7f32]/10", shadow: "" };
      default: return { color: "text-green-400", border: "border-green-500/20", bg: "bg-green-900/20", shadow: "" };
    }
  };

  const TopThree = ({ entry }: { entry: typeof entries[0] }) => {
    if (!entry) return null;
    const style = getRankStyle(entry.rank);
    const size = entry.rank === 1 ? 'w-32 h-32' : 'w-24 h-24';
    const wrapperClasses = entry.rank === 1 ? 'scale-110 z-10 mx-4' : 'opacity-90';

    return (
      <div className={`flex flex-col items-center text-center ${wrapperClasses}`}>
        <div className={`relative mb-4 ${style.shadow} rounded-full`}>
          <div className={`${size} rounded-full bg-[rgba(10,26,10,1)] border-4 ${style.border} flex items-center justify-center font-bold text-3xl overflow-hidden`}>
            {entry.photoUrl ? (
              <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
            ) : (
              entry.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${style.bg} ${style.border} border-2 w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono ${style.color}`}>
            {entry.rank}
          </div>
          {entry.rank === 1 && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              <Trophy size={32} fill="currentColor" />
            </div>
          )}
        </div>
        <Link href={`/vets/${entry.vetId}`} className="font-bold text-lg hover:text-green-400 transition-colors leading-tight mb-1">
          {entry.name}
        </Link>
        <div className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mb-2 ${getTierBadge(entry.tier)}`}>
          {entry.tier}
        </div>
        <div className="text-sm font-mono bg-[rgba(10,26,10,0.6)] px-3 py-1 rounded-full border border-[rgba(74,222,128,0.1)]">
          {entry.completedOrders} вызовов
        </div>
      </div>
    );
  };

  const top3 = entries.slice(0, 3);
  // Reorder for podium display: 2, 1, 3
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Лидерборд Врачей</h1>
        <p className="text-muted-foreground">Топ лучших специалистов платформы по количеству успешных заказов</p>
      </div>

      {entries.length > 0 ? (
        <>
          {/* Podium */}
          <div className="flex justify-center items-end h-[250px] mb-12">
            {podiumOrder.map((entry) => (
              <TopThree key={entry.vetId} entry={entry} />
            ))}
          </div>

          {/* List */}
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                  <th className="p-4 font-medium w-16 text-center">Ранг</th>
                  <th className="p-4 font-medium">Врач</th>
                  <th className="p-4 font-medium text-center">Вызовы</th>
                  <th className="p-4 font-medium text-center">Рейтинг</th>
                  <th className="p-4 font-medium text-right">Заработок</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => (
                  <tr key={entry.vetId} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                    <td className="p-4 text-center">
                      <div className="inline-flex w-8 h-8 rounded-full bg-[rgba(10,26,10,0.8)] border border-green-500/20 items-center justify-center font-bold font-mono text-green-500/70">
                        {entry.rank}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(10,26,10,1)] border border-[rgba(74,222,128,0.2)] overflow-hidden">
                          {entry.photoUrl ? (
                            <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-green-500">
                              {entry.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/vets/${entry.vetId}`} className="font-semibold text-sm hover:text-green-400 block mb-0.5">
                            {entry.name}
                          </Link>
                          <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getTierBadge(entry.tier)}`}>
                            {entry.tier}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono bg-[rgba(74,222,128,0.05)] px-3 py-1 rounded text-green-400 border border-[rgba(74,222,128,0.1)]">
                        {entry.completedOrders}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {entry.rating}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-sm text-green-400">{formatCurrency(entry.totalEarnings || 0)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="glass-card p-12 text-center text-muted-foreground">
          Нет данных для лидерборда
        </div>
      )}
    </div>
  );
}
