import { ReactNode, useId, useState } from 'react';
import { useWidth, money, num, pct, monthShort } from '../lib/format';

// ═══════════════════════════════════════════════════════════════════
//  Графики CRM — без внешних библиотек, в стиле ВетДом:
//  объёмные столбцы с бликом, мягкие тени, подсказка при наведении/касании.
// ═══════════════════════════════════════════════════════════════════

export interface Series { key: string; name: string; color: string }
type Row = { label: string; full?: string; [k: string]: number | string | undefined };

const GRID = 'rgba(255,255,255,0.07)';
const AXIS = 'rgba(255,255,255,0.45)';

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  return (steps.find((x) => m <= x) ?? 10) * p;
}

function Tooltip({ x, w, children }: { x: number; w: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 80), w - 80);
  return (
    <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1F150E]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur"
      style={{ left }}>{children}</div>
  );
}

function Legend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/65">
          <span className="w-2.5 h-2.5 rounded-[4px]" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}88` }} />{s.name}
        </span>
      ))}
    </div>
  );
}

// ── Столбцы (можно стопкой, можно с отрицательными значениями) + линия ──
export function Bars({ data, series, height = 220, stacked = true, line, fmt = money, legend = true, highlightLast = false }: {
  data: Row[]; series: Series[]; height?: number; stacked?: boolean; line?: Series; fmt?: (n: number) => string; legend?: boolean; highlightLast?: boolean;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const padL = 46, padR = 8, padT = 12, padB = 26;
  const W = Math.max(w, 200), Hh = height;
  const vals = data.map((d) => series.map((s) => Number(d[s.key] ?? 0)));
  const tops = vals.map((v) => (stacked ? v.filter((x) => x > 0).reduce((a, b) => a + b, 0) : Math.max(0, ...v)));
  const bottoms = vals.map((v) => (stacked ? v.filter((x) => x < 0).reduce((a, b) => a + b, 0) : Math.min(0, ...v)));
  const lineVals = line ? data.map((d) => Number(d[line.key] ?? 0)) : [];
  const max = niceMax(Math.max(...tops, ...lineVals, 1));
  const minRaw = Math.min(...bottoms, ...lineVals, 0);
  const min = minRaw < 0 ? -niceMax(-minRaw) : 0;
  const ih = Hh - padT - padB;
  const y = (v: number) => padT + ((max - v) / (max - min)) * ih;
  const slot = (W - padL - padR) / Math.max(data.length, 1);
  const bw = Math.max(4, Math.min(38, slot * (stacked ? 0.62 : 0.8 / series.length)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t);
  const every = Math.ceil(data.length / Math.max(1, Math.floor((W - padL) / 46)));
  return (
    <div ref={ref} className="relative select-none">
      {w > 0 && (
        <svg width={W} height={Hh} className="block overflow-visible"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left - padL) / slot); setHover(i >= 0 && i < data.length ? i : null); }}
          onTouchStart={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.floor((e.touches[0].clientX - r.left - padL) / slot); setHover(i >= 0 && i < data.length ? i : null); }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`g${uid}${s.key}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor={s.color} stopOpacity="1" />
                <stop offset="0.55" stopColor={s.color} stopOpacity="0.9" />
                <stop offset="1" stopColor={s.color} stopOpacity="0.62" />
              </linearGradient>
            ))}
            <filter id={`sh${uid}`} x="-50%" y="-20%" width="200%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.45" /></filter>
          </defs>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'rgba(255,255,255,0.22)' : GRID} />
              <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill={AXIS}>{money(t, false).replace(/ /g, ' ')}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = padL + slot * i + slot / 2;
            let up = 0, down = 0;
            const active = hover === i || (highlightLast && hover === null && i === data.length - 1);
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.55}>
                {active && <rect x={padL + slot * i + 1} y={padT} width={slot - 2} height={ih} rx={8} fill="rgba(255,255,255,0.04)" />}
                {series.map((s, si) => {
                  const v = vals[i][si];
                  if (!v) return null;
                  let y0: number, y1: number, x: number;
                  if (stacked) {
                    if (v >= 0) { y0 = y(up + v); y1 = y(up); up += v; } else { y0 = y(down); y1 = y(down + v); down += v; }
                    x = cx - bw / 2;
                  } else { y0 = y(Math.max(v, 0)); y1 = y(Math.min(v, 0)); x = cx - (bw * series.length) / 2 + si * bw; }
                  const h = Math.max(1.5, y1 - y0);
                  const color = v < 0 ? '#E2533E' : s.color;
                  return (
                    <g key={s.key} filter={`url(#sh${uid})`}>
                      <rect x={x} y={y0} width={bw - (stacked ? 0 : 2)} height={h} rx={Math.min(6, bw / 3)} fill={v < 0 ? color : `url(#g${uid}${s.key})`} />
                      <rect x={x + 2} y={y0 + 1.5} width={Math.max(1, (bw - (stacked ? 0 : 2)) * 0.28)} height={Math.max(0, h - 3)} rx={2} fill="rgba(255,255,255,0.22)" />
                    </g>
                  );
                })}
                {(i % every === 0 || i === data.length - 1) && (
                  <text x={cx} y={Hh - 8} textAnchor="middle" fontSize="10" fill={active ? '#fff' : AXIS} fontWeight={active ? 700 : 400}>{d.label}</text>
                )}
              </g>
            );
          })}
          {line && (
            <>
              <path d={lineVals.map((v, i) => `${i ? 'L' : 'M'}${padL + slot * i + slot / 2},${y(v)}`).join('')} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {lineVals.map((v, i) => <circle key={i} cx={padL + slot * i + slot / 2} cy={y(v)} r={hover === i ? 5 : 3} fill="#1F150E" stroke={line.color} strokeWidth="2" />)}
            </>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tooltip x={padL + slot * hover + slot / 2} w={W}>
          <div className="font-black text-white mb-1">{data[hover].full ?? data[hover].label}</div>
          {[...series, ...(line ? [line] : [])].map((s) => (
            <div key={s.key} className="flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-white/60">{s.name}</span>
              <span className="ml-auto pl-3 font-bold money">{fmt(Number(data[hover][s.key] ?? 0))}</span>
            </div>
          ))}
        </Tooltip>
      )}
      {legend && <Legend series={line ? [...series, line] : series} />}
    </div>
  );
}

