import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, PageHead, Loader, ErrorBox, Segmented, Search, Pager, StatusChip, Stars, Avatar, Stat, Row } from '../components/ui';
import { useCrm, money, rub, num, when, dateLong, time, speciesEmoji } from '../lib/format';

interface O { id: number; status: string; scheduled_at: string; total_price: number; bonus_used: number; vet_payout: number; client_rating: number | null; address: string;
  service: string; icon: string; client_id: number; client: string; pet: string; species: string; vet: string | null; vet_photo: string | null }

export default function OrdersPage() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const status = sp.get('status') || 'all';
  const period = sp.get('period') || 'all';
  const [q, setQ] = useState('');
  const [qq, setQq] = useState('');
  const [page, setPage] = useState(1);
  const [service, setService] = useState('');
  const [vet, setVet] = useState('');
  useEffect(() => { const t = setTimeout(() => { setQq(q); setPage(1); }, 350); return () => clearTimeout(t); }, [q]);
  const { data, error } = useCrm('orders', { status, period, q: qq || undefined, page, service: service || undefined, vet: vet || undefined });
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n); setPage(1); };
  if (error) return <ErrorBox />;
  const cnt = (s: string) => data?.counts.find((c: { status: string; n: number }) => c.status === s)?.n ?? 0;
  const activeN = ['pending', 'confirmed', 'on_the_way', 'arrived', 'in_progress'].reduce((a, s) => a + cnt(s), 0);
  return (
    <div className="space-y-4">
      <PageHead eyebrow="Все заказы компании" title="Заказы" sub={data ? <span className="money">{`Заказов за всё время: ${num(data.counts.reduce((a: number, c: { n: number }) => a + c.n, 0))} · сейчас в работе: ${activeN}`}</span> : '…'} />
      <div className="flex flex-col lg:flex-row gap-2">
        <Segmented value={status} onChange={(v) => set('status', v)} items={[
          { k: 'all', label: 'Все' }, { k: 'active', label: `🟢 В работе ${activeN || ''}` }, { k: 'completed', label: 'Выполнены' }, { k: 'cancelled', label: 'Отменены' }]} />
        <Segmented value={period} onChange={(v) => set('period', v)} items={[{ k: 'all', label: 'Всё время' }, { k: 'today', label: 'Сегодня' }, { k: '7d', label: '7 дней' }, { k: '30d', label: '30 дней' }]} />
      </div>
      <div className="grid md:grid-cols-[1fr_220px_220px] gap-2">
        <Search value={q} onChange={setQ} placeholder="Номер заказа, клиент, питомец, врач, адрес" />
        <select className="input py-2.5" value={service} onChange={(e) => { setService(e.target.value); setPage(1); }}>
          <option value="">Все услуги</option>{data?.filters.services.map((s: { id: number; name: string; icon: string }) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <select className="input py-2.5" value={vet} onChange={(e) => { setVet(e.target.value); setPage(1); }}>
          <option value="">Все врачи</option>{data?.filters.vets.map((v: { id: number; name: string }) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
      {!data ? <Loader rows={3} /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <Stat label="Найдено" value={num(data.total)} sub="заказов" />
            <Stat label="Выручка" value={money(data.revenue)} sub="по выполненным" color="#9BCD67" />
            <Stat label="Средний чек" value={rub(data.total ? data.revenue / Math.max(1, data.total) : 0)} sub="по выборке" />
          </div>
          <Card pad={false}>
            <div className="hidden md:grid grid-cols-[70px_1.3fr_1.2fr_1.2fr_130px_110px] gap-3 px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
              <span>№</span><span>Услуга и питомец</span><span>Клиент</span><span>Врач</span><span>Статус</span><span className="text-right">Сумма</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.rows.map((o: O) => (
                <button key={o.id} onClick={() => nav(`/orders/${o.id}`)} className="w-full text-left px-3 md:px-4 py-3 hover:bg-white/[0.04] grid grid-cols-[1fr_auto] md:grid-cols-[70px_1.3fr_1.2fr_1.2fr_130px_110px] gap-x-3 gap-y-1 items-center">
                  <span className="hidden md:block text-xs text-white/45 font-mono">#{o.id}</span>
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">{o.icon}</span>
                    <span className="min-w-0">
                      <span className="block font-bold text-sm truncate">{o.service}</span>
                      <span className="block text-[11px] text-white/50 truncate">{`${speciesEmoji(o.species)} ${o.pet} · ${when(o.scheduled_at)}`}</span>
                    </span>
                  </span>
                  <span className="md:hidden text-right"><span className="block font-black text-sm money">{rub(o.total_price + (o.bonus_used || 0))}</span><StatusChip status={o.status} /></span>
                  <span className="hidden md:block text-sm truncate">{o.client}</span>
                  <span className="hidden md:flex items-center gap-2 min-w-0"><Avatar src={o.vet_photo} name={o.vet ?? '?'} size={28} /><span className="text-sm truncate">{o.vet ?? '—'}</span></span>
                  <span className="hidden md:block"><StatusChip status={o.status} /></span>
                  <span className="hidden md:block text-right font-black money">{rub(o.total_price + (o.bonus_used || 0))}</span>
                  <span className="md:hidden col-span-2 text-[11px] text-white/45 truncate pl-12">{`#${o.id} · ${o.client} → ${o.vet ?? 'ищем врача'}`}</span>
                </button>
              ))}
              {!data.rows.length && <div className="p-8 text-center text-white/50">Ничего не найдено</div>}
            </div>
          </Card>
          <Pager page={data.page} pages={data.pages} onPage={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { data, error } = useCrm(`orders/${id}`);
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const o = data;
  const total = o.total_price + (o.bonus_used || 0);
  return (
    <div className="space-y-4 md:space-y-5">
      <PageHead eyebrow={`Заказ №${o.id} · ${dateLong(o.scheduled_at)}, ${time(o.scheduled_at)}`} title={`${o.icon} ${o.service}`} right={<StatusChip status={o.status} />} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Stat label="Сумма визита" value={rub(total)} sub={o.bonus_used ? `из них бонусами ${rub(o.bonus_used)}` : 'оплачено картой'} />
        <Stat label="Врачу" value={rub(o.vet_payout || 0)} sub={o.vet_percent ? `${o.vet_percent}% по уровню врача` : '—'} />
        <Stat label="Компании" value={rub(o.margin)} sub="до налогов и офиса" color="#9BCD67" />
        <Stat label="Оценка клиента" value={o.client_rating ? <Stars value={o.client_rating} size={16} /> : '—'} sub={o.client_rating ? `${o.client_rating} из 5` : 'ещё не оценил'} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card title="Клиент и питомец">
          <Row onClick={undefined}><Avatar name={o.client} size={44} /><div className="min-w-0"><Link to={`/clients/${o.client_id}`} className="font-bold hover:text-green-300">{o.client}</Link><div className="text-xs text-white/50">{[o.client_phone, o.client_email].filter(Boolean).join(' · ')}</div></div></Row>
          <div className="mt-2 rounded-2xl bg-white/[0.04] p-3 text-sm space-y-1">
            <div className="font-bold">{`${speciesEmoji(o.species)} ${o.pet} · ${o.breed}`}</div>
            <div className="text-white/60 text-xs">{[`${o.age_years} лет`, `${o.weight_kg} кг`, o.passport_id ? `ветпаспорт ${o.passport_id}` : ''].filter(Boolean).join(' · ')}</div>
          </div>
          <div className="mt-3 text-sm"><div className="text-[11px] uppercase font-bold tracking-wider text-white/45">Адрес</div><div className="mt-0.5">{o.address}</div></div>
          {o.notes && <div className="mt-3 text-sm"><div className="text-[11px] uppercase font-bold tracking-wider text-white/45">Жалоба</div><div className="mt-0.5 text-white/80">{o.notes}</div></div>}
        </Card>
        <Card title="Врач">
          {o.vet ? (
            <>
              <Row><Avatar src={o.vet_photo} name={o.vet} size={52} /><div className="min-w-0"><Link to={`/vets/${o.vet_id}`} className="font-bold hover:text-green-300">{o.vet}</Link><div className="text-xs text-white/50">{o.specialization}</div><div className="text-xs text-white/50">{o.vet_phone}</div></div></Row>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="text-[10px] text-white/45 uppercase font-bold">Принял заказ</div><div className="font-bold">{o.accepted_at ? time(o.accepted_at) : '—'}</div></div>
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="text-[10px] text-white/45 uppercase font-bold">Завершил</div><div className="font-bold">{o.completed_at ? time(o.completed_at) : '—'}</div></div>
              </div>
            </>
          ) : <div className="text-white/55 text-sm">Врач ещё не назначен — заказ в ленте у врачей рядом.</div>}
        </Card>
        <Card title="Итог визита">
          {o.vet_conclusion ? <p className="text-sm text-white/80 leading-relaxed">{o.vet_conclusion}</p> : <p className="text-sm text-white/50">Заключение появится после приёма.</p>}
          {o.client_review && <div className="mt-3 rounded-2xl bg-yellow-400/10 border border-yellow-300/20 p-3 text-sm">«{o.client_review}»</div>}
          {o.history?.length > 0 && (
            <div className="mt-4 space-y-2">
              {o.history.map((h: { status: string; created_at: string; comment?: string }, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs"><StatusChip status={h.status} /><span className="text-white/50">{time(h.created_at)}</span></div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div className="text-center"><Link to="/orders" className="btn-ghost text-sm">← Все заказы</Link></div>
    </div>
  );
}

export { money };
