import { Bars, Donut } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Stars } from '../components/ui';
import { useCrm, money, rub, num, pct, monthShort, monthLong, PALETTE } from '../lib/format';

interface S { id: number; name: string; icon: string; price_from: number; price_to: number; duration_minutes: number; n30: number; rev30: number; pay30: number; total: number; rev_all: number; rating: number }

export default function ServicesPage() {
  const { data, error } = useCrm('services');
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const rows: S[] = data.rows;
  const rev = rows.reduce((a, s) => a + s.rev30, 0), n = rows.reduce((a, s) => a + s.n30, 0), pay = rows.reduce((a, s) => a + s.pay30, 0);
  const top = rows.slice(0, 6).map((s) => s.name);
  const monthsList = [...new Set((data.months as { m: string }[]).map((m) => m.m))];
  const series = top.map((name, i) => ({ key: name, name, color: PALETTE[i] }));
  const chart = monthsList.map((m) => {
    const row: Record<string, string | number> = { label: monthShort(m), full: monthLong(m) };
    (data.months as { m: string; name: string; n: number }[]).filter((x) => x.m === m && top.includes(x.name)).forEach((x) => { row[x.name] = x.n; });
    return row as { label: string };
  });
  return (
    <div className="space-y-4 md:space-y-5">
      <PageHead eyebrow="Что продаём" title="Услуги" sub="13 направлений: сколько визитов, какая выручка, средний чек и маржа компании по каждой услуге" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="💉" tone="green" label="Выручка услуг · 30 дней" value={money(rev)} />
        <Kpi icon="🚗" tone="sky" label="Визитов · 30 дней" value={num(n)} />
        <Kpi icon="🧮" tone="amber" label="Средний чек" value={rub(n ? rev / n : 0)} />
        <Kpi icon="🏢" tone="yellow" label="Остаётся компании" value={pct(rev ? 1 - pay / rev : 0)} sub={money(rev - pay)} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2" title="Самые востребованные услуги по месяцам" sub="Число визитов">
          <Bars data={chart} series={series} height={260} fmt={num} />
        </Card>
        <Card title="Доля в выручке" sub="За 30 дней">
          <div className="flex justify-center"><Donut size={190} items={rows.map((s, i) => ({ name: s.name, value: s.rev30, color: PALETTE[i % PALETTE.length] }))} center={<div className="font-black text-xl money">{money(rev)}</div>} sub="услуги" /></div>
        </Card>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {rows.map((s, i) => (
          <div key={s.id} className="card3d p-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl tile3d flex-shrink-0" style={{ background: `linear-gradient(145deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[i % PALETTE.length]}77)` }}>{s.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-black truncate">{s.name}</div>
                <div className="text-[11px] text-white/55">{`${rub(s.price_from)} – ${rub(s.price_to)} · ${s.duration_minutes} мин`}</div>
              </div>
              {s.rating > 0 && <div className="text-right"><Stars value={s.rating} size={10} /><div className="text-[10px] text-white/50">{s.rating.toFixed(2)}</div></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Cell label="Визитов" value={num(s.n30)} />
              <Cell label="Выручка" value={money(s.rev30)} />
              <Cell label="Ср. чек" value={rub(s.n30 ? s.rev30 / s.n30 : 0)} />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-white/55 mb-1"><span>Доля в выручке</span><b className="text-white">{pct(rev ? s.rev30 / rev : 0, 1)}</b></div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${rev ? (s.rev30 / rev) * 100 : 0}%`, background: PALETTE[i % PALETTE.length] }} /></div>
            </div>
            <div className="text-[11px] text-white/45 mt-2 money">{`За всё время: ${num(s.total)} визитов · ${money(s.rev_all)}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/20 px-2 py-1.5"><div className="text-[10px] text-white/45 font-bold uppercase">{label}</div><div className="font-black text-sm money">{value}</div></div>;
}
