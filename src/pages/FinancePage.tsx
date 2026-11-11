import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bars, Donut, HBars } from '../components/Charts';
import { Card, Kpi, PageHead, Loader, ErrorBox, Segmented, Stat, Pill } from '../components/ui';
import { useCrm, money, rub, pct, monthShort, monthLong, dateShort, time, PALETTE, useIsMobile, delta } from '../lib/format';
import { Month } from '../lib/api';
import { monthRows } from './DashboardPage';

type Tab = 'pnl' | 'expenses' | 'accounts' | 'tx';
const GROUP_ICON: Record<string, string> = {
  'Выплаты ветеринарам': '🩺', 'Маркетинг и реклама': '📣', 'Зарплаты команды': '👩‍💼', 'Налоги и взносы': '🏛️', 'Себестоимость товаров': '📦',
  'Аренда и офис': '🏢', 'Банк и эквайринг': '💳', 'IT и сервисы': '🖥️', 'Медикаменты и расходники': '💊', 'Прочее': '🧩',
};

export default function FinancePage() {
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get('tab') as Tab) || 'pnl';
  const [month, setMonth] = useState<string | undefined>();
  const { data, error } = useCrm('finance', month ? { month } : undefined);
  const mobile = useIsMobile();
  const groupColors = useMemo(() => {
    const m: Record<string, string> = {};
    Object.keys(GROUP_ICON).forEach((g, i) => { m[g] = PALETTE[i % PALETTE.length]; });
    return m;
  }, []);
  if (error) return <ErrorBox />;
  if (!data) return <Loader rows={4} />;
  const months: Month[] = data.months;
  const cur: Month = data.cur;
  const prevM = months[months.findIndex((m) => m.m === data.month) - 1];
  const groups = Object.values((data.groups as { grp: string; item: string; amount: number }[]).reduce((acc, g) => {
    (acc[g.grp] ??= { grp: g.grp, amount: 0, items: [] as { item: string; amount: number }[] }).amount += g.amount;
    acc[g.grp].items.push({ item: g.item, amount: g.amount });
    return acc;
  }, {} as Record<string, { grp: string; amount: number; items: { item: string; amount: number }[] }>)).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-5">
      <PageHead eyebrow="Финансы компании" title="Деньги ВетДом" sub="Доходы и расходы по месяцам, структура затрат, счета в банках и все операции" />
      <Segmented value={tab} onChange={(t) => setSp({ tab: t })} items={[
        { k: 'pnl', label: '📊 Прибыль и убытки' }, { k: 'expenses', label: '🧾 Расходы' }, { k: 'accounts', label: '🏦 Счета' }, { k: 'tx', label: '🔁 Операции' }]} />

      {(tab === 'pnl' || tab === 'expenses') && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {months.map((m) => (
            <button key={m.m} onClick={() => setMonth(m.m)}
              className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold border ${m.m === data.month ? 'bg-white text-[#1E140D] border-white' : 'border-white/15 text-white/65 hover:text-white'}`}>
              {m.m === months[months.length - 1].m ? `${monthShort(m.m)} · сейчас` : monthShort(m.m)}
            </button>
          ))}
        </div>
      )}

      {tab === 'pnl' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Kpi icon="💰" tone="green" label={`Выручка · ${monthShort(cur.m)}`} value={money(cur.revenue)} delta={prevM ? delta(cur.revenue, prevM.revenue) : undefined} sub={`услуги ${money(cur.svc)}`} />
            <Kpi icon="🧾" tone="red" label="Расходы" value={money(cur.expenses)} delta={prevM ? delta(cur.expenses, prevM.expenses) : undefined} sub="все статьи" />
            <Kpi icon="📈" tone="yellow" label="Чистая прибыль" value={money(cur.profit)} delta={prevM && prevM.profit > 0 ? delta(cur.profit, prevM.profit) : undefined} sub={cur.profit >= 0 ? 'компания в плюсе' : 'период роста'} />
            <Kpi icon="🎯" tone="purple" label="Рентабельность" value={pct(cur.revenue ? cur.profit / cur.revenue : 0, 1)} sub={`за год: ${money(months.slice(0, -1).reduce((a, m) => a + m.profit, 0))}`} />
          </div>
          <Card title="Доходы, расходы и прибыль" sub="Компания вышла в плюс в мае и растёт каждый месяц">
            <Bars stacked={false} data={monthRows(months)} height={270}
              series={[{ key: 'revenue', name: 'Выручка', color: '#7CB842' }, { key: 'expenses', name: 'Расходы', color: '#D9895F' }]}
              line={{ key: 'profit', name: 'Прибыль', color: '#FACC15' }} />
          </Card>
          <Card title="Отчёт о прибылях и убытках" sub={mobile ? monthLong(cur.m) : 'Последние 6 месяцев, ₽'}>
            {mobile ? (
              <PnlList month={cur} groups={groups} />
            ) : (
              <PnlTable months={months.slice(-7)} byGroup={data.byMonthGroup} />
            )}
          </Card>
        </>
      )}

      {tab === 'expenses' && (
        <>
          <div className="grid lg:grid-cols-5 gap-4 md:gap-5">
            <Card className="lg:col-span-2" title={`Структура расходов · ${monthLong(cur.m)}`} sub="Нажмите на сектор, чтобы увидеть сумму">
              <div className="flex justify-center">
                <Donut size={220} thickness={30} items={groups.map((g) => ({ name: g.grp, value: g.amount, color: groupColors[g.grp] }))}
                  center={<div className="font-black text-2xl money">{money(cur.expenses)}</div>} sub="всего расходов" />
              </div>
              <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-xs text-white/65 leading-relaxed">
                {`Главная статья — выплаты врачам: ${pct((groups[0]?.amount ?? 0) / cur.svc)} от выручки услуг.`}{' '}
                {'Врач получает 55–70% от визита в зависимости от уровня — это и есть мотивация расти.'}
              </div>
            </Card>
            <Card className="lg:col-span-3" title="Статьи расходов" sub="Разверните группу, чтобы увидеть детали">
              <div className="space-y-2">
                {groups.map((g) => <ExpenseGroup key={g.grp} g={g} color={groupColors[g.grp]} total={cur.expenses} revenue={cur.revenue} />)}
              </div>
            </Card>
          </div>
          <Card title="Расходы по месяцам" sub="Как меняется структура затрат по мере роста">
            <Bars data={months.map((m) => {
              const row: Record<string, string | number> = { label: monthShort(m.m), full: monthLong(m.m) };
              (data.byMonthGroup as { m: string; grp: string; amount: number }[]).filter((x) => x.m === m.m).forEach((x) => { row[x.grp] = x.amount; });
              return row as { label: string };
            })} height={280} series={Object.keys(GROUP_ICON).map((g) => ({ key: g, name: g, color: groupColors[g] }))} />
          </Card>
        </>
      )}

      {tab === 'accounts' && <Accounts accounts={data.accounts} tx={data.tx} />}
      {tab === 'tx' && <Transactions tx={data.tx} />}
    </div>
  );
}

function ExpenseGroup({ g, color, total, revenue }: { g: { grp: string; amount: number; items: { item: string; amount: number }[] }; color: string; total: number; revenue: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/10 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03]">
        <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 tile3d" style={{ background: `linear-gradient(145deg, ${color}, ${color}88)` }}>{GROUP_ICON[g.grp] ?? '•'}</span>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm truncate">{g.grp}</div>
          <div className="h-1.5 mt-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(g.amount / total) * 100}%`, background: color }} /></div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-black text-sm money">{money(g.amount)}</div>
          <div className="text-[10px] text-white/45">{`${pct(g.amount / revenue, 1)} выручки`}</div>
        </div>
        <span className={`text-white/40 transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 space-y-1.5">
          {g.items.map((it) => (
            <div key={it.item} className="flex items-center justify-between gap-3 text-sm border-t border-white/5 pt-1.5">
              <span className="text-white/70 min-w-0">{it.item}</span><span className="font-bold money">{rub(it.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PnlList({ month, groups }: { month: Month; groups: { grp: string; amount: number }[] }) {
  const line = (label: string, v: number, bold = false, color?: string) => (
    <div key={label} className={`flex items-center justify-between gap-3 py-2 border-t border-white/5 ${bold ? 'font-black' : ''}`}>
      <span className={bold ? '' : 'text-white/70 text-sm'}>{label}</span><span className="money" style={{ color }}>{rub(v)}</span>
    </div>
  );
  return (
    <div>
      {line('Услуги врачей', month.svc)}
      {line('Магазин', month.shop)}
      {line('Выручка', month.revenue, true, '#9BCD67')}
      {groups.map((g) => line(`${GROUP_ICON[g.grp] ?? ''} ${g.grp}`, -g.amount))}
      {line('Расходы всего', -month.expenses, true, '#D9895F')}
      {line('Чистая прибыль', month.profit, true, month.profit >= 0 ? '#FACC15' : '#F87171')}
    </div>
  );
}

function PnlTable({ months, byGroup }: { months: Month[]; byGroup: { m: string; grp: string; amount: number }[] }) {
  const g = (m: string, grp: string) => byGroup.find((x) => x.m === m && x.grp === grp)?.amount ?? 0;
  const cell = 'px-3 py-2 text-right money whitespace-nowrap';
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-sm">
        <thead><tr className="text-white/45 text-[11px] uppercase tracking-wider"><th className="text-left py-2 pr-3 font-bold">Статья</th>{months.map((m) => <th key={m.m} className="px-3 py-2 text-right font-bold">{monthShort(m.m)}</th>)}</tr></thead>
        <tbody>
          <tr className="table-row"><td className="py-2 pr-3 text-white/75">Услуги врачей</td>{months.map((m) => <td key={m.m} className={cell}>{money(m.svc)}</td>)}</tr>
          <tr className="table-row"><td className="py-2 pr-3 text-white/75">Магазин</td>{months.map((m) => <td key={m.m} className={cell}>{money(m.shop)}</td>)}</tr>
          <tr className="font-black text-green-300 border-y border-white/10"><td className="py-2.5 pr-3">Выручка</td>{months.map((m) => <td key={m.m} className={cell}>{money(m.revenue)}</td>)}</tr>
          {Object.keys(GROUP_ICON).map((grp) => (
            <tr key={grp} className="table-row"><td className="py-2 pr-3 text-white/70 whitespace-nowrap">{GROUP_ICON[grp]} {grp}</td>{months.map((m) => <td key={m.m} className={`${cell} text-white/80`}>−{money(g(m.m, grp))}</td>)}</tr>
          ))}
          <tr className="font-black text-[#D9895F] border-y border-white/10"><td className="py-2.5 pr-3">Расходы всего</td>{months.map((m) => <td key={m.m} className={cell}>−{money(m.expenses)}</td>)}</tr>
          <tr className="font-black text-base"><td className="py-3 pr-3">Чистая прибыль</td>{months.map((m) => <td key={m.m} className={cell} style={{ color: m.profit >= 0 ? '#FACC15' : '#F87171' }}>{m.profit >= 0 ? '+' : ''}{money(m.profit)}</td>)}</tr>
          <tr className="text-white/55"><td className="py-1 pr-3 text-xs">Рентабельность</td>{months.map((m) => <td key={m.m} className={`${cell} text-xs`}>{pct(m.revenue ? m.profit / m.revenue : 0, 1)}</td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

interface Tx { id: number; at: string; direction: string; amount: number; category: string; counterparty: string; note: string; account: string; color: string }

function Accounts({ accounts, tx }: { accounts: { id: number; name: string; bank: string; kind: string; mask: string; balance: number; color: string; note: string }[]; tx: Tx[] }) {
  const total = accounts.reduce((a, b) => a + b.balance, 0);
  const days = useMemo(() => {
    const m = new Map<string, { label: string; full: string; inn: number; out: number }>();
    for (const t of [...tx].reverse()) {
      if (t.category === 'Перевод между счетами') continue;
      const k = t.at.slice(0, 10);
      const r = m.get(k) ?? { label: dateShort(t.at).replace('.', ''), full: dateShort(t.at), inn: 0, out: 0 };
      if (t.direction === 'in') r.inn += t.amount; else r.out -= t.amount;
      m.set(k, r);
    }
    return [...m.values()].slice(-21);
  }, [tx]);
  return (
    <>
      <div className="card3d p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="eyebrow">Все деньги компании</div>
          <div className="text-4xl md:text-5xl font-black mt-1 money">{money(total)}</div>
          <div className="text-sm text-white/55 mt-1">{`Счетов: ${accounts.length} · обновлено ${time(new Date())}`}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-80">
          <Stat label="Можно тратить" value={money(total - (accounts.find((a) => a.kind.startsWith('Депозит'))?.balance ?? 0))} color="#9BCD67" />
          <Stat label="Подушка" value={money(accounts.find((a) => a.kind.startsWith('Депозит'))?.balance ?? 0)} sub="≈ 3 месяца расходов" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="tile3d relative overflow-hidden rounded-[26px] p-5 min-h-[170px] flex flex-col"
            style={{ background: `linear-gradient(140deg, ${a.color} 0%, ${a.color}cc 30%, #2A1D14 120%)` }}>
            <span className="tile3d-gloss" />
            <div className="relative flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-white/85" style={{ textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>{a.bank}</div>
                <div className="text-sm font-bold text-white mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>{a.name}</div>
              </div>
              <span className="text-[11px] font-bold rounded-full bg-black/25 px-2 py-1 text-white/90">{a.kind}</span>
            </div>
            <div className="relative mt-auto">
              <div className="text-[28px] font-black text-white money" style={{ textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{rub(a.balance)}</div>
              <div className="flex items-center justify-between text-[11px] text-white/80 mt-1 gap-2"><span className="truncate">{a.note}</span><span className="font-mono flex-shrink-0">{a.mask}</span></div>
            </div>
          </div>
        ))}
      </div>
      <Card title="Движение денег" sub="Поступления и списания по дням, последние 3 недели">
        <Bars data={days} height={240} series={[{ key: 'inn', name: 'Поступления', color: '#7CB842' }, { key: 'out', name: 'Списания', color: '#D9895F' }]} />
      </Card>
    </>
  );
}

function Transactions({ tx }: { tx: Tx[] }) {
  const [dir, setDir] = useState<'all' | 'in' | 'out'>('all');
  const [cat, setCat] = useState('');
  const cats = [...new Set(tx.map((t) => t.category))];
  const list = tx.filter((t) => (dir === 'all' || t.direction === dir) && (!cat || t.category === cat));
  const sumIn = list.filter((t) => t.direction === 'in').reduce((a, t) => a + t.amount, 0);
  const sumOut = list.filter((t) => t.direction === 'out').reduce((a, t) => a + t.amount, 0);
  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <Stat label="Поступило" value={money(sumIn)} color="#9BCD67" />
        <Stat label="Списано" value={money(sumOut)} color="#D9895F" />
        <Stat label="Операций" value={list.length} />
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <Segmented value={dir} onChange={setDir} items={[{ k: 'all', label: 'Все' }, { k: 'in', label: '⬇ Поступления' }, { k: 'out', label: '⬆ Списания' }]} />
        <select className="input py-2.5 md:max-w-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Все категории</option>{cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <Card pad={false}>
        <div className="divide-y divide-white/5">
          {list.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${t.direction === 'in' ? 'bg-green-500/15 text-green-300' : 'bg-[#D9895F]/15 text-[#E9A27C]'}`}>{t.direction === 'in' ? '⬇' : '⬆'}</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate">{t.counterparty}</div>
                <div className="text-[11px] text-white/50 truncate">{t.note ? `${t.category} · ${t.note}` : t.category}</div>
                <div className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: t.color }} />{`${t.account} · ${dateShort(t.at)} ${time(t.at)}`}</div>
              </div>
              <div className={`font-black text-sm money flex-shrink-0 ${t.direction === 'in' ? 'text-green-300' : 'text-white'}`}>{t.direction === 'in' ? '+' : '−'}{rub(t.amount)}</div>
            </div>
          ))}
          {!list.length && <div className="p-6 text-center text-white/50">Нет операций</div>}
        </div>
      </Card>
      <div className="text-center"><Pill color="#C99A63">Показаны последние 150 операций</Pill></div>
    </>
  );
}

export { HBars };
