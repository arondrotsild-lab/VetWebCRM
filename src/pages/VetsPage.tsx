import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bars, Donut, HBars } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Avatar, Stars, StatusChip, Segmented, Stat, Pill, Search } from '../components/ui';
import { useCrm, money, rub, num, pct, monthShort, monthLong, dateLong, dateShort, speciesEmoji, PALETTE, dec } from '../lib/format';
import Icon3D from '../components/Icon3D';

interface V { id: number; name: string; phone: string; photo_url: string | null; specialization: string; experience_years: number; district: string | null; is_available: boolean;
  created_at: string; transport: string; total: number; n30: number; rev30: number; pay30: number; rev_all: number; rating: number; reviews: number; cancel30: number;
  clients: number; accept_min: number; tier: { name: string; icon: string; percent: number; color: string }; margin30: number }

export default function VetsPage() {
  const nav = useNavigate();
  const { data, error } = useCrm('vets');
  const [sort, setSort] = useState<'rev' | 'rating' | 'n' | 'new'>('rev');
  const [q, setQ] = useState('');
  const [online, setOnline] = useState(false);
  const rows: V[] = useMemo(() => {
    if (!data) return [];
    const r = (data.rows as V[]).filter((v) => (!q || `${v.name} ${v.specialization} ${v.district}`.toLowerCase().includes(q.toLowerCase())) && (!online || v.is_available));
    return [...r].sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'n' ? b.n30 - a.n30 : sort === 'new' ? +new Date(b.created_at) - +new Date(a.created_at) : b.rev30 - a.rev30);
  }, [data, sort, q, online]);
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={4} />;
  const all: V[] = data.rows;
  const rev = all.reduce((a, v) => a + v.rev30, 0), pay = all.reduce((a, v) => a + v.pay30, 0), n = all.reduce((a, v) => a + v.n30, 0);
  return (
    <div className="space-y-4 md:space-y-5">
      <PageHead eyebrow="Команда врачей" title="Ветеринары" sub="Загрузка, выручка, выплаты, рейтинг и уровни каждого врача за последние 30 дней" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="🩺" tone="green" label="Врачей в команде" value={num(all.length)} sub={`${all.filter((v) => v.is_available).length} на линии сейчас`} onClick={() => setOnline(!online)} />
        <Kpi icon="🚗" tone="sky" label="Визитов за 30 дней" value={num(n)} sub={`${dec(n / all.length / 30 * 7 / 5)} визита в рабочий день на врача`} />
        <Kpi icon="💵" tone="yellow" label="Выплачено врачам" value={money(pay)} sub={`в среднем ${money(pay / all.length)} на врача`} />
        <Kpi icon="⭐" tone="purple" label="Средний рейтинг" value={(all.reduce((a, v) => a + v.rating * v.reviews, 0) / Math.max(1, all.reduce((a, v) => a + v.reviews, 0))).toFixed(2)} sub={`${num(all.reduce((a, v) => a + v.reviews, 0))} оценок`} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card title="Уровни врачей" sub="Чем выше уровень — тем больше доля врача">
          <div className="grid grid-cols-2 gap-2">
            {data.tiers.map((t: { name: string; icon: string; color: string; percent: number; n: number }) => (
              <div key={t.name} className="rounded-2xl p-3 border border-white/10 bg-white/[0.04] medal-shine">
                <div className="text-2xl">{t.icon}</div>
                <div className="font-black mt-1" style={{ color: t.color }}>{`${t.name} · ${t.percent}%`}</div>
                <div className="text-xs text-white/55">{`врачей: ${t.n}`}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Деньги врачей за 30 дней" sub="Выручка их визитов делится между врачом и компанией">
          <div className="flex justify-center">
            <Donut size={180} items={[{ name: 'Врачам', value: pay, color: '#7CB842' }, { name: 'Компании', value: rev - pay, color: '#FACC15' }]}
              center={<div className="font-black text-xl money">{money(rev)}</div>} sub="выручка визитов" />
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs"><span>{`🟢 Врачам ${pct(pay / rev)}`}</span><span>{`🟡 Компании ${pct(1 - pay / rev)}`}</span></div>
        </Card>
        <Card title="Рост команды" sub="Новые врачи по месяцам">
          <Bars data={data.growth.map((g: { m: string; n: number }) => ({ label: monthShort(g.m), full: monthLong(g.m), n: g.n }))} series={[{ key: 'n', name: 'Новые врачи', color: '#7DD3FC' }]} fmt={num} height={190} legend={false} />
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1"><Search value={q} onChange={setQ} placeholder="Имя, специализация или район" /></div>
        <Segmented value={sort} onChange={setSort} items={[{ k: 'rev', label: 'По выручке' }, { k: 'n', label: 'По визитам' }, { k: 'rating', label: 'По рейтингу' }, { k: 'new', label: 'Новые' }]} />
        <button onClick={() => setOnline(!online)} className={`btn px-4 py-2.5 text-sm ${online ? 'bg-green-500 text-white' : 'bg-white/[0.06] border border-white/10'}`}>🟢 Только на линии</button>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {rows.map((v) => (
          <button key={v.id} onClick={() => nav(`/vets/${v.id}`)} className="card3d p-4 text-left hover:border-green-400/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar src={v.photo_url} name={v.name} size={56} ring={v.tier.color} />
                {v.is_available && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-[#2A1D14] live-pulse" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black truncate">{v.name}</div>
                <div className="text-[11px] text-white/55 truncate">{`${v.specialization} · ${v.experience_years} лет`}</div>
                <div className="flex items-center gap-1.5 mt-0.5"><Stars value={v.rating} size={11} /><span className="text-[11px] text-white/60">{`${v.rating.toFixed(2)} · ${num(v.reviews)}`}</span></div>
              </div>
              <span className="chip flex-shrink-0" style={{ color: v.tier.color, background: `${v.tier.color}22`, border: `1px solid ${v.tier.color}55` }}>{`${v.tier.icon} ${v.tier.percent}%`}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <MiniV label="Визитов" value={num(v.n30)} />
              <MiniV label="Выручка" value={money(v.rev30)} />
              <MiniV label="Врачу" value={money(v.pay30)} />
            </div>
            <div className="text-[11px] text-white/45 mt-2 truncate">{`📍 ${v.district ?? 'Москва'} · ${v.transport} · ${v.accept_min ? `принимает заказ за ${dec(v.accept_min)} мин` : '—'}`}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniV({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/20 px-2 py-1.5"><div className="text-[10px] text-white/45 font-bold uppercase">{label}</div><div className="font-black text-sm money">{value}</div></div>;
}

export function VetDetailPage() {
  const { id } = useParams();
  const { data, error } = useCrm(`vets/${id}`);
  const [tab, setTab] = useState<'stats' | 'orders' | 'reviews'>('stats');
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const v = data.vet, s = data.stats;
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="card3d p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <Avatar src={v.photo_url} name={v.name} size={84} ring={s.tier.color} />
        <div className="flex-1 min-w-0">
          <div className="eyebrow">{`В команде с ${dateLong(v.created_at)}`}</div>
          <h1 className="text-2xl md:text-3xl font-black mt-1">{v.name}</h1>
          <div className="text-sm text-white/60 mt-0.5">{`${v.specialization} · стаж ${v.experience_years} лет`}</div>
          <div className="text-xs text-white/50 mt-1">{`📞 ${v.phone} · 📍 ${v.district ?? 'Москва'} · 🚗 ${v.transport ?? '—'}`}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip text-sm" style={{ color: s.tier.color, background: `${s.tier.color}22`, border: `1px solid ${s.tier.color}55` }}>{`${s.tier.icon} ${s.tier.name} · ${s.tier.percent}%`}</span>
          {v.is_available ? <Pill color="#7CB842">🟢 На линии</Pill> : <Pill color="#C99A63">Не на линии</Pill>}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="🚗" tone="sky" label="Визитов всего" value={num(s.total)} sub={`${s.n30} за 30 дней`} />
        <Kpi icon="💰" tone="green" label="Выручка визитов" value={money(s.revenue)} sub={`врачу ${money(s.payout)}`} />
        <Kpi icon="⭐" tone="yellow" label="Рейтинг" value={s.rating.toFixed(2)} sub={`${num(s.reviews)} оценок`} />
        <Kpi icon="👥" tone="purple" label="Клиентов" value={num(s.clients)} sub="уникальных" />
      </div>
      <Segmented value={tab} onChange={setTab} items={[{ k: 'stats', label: '📊 Показатели' }, { k: 'orders', label: '🧾 Визиты' }, { k: 'reviews', label: `💬 Отзывы ${data.reviews.length}` }]} />
      {tab === 'stats' && (
        <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
          <Card className="lg:col-span-2" title="Выручка и выплаты по месяцам">
            <Bars stacked={false} height={240} data={data.months.map((m: { m: string; revenue: number; payout: number; n: number }) => ({ label: monthShort(m.m), full: monthLong(m.m), revenue: m.revenue, payout: m.payout }))}
              series={[{ key: 'revenue', name: 'Выручка', color: '#7CB842' }, { key: 'payout', name: 'Выплата врачу', color: '#FACC15' }]} />
          </Card>
          <Card title="Какие услуги делает">
            <HBars fmt={num} items={data.services.slice(0, 7).map((x: { name: string; icon: string; n: number }, i: number) => ({ label: x.name, icon: x.icon, value: x.n, color: PALETTE[i], right: num(x.n) }))} />
          </Card>
        </div>
      )}
      {tab === 'orders' && (
        <Card pad={false}>
          <div className="divide-y divide-white/5">
            {data.orders.map((o: { id: number; status: string; scheduled_at: string; total_price: number; vet_payout: number; client_rating: number | null; service: string; icon: string; client: string; pet: string; species: string }) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
                <Icon3D emoji={o.icon} size={40} still />
                <div className="min-w-0 flex-1"><div className="font-bold text-sm truncate">{`${o.service} · ${speciesEmoji(o.species)} ${o.pet}`}</div><div className="text-[11px] text-white/50 truncate">{`${o.client} · ${dateShort(o.scheduled_at)}`}</div></div>
                <div className="text-right flex-shrink-0"><div className="font-black text-sm money">{rub(o.total_price)}</div>{o.status === 'completed' ? <div className="text-[11px] text-green-300 money">{`врачу ${rub(o.vet_payout)}`}</div> : <StatusChip status={o.status} />}</div>
              </Link>
            ))}
          </div>
        </Card>
      )}
      {tab === 'reviews' && (
        <div className="grid md:grid-cols-2 gap-3">
          {data.reviews.map((r: { rating: number; text: string; scheduled_at: string; client: string }, i: number) => (
            <div key={i} className="card3d p-4">
              <div className="flex items-center justify-between"><b className="text-sm">{r.client}</b><Stars value={r.rating} /></div>
              <p className="text-sm text-white/80 mt-2">{r.text}</p>
              <div className="text-[11px] text-white/45 mt-2">{dateLong(r.scheduled_at)}</div>
            </div>
          ))}
          {!data.reviews.length && <Stat label="Отзывы" value="Пока нет" />}
        </div>
      )}
    </div>
  );
}
