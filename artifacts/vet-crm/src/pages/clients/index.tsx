import { useListClients } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Loader2, Users as UsersIcon, Mail, Phone, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  
  const { data: clientsList, isLoading } = useListClients({
    search: search || undefined
  });

  const clients = clientsList?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Клиенты</h1>
          <p className="text-muted-foreground mt-1 text-sm">База владельцев питомцев</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Поиск по имени, телефону или email..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {client.id}
                    </td>
                    <td className="p-4">
                      <Link href={`/clients/${client.id}`} className="text-sm font-semibold hover:text-green-400 transition-colors block flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-900 border border-green-500/20 flex items-center justify-center text-xs text-green-400">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        {client.name}
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
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      Клиенты не найдены
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
