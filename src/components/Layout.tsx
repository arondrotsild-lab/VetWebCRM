import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../lib/auth';
import LangMenu from './LangMenu';
import { LOC } from '../lib/i18n';

export const NAV: { to: string; label: string; icon: string; group?: string }[] = [
  { to: '/', label: 'Сводка', icon: '📊', group: 'Компания' },
  { to: '/finance', label: 'Финансы и счета', icon: '💰' },
  { to: '/unit', label: 'Юнит-экономика', icon: '📈' },
  { to: '/marketing', label: 'Маркетинг и реклама', icon: '📣' },
  { to: '/orders', label: 'Заказы', icon: '🧾', group: 'Работа' },
  { to: '/clients', label: 'Клиенты', icon: '👥' },
  { to: '/pets', label: 'Питомцы', icon: '🐾' },
  { to: '/vets', label: 'Ветеринары', icon: '🩺' },
  { to: '/services', label: 'Услуги', icon: '💉' },
  { to: '/shop', label: 'Магазин', icon: '🛍️' },
];

const TITLES: [RegExp, string][] = [
  [/^\/summary/, 'Сводка'], [/^\/finance/, 'Финансы'], [/^\/unit/, 'Юнит-экономика'], [/^\/marketing/, 'Маркетинг'],
  [/^\/orders\/\d+/, 'Заказ'], [/^\/orders/, 'Заказы'], [/^\/clients\/\d+/, 'Клиент'], [/^\/clients/, 'Клиенты'], [/^\/pets/, 'Питомцы'],
  [/^\/vets\/\d+/, 'Ветеринар'], [/^\/vets/, 'Ветеринары'], [/^\/services/, 'Услуги'], [/^\/shop/, 'Магазин'],
];

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 30000); return () => clearInterval(i); }, []);
  return <span className="money">{t.toLocaleDateString(LOC, { day: 'numeric', month: 'long' })}, {t.toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' })}</span>;
}

function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-[264px] flex-col bg-[#2A1D14] border-r border-amber-300/15 z-40">
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <Link to="/" className="relative flex items-center gap-3 px-6 pt-7 pb-5">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400/25 rounded-full blur-lg" />
          <img src="/logo.jpeg" alt="ВетДом" className="relative w-12 h-12 rounded-full object-cover border-2 border-white/30" />
        </div>
        <div className="leading-tight">
          <div className="font-black text-white tracking-wide">ВетДом</div>
          <div className="text-[10px] font-bold text-green-400 uppercase tracking-[0.2em]">CRM компании</div>
        </div>
      </Link>
      <div className="relative mx-4 mb-4 rounded-2xl border border-green-400/25 bg-green-500/[0.07] px-3 py-2.5 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 live-pulse flex-shrink-0" />
        <div className="text-[11px] leading-tight"><div className="font-bold text-green-300">Данные в реальном времени</div><div className="text-white/50"><Clock /></div></div>
      </div>
      <nav className="relative flex-1 px-3 overflow-y-auto no-scrollbar">
        {NAV.map((n) => (
          <div key={n.to}>
            {n.group && <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/50">{n.group}</div>}
            <NavLink to={n.to} end={n.to === '/'}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive ? 'bg-green-500/15 text-green-300 border border-green-400/25' : 'text-white/70 hover:text-white hover:bg-white/[0.05] border border-transparent'}`}>
              <span className="text-[17px] w-6 text-center">{n.icon}</span><span className="flex-1">{n.label}</span>
            </NavLink>
          </div>
        ))}
      </nav>
      <LangMenu up className="relative mx-3 mt-2" />
      <div className="relative m-3 p-3 rounded-2xl bg-black/20 border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(145deg,#FFE36E,#C98A06)' }}>👑</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate">{user?.name ?? 'Руководитель'}</div>
          <div className="text-[11px] text-white/45">Полный доступ</div>
        </div>
        <button onClick={logout} className="w-9 h-9 rounded-full flex items-center justify-center text-white/45 hover:text-red-300 hover:bg-white/5" title="Выйти" aria-label="Выйти"><Icon name="logout" size={17} /></button>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = TITLES.find(([re]) => re.test(pathname))?.[1];
  const isRoot = pathname === '/';
  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-amber-300/25 bg-[#4A3426]/90" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="h-16 px-4 flex items-center gap-2">
        {isRoot ? (
          <Link to="/" className="flex items-center gap-2.5 flex-1 min-w-0">
            <img src="/logo.jpeg" alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
            <div className="leading-tight">
              <div className="font-black text-sm">ВетДом</div>
              <div className="text-[9px] font-bold text-green-400 uppercase tracking-[0.2em]">CRM компании</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center active:bg-white/10" aria-label="Назад">
              <Icon name="back" size={24} stroke={2.4} />
            </button>
            <span className="font-black text-[17px] truncate">{title}</span>
          </div>
        )}
        <LangMenu compact />
        <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-black border bg-green-500/15 border-green-400/40 text-green-300">
          <span className="w-2 h-2 rounded-full bg-green-400 live-pulse" />Онлайн
        </span>
      </div>
    </header>
  );
}

const TabIcon = ({ d }: { d: string }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

function TabBar() {
  const { pathname } = useLocation();
  const tabs = [
    { to: '/', label: 'Главная', d: 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
    { to: '/orders', label: 'Заказы', d: 'M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1zM8 6H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2M8 12h8M8 16h5' },
    { center: true, to: '/finance', label: 'Финансы', d: '' },
    { to: '/clients', label: 'Клиенты', d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8' },
    { to: '/vets', label: 'Врачи', d: 'M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6 6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3M8 15v1a6 6 0 006 6 6 6 0 006-6v-4M20 12a2 2 0 100-4 2 2 0 000 4z' },
  ];
  const active = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  return (
    <nav className="tabbar md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#1F150E]/95 backdrop-blur-xl border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid grid-cols-5 h-16">
        {tabs.map((t) => t.center ? (
          <Link key="c" to={t.to} className="flex flex-col items-center justify-start -mt-5" aria-label="Финансы">
            <span className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#1F150E] text-2xl hero3d ${active(t.to) ? 'live-pulse' : ''}`}
              style={{ background: 'linear-gradient(145deg, #FFE36E 0%, #FACC15 45%, #C98A06 100%)' }}>₽</span>
            <span className={`text-[10px] font-bold mt-0.5 ${active(t.to) ? 'text-yellow-300' : 'text-white/60'}`}>{t.label}</span>
          </Link>
        ) : (
          <Link key={t.to} to={t.to} className={`relative flex flex-col items-center justify-center gap-0.5 ${active(t.to) ? 'text-green-400' : 'text-white/55 active:text-white'}`}>
            <TabIcon d={t.d} />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="md:pl-[264px] pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div key={pathname} className="screen-in max-w-[1280px] mx-auto px-4 md:px-8 py-4 md:py-8">{children}</div>
      </main>
      <TabBar />
      <div className="hidden md:block fixed top-5 right-6 z-40 rtl:right-auto rtl:left-6"><LangMenu /></div>
    </div>
  );
}
