import axios from 'axios';

// Тот же сервер, что у приложений клиентов и ветеринаров. Вход — только для руководителя (роль admin).
const TOKEN = 'crm_token';
const USER = 'crm_user';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem(TOKEN);
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USER);
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const storage = { TOKEN, USER };
export const errText = (e: unknown, fallback = 'Что-то пошло не так') =>
  (e as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;

export const QUICK_LOGIN = { phone: '+79990000001', password: 'vetdomceo2026' };

export const loginReq = (phone: string, password: string) => api.post('/auth/login', { phone, password }).then((r) => r.data);
export const crm = <T = any>(path: string, params?: Record<string, unknown>) =>
  api.get<T>(`/crm/${path}`, { params }).then((r) => r.data);

// ── Типы ──────────────────────────────────────────────────────────
export interface Month { m: string; svc: number; shop: number; revenue: number; orders: number; shop_n: number; expenses: number; profit: number; marketing: number; new_clients: number }

export default api;
