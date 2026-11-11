import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donut, HBars } from '../components/Charts';
import { Card, PageHead, Loader, ErrorBox, Search, Pager, Segmented } from '../components/ui';
import { useCrm, num, dateShort, speciesEmoji, plural, PALETTE } from '../lib/format';

interface P { id: number; name: string; species: string; breed: string; age_years: number; weight_kg: string; sex: string; photo_url: string | null; passport_id: string | null;
  current_concern: string | null; owner_id: number; owner: string; visits: number; last_visit: string | null }

export default function PetsPage() {
  const nav = useNavigate();
  const [q, setQ] = useState(''); const [qq, setQq] = useState(''); const [species, setSpecies] = useState(''); const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => { setQq(q); setPage(1); }, 350); return () => clearTimeout(t); }, [q]);
  const { data, error } = useCrm('pets', { q: qq || undefined, species: species || undefined, page });
  if (error) return <ErrorBox />;
  const total = data?.bySpecies.reduce((a: number, s: { n: number }) => a + s.n, 0) ?? 0;
  return (
    <div className="space-y-4">
      <PageHead eyebrow="Пациенты" title="Питомцы" sub="Все животные клиентов: кого лечим, какие породы и с чем обращаются чаще всего" />
      {data && (
        <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
          <Card title="Кто наши пациенты" sub={`${num(total)} животных`}>
            <div className="flex justify-center">
              <Donut size={190} items={data.bySpecies.map((s: { species: string; n: number }, i: number) => ({ name: `${speciesEmoji(s.species)} ${s.species}`, value: s.n, color: PALETTE[i] }))}
                center={<div className="font-black text-2xl money">{num(total)}</div>} sub="питомцев" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-4">
              {data.bySpecies.map((s: { species: string; n: number; age: string }, i: number) => (
                <div key={s.species} className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: PALETTE[i] }} /><span className="text-white/70 flex-1 truncate">{`${speciesEmoji(s.species)} ${s.species}`}</span><b>{num(s.n)}</b></div>
              ))}
            </div>
          </Card>
          <Card title="Популярные породы" sub="Топ по числу питомцев">
            <HBars fmt={num} items={data.breeds.slice(0, 8).map((b: { species: string; breed: string; n: number }, i: number) => ({ label: b.breed, icon: speciesEmoji(b.species), value: b.n, color: PALETTE[(i + 2) % PALETTE.length], right: num(b.n) }))} />
          </Card>
          <Card title="С чем обращаются" sub="Услуги за 90 дней по видам животных">
            <HBars fmt={num} items={data.reasons.slice(0, 8).map((r: { name: string; icon: string; species: string; n: number }, i: number) => ({ label: `${r.name} · ${speciesEmoji(r.species)}`, icon: r.icon, value: r.n, color: PALETTE[(i + 5) % PALETTE.length], right: num(r.n) }))} />
          </Card>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1"><Search value={q} onChange={setQ} placeholder="Кличка, порода, хозяин или номер ветпаспорта" /></div>
        <Segmented value={species} onChange={(v) => { setSpecies(v); setPage(1); }} items={[{ k: '', label: 'Все' }, { k: 'Собака', label: '🐕 Собаки' }, { k: 'Кошка', label: '🐈 Кошки' }, { k: 'Кролик', label: '🐇 Кролики' }, { k: 'Птица', label: '🦜 Птицы' }]} />
      </div>
      {!data ? <Loader rows={2} /> : (
        <>
          <div className="text-sm text-white/55 money">{`Найдено питомцев: ${num(data.total)}`}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.rows.map((p: P) => (
              <button key={p.id} onClick={() => nav(`/clients/${p.owner_id}`)} className="card3d p-3.5 text-left hover:border-green-400/30 transition-colors">
                <div className="flex items-center gap-3">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="w-14 h-14 rounded-2xl object-cover" /> :
                    <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl tile3d flex-shrink-0" style={{ background: 'linear-gradient(145deg,#E7B985,#5C3F28)' }}>{speciesEmoji(p.species)}</span>}
                  <div className="min-w-0">
                    <div className="font-black truncate">{p.name}</div>
                    <div className="text-[11px] text-white/55 truncate">{p.breed}</div>
                    <div className="text-[11px] text-white/55">{`${p.age_years} ${plural(p.age_years, 'год', 'года', 'лет')} · ${p.weight_kg} кг`}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px]">
                  <span className="text-white/60 truncate">{`👤 ${p.owner}`}</span>
                  <span className="font-bold text-green-300 flex-shrink-0">{p.last_visit ? `визитов: ${p.visits} · ${dateShort(p.last_visit)}` : `визитов: ${p.visits}`}</span>
                </div>
              </button>
            ))}
          </div>
          <Pager page={data.page} pages={data.pages} onPage={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </>
      )}
    </div>
  );
}