// ── Линии с объёмной заливкой ──
export function Area({ data, series, height = 220, fmt = money, legend = true }: { data: Row[]; series: Series[]; height?: number; fmt?: (n: number) => string; legend?: boolean }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const padL = 46, padR = 10, padT = 12, padB = 26;
  const W = Math.max(w, 200);
  const max = niceMax(Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0)))));
  const ih = height - padT - padB;
  const x = (i: number) => padL + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - v / max) * ih;
  const every = Math.ceil(data.length / Math.max(1, Math.floor((W - padL) / 52)));
  const smooth = (pts: [number, number][]) => pts.reduce((acc, p, i, a) => {
    if (!i) return `M${p[0]},${p[1]}`;
    const [px, py] = a[i - 1]; const cx = (px + p[0]) / 2;
    return `${acc} C${cx},${py} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }, '');
  return (
    <div ref={ref} className="relative select-none">
      {w > 0 && (
        <svg width={W} height={height} className="block overflow-visible" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - padL) / (W - padL - padR)) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}
          onTouchStart={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.touches[0].clientX - r.left - padL) / (W - padL - padR)) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`a${uid}${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity="0.45" /><stop offset="1" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
            <filter id={`gl${uid}`}><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" /></filter>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(max * t)} y2={y(max * t)} stroke={GRID} />
              <text x={padL - 6} y={y(max * t) + 4} textAnchor="end" fontSize="10" fill={AXIS}>{money(max * t, false).replace(/ /g, ' ')}</text>
            </g>
          ))}
          {series.map((s) => {
            const pts = data.map((d, i) => [x(i), y(Number(d[s.key] ?? 0))] as [number, number]);
            const path = smooth(pts);
            return (
              <g key={s.key}>
                <path d={`${path} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#a${uid}${s.key})`} />
                <path d={path} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" filter={`url(#gl${uid})`} />
              </g>
            );
          })}
          {data.map((d, i) => (i % every === 0 || i === data.length - 1) && (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill={AXIS}>{d.label}</text>
          ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
              {series.map((s) => <circle key={s.key} cx={x(hover)} cy={y(Number(data[hover][s.key] ?? 0))} r="5" fill="#1F150E" stroke={s.color} strokeWidth="2.5" />)}
            </g>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tooltip x={x(hover)} w={W}>
          <div className="font-black text-white mb-1">{data[hover].full ?? data[hover].label}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /><span className="text-white/60">{s.name}</span>
              <span className="ml-auto pl-3 font-bold money">{fmt(Number(data[hover][s.key] ?? 0))}</span>
            </div>
          ))}
        </Tooltip>
      )}
      {legend && <Legend series={series} />}
    </div>
  );
}

