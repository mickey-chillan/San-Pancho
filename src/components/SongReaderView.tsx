import { ArrowLeft, Eye, EyeOff, Minus, Plus, CalendarPlus } from 'lucide-react';
import type { Song } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface SongReaderViewProps {
  song: Song;
  showChords: boolean;
  onToggleChords: () => void;
  fontSize: number;
  onChangeFontSize: (delta: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isEditor: boolean;
  onBack: () => void;
  onOpenAddToProgram: (song: Song) => void;
}

export function SongReaderView({
  song,
  showChords,
  onToggleChords,
  fontSize,
  onChangeFontSize,
  darkMode,
  onToggleDarkMode,
  isEditor,
  onBack,
  onOpenAddToProgram,
}: SongReaderViewProps) {
  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-md print-hidden dark:border-[#283344] dark:bg-[#0F141D]/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-sm font-semibold text-[#1E3A5F] active:bg-[#EEF3F8] dark:text-[#8AB4E8] dark:active:bg-[#171F2C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden xs:inline sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleChords}
              aria-pressed={showChords}
              className={`flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                showChords
                  ? 'border-[#B4691E] bg-[#FDF5EC] text-[#9A5512] dark:border-[#F2B463]/50 dark:bg-[#2A2014] dark:text-[#F2B463]'
                  : 'border-[#E5E0D8] bg-white text-[#525D70] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#9BA7B8]'
              }`}
            >
              {showChords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showChords ? 'Ocultar Acordes' : 'Mostrar Acordes'}</span>
            </button>

            <div className="flex items-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] dark:border-[#283344] dark:bg-[#171F2C]">
              <button
                type="button"
                onClick={() => onChangeFontSize(-2)}
                aria-label="Reducir tamaño de letra"
                className="flex min-h-[44px] min-w-[40px] items-center justify-center text-[#181D27] active:bg-[#EFECE6] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-1 text-xs font-bold text-[#525D70] dark:text-[#9BA7B8]">{fontSize}</span>
              <button
                type="button"
                onClick={() => onChangeFontSize(2)}
                aria-label="Aumentar tamaño de letra"
                className="flex min-h-[44px] min-w-[40px] items-center justify-center text-[#181D27] active:bg-[#EFECE6] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} compact />
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 pt-5 sm:px-6">
        <header className="border-b border-[#E5E0D8] pb-4 dark:border-[#283344]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
            {song.categoryName} · Canto {song.numberInCategory}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-bold leading-snug text-[#181D27] sm:text-3xl dark:text-[#F3F5F8]">
            {song.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#525D70] dark:text-[#9BA7B8]">
              Tono:{' '}
              <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                [{song.tone}]
              </span>
            </p>
            {isEditor ? (
              <button
                type="button"
                onClick={() => onOpenAddToProgram(song)}
                className="print-hidden flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-4 text-sm font-semibold text-white shadow-sm active:scale-[0.98] dark:bg-[#2A4E7E]"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>Agregar al Programa</span>
              </button>
            ) : null}
          </div>
        </header>

        <div className="mt-6 space-y-1">
          {song.lines.map((line, idx) => {
            const isBlank = !line.lyric && !line.chords;
            if (isBlank) {
              return <div key={idx} className="h-4" />;
            }

            const isRefrainLabel = /^(coro|estribillo)\s*[:.]?/i.test(line.lyric.trim());
            const chordFontSize = Math.max(13, fontSize - 3);

            return (
              <div
                key={idx}
                className={`${line.stanzaBreak && idx > 0 ? 'pt-4' : 'pt-0.5'} ${
                  isRefrainLabel ? 'border-l-2 border-[#B4691E] pl-3 dark:border-[#F2B463]' : ''
                }`}
              >
                {showChords && line.chords ? (
                  <pre
                    style={{ fontSize: `${chordFontSize}px`, lineHeight: 1.25 }}
                    className="font-mono-chord m-0 overflow-x-auto whitespace-pre font-bold text-[#B4691E] dark:text-[#F2B463]"
                  >
                    {line.chords}
                  </pre>
                ) : null}
                {line.lyric ? (
                  <p
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.45 }}
                    className={`m-0 whitespace-pre-wrap ${
                      isRefrainLabel
                        ? 'font-bold text-[#1E3A5F] dark:text-[#8AB4E8]'
                        : 'font-medium text-[#181D27] dark:text-[#F3F5F8]'
                    }`}
                  >
                    {line.lyric}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {isEditor ? (
          <div className="mt-8 border-t border-[#E5E0D8] pt-5 print-hidden dark:border-[#283344]">
            <button
              type="button"
              onClick={() => onOpenAddToProgram(song)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1E3A5F] bg-[#EEF3F8] px-5 text-base font-bold text-[#1E3A5F] active:scale-[0.99] dark:border-[#6CA0DC] dark:bg-[#172334] dark:text-[#8AB4E8]"
            >
              <CalendarPlus className="h-5 w-5" />
              <span>Agregar este canto al Programa de la fecha seleccionada</span>
            </button>
          </div>
        ) : null}
      </article>
    </div>
  );
}
