import { Link } from 'react-router-dom';
import Tile3D from './Tile3D';
import { Loader, ErrorBox, StatusChip } from './ui';
import { Spark } from './Charts';
import { useCrm, money, num, pct, delta, monthLong, monthShort, time, speciesEmoji, plural } from '../lib/format';
import Icon3D from './Icon3D';

// Главный экран мобильного приложения CRM: сочная карточка выручки и 3D-плитки всех разделов
export default function MobileHome() {
  const { data, error } = useCrm('summary');
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const k = data.kpi;
  const d = delta(k.revenue_mtd, k.revenue_prev_same);
  const months = data.months as { revenue: number; profit: number }[];
  return (
    <div className="space-y-4">
      <Link to="/summary" className="hero3d relative block overflow-hidden rounded-[28px] p-5" style={{ background: 'linear-gradient(145deg, #8BD14E 0%, #5E9E2C 45%, #2F5119 100%)' }}>
        <span className="tile3d-gloss" />
        <span className="tile-sweep" />
        <Icon3D emoji="💰" tone="yellow" size={64} pulse className="!absolute z-[2] right-4 top-4" />
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{`Выручка · ${monthLong(new Date().toISOString().slice(0, 7))}`}</div>
          <div className="text-[38px] font-black leading-none mt-2 money" style={{ textShadow: '0 2px 8px rgba(0,0,0,.35)' }}>{money(k.revenue_mtd)}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="chip bg-black/25 text-white money">{`${d >= 0 ? '▲' : '▼'} ${pct(Math.abs(d))} к прошлому месяцу`}</span>
          </div>
          <div className="flex items-end justify-between mt-4 gap-3">
            <div>
              <div className="text-[11px] text-white/75">Прогноз на месяц</div>
              <div className="font-black text-xl money">{money(k.revenue_forecast)}</div>
            </div>
            <Spark values={months.slice(-8, -1).map((m) => m.revenue)} color="#ffffff" width={120} height={40} />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-2">
        <Chip3D icon="📈" label={`Прибыль ${monthShort(k.last_month)}`} value={money(k.profit_last)} to="/finance" />
        <Chip3D icon="🧾" label="Визитов сегодня" value={num(k.orders_today)} to="/orders?period=today" />
        <Chip3D icon="🟢" label="Врачей на линии" value={`${k.vets_online} из ${k.vets_total}`} to="/vets" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile3D wide icon="📊" tone="yellow" label="Сводка и графики" sub="выручка, прибыль, план месяца" to="/summary" />
        <Tile3D icon="💰" tone="green" label="Финансы и счета" sub={`прибыль ${pct(k.margin_last)}`} to="/finance" />
        <Tile3D icon="📈" tone="purple" label="Юнит-экономика" sub="CAC, LTV, когорты" to="/unit" />
        <Tile3D icon="🧾" tone="sky" dot label="Заказы" sub={`${num(k.orders_mtd)} за месяц`} to="/orders" badge={k.active_now} />
        <Tile3D icon="👥" tone="red" label="Клиенты" sub={`${num(k.clients_total)} в базе`} to="/clients" />
        <Tile3D icon="🐾" tone="teal" label="Питомцы" sub={`${num(k.pets_total)} животных`} to="/pets" />
        <Tile3D icon="🩺" tone="amber" label="Ветеринары" sub={`★ ${k.rating30.toFixed(2)}`} to="/vets" />
        <Tile3D icon="📣" tone="coffee" label="Маркетинг" sub="реклама и каналы" to="/marketing" />
        <Tile3D icon="💉" tone="green" label="Услуги" sub="13 направлений" to="/services" />
        <Tile3D wide icon="🛍️" tone="purple" label="Магазин «ВетДом»" sub="корма, аптека, игрушки" to="/shop" />
      </div>

      <section className="card3d p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black">Прямо сейчас</h2>
          <span className="text-[11px] font-bold text-green-300 money">{`В работе: ${k.active_now}`}</span>
        </div>
        {data.live.slice(0, 4).map((o: { id: number; status: string; scheduled_at: string; service: string; icon: string; pet: string; species: string; vet: string }) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-0">
            <Icon3D emoji={o.icon} size={40} still />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{`${o.service} · ${speciesEmoji(o.species)} ${o.pet}`}</div>
              <div className="text-[11px] text-white/50 truncate">{`${o.vet ?? 'ищем врача'} · ${time(o.scheduled_at)}`}</div>
            </div>
            <StatusChip status={o.status} />
          </Link>
        ))}
      </section>
    </div>
  );
}

function Chip3D({ icon, label, value, to }: { icon: string; label: string; value: string; to: string }) {
  return (
    <Link to={to} className="glass3d rounded-2xl bg-white/[0.06] border border-white/10 p-2.5 min-w-0">
      <Icon3D emoji={icon} tone="cream" size={34} />
      <div className="font-black text-[15px] mt-1.5 leading-tight money">{value}</div>
      <div className="text-[10px] text-white/55 leading-tight mt-0.5">{label}</div>
    </Link>
  );
}
