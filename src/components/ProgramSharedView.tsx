import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  Link2,
  MessageCircle,
  Music2,
  Pencil,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { SLOT_DEFINITIONS, SONG_BY_ID, formatSundayDateSpanish } from '../data/songbook';
import type { ProgramDateSummary, SundayProgram } from '../types';
import { exportProgramToPdf } from '../utils/pdfExport';
import { buildProgramShareUrl, buildWhatsAppShareUrl } from '../utils/programCodec';
import { SongLyricsBlock } from './SongLyricsBlock';
import { ThemeToggle } from './ThemeToggle';

interface ProgramSharedViewProps {
  program: SundayProgram | null;
  mode: 'official' | 'shared-url' | 'code' | 'date';
  loading: boolean;
  isEditor: boolean;
  allDates: ProgramDateSummary[];
  showChords: boolean;
  onToggleChords: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectSundayDate: (date: string) => void;
  onBackHome: () => void;
  onOpenSong: (songId: string) => void;
  onEditProgram: (targetDate?: string) => void;
  onToast: (msg: string) => void;
}

export function ProgramSharedView({
  program,
  mode,
  loading,
  isEditor,
  allDates,
  showChords,
  onToggleChords,
  darkMode,
  onToggleDarkMode,
  onSelectSundayDate,
  onBackHome,
  onOpenSong,
  onEditProgram,
  onToast,
}: ProgramSharedViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(true);

  const shareUrl = program ? buildProgramShareUrl(program) : '';
  const whatsAppUrl = program ? buildWhatsAppShareUrl(program, shareUrl) : '';

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onToast('Link del programa copiado');
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      onToast('No se pudo copiar automáticamente; selecciona el link manualmente.');
    }
  }

  async function handleCopyCode() {
    if (!program?.code) return;
    try {
      await navigator.clipboard.writeText(program.code);
      setCopiedCode(true);
      onToast(`Código ${program.code} copiado`);
      window.setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      onToast(`Código: ${program.code}`);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleSavePdf() {
    if (!program) return;
    exportProgramToPdf(program, shareUrl, { includeChords: showChords });
    onToast('PDF con letras desplegadas descargado');
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-md print-hidden dark:border-[#283344] dark:bg-[#0F141D]/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={onBackHome}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-[#1E3A5F] active:bg-[#EEF3F8] dark:text-[#8AB4E8] dark:active:bg-[#171F2C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Cancionero</span>
          </button>

          <div className="flex items-center gap-2">
            {isEditor ? (
              <button
                type="button"
                onClick={() => onEditProgram(program?.sundayDate)}
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 text-sm font-semibold text-[#181D27] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
              >
                <Pencil className="h-4 w-4 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                <span>Editar fecha</span>
              </button>
            ) : null}
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} compact />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6">
        <div className="rounded-2xl border border-[#1E3A5F]/20 bg-[#EEF3F8] px-4 py-3 text-[#1E3A5F] dark:border-[#6CA0DC]/30 dark:bg-[#172334] dark:text-[#D5E4F7]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#1E3A5F] dark:text-[#8AB4E8]" />
            <p className="text-sm font-bold sm:text-base">
              Estás viendo el Programa Oficial Compartido
            </p>
          </div>
          <p className="mt-1 pl-7 text-xs text-[#3C506B] dark:text-[#9CB3CF]">
            {mode === 'shared-url'
              ? 'Vista comunitaria en modo solo lectura abierta desde enlace compartido.'
              : mode === 'code'
              ? 'Vista comunitaria en modo solo lectura abierta con código corto.'
              : mode === 'date'
              ? 'Consultando la programación guardada para la fecha seleccionada.'
              : 'Última programación oficial publicada para toda la comunidad.'}
          </p>
        </div>

        {allDates.length > 0 ? (
          <div className="print-hidden mt-4 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-3.5 dark:border-[#283344] dark:bg-[#171F2C]">
            <label
              htmlFor="public-sunday-select"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
            >
              <CalendarDays className="h-3.5 w-3.5 text-[#B4691E] dark:text-[#F2B463]" />
              <span>Revisar cantos de otro domingo</span>
            </label>
            <select
              id="public-sunday-select"
              value={program?.sundayDate ?? ''}
              onChange={(e) => {
                if (e.target.value) onSelectSundayDate(e.target.value);
              }}
              className="mt-2 min-h-[44px] w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 text-sm font-bold text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
            >
              {allDates.map((d, idx) => (
                <option key={d.sundayDate} value={d.sundayDate}>
                  {idx === 0 ? 'Último: ' : ''}
                  {formatSundayDateSpanish(d.sundayDate)} ({d.code})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-8 text-center dark:border-[#283344] dark:bg-[#171F2C]">
            <p className="text-base font-medium text-[#525D70] dark:text-[#9BA7B8]">
              Cargando Programa Oficial...
            </p>
          </div>
        ) : !program ? (
          <div className="mt-6 rounded-3xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 text-center sm:p-8 dark:border-[#283344] dark:bg-[#171F2C]">
            <Music2 className="mx-auto h-10 w-10 text-[#B4691E] dark:text-[#F2B463]" />
            <h2 className="mt-3 font-display text-xl font-bold text-[#181D27] dark:text-[#F3F5F8]">
              No hay programación para esta fecha
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#525D70] dark:text-[#9BA7B8]">
              Selecciona otra fecha publicada en el listado superior o vuelve al cancionero general.
            </p>
          </div>
        ) : (
          <>
            <section className="mt-5 rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-xs sm:p-6 dark:border-[#283344] dark:bg-[#171F2C]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E0D8] pb-4 dark:border-[#283344]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                    Convento San Francisco de Chillán
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-[#181D27] sm:text-3xl dark:text-[#F3F5F8]">
                    Programa de Misa
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-base font-semibold capitalize text-[#1E3A5F] dark:text-[#8AB4E8]">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formatSundayDateSpanish(program.sundayDate)}</span>
                  </div>
                </div>

                {program.code ? (
                  <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-2.5 text-right dark:border-[#283344] dark:bg-[#0F141D]">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]">
                      Código Corto
                    </span>
                    <span className="font-mono-chord text-xl font-bold tracking-widest text-[#1E3A5F] dark:text-[#F2B463]">
                      {program.code}
                    </span>
                  </div>
                ) : null}
              </div>

              {program.note.trim() ? (
                <div className="mt-4 rounded-2xl border-l-4 border-[#B4691E] bg-[#FDF5EC] px-4 py-3 dark:border-[#F2B463] dark:bg-[#2A2014]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#9A5512] dark:text-[#F2B463]">
                    Nota del coordinador
                  </p>
                  <p className="mt-0.5 text-base font-medium text-[#181D27] dark:text-[#F3F5F8]">
                    {program.note}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 print-hidden">
                <button
                  type="button"
                  onClick={onToggleChords}
                  aria-pressed={showChords}
                  className={`flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition ${
                    showChords
                      ? 'border-[#B4691E] bg-[#FDF5EC] text-[#9A5512] dark:border-[#F2B463]/50 dark:bg-[#2A2014] dark:text-[#F2B463]'
                      : 'border-[#E5E0D8] bg-[#FAF8F5] text-[#525D70] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#9BA7B8]'
                  }`}
                >
                  {showChords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showChords ? 'Ocultar Acordes' : 'Mostrar Acordes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLyricsExpanded((v) => !v)}
                  className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8]"
                >
                  {lyricsExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>{lyricsExpanded ? 'Contraer letras' : 'Expandir todas las letras'}</span>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {SLOT_DEFINITIONS.map((def) => {
                  const sel = program.slots[def.key];
                  const song = sel ? SONG_BY_ID.get(sel.songId) : undefined;
                  return (
                    <div
                      key={def.key}
                      className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 transition dark:border-[#283344] dark:bg-[#0F141D]"
                    >
                      {sel ? (
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                                {def.label}
                              </p>
                              <h3 className="mt-0.5 text-lg font-bold leading-snug text-[#181D27] sm:text-xl dark:text-[#F3F5F8]">
                                {sel.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-[#525D70] dark:text-[#9BA7B8]">
                                {sel.categoryName} ·{' '}
                                <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                                  [{sel.tone}]
                                </span>
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenSong(sel.songId)}
                              className="print-hidden flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-white px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#8AB4E8]"
                            >
                              Pantalla completa →
                            </button>
                          </div>

                          <div
                            className={`${
                              lyricsExpanded ? 'mt-3.5 border-t border-[#E5E0D8] pt-3.5 dark:border-[#283344]' : 'hidden print-only mt-3.5 border-t border-gray-300 pt-3.5'
                            }`}
                          >
                            <SongLyricsBlock
                              song={song}
                              showChords={showChords}
                              fontSize={16}
                              compact
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-[44px] items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                              {def.label}
                            </p>
                            <p className="mt-0.5 text-sm italic text-[#7B8494]">
                              Sin canto asignado
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 space-y-3 print-hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]">
                Compartir y guardar programa
              </h2>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#15803D] px-5 text-base font-bold text-white shadow-sm transition active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Compartir por WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#E5E0D8] bg-white px-3 text-sm font-bold text-[#181D27] active:bg-[#FAF8F5] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-[#15803D] dark:text-[#4ADE80]" />
                  ) : (
                    <Link2 className="h-4 w-4 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                  )}
                  <span>{copiedLink ? 'Copiado' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#E5E0D8] bg-white px-3 text-sm font-bold text-[#181D27] active:bg-[#FAF8F5] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-[#15803D] dark:text-[#4ADE80]" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                  )}
                  <span>{copiedCode ? 'Copiado' : 'Copiar Código'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#E5E0D8] bg-white px-3 text-sm font-bold text-[#181D27] active:bg-[#FAF8F5] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
                >
                  <Printer className="h-4 w-4 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={handleSavePdf}
                  className="flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#1E3A5F] bg-[#EEF3F8] px-3 text-sm font-bold text-[#1E3A5F] active:bg-[#DCE7F2] dark:border-[#6CA0DC] dark:bg-[#172334] dark:text-[#8AB4E8] dark:active:bg-[#22334D]"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Guardar PDF</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
