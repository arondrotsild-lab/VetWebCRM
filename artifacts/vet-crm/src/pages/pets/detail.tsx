import { useGetPet, useGetPetMedicalRecords } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Loader2, ArrowLeft, Dog, User, Activity, FileText, Calendar, Weight } from "lucide-react";

export default function PetDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: pet, isLoading: petLoading } = useGetPet(id, { query: { enabled: !!id } });
  const { data: recordsData, isLoading: recordsLoading } = useGetPetMedicalRecords(id, { query: { enabled: !!id } });

  if (petLoading || !pet) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  const records = recordsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/pets" className="p-2 glass-card hover:bg-green-500/10 rounded-md transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">Медицинская карта</h1>
        </div>
      </div>

      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-5 pointer-events-none">
          <Dog className="w-48 h-48" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="w-32 h-32 shrink-0 rounded-full bg-[rgba(10,26,10,0.8)] border-4 border-green-500/20 flex items-center justify-center shadow-lg shadow-green-900/20">
            <Dog className="w-16 h-16 text-green-400/80" />
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{pet.name}</h2>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                    {pet.species}
                  </span>
                  {pet.breed && (
                    <span className="px-3 py-1 bg-[rgba(10,26,10,0.8)] text-muted-foreground rounded-full border border-[rgba(74,222,128,0.2)]">
                      {pet.breed}
                    </span>
                  )}
                </div>
              </div>
              
              <Link href={`/clients/${pet.clientId}`} className="glass-card-hover p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Владелец</div>
                  <div className="font-semibold text-sm hover:text-green-400 transition-colors">{pet.clientName || 'Перейти к клиенту'}</div>
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[rgba(74,222,128,0.1)]">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Возраст</div>
                <div className="font-medium text-lg">{pet.age ? `${pet.age} лет` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Вес</div>
                <div className="font-medium text-lg font-mono text-green-400">{pet.weight ? `${pet.weight} кг` : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Окрас</div>
                <div className="font-medium">{pet.color || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Добавлен</div>
                <div className="font-medium text-sm">{formatDate(pet.createdAt).split(' ')[0]}</div>
              </div>
            </div>

            {pet.notes && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                <div className="text-xs text-yellow-500/70 mb-1 uppercase font-bold tracking-wider">Особые отметки</div>
                <p className="text-sm text-yellow-100/90 leading-relaxed">{pet.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical History Timeline */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="text-green-400 w-6 h-6" /> История болезни
        </h3>

        {recordsLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-green-400 animate-spin" /></div>
        ) : records.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-green-500/50 before:via-green-500/20 before:to-transparent">
            {records.map((record, idx) => (
              <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#040a04] bg-green-900 shadow shadow-green-500/20 group-hover:bg-green-500 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <FileText className="w-4 h-4 text-green-400 group-hover:text-[#040a04]" />
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-5 group-hover:border-green-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <span className="font-mono text-sm text-green-400">{formatDate(record.createdAt)}</span>
                    <span className="text-xs px-2 py-1 rounded bg-[rgba(10,26,10,0.6)] border border-green-500/10 flex items-center gap-1">
                      <User className="w-3 h-3" /> Врач: {record.vetName || 'Неизвестно'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Диагноз</div>
                      <div className="font-medium text-lg leading-tight">{record.diagnosis}</div>
                    </div>
                    
                    {record.treatment && (
                      <div className="pt-2 border-t border-[rgba(74,222,128,0.1)]">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Лечение</div>
                        <div className="text-sm leading-relaxed">{record.treatment}</div>
                      </div>
                    )}
                    
                    {record.prescription && (
                      <div className="pt-2 border-t border-[rgba(74,222,128,0.1)]">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Назначения</div>
                        <div className="text-sm font-mono text-blue-200 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                          {record.prescription}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-muted-foreground flex flex-col items-center">
            <Activity className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Медицинская история пуста</p>
            <p className="text-sm mt-1">Здесь будут отображаться диагнозы и назначения после вызовов</p>
          </div>
        )}
      </div>
    </div>
  );
}
