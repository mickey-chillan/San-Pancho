import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_SONGS_ORDERED,
  SLOT_DEFINITIONS,
  SONG_BY_ID,
  SONGBOOK_CATEGORIES,
  formatSundayDateSpanish,
  normalizeSearchText,
} from '../data/songbook';
import type { ProgramDateSummary, ProgramSlots, SlotKey, Song, SundayProgram } from '../types';
import { SongLyricsBlock } from './SongLyricsBlock';
import { ThemeToggle } from './ThemeToggle';

interface ProgramEditorViewProps {
  editorToken: string | null;
  sundayDate: string;
  note: string;
  slots: ProgramSlots;
  allDates: ProgramDateSummary[];
  loadingDate: boolean;
  showChords: boolean;
  onToggleChords: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectCalendarDate: (date: string) => void;
  onChangeNote: (note: string) => void;
  onAssignSlot: (slotKey: SlotKey, song: Song | null) => void;
  onSaved: (program: SundayProgram, updatedDates: ProgramDateSummary[]) => void;
  onViewPublishedPage: () => void;
  onBackHome: () => void;
  onAuthExpired: () => void;
  onToast: (msg: string) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function parseIsoParts(iso: string): { year: number; month: number; day: number } {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

function toIsoDate(year: number, monthZeroBased: number, day: number): string {
  return `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function ProgramEditorView({
  editorToken,
  sundayDate,
  note,
  slots,
  allDates,
  loadingDate,
  showChords,
  onToggleChords,
  darkMode,
  onToggleDarkMode,
  onSelectCalendarDate,
  onChangeNote,
  onAssignSlot,
  onSaved,
  onViewPublishedPage,
  onBackHome,
  onAuthExpired,
  onToast,
}: ProgramEditorViewProps) {
  const [pickingSlot, setPickingSlot] = useState<SlotKey | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lyricsExpanded, setLyricsExpanded] = useState(true);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const initialParts = parseIsoParts(sundayDate);
  const [viewYear, setViewYear] = useState(initialParts.year);
  const [viewMonth, setViewMonth] = useState(initialParts.month);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const parts = parseIsoParts(sundayDate);
    setViewYear(parts.year);
    setViewMonth(parts.month);
  }, [sundayDate]);

  const savedDateSet = useMemo(() => new Set(allDates.map((d) => d.sundayDate)), [allDates]);

  const monthTitle = useMemo(() => {
    const dt = new Date(viewYear, viewMonth, 1);
    return dt.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  }, [viewYear, viewMonth]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday = 0 ... Sunday = 6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ day: number | null; iso: string | null; isSunday: boolean }> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, iso: null, isSunday: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const col = (startOffset + day - 1) % 7;
      cells.push({
        day,
        iso: toIsoDate(viewYear, viewMonth, day),
        isSunday: col === 6,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  const activeSlotDef = useMemo(
    () => SLOT_DEFINITIONS.find((s) => s.key === pickingSlot) ?? null,
    [pickingSlot]
  );

  const eligibleSongs = useMemo(() => {
    if (!activeSlotDef) return [];
    const base = activeSlotDef.allowedCategoryName
      ? SONGBOOK_CATEGORIES.find((c) => c.name === activeSlotDef.allowedCategoryName)?.songs ?? []
      : ALL_SONGS_ORDERED;

    const q = normalizeSearchText(pickerSearch);
    if (!q) return base;
    return base.filter(
      (s) =>
        normalizeSearchText(s.title).includes(q) ||
        normalizeSearchText(s.tone).includes(q) ||
        normalizeSearchText(s.categoryName).includes(q)
    );
  }, [activeSlotDef, pickerSearch]);

  const existingDateEntry = useMemo(
    () => allDates.find((d) => d.sundayDate === sundayDate) ?? null,
    [allDates, sundayDate]
  );

  async function handleSaveDate() {
    setSaveError('');
    if (!editorToken) {
      onAuthExpired();
      return;
    }
    if (!sundayDate) {
      setSaveError('Selecciona una fecha en el calendario.');
      return;
    }
    const hasAny = Object.values(slots).some(Boolean);
    if (!hasAny) {
      setSaveError('Asigna al menos un canto antes de guardar el programa.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/program/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${editorToken}`,
        },
        body: JSON.stringify({
          sundayDate,
          note,
          slots,
        }),
      });
      const data = (await res.json()) as {
        program?: SundayProgram;
        allDates?: ProgramDateSummary[];
        error?: string;
      };
      if (res.status === 401) {
        onAuthExpired();
        return;
      }
      if (!res.ok || !data.program) {
        setSaveError(data.error || 'No se pudo guardar el programa de esta fecha.');
        return;
      }
      onToast(`Guardado y publicado para ${formatSundayDateSpanish(sundayDate)}`);
      onSaved(data.program, data.allDates ?? allDates);
    } catch {
      setSaveError('Error de conexión al guardar el programa.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-md dark:border-[#283344] dark:bg-[#0F141D]/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={onBackHome}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-[#1E3A5F] active:bg-[#EEF3F8] dark:text-[#8AB4E8] dark:active:bg-[#171F2C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Portada</span>
          </button>

          <span className="truncate text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
            Calendario de Editores
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onViewPublishedPage}
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs font-bold text-[#1E3A5F] sm:text-sm dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#8AB4E8]"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Publicada</span>
            </button>
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} compact />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-4 pt-5 sm:px-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
            Modo Editor · Sesión Activa
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#181D27] sm:text-3xl dark:text-[#F3F5F8]">
            Programación por Calendario
          </h1>
          <p className="mt-1 text-sm text-[#525D70] dark:text-[#9BA7B8]">
            Haz clic en el botón de fecha para abrir el calendario y elegir cualquier día nuevo o anterior. Al guardar, esa fecha pasa a ser la última programación visible para toda la comunidad.
          </p>
        </header>

        <section className="rounded-3xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 sm:p-5 dark:border-[#283344] dark:bg-[#171F2C]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="editor-calendar-date"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
              >
                <Calendar className="h-3.5 w-3.5 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                <span>Fecha seleccionada del calendario</span>
              </label>

              <div className="mt-1.5 flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#1E3A5F] bg-white px-3.5 text-left transition hover:bg-[#EEF3F8] active:scale-[0.99] dark:border-[#6CA0DC] dark:bg-[#0F141D] dark:hover:bg-[#172334]"
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold capitalize text-[#181D27] dark:text-[#F3F5F8]">
                      {formatSundayDateSpanish(sundayDate)}
                    </span>
                    <span className="font-mono-chord block text-xs font-semibold text-[#525D70] dark:text-[#9BA7B8]">
                      {sundayDate}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1E3A5F] px-3 py-1.5 text-xs font-bold text-white dark:bg-[#2A4E7E]">
                    <CalendarDays className="h-4 w-4" />
                    <span>{calendarOpen ? 'Cerrar' : 'Elegir fecha'}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = dateInputRef.current;
                    if (!el) return;
                    if (typeof el.showPicker === 'function') {
                      el.showPicker();
                    } else {
                      el.focus();
                      el.click();
                    }
                  }}
                  title="Selector nativo del navegador"
                  aria-label="Abrir selector nativo de fecha"
                  className="flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E5E0D8] bg-white text-[#1E3A5F] hover:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8]"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                <input
                  ref={dateInputRef}
                  id="editor-calendar-date"
                  type="date"
                  value={sundayDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectCalendarDate(e.target.value);
                      setCalendarOpen(false);
                    }
                  }}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#525D70] dark:text-[#9BA7B8]">
                {loadingDate ? (
                  <span>Cargando fecha...</span>
                ) : existingDateEntry ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                    <span>
                      Editando cancionero existente ({existingDateEntry.code})
                    </span>
                  </>
                ) : (
                  <span>Fecha nueva · Lista disponible para programar</span>
                )}
              </p>
            </div>

            <div>
              <label
                htmlFor="coordinator-note"
                className="text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
              >
                Nota para esta fecha (opcional)
              </label>
              <input
                id="coordinator-note"
                type="text"
                maxLength={240}
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="Ej: Misa 11:00 hrs · Llegar 10:30"
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#E5E0D8] bg-white px-3.5 text-base text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
              />
            </div>
          </div>

          {calendarOpen ? (
            <div className="mt-4 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm dark:border-[#283344] dark:bg-[#0F141D]">
              <div className="flex items-center justify-between gap-2 pb-3">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Mes anterior"
                  className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-[#181D27] hover:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-display text-base font-bold capitalize text-[#181D27] dark:text-[#F3F5F8]">
                  {monthTitle}
                </span>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Mes siguiente"
                  className="flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-[#181D27] hover:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((wd, idx) => (
                  <div
                    key={wd}
                    className={`py-1 text-[11px] font-bold uppercase ${
                      idx === 6
                        ? 'text-[#B4691E] dark:text-[#F2B463]'
                        : 'text-[#7B8494] dark:text-[#9BA7B8]'
                    }`}
                  >
                    {wd}
                  </div>
                ))}

                {calendarCells.map((cell, idx) => {
                  if (!cell.day || !cell.iso) {
                    return <div key={`empty-${idx}`} className="h-10" />;
                  }
                  const isSelected = cell.iso === sundayDate;
                  const hasSaved = savedDateSet.has(cell.iso);
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => {
                        onSelectCalendarDate(cell.iso!);
                        setCalendarOpen(false);
                      }}
                      className={`relative flex h-10 cursor-pointer flex-col items-center justify-center rounded-xl text-sm font-bold transition ${
                        isSelected
                          ? 'bg-[#1E3A5F] text-white shadow-xs dark:bg-[#2A4E7E]'
                          : cell.isSunday
                          ? 'bg-[#FDF5EC] text-[#9A5512] hover:bg-[#F7E5CE] dark:bg-[#2A2014] dark:text-[#F2B463] dark:hover:bg-[#3A2C1B]'
                          : 'text-[#181D27] hover:bg-[#EEF3F8] dark:text-[#F3F5F8] dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      <span>{cell.day}</span>
                      {hasSaved ? (
                        <span
                          className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                            isSelected ? 'bg-[#F6C88B]' : 'bg-[#15803D] dark:bg-[#4ADE80]'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-center text-[11px] text-[#525D70] dark:text-[#9BA7B8]">
                Los domingos están destacados y las fechas con punto verde ya tienen programación guardada.
              </p>
            </div>
          ) : null}

          {allDates.length > 0 ? (
            <div className="mt-4 border-t border-[#E5E0D8] pt-3.5 dark:border-[#283344]">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]">
                <CalendarDays className="h-3.5 w-3.5 text-[#B4691E] dark:text-[#F2B463]" />
                <span>Fechas ya programadas (toca una para editar)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allDates.map((d) => {
                  const isActive = d.sundayDate === sundayDate;
                  return (
                    <button
                      key={d.sundayDate}
                      type="button"
                      onClick={() => {
                        onSelectCalendarDate(d.sundayDate);
                        setCalendarOpen(false);
                      }}
                      className={`min-h-[40px] cursor-pointer whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition ${
                        isActive
                          ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white dark:border-[#6CA0DC] dark:bg-[#2A4E7E]'
                          : 'border-[#E5E0D8] bg-white text-[#181D27] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8]'
                      }`}
                    >
                      {d.sundayDate} · {d.code}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]">
              Cantos del programa (letras desplegadas)
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleChords}
                aria-pressed={showChords}
                className={`flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition ${
                  showChords
                    ? 'border-[#B4691E] bg-[#FDF5EC] text-[#9A5512] dark:border-[#F2B463]/50 dark:bg-[#2A2014] dark:text-[#F2B463]'
                    : 'border-[#E5E0D8] bg-white text-[#525D70] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#9BA7B8]'
                }`}
              >
                {showChords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showChords ? 'Ocultar Acordes' : 'Mostrar Acordes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLyricsExpanded((v) => !v)}
                className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-white px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#8AB4E8]"
              >
                {lyricsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>{lyricsExpanded ? 'Contraer' : 'Expandir todas'}</span>
              </button>
            </div>
          </div>

          {SLOT_DEFINITIONS.map((def) => {
            const current = slots[def.key];
            const song = current ? SONG_BY_ID.get(current.songId) : undefined;
            return (
              <div
                key={def.key}
                className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-2xs dark:border-[#283344] dark:bg-[#171F2C]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                      {def.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#525D70] dark:text-[#9BA7B8]">
                      {def.ruleDescription}
                    </p>
                    {current ? (
                      <div className="mt-2">
                        <p className="text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                          {current.title}
                        </p>
                        <p className="text-xs text-[#525D70] dark:text-[#9BA7B8]">
                          {current.categoryName} ·{' '}
                          <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                            [{current.tone}]
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm italic text-[#7B8494]">Sin canto seleccionado</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {current ? (
                      <button
                        type="button"
                        onClick={() => onAssignSlot(def.key, null)}
                        aria-label={`Quitar canto de ${def.shortLabel}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E5E0D8] text-[#7B8494] active:bg-[#FAF8F5] dark:border-[#283344] dark:text-[#9BA7B8] dark:active:bg-[#222D3F]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setPickerSearch('');
                        setPickingSlot(def.key);
                      }}
                      className="flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-xl bg-[#EEF3F8] px-3.5 text-sm font-bold text-[#1E3A5F] active:bg-[#DCE7F2] dark:bg-[#22334D] dark:text-[#8AB4E8] dark:active:bg-[#2D4366]"
                    >
                      {current ? 'Cambiar' : 'Elegir canto'}
                    </button>
                  </div>
                </div>

                {current && lyricsExpanded ? (
                  <div className="mt-3.5 border-t border-[#EFECE6] pt-3.5 dark:border-[#242F40]">
                    <SongLyricsBlock
                      song={song}
                      showChords={showChords}
                      fontSize={15}
                      compact
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>

        {saveError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
            {saveError}
          </div>
        ) : null}

        <button
          type="button"
          disabled={saving || loadingDate}
          onClick={handleSaveDate}
          className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1E3A5F] px-6 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60 dark:bg-[#2A4E7E]"
        >
          <Save className="h-5 w-5" />
          <span>
            {saving ? 'Guardando programación...' : `Guardar programación (${sundayDate})`}
          </span>
        </button>
      </div>

      {pickingSlot && activeSlotDef ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setPickingSlot(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex max-h-[88vh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:border dark:border-[#283344] dark:bg-[#171F2C]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto my-2.5 h-1.5 w-10 shrink-0 rounded-full bg-[#D7D1C7] sm:hidden dark:bg-[#344257]" />

            <div className="flex items-start justify-between gap-3 border-b border-[#E5E0D8] px-5 pb-3 pt-1 sm:pt-4 dark:border-[#283344]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                  {activeSlotDef.label}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  {activeSlotDef.ruleDescription}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPickingSlot(null)}
                aria-label="Cerrar lista de cantos"
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] text-[#525D70] dark:border-[#283344] dark:text-[#9BA7B8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#E5E0D8] px-5 py-3 dark:border-[#283344]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8494]" />
                <input
                  type="search"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar por nombre o tono..."
                  autoFocus
                  className="min-h-[44px] w-full rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] pl-10 pr-4 text-sm font-medium text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
                />
              </div>
            </div>

            <div className="flex-1 divide-y divide-[#EFECE6] overflow-y-auto px-5 dark:divide-[#242F40]">
              {eligibleSongs.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#525D70] dark:text-[#9BA7B8]">
                  No hay cantos que coincidan con la búsqueda.
                </p>
              ) : (
                eligibleSongs.map((song) => (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => {
                      onAssignSlot(pickingSlot, song);
                      setPickingSlot(null);
                    }}
                    className="flex min-h-[56px] w-full items-center justify-between gap-3 py-3 text-left active:bg-[#FAF8F5] dark:active:bg-[#1E293B]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-[#181D27] dark:text-[#F3F5F8]">
                        {song.title}
                      </p>
                      <p className="text-xs text-[#525D70] dark:text-[#9BA7B8]">
                        {activeSlotDef.allowedCategoryName === null
                          ? `${song.categoryName} · `
                          : `#${song.numberInCategory} · `}
                        <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                          [{song.tone}]
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                      Elegir
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