// ── Объёмный «пончик» ──
export function Donut({ items, size = 180, thickness = 26, center, sub }: {
  items: { name: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode; sub?: ReactNode;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const r = size / 2 - thickness / 2 - 4;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block -rotate-90">
        <defs><filter id={`d${uid}`}><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.55" /></filter></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        <g filter={`url(#d${uid})`}>
          {items.map((it, i) => {
            const len = (it.value / total) * c;
            const el = (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={it.color} strokeWidth={hover === i ? thickness + 6 : thickness}
                strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-acc} style={{ transition: 'stroke-width .15s' }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === i ? null : i)} />
            );
            acc += len;
            return el;
          })}
        </g>
        {/* блик сверху — объём */}
        <circle cx={size / 2} cy={size / 2} r={r + thickness / 2 - 3} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray={`${c * 0.22} ${c}`} strokeDashoffset={c * 0.6} pointerEvents="none" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        {hover !== null ? (
          <>
            <div className="text-[11px] text-white/60 leading-tight">{items[hover].name}</div>
            <div className="font-black text-lg money">{money(items[hover].value)}</div>
            <div className="text-[11px] font-bold" style={{ color: items[hover].color }}>{pct(items[hover].value / total, 1)}</div>
          </>
        ) : (<>{center}{sub && <div className="text-[11px] text-white/50 mt-0.5">{sub}</div>}</>)}
      </div>
    </div>
  );
}

