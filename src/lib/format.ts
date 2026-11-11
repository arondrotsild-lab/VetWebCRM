import { useEffect, useRef, useState } from 'react';

import { getLang, LOC } from './i18n';
export { LOC };
const LANG = getLang();

// Неразрывный пробел перед ₽ — знак рубля никогда не переносится. Числа — по правилам выбранного языка.
export const num = (n: number | null | undefined) => Math.round(n || 0).toLocaleString(LOC);
export const rub = (n: number | null | undefined) => `${num(n)}\u00A0₽`;

// Компактно: 11,4 млн ₽ · 11.4M ₽ · 11,4 milyon ₽ · 11.4 مليون ₽
const UNITS = { ru: ['млрд', 'млн', 'тыс'], en: ['B', 'M', 'K'], tr: ['milyar', 'milyon', 'bin'], ar: ['مليار', 'مليون', 'ألف'] }[LANG];
const glue = LANG === 'en' ? '' : '\u00A0';
export function money(n: number | null | undefined, unit = true) {
  const v = n || 0; const a = Math.abs(v);
  const r = unit ? '\u00A0₽' : '';
  const f = (x: number, d: number) => x.toLocaleString(LOC, { maximumFractionDigits: d });
  if (a >= 1e9) return `${f(v / 1e9, 2)}${glue}${UNITS[0]}${r}`;
  if (a >= 1e6) return `${f(v / 1e6, a >= 1e8 ? 0 : a >= 1e7 ? 1 : 2)}${glue}${UNITS[1]}${r}`;
  if (a >= 1e4) return `${f(Math.round(v / 1e3), 0)}${glue}${UNITS[2]}${r}`;
  return `${num(v)}${r}`;
}
export const short = (n: number) => money(n, false);
export const pct = (x: number | null | undefined, d = 0) => {
  const v = ((x || 0) * 100).toLocaleString(LOC, { maximumFractionDigits: d, minimumFractionDigits: d });
  return LANG === 'tr' ? `%${v}` : `${v}%`;
};
export const dec = (x: number, d = 1) => x.toLocaleString(LOC, { maximumFractionDigits: d, minimumFractionDigits: d });
export const delta = (cur: number, prev: number) => (prev ? cur / prev - 1 : 0);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const monthShort = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  const s = new Date(y, mm - 1, 1).toLocaleDateString(LOC, { month: 'short' }).replace('.', '');
  return `${s}${mm === 1 ? ` ’${String(y).slice(2)}` : ''}`;
};
export const monthLong = (m: string) => { const [y, mm] = m.split('-').map(Number); return cap(new Date(y, mm - 1, 1).toLocaleDateString(LOC, { month: 'long', year: 'numeric' }).replace(' г.', '')); };

export const dateShort = (d: string | Date) => new Date(d).toLocaleDateString(LOC, { day: 'numeric', month: 'short' });
export const dateLong = (d: string | Date) => new Date(d).toLocaleDateString(LOC, { day: 'numeric', month: 'long', year: 'numeric' });
export const time = (d: string | Date) => new Date(d).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' });
export const dateTime = (d: string | Date) => `${dateShort(d)}, ${time(d)}`;

export function when(d: string | Date) {
  const x = new Date(d); const t = new Date();
  const y = new Date(); y.setDate(t.getDate() - 1);
  if (x.toDateString() === t.toDateString()) return `сегодня, ${time(x)}`;
  if (x.toDateString() === y.toDateString()) return `вчера, ${time(x)}`;
  return dateTime(x);
}

export function ago(d: string | Date | null | undefined) {
  if (!d) return '—';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 30) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} ${plural(m, 'месяц', 'месяца', 'месяцев')} назад`;
  return dateLong(d);
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ищем врача', color: '#FACC15' },
  confirmed: { label: 'Врач назначен', color: '#9BCD67' },
  on_the_way: { label: 'Врач в пути', color: '#7DD3FC' },
  arrived: { label: 'Врач на месте', color: '#C99A63' },
  in_progress: { label: 'Идёт приём', color: '#D9895F' },
  completed: { label: 'Выполнен', color: '#7CB842' },
  cancelled: { label: 'Отменён', color: '#F87171' },
};

export const speciesEmoji = (s?: string) => {
  const x = (s || '').toLowerCase();
  if (x.includes('соба')) return '🐕';
  if (x.includes('кош') || x.includes('кот')) return '🐈';
  if (x.includes('птиц') || x.includes('попуг')) return '🦜';
  if (x.includes('крол')) return '🐇';
  if (x.includes('череп')) return '🐢';
  if (x.includes('хор')) return '🦦';
  if (x.includes('свин') || x.includes('хомя')) return '🐹';
  return '🐾';
};

export const CATEGORY_ICON: Record<string, string> = {
  'Корма': '🥩', 'Лакомства': '🦴', 'Препараты': '💊', 'Амуниция': '🦮', 'Игрушки': '🧸', 'Дом и уход': '🛁', 'Другое': '📦',
};

export const PALETTE = ['#7CB842', '#FACC15', '#D9895F', '#7DD3FC', '#A78BFA', '#2BA6A0', '#F87171', '#C99A63', '#F9A8D4', '#9BCD67', '#60A5FA', '#FB923C'];

// Телефон или компьютер
export function useIsMobile() {
  const q = '(max-width: 767px)';
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return m;
}

// Ширина блока — чтобы графики были чёткими на любом экране
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// Загрузка данных с сервера CRM
import { crm } from './api';
export function useCrm<T = any>(path: string, params?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const key = path + JSON.stringify(params ?? {});
  useEffect(() => {
    let alive = true;
    setError(false);
    crm<T>(path, params).then((d) => alive && setData(d)).catch(() => alive && setError(true));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { data, error, loading: !data && !error };
}
