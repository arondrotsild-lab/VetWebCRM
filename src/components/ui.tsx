import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { Spark } from './Charts';
import { pct, STATUS } from '../lib/format';
import { TONES } from './Tile3D';
import Icon3D, { tiltHandlers } from './Icon3D';

export function PageHead({ eyebrow, title, sub, right }: { eyebrow?: string; title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6 mb-5 md:mb-7">
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-[26px] md:text-4xl font-black leading-tight tracking-tight">{title}</h1>
        {sub && <div className="text-sm text-white/55 mt-1.5">{sub}</div>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

export function Card({ title, sub, right, children, className = '', pad = true }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`card3d ${pad ? 'p-4 md:p-6' : ''} ${className}`}>
      {(title || right) && (
        <div className={`flex items-start gap-3 ${pad ? 'mb-4' : 'p-4 md:p-6 pb-0 mb-3'}`}>
          <div className="min-w-0 flex-1">
            {title && <h2 className="font-black text-[15px] md:text-base leading-tight">{title}</h2>}
            {sub && <div className="text-xs text-white/50 mt-0.5">{sub}</div>}
          </div>
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Delta({ value, invert = false, className = '' }: { value: number; invert?: boolean; className?: string }) {
  if (!isFinite(value) || value === 0) return <span className={`chip bg-white/10 text-white/60 ${className}`}>0%</span>;
  const good = invert ? value < 0 : value > 0;
  return (
    <span className={`chip money ${good ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/15 text-red-300 border border-red-400/30'} ${className}`}>
      {value > 0 ? '▲' : '▼'} {pct(Math.abs(value), Math.abs(value) < 0.1 ? 1 : 0)}
    </span>
  );
}

// Объёмная «сочная» плитка показателя
export function Kpi({ icon, label, value, sub, delta, tone = 'coffee', spark, onClick, invert }: {
  icon: string; label: string; value: ReactNode; sub?: ReactNode; delta?: number; tone?: string; spark?: number[]; onClick?: () => void; invert?: boolean;
}) {
  const t = TONES[tone] ?? TONES.coffee;
  const dark = t.dark;
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="tile3d tilt3d relative overflow-hidden rounded-[24px] p-4 md:p-5 text-left flex flex-col min-h-[132px] md:min-h-[150px] disabled:cursor-default" style={{ background: t.bg }} {...tiltHandlers}>
      <span className="tile3d-gloss" />
      <span className="tile-sweep" />
      <Icon3D emoji={icon} tone="cream" size={44} className="!absolute z-[2] right-3 top-3" />
      <span className={`relative z-[3] text-[11px] md:text-xs font-bold uppercase tracking-wider pr-14 ${dark ? 'text-[#1E140D]/70' : 'text-white/80'}`}>{label}</span>
      <span className={`relative z-[3] mt-auto pt-3 block font-black text-[22px] md:text-[28px] leading-none money ${dark ? 'text-[#1E140D]' : 'text-white'}`}
        style={{ textShadow: dark ? 'none' : '0 2px 6px rgba(0,0,0,.35)' }}>{value}</span>
      <span className="relative z-[3] mt-2 flex items-center gap-2 flex-wrap">
        {delta !== undefined && (
          <span className={`chip money ${dark ? 'bg-black/15 text-[#1E140D]' : 'bg-black/25 text-white'}`}>
            {delta >= 0 ? '▲' : '▼'} {pct(Math.abs(delta), Math.abs(delta) < 0.1 ? 1 : 0)}
            {invert !== undefined && <span className="sr-only">{(invert ? delta < 0 : delta > 0) ? 'хорошо' : 'плохо'}</span>}
          </span>
        )}
        {sub && <span className={`text-[11px] font-semibold ${dark ? 'text-[#1E140D]/70' : 'text-white/80'}`}>{sub}</span>}
      </span>
      {spark && <span className="absolute right-3 bottom-3 opacity-80 hidden md:block"><Spark values={spark} color={dark ? '#1E140D' : '#ffffff'} width={84} height={30} /></span>}
    </button>
  );
}

// Небольшая карточка-цифра
export function Stat({ label, value, sub, color }: { label: string; value: ReactNode; sub?: ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.045] border border-white/10 p-3 md:p-4 glass3d">
      <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/45">{label}</div>
      <div className="font-black text-lg md:text-xl mt-1 money" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-white/50 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Avatar({ src, name, size = 40, ring }: { src?: string | null; name?: string; size?: number; ring?: string }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const style = { width: size, height: size, boxShadow: ring ? `0 0 0 2px ${ring}` : undefined };
  return src ? (
    <img src={src} alt="" loading="lazy" className="rounded-full object-cover flex-shrink-0 bg-white/10" style={style} />
  ) : (
    <div className="rounded-full flex-shrink-0 flex items-center justify-center font-black text-green-200 border border-green-400/30"
      style={{ ...style, fontSize: size * 0.36, background: 'linear-gradient(145deg, rgba(124,184,66,.35), rgba(47,81,25,.5))' }}>{initials}</div>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(value) ? '#FACC15' : 'rgba(255,255,255,0.15)'}>
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function StatusChip({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, color: '#aaa' };
  return (
    <span className="chip whitespace-nowrap" style={{ color: s.color, background: `${s.color}1f`, border: `1px solid ${s.color}55` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
    </span>
  );
}

export function Segmented<T extends string>({ value, onChange, items, className = '' }: { value: T; onChange: (v: T) => void; items: { k: T; label: ReactNode }[]; className?: string }) {
  return (
    <div className={`flex gap-1 p-1 rounded-2xl bg-black/25 border border-white/10 overflow-x-auto no-scrollbar ${className}`}>
      {items.map((it) => (
        <button key={it.k} onClick={() => onChange(it.k)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${value === it.k ? 'bg-green-500 text-white shadow-lg shadow-green-900/40' : 'text-white/60 hover:text-white'}`}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      </span>
      <input className="input pl-10 py-2.5" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="search" />
    </label>
  );
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button className="btn-ghost px-3 py-2 text-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><Icon name="back" size={16} /> Назад</button>
      <span className="text-sm text-white/60 px-2 money">{`${page} / ${pages}`}</span>
      <button className="btn-ghost px-3 py-2 text-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Дальше <Icon name="chevron" size={16} /></button>
    </div>
  );
}

export function Loader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-label="Загрузка">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="h-36 rounded-3xl bg-white/[0.05] animate-pulse" />)}
    </div>
  );
}

export function ErrorBox() {
  return <div className="card3d p-6 text-center text-white/70">Не удалось загрузить данные. Проверьте, что сервер ВетДом запущен, и обновите страницу.</div>;
}

export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="sheet-wrap fixed inset-0 z-[80] flex items-end md:items-center justify-center md:p-6">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className={`sheet slide-up relative w-full ${wide ? 'md:max-w-3xl' : 'md:max-w-lg'} max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#2A1D14] p-5 md:p-7 shadow-2xl`}
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="md:hidden w-10 h-1.5 rounded-full bg-white/20 mx-auto -mt-2 mb-3" />
        <div className="flex items-start justify-between gap-4 mb-4">
          {title ? <h3 className="text-xl font-black">{title}</h3> : <span />}
          <button onClick={onClose} className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10" aria-label="Закрыть"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// Строка списка (используется в таблицах на телефоне и компьютере)
export function Row({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className={`w-full text-left flex items-center gap-3 px-3 md:px-4 py-3 rounded-2xl transition-colors hover:bg-white/[0.05] active:bg-white/[0.08] disabled:hover:bg-transparent disabled:cursor-default ${className}`}>
      {children}
    </button>
  );
}

export function Pill({ children, color = '#7CB842' }: { children: ReactNode; color?: string }) {
  return <span className="chip whitespace-nowrap" style={{ color, background: `${color}1f`, border: `1px solid ${color}55` }}>{children}</span>;
}