// ── Горизонтальные полосы (рейтинги, структура) ──
export function HBars({ items, fmt = money, max: maxIn }: {
  items: { label: ReactNode; value: number; color?: string; right?: ReactNode; sub?: ReactNode; icon?: ReactNode }[]; fmt?: (n: number) => string; max?: number;
}) {
  const max = maxIn ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 text-sm mb-1.5">
            {it.icon && <span className="text-base w-6 text-center flex-shrink-0">{it.icon}</span>}
            <span className="font-semibold text-white/85 min-w-0 flex-1 truncate">{it.label}</span>
            <span className="font-black money flex-shrink-0">{it.right ?? fmt(it.value)}</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden shadow-inner">
            <div className="h-full rounded-full relative" style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: `linear-gradient(180deg, ${it.color ?? '#7CB842'}, ${it.color ?? '#7CB842'}bb)`, boxShadow: `0 0 12px ${(it.color ?? '#7CB842')}66` }}>
              <span className="absolute inset-x-1 top-[2px] h-[3px] rounded-full bg-white/35" />
            </div>
          </div>
          {it.sub && <div className="text-[11px] text-white/45 mt-1">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Мини-график в карточке ──
export function Spark({ values, color = '#7CB842', height = 36, width = 110 }: { values: number[]; color?: string; height?: number; width?: number }) {
  const uid = useId().replace(/:/g, '');
  if (values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - 3 - ((v - min) / (max - min || 1)) * (height - 6);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return (
    <svg width={width} height={height} className="block overflow-visible">
      <defs><linearGradient id={`s${uid}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.4" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#s${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="3" fill={color} />
    </svg>
  );
}

// ── Тепловая карта: дни недели × часы ──
export function Heatmap({ cells }: { cells: { dow: number; h: number; n: number }[] }) {
  const [hover, setHover] = useState<{ dow: number; h: number; n: number } | null>(null);
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);
  const max = Math.max(1, ...cells.map((c) => c.n));
  const get = (d: number, h: number) => cells.find((c) => c.dow === d && c.h === h)?.n ?? 0;
  return (
    <div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `22px repeat(${hours.length}, minmax(0, 1fr))` }}>
        <span />
        {hours.map((h) => <span key={h} className="text-[9px] text-white/40 text-center">{h % 2 === 0 ? h : ''}</span>)}
        {days.map((d, di) => (
          <div key={d} className="contents">
            <span className="text-[10px] text-white/50 self-center">{d}</span>
            {hours.map((h) => {
              const v = get(di + 1, h); const t = v / max;
              return (
                <span key={h} onMouseEnter={() => setHover({ dow: di + 1, h, n: v })} onMouseLeave={() => setHover(null)} onClick={() => setHover({ dow: di + 1, h, n: v })}
                  className="aspect-square rounded-[5px] transition-transform hover:scale-110"
                  style={{ background: t ? `rgba(124,184,66,${0.12 + t * 0.88})` : 'rgba(255,255,255,0.04)', boxShadow: t > 0.6 ? `0 0 10px rgba(124,184,66,${t * 0.6}), inset 0 1px 0 rgba(255,255,255,.3)` : 'inset 0 1px 0 rgba(255,255,255,.06)' }} />
              );
            })}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-white/55 mt-3 h-4">
        {hover ? `${days[hover.dow - 1]} ${hover.h}:00–${hover.h + 1}:00 · визитов за 90 дней: ${num(hover.n)}` : 'Наведите на клетку, чтобы увидеть число визитов'}
      </div>
    </div>
  );
}

// ── Воронка маркетинга ──
export function Funnel({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const w = 38 + 62 * (Math.log10(Math.max(1, s.value)) / Math.log10(Math.max(10, max)));
        const conv = i ? s.value / (steps[i - 1].value || 1) : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex-1 flex justify-center">
              <div className="h-11 rounded-2xl flex items-center justify-center px-3 relative overflow-hidden tile3d whitespace-nowrap" style={{ width: `${w}%`, minWidth: '6.5rem', background: `linear-gradient(145deg, ${s.color}, ${s.color}99)` }}>
                <span className="tile3d-gloss" />
                <span className="relative font-black text-sm text-white drop-shadow money">{num(s.value)}</span>
              </div>
            </div>
            <div className="w-28 md:w-36 text-right">
              <div className="text-xs font-bold text-white/85">{s.label}</div>
              {conv !== null && <div className="text-[11px] text-white/45">{`конверсия ${pct(conv, conv < 0.1 ? 1 : 0)}`}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Когорты: какая доля клиентов возвращается через N месяцев ──
export function Cohorts({ rows }: { rows: { cohort: string; k: number; n: number }[] }) {
  const cohorts = [...new Set(rows.map((r) => r.cohort))];
  const maxK = Math.max(0, ...rows.map((r) => r.k));
  const label = (m: string) => `${monthShort(m).replace(/ ’\d+$/, '')} ${m.slice(2, 4)}`;
  return (
    <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
      <table className="text-[11px] border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr><th className="text-left text-white/45 font-semibold pr-2">Месяц прихода</th><th className="text-white/45 font-semibold px-1">Клиентов</th>
            {Array.from({ length: maxK }, (_, k) => <th key={k} className="text-white/45 font-semibold w-11">{`+${k + 1} мес`}</th>)}</tr>
        </thead>
        <tbody>
          {cohorts.map((c) => {
            const base = rows.find((r) => r.cohort === c && r.k === 0)?.n ?? 0;
            return (
              <tr key={c}>
                <td className="pr-2 font-bold text-white/80 whitespace-nowrap">{label(c)}</td>
                <td className="text-center font-bold money">{num(base)}</td>
                {Array.from({ length: maxK }, (_, k) => {
                  const r = rows.find((x) => x.cohort === c && x.k === k + 1);
                  if (!r) return <td key={k} />;
                  const t = base ? r.n / base : 0;
                  return (
                    <td key={k} className="text-center font-bold rounded-md h-7 w-11" title={`${num(r.n)} из ${num(base)}`}
                      style={{ background: `rgba(124,184,66,${0.1 + Math.min(1, t * 2.4) * 0.85})`, color: t > 0.25 ? '#12240A' : '#fff' }}>{Math.round(t * 100)}%</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Кольцо-прогресс (цель месяца) ──
export function Ring({ value, size = 92, color = '#7CB842', children }: { value: number; size?: number; color?: string; children?: ReactNode }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${Math.min(1, value) * c} ${c}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
