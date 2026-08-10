import { useListSuggestions, useUpdateSuggestionStatus } from "@workspace/api-client-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Loader2, MessageSquare, Check, X, Clock, Navigation } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SuggestionsPage() {
  const [filter, setFilter] = useState<string>("new");
  const queryClient = useQueryClient();
  
  const { data: suggestionsList, isLoading } = useListSuggestions();
  const updateStatus = useUpdateSuggestionStatus();

  const suggestions = suggestionsList?.data || [];
  const filtered = filter ? suggestions.filter(s => s.status === filter) : suggestions;

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] as any });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs">Новое</span>;
      case 'reviewed': return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded text-xs">На рассмотрении</span>;
      case 'approved': return <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded text-xs">Принято</span>;
      case 'rejected': return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-1 rounded text-xs">Отклонено</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Предложения</h1>
          <p className="text-muted-foreground mt-1 text-sm">Обратная связь и идеи от клиентов</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[rgba(74,222,128,0.1)] pb-px">
        {[
          { id: 'new', label: 'Новые' },
          { id: 'reviewed', label: 'В работе' },
          { id: 'approved', label: 'Принятые' },
          { id: 'rejected', label: 'Отклоненные' },
          { id: '', label: 'Все' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.id 
                ? 'border-green-400 text-green-400' 
                : 'border-transparent text-muted-foreground hover:text-white hover:border-[rgba(74,222,128,0.3)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(suggestion => (
            <div key={suggestion.id} className="glass-card p-5 group transition-all hover:bg-[rgba(10,26,10,0.9)] hover:border-[rgba(74,222,128,0.2)]">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{suggestion.clientName}</span>
                    {suggestion.telegram && (
                      <a href={`https://t.me/${suggestion.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                        <Navigation className="w-3 h-3" /> {suggestion.telegram}
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto md:ml-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(suggestion.createdAt)}
                    </span>
                  </div>
                  
                  <div className="bg-[rgba(10,26,10,0.5)] p-4 rounded-lg border border-[rgba(74,222,128,0.05)] text-sm leading-relaxed mb-4">
                    {suggestion.comment}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>{getStatusBadge(suggestion.status)}</div>
                    
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {suggestion.status === 'new' && (
                        <button 
                          onClick={() => handleUpdateStatus(suggestion.id, 'reviewed')}
                          className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs rounded border border-yellow-500/20 transition-colors"
                        >
                          Взять в работу
                        </button>
                      )}
                      {suggestion.status !== 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(suggestion.id, 'approved')}
                          className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs rounded border border-green-500/20 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Принять
                        </button>
                      )}
                      {suggestion.status !== 'rejected' && (
                        <button 
                          onClick={() => handleUpdateStatus(suggestion.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs rounded border border-red-500/20 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Отклонить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>В этой категории нет предложений</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
