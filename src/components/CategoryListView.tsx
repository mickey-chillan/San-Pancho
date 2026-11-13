import { ArrowLeft, CalendarPlus, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeSearchText } from '../data/songbook';
import type { Category, Song } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface CategoryListViewProps {
  category: Category;
  darkMode: boolean;
  isEditor: boolean;
  onToggleDarkMode: () => void;
  onBack: () => void;
  onSelectSong: (song: Song) => void;
  onQuickAddSong: (song: Song) => void;
}

export function CategoryListView({
  category,
  darkMode,
  isEditor,
  onToggleDarkMode,
  onBack,
  onSelectSong,
  onQuickAddSong,
}: CategoryListViewProps) {
  const [query, setQuery] = useState('');
  const [toneFilter, setToneFilter] = useState('');

  const availableTones = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const s of category.songs) {
      if (!seen.has(s.tone)) {
        seen.add(s.tone);
        list.push(s.tone);
      }
    }
    return list;
  }, [category]);

  const filteredSongs = useMemo(() => {
    const q = normalizeSearchText(query);
    return category.songs.filter((song) => {
      if (toneFilter && song.tone !== toneFilter) return false;
      if (q && !normalizeSearchText(song.title).includes(q)) return false;
      return true;
    });
  }, [category, query, toneFilter]);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-md dark:border-[#283344] dark:bg-[#0F141D]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-[#1E3A5F] active:bg-[#EEF3F8] dark:text-[#8AB4E8] dark:active:bg-[#171F2C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Categorías</span>
          </button>

          <span className="truncate text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
            {category.name}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs font-semibold text-[#525D70] sm:inline dark:text-[#9BA7B8]">
              {category.songs.length} cantos
            </span>
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} compact />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
            Categoría {String(category.order).padStart(2, '0')} · Orden Oficial ({category.songs.length} cantos)
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#181D27] sm:text-3xl dark:text-[#F3F5F8]">
            {category.name}
          </h1>
        </header>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8494]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar dentro de ${category.name}...`}
              className="min-h-[46px] w-full rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] pl-10 pr-4 text-sm font-medium text-[#181D27] outline-none focus:border-[#1E3A5F] focus:bg-white dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
            />
          </div>

          <select
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            aria-label="Filtrar por tono"
            className="min-h-[46px] w-full rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 text-sm font-semibold text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
          >
            <option value="">Todos los tonos</option>
            {availableTones.map((t) => (
              <option key={t} value={t}>
                Tono [{t}]
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 divide-y divide-[#EFECE6] rounded-3xl border border-[#E5E0D8] bg-white lg:grid lg:grid-cols-2 lg:divide-y-0 lg:gap-px lg:bg-[#EFECE6] lg:overflow-hidden dark:divide-[#242F40] dark:border-[#283344] dark:bg-[#171F2C] dark:lg:bg-[#242F40]">
          {filteredSongs.length === 0 ? (
            <div className="col-span-2 bg-white px-5 py-10 text-center dark:bg-[#171F2C]">
              <p className="text-base font-medium text-[#525D70] dark:text-[#9BA7B8]">
                No se encontraron cantos con ese filtro.
              </p>
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex min-h-[64px] items-center justify-between gap-2 bg-white px-4 py-2.5 transition hover:bg-[#FAF8F5] dark:bg-[#171F2C] dark:hover:bg-[#1E293B]"
              >
                <button
                  type="button"
                  onClick={() => onSelectSong(song)}
                  className="flex min-h-[48px] min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="w-7 shrink-0 text-right font-mono-chord text-xs font-bold text-[#7B8494]">
                    {String(song.numberInCategory).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold leading-snug text-[#181D27] dark:text-[#F3F5F8]">
                      {song.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#525D70] dark:text-[#9BA7B8]">
                      Tono{' '}
                      <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                        [{song.tone}]
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#9AA2B1]" />
                </button>

                {isEditor ? (
                  <button
                    type="button"
                    onClick={() => onQuickAddSong(song)}
                    aria-label={`Agregar ${song.title} al programa`}
                    title="Agregar al Programa"
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-[#1E3A5F] active:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8] dark:active:bg-[#222D3F]"
                  >
                    <CalendarPlus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
