import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    case 'confirmed': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    case 'in_progress': return 'bg-green-500/10 text-green-500 border border-green-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    case 'cancelled': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
}

export function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'Ожидает';
    case 'confirmed': return 'Подтвержден';
    case 'in_progress': return 'В процессе';
    case 'completed': return 'Завершен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
}

export function getTierBadge(tier: string) {
  switch (tier.toLowerCase()) {
    case 'бронза': return 'bg-[#cd7f32]/20 text-[#cd7f32] border border-[#cd7f32]/30';
    case 'серебро': return 'bg-[#94a3b8]/20 text-[#94a3b8] border border-[#94a3b8]/30';
    case 'золото': return 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30';
    case 'платина': return 'bg-[#e2e8f0]/20 text-[#e2e8f0] border border-[#e2e8f0]/30';
    case 'алмаз': return 'bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/30';
    default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  }
}
