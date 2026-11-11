import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bars } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Segmented, Search, Pager, Avatar, StatusChip, Stars, Stat, Pill } from '../components/ui';
import { useCrm, money, rub, num, ago, dateLong, dateShort, monthShort, monthLong, speciesEmoji, plural, CATEGORY_ICON } from '../lib/format';

interface C { id: number; name: string; phone: string; email: string | null; telegram_nick: string | null; avatar_url: string | null; created_at: string;
  orders: number; services: number; shop: number; ltv: number; last: string | null; first: string | null; pets_n: number; pets: string | null }

export default function ClientsPage() {
  const nav = useNavigate();
  const [q, setQ] = useState(''); const [qq, setQq] = useState('');
  const [segment, setSegment] = useState('all'); const [sort, setSort] = useState('ltv'); const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => { setQq(q); setPage(1); }, 350); return () => clearTimeout(t); }, [q]);
  const { data, error } = useCrm('clients', { q: qq || undefined, segment: segment === 'all' ? undefined : segment, sort, page });
  if (error) return <ErrorBox />;
  const seg = data?.seg;
  return (
    <div className="space-y-4">
      <PageHead eyebrow="База клиентов" title="Клиенты и их питомцы" sub="Кто вызывает врача, сколько приносит компании и кто давно не возвращался" />
      {seg && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Kpi icon="👥" tone="purple" label="Всего клиентов" value={num(seg.total)} sub={`+${num(seg.new)} за 30 дней`} onClick={() => setSegment('all')} />
          <Kpi icon="💎" tone="yellow" label="VIP (от 30 тыс ₽)" value={num(seg.vip)} sub="самые ценные" onClick={() => setSegment('vip')} />
          <Kpi icon="🔁" tone="green" label="Постоянные" value={num(seg.regular)} sub="3 и больше визитов" onClick={() => setSegment('regular')} />
          <Kpi icon="💤" tone="coffee" label="Давно не были" value={num(seg.sleeping)} sub="больше 90 дней — вернуть" onClick={() => setSegment('sleeping')} />
        </div>
      )}
      {seg && (
        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          <Card className="md:col-span-2" title="Рост базы клиентов" sub="Новые регистрации по месяцам">
            <Bars data={data.growth.map((g: { m: string; n: number }) => ({ label: monthShort(g.m), full: monthLong(g.m), n: g.n }))} series={[{ key: 'n', name: 'Новые клиенты', color: '#A78BFA' }]} fmt={num} height={180} legend={false} />
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <Stat label="Средний LTV" value={rub(seg.avg_ltv)} sub="выручка с клиента" color="#9BCD67" />
            <Stat label="Визитов на клиента" value={String(seg.avg_orders).replace('.', ',')} sub="в среднем" />
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1"><Search value={q} onChange={setQ} placeholder="Имя, телефон, почта или кличка питомца" /></div>
        <Segmented value={segment} onChange={(v) => { setSegment(v); setPage(1); }} items={[
          { k: 'all', label: 'Все' }, { k: 'new', label: 'Новые' }, { k: 'regular', label: 'Постоянные' }, { k: 'vip', label: 'VIP' }, { k: 'sleeping', label: 'Спящие' }, { k: 'noorders', label: 'Без визитов' }]} />
        <select className="input py-2.5 lg:w-52" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="ltv">По выручке</option><option value="orders">По числу визитов</option><option value="last">По последнему визиту</option><option value="new">Сначала новые</option><option value="name">По имени</option>
        </select>
      </div>
      {!data ? <Loader rows={3} /> : (
        <>
          <div className="text-sm text-white/55 money">{`Найдено клиентов: ${num(data.total)}`}</div>
          <Card pad={false}>
            <div className="hidden md:grid grid-cols-[1.4fr_1.4fr_90px_120px_130px] gap-3 px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
              <span>Клиент</span><span>Питомцы</span><span className="text-right">Визитов</span><span className="text-right">Принёс</span><span className="text-right">Последний визит</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.rows.map((c: C) => (
                <button key={c.id} onClick={() => nav(`/clients/${c.id}`)} className="w-full text-left px-3 md:px-4 py-3 hover:bg-white/[0.04] grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1.4fr_90px_120px_130px] gap-x-3 gap-y-1 items-center">
                  <span className="flex items-center gap-3 min-w-0">
                    <Avatar src={c.avatar_url} name={c.name} size={42} ring={c.ltv >= 30000 ? '#FACC15' : undefined} />
                    <span className="min-w-0">
                      <span className="block font-bold text-sm truncate">{c.ltv >= 30000 ? `${c.name} 💎` : c.name}</span>
                      <span className="block text-[11px] text-white/50 truncate">{`${c.phone} · с нами с ${dateShort(c.created_at)}`}</span>
                    </span>
                  </span>
                  <span className="md:hidden text-right"><span className="block font-black text-sm money">{money(c.ltv)}</span><span className="text-[11px] text-white/50">{`визитов: ${c.orders}`}</span></span>
                  <span className="hidden md:flex flex-wrap gap-1 min-w-0">
                    {(c.pets ?? '').split(',').filter(Boolean).map((p, i) => { const [n, s] = p.split(':'); return <Pill key={i} color="#C99A63">{speciesEmoji(s)} {n}</Pill>; })}
                    {c.pets_n > 4 && <Pill color="#C99A63">+{c.pets_n - 4}</Pill>}
                  </span>
                  <span className="hidden md:block text-right font-bold money">{c.orders}</span>
                  <span className="hidden md:block text-right font-black money">{money(c.ltv)}</span>
                  <span className="hidden md:block text-right text-xs text-white/55">{ago(c.last)}</span>
                  <span className="md:hidden col-span-2 flex flex-wrap gap-1 pl-[54px]">
                    {(c.pets ?? '').split(',').filter(Boolean).slice(0, 3).map((p, i) => { const [n, s] = p.split(':'); return <Pill key={i} color="#C99A63">{speciesEmoji(s)} {n}</Pill>; })}
                  </span>
                </button>
              ))}
              {!data.rows.length && <div className="p-8 text-center text-white/50">Никого не нашли</div>}
            </div>
          </Card>
          <Pager page={data.page} pages={data.pages} onPage={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </>
      )}
    </div>
  );
}

