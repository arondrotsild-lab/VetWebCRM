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
        <div className="p-6 flex items-center gap-3 animate-slide-left">
          <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center" style={{ animation: 'glowPulse 3s infinite' }}>
            <Stethoscope className="text-green-400 w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">VetCRM</span>
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
