import { useListPets } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Loader2, Dog, User, FileText } from "lucide-react";

export default function PetsPage() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  
  const { data: petsList, isLoading } = useListPets({
    search: search || undefined,
    species: speciesFilter || undefined
  });

  const pets = Array.isArray(petsList) ? petsList : [];
  
  // Extract unique species for filter
  const speciesOptions = ["Собака", "Кошка", "Грызун", "Птица", "Экзотика"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Питомцы</h1>
          <p className="text-muted-foreground mt-1 text-sm">База пациентов</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Кличка, порода..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSpeciesFilter("")}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
              speciesFilter === "" 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-[rgba(10,26,10,0.6)] text-muted-foreground border border-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.05)]'
            }`}
          >
            Все виды
          </button>
          {speciesOptions.map(s => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                speciesFilter === s 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-[rgba(10,26,10,0.6)] text-muted-foreground border border-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.05)]'
              }`}
            >
              {s}
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
                  <th className="p-4 font-medium">Питомец</th>
                  <th className="p-4 font-medium">Вид / Порода</th>
                  <th className="p-4 font-medium">Возраст</th>
                  <th className="p-4 font-medium">Владелец</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.id} className="border-b border-[rgba(74,222,128,0.05)] hover:bg-[rgba(74,222,128,0.04)] transition-colors">
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      {pet.id}
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <Link href={`/pets/${pet.id}`} className="text-sm font-semibold hover:text-green-400 transition-colors flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[rgba(10,26,10,0.8)] border border-green-500/20 flex items-center justify-center text-muted-foreground shrink-0">
                            <Dog className="w-5 h-5" />
                          </div>
                          {pet.name}
                        </Link>
                        <Link
                          href={`/pets/${pet.id}`}
                          className="btn-vetpassport inline-flex items-center justify-center gap-1.5 text-xs whitespace-nowrap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ветпаспорт
                        </Link>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="inline-block px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/20 mr-2">
                          {pet.species}
                        </span>
                        {pet.breed || <span className="text-muted-foreground text-xs italic">Порода не указана</span>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {pet.age ? `${pet.age} лет` : '—'}
                    </td>
                    <td className="p-4">
                      <Link href={`/clients/${pet.clientId}`} className="flex items-center gap-2 text-sm hover:text-green-400 transition-colors">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {pet.clientName || 'Владелец'}
                      </Link>
                    </td>
                  </tr>
                ))}
                {pets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <Dog className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      Питомцы не найдены
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