export function ClientDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<'pets' | 'visits' | 'shop' | 'more'>('pets');
  const { data, error } = useCrm(`clients/${id}`);
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const c = data.client;
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="card3d p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <Avatar src={c.avatar_url} name={c.name} size={76} ring={c.ltv >= 30000 ? '#FACC15' : '#7CB842'} />
        <div className="flex-1 min-w-0">
          <div className="eyebrow">{`Клиент №${c.id} · с нами с ${dateLong(c.created_at)}`}</div>
          <h1 className="text-2xl md:text-3xl font-black mt-1">{c.ltv >= 30000 ? `${c.name} 💎` : c.name}</h1>
          <div className="text-sm text-white/60 mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>{`📞 ${c.phone}`}</span>{c.email && <span>{`✉️ ${c.email}`}</span>}{c.telegram_nick && <span>{`✈️ ${c.telegram_nick}`}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.orders >= 3 && <Pill color="#7CB842">🔁 Постоянный</Pill>}
          {c.last && new Date(c.last).getTime() < Date.now() - 90 * 864e5 && <Pill color="#D9895F">💤 Давно не был</Pill>}
          {c.ltv >= 30000 && <Pill color="#FACC15">💎 VIP</Pill>}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="💰" tone="green" label="Принёс компании" value={money(c.ltv)} sub={`визиты ${money(c.services)} · магазин ${money(c.shop)}`} />
        <Kpi icon="🩺" tone="sky" label="Визитов врача" value={num(c.orders)} sub={c.last ? `последний ${ago(c.last)}` : 'ещё не было'} />
        <Kpi icon="🐾" tone="teal" label="Питомцев" value={num(data.pets.length)} sub={data.pets.map((p: { name: string }) => p.name).slice(0, 3).join(', ')} />
        <Kpi icon="🎁" tone="yellow" label="Бонусов начислено" value={num(c.bonus)} sub={c.avg_rating ? `ставит врачам ★ ${c.avg_rating.toFixed(1)}` : 'кешбэк 10%'} />
      </div>
      <Segmented value={tab} onChange={setTab} items={[
        { k: 'pets', label: `🐾 Питомцы ${data.pets.length}` }, { k: 'visits', label: `🩺 Визиты ${data.orders.length}` }, { k: 'shop', label: `🛍️ Покупки ${data.shop.length}` }, { k: 'more', label: '❤️ Ещё' }]} />

      {tab === 'pets' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {data.pets.map((p: { id: number; name: string; species: string; breed: string; age_years: number; weight_kg: string; sex: string; photo_url: string | null; passport_id: string | null; visits: number; last_visit: string | null; current_concern: string | null; diagnoses: string | null; notes: string | null }) => (
            <div key={p.id} className="card3d p-4">
              <div className="flex items-center gap-3">
                {p.photo_url ? <img src={p.photo_url} alt="" className="w-16 h-16 rounded-2xl object-cover" /> :
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl tile3d" style={{ background: 'linear-gradient(145deg,#E7B985,#5C3F28)' }}>{speciesEmoji(p.species)}</span>}
                <div className="min-w-0">
                  <div className="font-black text-lg">{p.name}</div>
                  <div className="text-xs text-white/55">{`${p.species} · ${p.breed}`}</div>
                  <div className="text-xs text-white/55">{[`${p.age_years} ${plural(p.age_years, 'год', 'года', 'лет')}`, `${p.weight_kg} кг`, p.sex ? (p.sex === 'м' ? 'мальчик' : 'девочка') : ''].filter(Boolean).join(' · ')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="rounded-xl bg-white/[0.04] p-2"><div className="text-[10px] text-white/45 uppercase font-bold">Визитов</div><div className="font-black">{p.visits}</div></div>
                <div className="rounded-xl bg-white/[0.04] p-2"><div className="text-[10px] text-white/45 uppercase font-bold">Последний</div><div className="font-bold text-sm">{p.last_visit ? dateShort(p.last_visit) : '—'}</div></div>
              </div>
              {(p.current_concern || p.diagnoses || p.notes) && <div className="text-xs text-white/65 mt-3 leading-relaxed">{p.diagnoses || p.current_concern || p.notes}</div>}
              {p.passport_id && <div className="text-[11px] text-white/45 mt-2 font-mono">{`Ветпаспорт ${p.passport_id}`}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'visits' && (
        <Card pad={false}>
          <div className="divide-y divide-white/5">
            {data.orders.map((o: { id: number; status: string; scheduled_at: string; total_price: number; bonus_used: number; client_rating: number | null; client_review: string | null; service: string; icon: string; pet: string; vet: string | null }) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
                <span className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">{o.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{`${o.service} · ${o.pet}`}</div>
                  <div className="text-[11px] text-white/50 truncate">{`${dateShort(o.scheduled_at)} · ${o.vet ?? '—'}`}</div>
                  {o.client_review && <div className="text-[11px] text-yellow-100/70 truncate">{o.client_review}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-sm money">{rub(o.total_price + (o.bonus_used || 0))}</div>
                  {o.client_rating ? <Stars value={o.client_rating} size={10} /> : <StatusChip status={o.status} />}
                </div>
              </Link>
            ))}
            {!data.orders.length && <div className="p-6 text-center text-white/50">Визитов пока не было</div>}
          </div>
        </Card>
      )}

      {tab === 'shop' && (
        <Card pad={false}>
          <div className="divide-y divide-white/5">
            {data.shop.map((s: { id: number; title: string; category: string; qty: number; total_rub: number; bonus_used: number; created_at: string }) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">{CATEGORY_ICON[s.category] ?? '📦'}</span>
                <div className="min-w-0 flex-1"><div className="font-bold text-sm truncate">{s.title}</div><div className="text-[11px] text-white/50">{[dateShort(s.created_at), `${s.qty} шт.`, s.bonus_used ? `бонусами ${rub(s.bonus_used)}` : ''].filter(Boolean).join(' · ')}</div></div>
                <div className="font-black text-sm money">{rub(s.total_rub + s.bonus_used)}</div>
              </div>
            ))}
            {!data.shop.length && <div className="p-6 text-center text-white/50">Покупок в магазине пока нет</div>}
          </div>
        </Card>
      )}

      {tab === 'more' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Помощь животным" sub="Пожертвования клиента">
            {data.donations.length ? data.donations.map((d: { amount: number; created_at: string; name: string }, i: number) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-t border-white/5 first:border-0"><span>{`❤️ ${d.name} · ${dateShort(d.created_at)}`}</span><b className="money">{rub(d.amount)}</b></div>
            )) : <div className="text-sm text-white/50">Пока без пожертвований</div>}
          </Card>
          <Card title="Привёл друзей" sub="Реферальная программа: +500 бонусов за друга">
            {data.referrals.length ? data.referrals.map((r: { id: number; name: string; created_at: string }) => (
              <Link key={r.id} to={`/clients/${r.id}`} className="flex justify-between text-sm py-1.5 border-t border-white/5 first:border-0"><span>{`👋 ${r.name}`}</span><span className="text-white/50">{dateShort(r.created_at)}</span></Link>
            )) : <div className="text-sm text-white/50">Пока никого не пригласил</div>}
          </Card>
        </div>
      )}
    </div>
  );
}
