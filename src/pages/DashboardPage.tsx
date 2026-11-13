import { useNavigate, Link } from 'react-router-dom';
import { Bars, Area, Donut, HBars, Heatmap, Ring } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Avatar, StatusChip } from '../components/ui';
import { useCrm, money, num, rub, pct, delta, monthShort, monthLong, dateShort, time, speciesEmoji, PALETTE, plural } from '../lib/format';
import { Month } from '../lib/api';
import Icon3D from '../components/Icon3D';

export const monthRows = (months: Month[]) => months.map((m) => ({ label: monthShort(m.m), full: monthLong(m.m), ...m }));

export default function DashboardPage() {
  const { data, error } = useCrm('summary');
  const nav = useNavigate();
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={4} />;
  const k = data.kpi;
  const months: Month[] = data.months;
  const now = new Date();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const spark = months.slice(-8, -1).map((m) => m.revenue);
  const svcTotal = data.services.reduce((a: number, s: { revenue: number }) => a + s.revenue, 0);
  return (
    <div className="space-y-5 md:space-y-6">
      <PageHead eyebrow={`${monthLong(now.toISOString().slice(0, 7))} · день ${now.getDate()} из ${dim}`} title="Сводка компании"
        sub={<>Все цифры ВетДом в одном месте: выручка, прибыль, заказы, клиенты, врачи. Обновляется в реальном времени.</>}
        right={<div className="flex items-center gap-2 rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 live-pulse" />
          <span className="text-sm font-bold text-green-300 money">{`В работе: ${k.active_now} · врачей на линии: ${k.vets_online}`}</span>
        </div>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="💰" tone="green" label="Выручка за месяц" value={money(k.revenue_mtd)} delta={delta(k.revenue_mtd, k.revenue_prev_same)} sub={`прогноз ${money(k.revenue_forecast)}`} spark={spark} onClick={() => nav('/finance')} />
        <Kpi icon="📈" tone="yellow" label={`Прибыль · ${monthShort(k.last_month)}`} value={money(k.profit_last)} sub={`маржа ${pct(k.margin_last, 1)}`} spark={months.slice(-8, -1).map((m) => m.profit)} onClick={() => nav('/finance')} />
        <Kpi icon="🧾" tone="sky" label="Визитов за месяц" value={num(k.orders_mtd)} delta={delta(k.orders_mtd, k.orders_prev_same)} sub={`сегодня ${num(k.orders_today)}`} onClick={() => nav('/orders')} />
        <Kpi icon="🧮" tone="amber" label="Средний чек" value={rub(k.avg_check)} delta={delta(k.avg_check, k.avg_check_prev)} sub="визит врача" onClick={() => nav('/services')} />
        <Kpi icon="👥" tone="purple" label="Клиентов в базе" value={num(k.clients_total)} sub={`+${num(k.new_clients_mtd)} новых в этом месяце`} onClick={() => nav('/clients')} />
        <Kpi icon="🐾" tone="teal" label="Питомцев" value={num(k.pets_total)} sub={`активных клиентов ${num(k.active_clients)}`} onClick={() => nav('/pets')} />
        <Kpi icon="🩺" tone="red" label="Ветеринаров" value={num(k.vets_total)} sub={`${k.vets_online} на линии · ★ ${k.rating30.toFixed(2)}`} onClick={() => nav('/vets')} />
        <Kpi icon="🏦" tone="coffee" label="Деньги на счетах" value={money(k.cash)} sub="5 счетов компании" onClick={() => nav('/finance?tab=accounts')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2" title="Выручка и прибыль по месяцам" sub="Услуги врачей + магазин, линия — чистая прибыль компании">
          <Bars data={monthRows(months)} height={260} highlightLast
            series={[{ key: 'svc', name: 'Услуги врачей', color: '#7CB842' }, { key: 'shop', name: 'Магазин', color: '#FACC15' }]}
            line={{ key: 'profit', name: 'Прибыль', color: '#F9A8D4' }} />
        </Card>
        <Card title="План месяца" sub={`Цель — ${money(Math.round(k.revenue_last * 1.08 / 1e5) * 1e5)} (+8% к прошлому месяцу)`}>
          <div className="flex items-center gap-5">
            <Ring value={k.revenue_mtd / (k.revenue_last * 1.08)} size={118}>
              <div className="font-black text-xl money">{pct(k.revenue_mtd / (k.revenue_last * 1.08))}</div>
              <div className="text-[10px] text-white/50">выполнено</div>
            </Ring>
            <div className="space-y-2 text-sm min-w-0">
              <div><div className="text-white/45 text-[11px] uppercase font-bold tracking-wider">Уже</div><div className="font-black money">{money(k.revenue_mtd)}</div></div>
              <div><div className="text-white/45 text-[11px] uppercase font-bold tracking-wider">Прогноз</div><div className="font-black text-green-300 money">{money(k.revenue_forecast)}</div></div>
              <div><div className="text-white/45 text-[11px] uppercase font-bold tracking-wider">Прошлый месяц</div><div className="font-bold text-white/70 money">{money(k.revenue_last)}</div></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            <MiniStat label="Сегодня" value={money(k.revenue_today)} />
            <MiniStat label="Визитов" value={num(k.orders_today)} />
            <MiniStat label="В работе" value={num(k.active_now)} />
          </div>
          <div className="mt-4 rounded-2xl p-3 bg-pink-400/10 border border-pink-300/20 text-xs text-pink-100/90">
            {`❤️ Клиенты собрали на лечение животных из приютов: ${money(k.charity)}`}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2" title="Выручка по дням" sub="Последние 30 дней">
          <Area height={230} data={data.daily.map((d: { day: string; svc: number; shop: number }) => ({ label: dateShort(d.day).replace('.', ''), full: dateShort(d.day), svc: d.svc, shop: d.shop }))}
            series={[{ key: 'svc', name: 'Услуги', color: '#7CB842' }, { key: 'shop', name: 'Магазин', color: '#FACC15' }]} />
        </Card>
        <Card title="Откуда выручка" sub="Услуги за 30 дней">
          <div className="flex flex-col items-center">
            <Donut size={190} items={data.services.slice(0, 8).map((s: { name: string; revenue: number }, i: number) => ({ name: s.name, value: s.revenue, color: PALETTE[i] }))}
              center={<div className="font-black text-xl money">{money(svcTotal)}</div>} sub="за 30 дней" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 w-full">
              {data.services.slice(0, 8).map((s: { name: string; icon: string; revenue: number }, i: number) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[11px] min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PALETTE[i] }} />
                  <span className="truncate text-white/70">{s.name}</span><span className="ml-auto font-bold text-white/85">{pct(s.revenue / svcTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <Card title="Лучшие врачи месяца" sub="По выручке за 30 дней" right={<Link to="/vets" className="text-xs font-bold text-green-300">Все врачи ›</Link>}>
          <div className="space-y-1">
            {data.topVets.map((v: { id: number; name: string; photo_url: string; specialization: string; n: number; revenue: number; rating: number }, i: number) => (
              <Link key={v.id} to={`/vets/${v.id}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.05]">
                <span className={`w-7 text-center font-black ${i < 3 ? 'text-xl' : 'text-white/40'}`}>{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
                <Avatar src={v.photo_url} name={v.name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{v.name}</div>
                  <div className="text-[11px] text-white/50 truncate">{`${v.specialization} · ${v.n} визитов · ★ ${v.rating.toFixed(2)}`}</div>
                </div>
                <div className="font-black money">{money(v.revenue)}</div>
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Прямо сейчас" sub="Визиты в работе" right={<Link to="/orders?status=active" className="text-xs font-bold text-green-300">Все ›</Link>}>
          <div className="space-y-1">
            {data.live.map((o: { id: number; status: string; scheduled_at: string; total_price: number; service: string; icon: string; client: string; pet: string; species: string; vet: string }) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/[0.05]">
                <Icon3D emoji={o.icon} size={44} still />
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{`${o.service} · ${speciesEmoji(o.species)} ${o.pet}`}</div>
                  <div className="text-[11px] text-white/50 truncate">{`${o.vet ?? 'ищем врача'} → ${o.client} · ${time(o.scheduled_at)}`}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusChip status={o.status} />
                  <div className="text-xs font-bold mt-1 money">{rub(o.total_price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2" title="Когда вызывают врача" sub="Визиты по дням недели и часам за 90 дней — для графика смен">
          <Heatmap cells={data.heat} />
        </Card>
        <Card title="Кого лечим" sub="Питомцы в базе">
          <HBars fmt={num} items={data.species.slice(0, 6).map((s: { species: string; n: number }, i: number) => ({ label: s.species, value: s.n, icon: speciesEmoji(s.species), color: PALETTE[i], right: `${num(s.n)}` }))} />
        </Card>
      </div>

      <Card title="Рост компании" sub="Каждый месяц больше клиентов и визитов">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {months.slice(-5, -1).map((m) => (
            <div key={m.m} className="rounded-2xl p-3 bg-white/[0.04] border border-white/10">
              <div className="text-xs font-bold text-white/60">{monthLong(m.m)}</div>
              <div className="font-black text-lg mt-1 money">{money(m.revenue)}</div>
              <div className="text-[11px] text-white/50 money">{`${num(m.orders)} визитов · +${num(m.new_clients)} клиентов`}</div>
              <div className="mt-1.5 flex items-center gap-1"><span className="text-[11px] text-white/45">прибыль</span><span className={`text-[11px] font-bold ${m.profit >= 0 ? 'text-green-300' : 'text-red-300'} money`}>{m.profit >= 0 ? '+' : ''}{money(m.profit)}</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-2.5 text-center glass3d">
      <div className="text-[10px] text-white/45 font-bold uppercase tracking-wider">{label}</div>
      <div className="font-black text-sm mt-0.5 money">{value}</div>
    </div>
  );
}
