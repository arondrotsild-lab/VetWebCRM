import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { errText, QUICK_LOGIN } from '../lib/api';
import LangMenu from '../components/LangMenu';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (p: string, pw: string) => {
    setBusy(true); setErr('');
    try { await login(p, pw); nav('/'); } catch (e) { setErr(errText(e, 'Неверный телефон или пароль')); } finally { setBusy(false); }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); go(phone, password); };
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
      <div className="fixed z-50 right-4 rtl:right-auto rtl:left-4" style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}><LangMenu /></div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl" />
            <img src="/logo.jpeg" alt="ВетДом" className="relative w-24 h-24 rounded-full object-cover border-4 border-white/25 shadow-2xl" />
          </div>
          <div className="eyebrow mt-5">ВетДом · ветеринар на дом</div>
          <h1 className="text-3xl font-black mt-2">CRM компании</h1>
          <p className="text-white/55 text-sm mt-2 max-w-xs">Выручка и прибыль, заказы, клиенты и питомцы, ветеринары, магазин, реклама и счета — всё в одном месте</p>
        </div>

        <button onClick={() => go(QUICK_LOGIN.phone, QUICK_LOGIN.password)} disabled={busy}
          className="tile3d relative overflow-hidden w-full rounded-[26px] p-5 text-left flex items-center gap-4 mb-4"
          style={{ background: 'linear-gradient(145deg, #8BD14E 0%, #5E9E2C 45%, #2F5119 100%)' }}>
          <span className="tile3d-gloss" />
          <span className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(145deg,#FFE36E,#C98A06)' }}>👑</span>
          <span className="relative flex-1">
            <span className="block font-black text-lg">Быстрый вход</span>
            <span className="block text-sm text-white/85">Руководитель ВетДом · полный доступ</span>
          </span>
          <span className="relative text-2xl">›</span>
        </button>

        <form onSubmit={submit} className="card3d p-5 space-y-3">
          <div className="text-xs text-white/50 text-center">или войдите по телефону</div>
          <div><label className="label">Телефон</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 999 000-00-01" inputMode="tel" autoComplete="username" /></div>
          <div><label className="label">Пароль</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
          {err && <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">{err}</div>}
          <button className="btn-green w-full" disabled={busy || !phone || !password}>{busy ? 'Входим…' : 'Войти'}</button>
        </form>
        <p className="text-center text-[11px] text-white/35 mt-4">Доступ только для руководства компании. Все действия записываются.</p>
      </div>
    </div>
  );
}
