import { Link } from 'react-router-dom';
import { Bars, Donut } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox } from '../components/ui';
import { useCrm, money, rub, num, pct, monthShort, monthLong, dateShort, time, PALETTE, CATEGORY_ICON } from '../lib/format';

interface Pr { id: number; title: string; brand: string; category: string; image: string | null; price: number; qty: number; n: number; revenue: number; bonus: number }

export default function ShopPage() {
  const { data, error } = useCrm('shop');
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={3} />;
  const k = data.kpi;
  const products: Pr[] = data.products;
  const cats: { category: string; revenue: number; qty: number }[] = data.categories;
  return (
    <div className="space-y-4 md:space-y-5">
      <PageHead eyebrow="Интернет-магазин" title="Магазин ВетДом" sub="Корма собственного производства «ВетДом Натурал», препараты, амуниция и игрушки — продажи за 30 дней" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="🛍️" tone="purple" label="Продажи · 30 дней" value={money(k.revenue)} sub={`${num(k.orders)} заказов`} />
        <Kpi icon="🧺" tone="amber" label="Средний чек" value={rub(k.avg)} sub={`${num(k.buyers)} покупателей`} />
        <Kpi icon="🎁" tone="yellow" label="Оплачено бонусами" value={money(k.bonus)} sub={`${pct(k.revenue ? k.bonus / k.revenue : 0, 1)} от продаж`} />
        <Kpi icon="📦" tone="teal" label="Товаров в каталоге" value={num(k.sku)} sub="6 категорий" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2" title="Продажи по месяцам" sub="Магазин растёт вместе с базой клиентов">
          <Bars data={data.months.map((m: { m: string; revenue: number; bonus: number }) => ({ label: monthShort(m.m), full: monthLong(m.m), paid: m.revenue - m.bonus, bonus: m.bonus }))}
            series={[{ key: 'paid', name: 'Оплачено деньгами', color: '#A78BFA' }, { key: 'bonus', name: 'Бонусами', color: '#FACC15' }]} height={240} />
        </Card>
        <Card title="По категориям">
          <div className="flex justify-center"><Donut size={180} items={cats.map((c, i) => ({ name: `${CATEGORY_ICON[c.category] ?? ''} ${c.category}`, value: c.revenue, color: PALETTE[i] }))} center={<div className="font-black text-xl money">{money(k.revenue)}</div>} sub="30 дней" /></div>
          <div className="space-y-1.5 mt-4">
            {cats.map((c, i) => (
              <div key={c.category} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i] }} /><span className="text-white/75 flex-1">{`${CATEGORY_ICON[c.category] ?? ''} ${c.category}`}</span><span className="text-white/50">{`${num(c.qty)} шт.`}</span><b className="w-20 text-right money">{money(c.revenue)}</b></div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Хиты продаж" sub="Топ товаров за 30 дней">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {products.slice(0, 12).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.035] border border-white/10 p-2.5">
              <span className="w-7 text-center font-black text-white/40">{i + 1}</span>
              {p.image ? <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-white" loading="lazy" /> :
                <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl tile3d" style={{ background: 'linear-gradient(145deg,#8BD14E,#2F5119)' }}>{CATEGORY_ICON[p.category] ?? '📦'}</span>}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[13px] leading-tight line-clamp-2">{p.title}</div>
                <div className="text-[11px] text-white/50 mt-0.5 money">{`${num(p.qty)} шт. · ${money(p.revenue)}`}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Последние покупки" pad={false}>
        <div className="divide-y divide-white/5">
          {data.recent.map((r: { id: number; title: string; qty: number; total_rub: number; bonus_used: number; created_at: string; user_id: number; name: string }) => (
            <Link key={r.id} to={`/clients/${r.user_id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
              <span className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">🛍️</span>
              <div className="min-w-0 flex-1"><div className="font-bold text-sm truncate">{r.title}</div><div className="text-[11px] text-white/50 truncate">{`${r.name} · ${dateShort(r.created_at)} ${time(r.created_at)} · ${r.qty} шт.`}</div></div>
              <div className="text-right flex-shrink-0"><div className="font-black text-sm money">{rub(r.total_rub + r.bonus_used)}</div>{r.bonus_used > 0 && <div className="text-[10px] text-yellow-300 money">{`бонусами ${rub(r.bonus_used)}`}</div>}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
