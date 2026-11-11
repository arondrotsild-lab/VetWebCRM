import { useGetClient, useGetClientOrders, useGetClientPets } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { Loader2, ArrowLeft, Phone, Mail, Calendar, Dog, ShoppingBag, User, Crown, FileText } from "lucide-react";
import { getClientSegment, getClientSegmentLabel } from "@/lib/client-segments";

export default function ClientDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: client, isLoading: clientLoading } = useGetClient(id);
  const { data: ordersData, isLoading: ordersLoading } = useGetClientOrders(id);
  const { data: petsData, isLoading: petsLoading } = useGetClientPets(id);

  if (clientLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const pets = petsData ?? [];
  const orders = ordersData ?? [];
  const clientSegment = getClientSegment(client.ordersCount);
  const segmentStyles = clientSegment === "vip"
    ? "text-amber-300 bg-amber-500/10 border-amber-400/20"
    : clientSegment === "regular"
      ? "text-green-300 bg-green-500/10 border-green-400/20"
      : "text-sky-300 bg-sky-500/10 border-sky-400/20";

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/clients" className="p-2 glass-card hover:bg-green-500/10 rounded-md transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">Карточка клиента</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-900 border-2 border-green-500/20 flex items-center justify-center font-bold text-2xl text-green-400">
                {client.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{client.name}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${segmentStyles}`}>
                    {clientSegment === "vip" && <Crown className="w-3 h-3" />}
                    {getClientSegmentLabel(clientSegment)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">ID: #{client.id}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card bg-[rgba(10,26,10,0.4)] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="font-mono">{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-green-400" />
                    <span>{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Регистрация: {formatDate(client.createdAt).split(' ')[0]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card bg-[rgba(10,26,10,0.4)] p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1 flex justify-center"><ShoppingBag className="w-3 h-3 mr-1" /> Заказов</div>
                  <div className="text-xl font-bold font-mono">{client.ordersCount}</div>
                </div>
                <div className="glass-card bg-[rgba(10,26,10,0.4)] p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1 flex justify-center"><Dog className="w-3 h-3 mr-1" /> Питомцев</div>
                  <div className="text-xl font-bold font-mono">{pets.length}</div>
                </div>
              </div>
              
              <div className="glass-card bg-green-900/10 border-green-500/20 p-4 text-center">
                <div className="text-sm text-green-400 mb-1">LTV (Всего потрачено)</div>
                <div className="text-2xl font-bold font-mono text-green-400">{formatCurrency(client.totalSpent || 0)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pets Section */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Dog className="w-5 h-5 text-green-400" /> Питомцы клиента
              </h3>
            </div>
            <div className="p-5">
              {petsLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
              ) : pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map(pet => (
                    <div key={pet.id} className="glass-card-hover p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[rgba(10,26,10,0.8)] border border-green-500/20 flex items-center justify-center shrink-0">
                          <Dog className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-lg truncate">{pet.name}</div>
                          <div className="text-sm text-muted-foreground">{pet.species} {pet.breed ? `(${pet.breed})` : ''}</div>
                        </div>
                      </div>
                      <Link href={`/pets/${pet.id}`} className="btn-vetpassport inline-flex w-fit self-start items-center justify-center gap-1.5 text-xs whitespace-nowrap shrink-0 sm:self-auto">
                        <FileText className="w-3.5 h-3.5" />
                        Ветпаспорт
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-[rgba(74,222,128,0.2)] rounded-lg">
                  У клиента пока нет добавленных питомцев
                </div>
              )}
            </div>
          </div>

          {/* Orders History */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(74,222,128,0.1)] flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-400" /> История заказов
              </h3>
            </div>
            <div className="overflow-x-auto">
              {ordersLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
              ) : orders.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(74,222,128,0.1)] text-xs text-muted-foreground bg-[rgba(10,26,10,0.4)]">
                      <th className="p-4 font-medium">Заказ</th>
                      <th className="p-4 font-medium">Услуга / Питомец</th>
                      <th className="p-4 font-medium">Статус</th>
                      <th className="p-4 font-medium text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                        <td className="p-4">
                          <Link href={`/orders/${order.id}`} className="text-sm font-mono text-green-400 hover:underline block mb-1">
                            #{order.id}
                          </Link>
                          <div className="text-xs text-muted-foreground">{formatDate(order.createdAt).split(' ')[0]}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{order.serviceName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{order.petName || 'Без питомца'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-mono font-medium">{formatCurrency(order.totalPrice)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Заказов еще не было
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
