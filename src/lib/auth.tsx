import { createContext, ReactNode, useContext, useState } from 'react';
import { loginReq, storage } from './api';

interface User { id: number; name: string; role: string; phone?: string }
interface Ctx { user: User | null; login: (phone: string, password: string) => Promise<void>; logout: () => void }

const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(storage.USER) || 'null'); } catch { return null; }
  });
  const login = async (phone: string, password: string) => {
    const d = await loginReq(phone, password);
    if (d.user?.role !== 'admin') throw { response: { data: { error: 'Вход в CRM — только для руководителя компании' } } };
    localStorage.setItem(storage.TOKEN, d.token);
    localStorage.setItem(storage.USER, JSON.stringify(d.user));
    setUser(d.user);
  };
  const logout = () => {
    localStorage.removeItem(storage.TOKEN);
    localStorage.removeItem(storage.USER);
    setUser(null);
    location.href = '/login';
  };
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
