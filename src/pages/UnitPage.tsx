import { Bars, Cohorts, HBars } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Stat } from '../components/ui';
import { useCrm, money, rub, pct, monthLong, num, dec } from '../lib/format';
import { monthRows } from './DashboardPage';

// Показатели, которые спрашивает инвестор: сколько зарабатываем с визита, сколько стоит клиент и сколько он приносит
export default function UnitPage() {
  const { data, error } = useCrm('unit');
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={4} />;
  const pv = data.perVisit;
  const steps = [
    { label: 'Средний чек визита', value: pv.check, color: '#7CB842', icon: '🧾' },
    { label: 'Доля врача (55–70%)', value: -pv.vet, color: '#D9895F', icon: '🩺' },
    { label: 'Налог УСН 6%', value: -pv.tax, color: '#C99A63', icon: '🏛️' },
    { label: 'Эквайринг 2,1%', value: -pv.acquiring, color: '#7DD3FC', icon: '💳' },
    { label: 'Препараты и расходники', value: -pv.meds, color: '#A78BFA', icon: '💊' },
  ];
  const months = data.months.slice(0, -1);
  return (
    <div className="space-y-5">
      <PageHead eyebrow={`Для инвестора · данные за ${monthLong(data.month).toLowerCase()}`} title="Юнит-экономика"
        sub="Сколько компания зарабатывает с одного визита, сколько стоит привлечь клиента и сколько он приносит за жизнь" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="🚀" tone="green" label="Годовая выручка (run-rate)" value={money(data.run_rate)} sub={`рост ${pct(data.mom_growth, 1)} в месяц`} />
        <Kpi icon="💎" tone="purple" label="LTV / CAC" value={`${dec(data.ltv_cac)}×`} sub="норма для рынка — от 3×" />
        <Kpi icon="🎯" tone="sky" label="Стоимость клиента (CAC)" value={rub(data.cac)} sub={`окупается за ${dec(data.payback_months)} мес`} />
        <Kpi icon="❤️" tone="red" label="Ценность клиента (LTV)" value={rub(data.ltv)} sub="маржа с клиента за год" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <Card title="Экономика одного визита" sub="Из чего складывается маржа компании">
          <div className="space-y-2.5">
            {steps.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base tile3d flex-shrink-0" style={{ background: `linear-gradient(145deg, ${s.color}, ${s.color}88)` }}>{s.icon}</span>
                <span className="flex-1 text-sm text-white/80">{s.label}</span>
                <span className={`font-black money ${s.value < 0 ? 'text-white/80' : 'text-green-300'}`}>{s.value < 0 ? '−' : ''}{rub(Math.abs(s.value))}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-3 mt-1 border-t border-white/10">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base tile3d flex-shrink-0" style={{ background: 'linear-gradient(145deg,#FFE36E,#C98A06)' }}>💰</span>
              <span className="flex-1 font-black">Маржа компании с визита</span>
              <span className="font-black text-xl text-yellow-300 money">{rub(data.contribution)}</span>
            </div>
            <div className="text-xs text-white/50 pl-12">{`${pct(data.contribution_pct, 1)} от чека остаётся компании на офис, маркетинг и прибыль`}</div>
          </div>
        </Card>
        <Card title="Клиенты возвращаются" sub="Повторные визиты — главный источник роста">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <Stat label="Повторные клиенты" value={pct(data.repeat_rate)} sub="сделали 2+ визита" color="#9BCD67" />
            <Stat label="Визитов в год" value={dec(data.visits_year)} sub="на одного клиента" />
            <Stat label="Средняя выручка" value={rub(data.avg_rev)} sub="с клиента за всё время" />
            <Stat label="Рентабельность" value={pct(data.profit_margin, 1)} sub="чистая, прошлый месяц" color="#FACC15" />
          </div>
          <div className="mt-4">
            <HBars fmt={(n) => `${dec(n)}×`} max={5} items={[
              { label: 'LTV / CAC у ВетДом', value: data.ltv_cac, color: '#7CB842', right: `${dec(data.ltv_cac)}×` },
              { label: 'Порог здорового бизнеса', value: 3, color: '#C99A63', right: `${dec(3)}×` },
            ]} />
          </div>
        </Card>
      </div>

      <Card title="Когорты: сколько клиентов возвращается" sub="Строка — месяц первого визита; число — доля клиентов, которые снова вызвали врача через N месяцев">
        <Cohorts rows={data.cohorts} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <Card title="Стоимость привлечения по месяцам" sub="Маркетинг ÷ новые клиенты — падает по мере роста узнаваемости">
          <Bars data={monthRows(months).map((m) => ({ ...m, cac: m.new_clients ? m.marketing / m.new_clients : 0 }))} height={220}
            series={[{ key: 'cac', name: 'CAC, ₽', color: '#7DD3FC' }]} fmt={rub} />
        </Card>
        <Card title="Новые клиенты и визиты" sub="Компания растёт за счёт и новых, и постоянных клиентов">
          <Bars stacked={false} data={monthRows(months)} height={220} fmt={num}
            series={[{ key: 'orders', name: 'Визиты', color: '#7CB842' }, { key: 'new_clients', name: 'Новые клиенты', color: '#A78BFA' }]} />
        </Card>
      </div>

      <Card title="Команда" sub="Ветеринары работают как партнёры, офис — компактный">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <Stat label="Ветеринаров" value={data.team.vets} sub="выездные врачи" color="#9BCD67" />
          <Stat label="Офис" value={data.team.office} sub="операторы, IT, менеджеры" />
          <Stat label="Выручка на врача" value={money(months[months.length - 1].svc / data.team.vets)} sub="в месяц" />
          <Stat label="Город" value="Москва" sub="следующие: СПб, Казань" />
        </div>
      </Card>
    </div>
  );
}
