import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Stethoscope, 
  Users, 
  Dog, 
  ActivitySquare, 
  LineChart, 
  Trophy, 
  MessageSquare,
  LogOut,
  Wifi,
  Menu,
  X
} from "lucide-react";
import logoUrl from "/logo.jpeg";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Обзор",
    items: [
      { path: "/", label: "Дашборд", icon: LayoutDashboard }
    ]
  },
  {
    label: "Работа",
    items: [
      { path: "/orders", label: "Заказы", icon: ClipboardList },
      { path: "/vets", label: "Врачи", icon: Stethoscope }
    ]
  },
  {
    label: "База данных",
    items: [
      { path: "/clients", label: "Клиенты", icon: Users },
      { path: "/pets", label: "Питомцы", icon: Dog }
    ]
  },
  {
    label: "Платформа",
    items: [
      { path: "/services", label: "Услуги", icon: ActivitySquare },
      { path: "/finance", label: "Финансы", icon: LineChart },
      { path: "/leaderboard", label: "Лидерборд", icon: Trophy },
      { path: "/suggestions", label: "Предложения", icon: MessageSquare }
    ]
  }
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#040a04] overflow-hidden">
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 glass-card rounded-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} className="text-green-400" /> : <Menu size={20} className="text-green-400" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-[rgba(6,13,6,0.97)] border-r border-[rgba(74,222,128,0.08)] flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 flex items-center gap-3 animate-slide-left border-b border-[rgba(74,222,128,0.08)]">
          <img
            src={logoUrl}
            alt="Ветеринар на дом"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ boxShadow: '0 0 12px rgba(74,222,128,0.35)', border: '1.5px solid rgba(74,222,128,0.3)' }}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight text-white">Ветеринар на дом</span>
            <span className="text-[11px] text-green-400/60 font-medium tracking-wide">Админ панель CRM</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1 animate-slide-left" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-green-500/50 mb-2">
                {group.label}
              </div>
              {group.items.map(item => {
                const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "nav-item",
                      isActive && "active"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[rgba(74,222,128,0.08)]">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-green-400/80 mb-2">
            <Wifi size={16} className="text-green-400" />
            <span>Система онлайн</span>
          </div>
          <button className="nav-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/10">
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-[#040a04]/0 to-transparent z-0"></div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
