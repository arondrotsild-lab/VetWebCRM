import { useListClients } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Loader2, Users as UsersIcon, Mail, Phone, Calendar, Crown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getClientSegment, getClientSegmentLabel, type ClientSegmentFilter } from "@/lib/client-segments";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<ClientSegmentFilter>("all");
  
  const { data: clientsList, isLoading } = useListClients({
    search: search || undefined
  });

  const clients = Array.isArray(clientsList) ? clientsList : [];
  const segmentCounts = {
    all: clients.length,
    vip: clients.filter((client) => getClientSegment(client.ordersCount) === "vip").length,
    regular: clients.filter((client) => getClientSegment(client.ordersCount) === "regular").length,
    new: clients.filter((client) => getClientSegment(client.ordersCount) === "new").length,
  };
  const filteredClients = segment === "all"
    ? clients
    : clients.filter((client) => getClientSegment(client.ordersCount) === segment);
  const segmentOptions: { value: ClientSegmentFilter; title: string; description: string }[] = [
    { value: "all", title: "Все клиенты", description: "Без фильтра" },
    { value: "vip", title: "VIP", description: "Более 10 заказов" },
    { value: "regular", title: "Постоянные", description: "От 1 до 10 заказов" },
    { value: "new", title: "Новые", description: "Заказов пока нет" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Клиенты</h1>
          <p className="text-muted-foreground mt-1 text-sm">VIP — больше 10 заказов; постоянные — от 1 до 10; новые — без заказов.</p>
        </div>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="relative w-full md:max-w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Поиск по имени, телефону или email..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2" role="group" aria-label="Сегменты клиентов">
          {segmentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={segment === option.value}
              onClick={() => setSegment(option.value)}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                segment === option.value
                  ? "border-green-400/40 bg-green-500/15 text-white"
                  : "border-green-500/10 bg-[rgba(10,26,10,0.25)] text-muted-foreground hover:bg-green-500/5"
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{option.title}</span>
                <span className="block text-xs opacity-70">{option.description}</span>
              </span>
              <span className="font-mono text-sm">{segmentCounts[option.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                  <th className="p-4 font-medium w-12">ID</th>
                  <th className="p-4 font-medium">Клиент</th>
                  <th className="p-4 font-medium">Контакты</th>
                  <th className="p-4 font-medium text-center">Заказы</th>
                  <th className="p-4 font-medium text-right">Потрачено</th>
                  <th className="p-4 font-medium text-right">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const clientSegment = getClientSegment(client.ordersCount);
                  const segmentStyles = clientSegment === "vip"
                    ? "text-amber-300 bg-amber-500/10 border-amber-400/20"
                    : clientSegment === "regular"
                      ? "text-green-300 bg-green-500/10 border-green-400/20"
                      : "text-sky-300 bg-sky-500/10 border-sky-400/20";

                  return (
                  <tr key={client.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {client.id}
                    </td>
                    <td className="p-4">
                      <Link href={`/clients/${client.id}`} className="text-sm font-semibold hover:text-green-400 transition-colors flex flex-wrap items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-900 border border-green-500/20 flex items-center justify-center text-xs text-green-400">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{client.name}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${segmentStyles}`}>
                          {clientSegment === "vip" && <Crown className="w-3 h-3" />}
                          {getClientSegmentLabel(clientSegment)}
                        </span>
                      </Link>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono">{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2 py-1 bg-[rgba(74,222,128,0.1)] text-green-400 rounded-md font-mono text-sm border border-[rgba(74,222,128,0.2)]">
                        {client.ordersCount}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-mono font-medium">{formatCurrency(client.totalSpent || 0)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-muted-foreground">{formatDate(client.createdAt).split(' ')[0]}</div>
                    </td>
                  </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      {segment === "all" ? "Клиенты не найдены" : "В этом сегменте пока нет клиентов"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
