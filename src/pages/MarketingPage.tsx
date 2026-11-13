import { useState } from 'react';
import { Bars, Donut, Funnel } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox } from '../components/ui';
import { useCrm, money, rub, num, pct, monthShort, monthLong, PALETTE } from '../lib/format';
import Icon3D from '../components/Icon3D';

interface Ch { channel: string; icon: string; spend: number; impressions: number; clicks: number; leads: number; clients: number; revenue: number }

export default function MarketingPage() {
  const [month, setMonth] = useState<string | undefined>();
  const { data, error } = useCrm('marketing', month ? { month } : undefined);
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={4} />;
  const ch: Ch[] = data.channels;
  const t = ch.reduce((a, c) => ({ spend: a.spend + c.spend, impressions: a.impressions + c.impressions, clicks: a.clicks + c.clicks, leads: a.leads + c.leads, clients: a.clients + c.clients, revenue: a.revenue + c.revenue }),
    { spend: 0, impressions: 0, clicks: 0, leads: 0, clients: 0, revenue: 0 });
  const romi = t.spend ? (t.revenue - t.spend) / t.spend : 0;
  const best = [...ch].sort((a, b) => a.spend / Math.max(1, a.clients) - b.spend / Math.max(1, b.clients));
  return (
    <div className="space-y-5">
      <PageHead eyebrow="Маркетинг и реклама" title="Откуда приходят клиенты" sub="Бюджет, охваты, заявки, новые клиенты и окупаемость по каждому каналу" />
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {(data.months as string[]).map((m) => (
          <button key={m} onClick={() => setMonth(m)} className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold border ${m === data.month ? 'bg-white text-[#1E140D] border-white' : 'border-white/15 text-white/65'}`}>{monthShort(m)}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi icon="📣" tone="red" label={`Бюджет · ${monthShort(data.month)}`} value={money(t.spend)} sub={`${ch.length} каналов`} />
        <Kpi icon="🙋" tone="green" label="Новых клиентов" value={num(t.clients)} sub={`из ${num(t.leads)} заявок`} />
        <Kpi icon="🎯" tone="sky" label="Цена клиента" value={rub(t.clients ? t.spend / t.clients : 0)} sub={`заявка ${rub(t.leads ? t.spend / t.leads : 0)}`} />
        <Kpi icon="💹" tone="yellow" label="Окупаемость (ROMI)" value={pct(romi)} sub="выручка клиентов за год" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 md:gap-5">
        <Card className="lg:col-span-3" title="Воронка" sub={`${monthLong(data.month)}: от показа рекламы до первого визита`}>
          <Funnel steps={[
            { label: 'Показы рекламы', value: t.impressions, color: '#A78BFA' },
            { label: 'Переходы', value: t.clicks, color: '#7DD3FC' },
            { label: 'Заявки и звонки', value: t.leads, color: '#FACC15' },
            { label: 'Новые клиенты', value: t.clients, color: '#7CB842' },
          ]} />
        </Card>
        <Card className="lg:col-span-2" title="Куда уходит бюджет">
          <div className="flex justify-center">
            <Donut size={200} items={ch.map((c, i) => ({ name: c.channel, value: c.spend, color: PALETTE[i] }))} center={<div className="font-black text-xl money">{money(t.spend)}</div>} sub="за месяц" />
          </div>
          <div className="grid grid-cols-1 gap-1 mt-4">
            {ch.map((c, i) => (
              <div key={c.channel} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i] }} /><span className="text-white/70 flex-1 truncate">{`${c.icon} ${c.channel}`}</span><span className="font-bold">{pct(c.spend / t.spend)}</span></div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Эффективность каналов" sub="Отсортировано по цене клиента — сверху самые выгодные">
        <div className="space-y-2">
          {best.map((c) => {
            const cac = c.clients ? c.spend / c.clients : 0;
            const r = c.spend ? (c.revenue - c.spend) / c.spend : 0;
            return (
              <div key={c.channel} className="rounded-2xl bg-white/[0.035] border border-white/10 p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <Icon3D emoji={c.icon} size={44} still />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold leading-snug">{c.channel}</div>
                      <div className="flex-shrink-0 text-right leading-tight">
                        <div className="font-black text-lg money">{num(c.clients)}</div>
                        <div className="text-[10px] text-white/50">клиентов</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-white/50">
                      <span className="whitespace-nowrap">{`👁 ${num(c.impressions)} показов`}</span>
                      <span className="whitespace-nowrap">{`👆 ${num(c.clicks)} переходов`}</span>
                      <span className="whitespace-nowrap">{`✍️ ${num(c.leads)} заявок`}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  <Mini label="Бюджет" value={money(c.spend)} />
                  <Mini label="Цена клиента" value={rub(cac)} good={cac < (t.spend / t.clients)} />
                  <Mini label="Конверсия заявки" value={pct(c.leads ? c.clients / c.leads : 0)} />
                  <Mini label="Окупаемость" value={pct(r)} good={r > romi} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Бюджет и клиенты по месяцам" sub="Доля маркетинга в выручке снизилась с 17% до 7% — клиенты приходят по рекомендациям">
        <Bars data={(data.byMonth as { m: string; spend: number; clients: number }[]).map((m) => ({ label: monthShort(m.m), full: monthLong(m.m), spend: m.spend, clients: m.clients }))}
          series={[{ key: 'spend', name: 'Бюджет', color: '#D9895F' }]} height={240} />
      </Card>
    </div>
  );
}

function Mini({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-black/20 px-2.5 py-2">
      <div className="text-[10px] text-white/45 font-bold uppercase tracking-wide leading-tight">{label}</div>
      <div className={`font-black text-sm mt-0.5 money ${good === undefined ? '' : good ? 'text-green-300' : 'text-white'}`}>{value}</div>
    </div>
  );
}
