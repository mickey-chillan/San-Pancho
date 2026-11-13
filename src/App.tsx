import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Cross,
  Eye,
  EyeOff,
  Hash,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AddToProgramSheet } from './components/AddToProgramSheet';
import { CategoryListView } from './components/CategoryListView';
import { LoginModal } from './components/LoginModal';
import { ManualView } from './components/ManualView';
import { ProgramEditorView } from './components/ProgramEditorView';
import { ProgramSharedView } from './components/ProgramSharedView';
import { SongLyricsBlock } from './components/SongLyricsBlock';
import { SongReaderView } from './components/SongReaderView';
import { ThemeToggle } from './components/ThemeToggle';
import {
  ALL_SONGS_ORDERED,
  ALL_TONES_ORDERED,
  CATEGORY_BY_ID,
  SLOT_DEFINITIONS,
  SONG_BY_ID,
  SONGBOOK_CATEGORIES,
  createEmptySlots,
  formatSundayDateSpanish,
  getNextSundayISO,
  normalizeSearchText,
} from './data/songbook';
import type {
  AppView,
  ProgramDateSummary,
  ProgramSlots,
  SlotKey,
  Song,
  SundayProgram,
} from './types';
import { decodeProgramFromUrlParam } from './utils/programCodec';

const TOKEN_STORAGE_KEY = 'csf-editor-token';

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'home' });

  // Day / Night mode (defaults to white Day Mode for church legibility)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('csf-theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      window.localStorage.setItem('csf-theme', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode((prev) => !prev);
  }

  // Editor authentication state
  const [editorToken, setEditorToken] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Song reader preferences
  const [showChords, setShowChords] = useState(true);
  const [fontSize, setFontSize] = useState(19);
  const [homeLyricsExpanded, setHomeLyricsExpanded] = useState(true);

  // Home search & tone filter
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalTone, setGlobalTone] = useState('');

  // Official & Viewed Shared Program state
  const [officialProgram, setOfficialProgram] = useState<SundayProgram | null>(null);
  const [viewedProgram, setViewedProgram] = useState<SundayProgram | null>(null);
  const [allDates, setAllDates] = useState<ProgramDateSummary[]>([]);
  const [lastProgramMode, setLastProgramMode] = useState<'official' | 'shared-url' | 'code' | 'date'>('official');
  const [loadingProgram, setLoadingProgram] = useState(true);

  // Calendar editor state
  const [draftDate, setDraftDate] = useState<string>(getNextSundayISO);
  const [draftNote, setDraftNote] = useState<string>('');
  const [draftSlots, setDraftSlots] = useState<ProgramSlots>(createEmptySlots);
  const [loadingEditorDate, setLoadingEditorDate] = useState(false);
  const draftTouchedRef = useRef(false);

  // Short code lookup state
  const [codeInput, setCodeInput] = useState('');
  const [codeLookupError, setCodeLookupError] = useState('');
  const [lookingUpCode, setLookingUpCode] = useState(false);

  // Add-to-program bottom sheet target song (editor only)
  const [sheetSong, setSheetSong] = useState<Song | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const isEditor = Boolean(editorToken);

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  }

  function navigateTo(nextView: AppView) {
    if (nextView.type === 'program-view') {
      setLastProgramMode(nextView.mode);
    }
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      // Validate stored editor token if present
      if (editorToken) {
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${editorToken}` },
          });
          if (meRes.ok) {
            const meData = (await meRes.json()) as { authenticated?: boolean };
            if (!meData.authenticated && active) {
              setEditorToken(null);
              try {
                window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const params = new URLSearchParams(window.location.search);
      const urlPayload = params.get('p');
      const urlCode = params.get('c');

      let openedFromUrl = false;
      if (urlPayload) {
        const decoded = decodeProgramFromUrlParam(urlPayload);
        if (decoded && active) {
          setViewedProgram(decoded);
          setLastProgramMode('shared-url');
          setView({ type: 'program-view', mode: 'shared-url' });
          setLoadingProgram(false);
          openedFromUrl = true;
        }
      } else if (urlCode) {
        try {
          const cleanCode = urlCode.trim().toUpperCase();
          const codeRes = await fetch(`/api/program/by-code/${encodeURIComponent(cleanCode)}`);
          if (codeRes.ok) {
            const codeData = (await codeRes.json()) as { program?: SundayProgram };
            if (codeData.program && active) {
              setViewedProgram(codeData.program);
              setLastProgramMode('code');
              setView({ type: 'program-view', mode: 'code' });
              setLoadingProgram(false);
              openedFromUrl = true;
            }
          }
        } catch {
          // Fall back to official program
        }
      }

      try {
        const res = await fetch('/api/program/official');
        if (res.ok) {
          const data = (await res.json()) as {
            program: SundayProgram | null;
            allDates?: ProgramDateSummary[];
          };
          if (!active) return;
          setOfficialProgram(data.program);
          setAllDates(data.allDates ?? []);

          if (!openedFromUrl) {
            setViewedProgram(data.program);
          }

          if (data.program && !draftTouchedRef.current) {
            setDraftDate(data.program.sundayDate || getNextSundayISO());
            setDraftNote(data.program.note || '');
            setDraftSlots(data.program.slots);
          }
        }
      } catch {
        // Ignore network errors if URL payload loaded
      } finally {
        if (active) setLoadingProgram(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const isGlobalFiltering = Boolean(globalQuery.trim() || globalTone);

  const filteredGlobalSongs = useMemo(() => {
    if (!isGlobalFiltering) return [];
    const q = normalizeSearchText(globalQuery);
    return ALL_SONGS_ORDERED.filter((song) => {
      if (globalTone && song.tone !== globalTone) return false;
      if (q && !normalizeSearchText(song.title).includes(q)) return false;
      return true;
    });
  }, [globalQuery, globalTone, isGlobalFiltering]);

  async function handleLookupCode(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = codeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleaned) {
      setCodeLookupError('Escribe un código de programa (ej: SF1001).');
      return;
    }
    setLookingUpCode(true);
    setCodeLookupError('');
    try {
      const res = await fetch(`/api/program/by-code/${encodeURIComponent(cleaned)}`);
      const data = (await res.json()) as { program?: SundayProgram; error?: string };
      if (!res.ok || !data.program) {
        setCodeLookupError(data.error || `No existe un programa con el código ${cleaned}.`);
        return;
      }
      setViewedProgram(data.program);
      setCodeInput('');
      navigateTo({ type: 'program-view', mode: 'code' });
    } catch {
      setCodeLookupError('No se pudo consultar el código en el servidor.');
    } finally {
      setLookingUpCode(false);
    }
  }

  async function handleSelectPublicDate(dateStr: string) {
    setLoadingProgram(true);
    try {
      const res = await fetch(`/api/program/by-date/${encodeURIComponent(dateStr)}`);
      const data = (await res.json()) as { program?: SundayProgram | null };
      if (res.ok) {
        setViewedProgram(data.program ?? null);
        navigateTo({ type: 'program-view', mode: 'date' });
      }
    } catch {
      showToast('No se pudo cargar la fecha seleccionada.');
    } finally {
      setLoadingProgram(false);
    }
  }

  async function loadEditorDate(dateStr: string) {
    setDraftDate(dateStr);
    draftTouchedRef.current = false;
    setLoadingEditorDate(true);
    try {
      const res = await fetch(`/api/program/by-date/${encodeURIComponent(dateStr)}`);
      if (res.ok) {
        const data = (await res.json()) as { program?: SundayProgram | null };
        if (data.program) {
          setDraftNote(data.program.note || '');
          setDraftSlots(data.program.slots);
        } else {
          setDraftNote('');
          setDraftSlots(createEmptySlots());
        }
      }
    } catch {
      showToast('No se pudo consultar esa fecha.');
    } finally {
      setLoadingEditorDate(false);
    }
  }

  function handleLoginSuccess(token: string, username: string) {
    setEditorToken(token);
    try {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // ignore
    }
    setLoginModalOpen(false);
    showToast(`Sesión iniciada (${username})`);
    navigateTo({ type: 'program-edit' });
  }

  function handleLogout() {
    setEditorToken(null);
    try {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Sesión de editor cerrada');
    if (view.type === 'program-edit') {
      navigateTo({ type: 'home' });
    }
  }

  function handleAssignDraftSlot(slotKey: SlotKey, song: Song | null) {
    draftTouchedRef.current = true;
    setDraftSlots((prev) => ({
      ...prev,
      [slotKey]: song
        ? {
            songId: song.id,
            title: song.title,
            tone: song.tone,
            categoryName: song.categoryName,
          }
        : null,
    }));
  }

  function handleAssignFromSheet(slotKey: SlotKey, song: Song) {
    handleAssignDraftSlot(slotKey, song);
    setSheetSong(null);
    showToast(`"${song.title}" agregado a ${draftDate}`);
  }

  function handleOpenOfficialProgram() {
    setViewedProgram(officialProgram);
    navigateTo({ type: 'program-view', mode: 'official' });
  }

  function handleOpenEditorForDate(targetDate?: string) {
    if (!isEditor) {
      setLoginModalOpen(true);
      return;
    }
    if (targetDate && targetDate !== draftDate) {
      void loadEditorDate(targetDate);
    }
    navigateTo({ type: 'program-edit' });
  }

  function handleOpenSongFromProgram(songId: string) {
    const song = SONG_BY_ID.get(songId);
    if (!song) {
      showToast('Canto no encontrado en el catálogo');
      return;
    }
    navigateTo({ type: 'song', songId: song.id, returnTo: 'program-view' });
  }

  function handleSavedProgram(program: SundayProgram, updatedDates: ProgramDateSummary[]) {
    setOfficialProgram(program);
    setViewedProgram(program);
    setAllDates(updatedDates);
    draftTouchedRef.current = false;
    setDraftDate(program.sundayDate);
    setDraftNote(program.note);
    setDraftSlots(program.slots);
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    navigateTo({ type: 'program-view', mode: 'official' });
  }

  const activeCategory = view.type === 'category' ? CATEGORY_BY_ID.get(view.categoryId) ?? null : null;
  const activeSong = view.type === 'song' ? SONG_BY_ID.get(view.songId) ?? null : null;

  const showBottomProgramBar =
    view.type === 'home' || view.type === 'category' || view.type === 'song';

  return (
    <div className="min-h-screen bg-white text-[#181D27] transition-colors dark:bg-[#0F141D] dark:text-[#F3F5F8]">
      {view.type === 'home' ? (
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:px-6">
          <header className="border-b border-[#E5E0D8] pb-5 dark:border-[#283344]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B4691E] dark:text-[#F2B463]">
                  <Cross className="h-3.5 w-3.5 shrink-0" />
                  <span>Convento San Francisco de Chillán</span>
                </div>
                <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-[#181D27] sm:text-4xl dark:text-[#F3F5F8]">
                  Cancionero San Francisco
                </h1>
              </div>

              <div className="flex flex-wrap shrink-0 items-center gap-2">
                {isEditor ? (
                  <button
                    type="button"
                    onClick={() => navigateTo({ type: 'program-edit' })}
                    className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-3.5 text-sm font-bold text-white shadow-xs active:scale-[0.98] dark:bg-[#2A4E7E]"
                  >
                    <CalendarDays className="h-4 w-4 text-[#F6C88B]" />
                    <span>Calendario</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigateTo({ type: 'manual' })}
                  className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 text-sm font-bold text-[#181D27] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]"
                >
                  <CircleHelp className="h-4 w-4 text-[#B4691E] dark:text-[#F2B463]" />
                  <span>Manual</span>
                </button>

                {isEditor ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión de editor"
                    className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-sm font-semibold text-[#525D70] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#9BA7B8]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(true)}
                    className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#1E3A5F] bg-[#EEF3F8] px-3.5 text-sm font-bold text-[#1E3A5F] active:bg-[#DCE7F2] dark:border-[#6CA0DC] dark:bg-[#172334] dark:text-[#8AB4E8]"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                )}

                <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
              </div>
            </div>

            <p className="mt-1.5 text-sm text-[#525D70] dark:text-[#9BA7B8]">
              471 cantos en 24 categorías · Consulta libre del programa dominical y letras con acordes.
            </p>
          </header>

          {/* Último Programa Publicado en la portada antes del listado */}
          <section className="mt-5 rounded-3xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 shadow-xs sm:p-5 dark:border-[#283344] dark:bg-[#171F2C]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E0D8] pb-3.5 dark:border-[#283344]">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Último Programa Publicado</span>
                </p>
                {officialProgram ? (
                  <div className="mt-1 flex items-center gap-2 text-base font-bold capitalize text-[#1E3A5F] sm:text-lg dark:text-[#8AB4E8]">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formatSundayDateSpanish(officialProgram.sundayDate)}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[#525D70] dark:text-[#9BA7B8]">
                    {loadingProgram ? 'Cargando programación...' : 'Sin programación publicada aún.'}
                  </p>
                )}
                {officialProgram?.note ? (
                  <p className="mt-0.5 text-xs font-medium text-[#525D70] dark:text-[#9BA7B8]">
                    {officialProgram.note}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {officialProgram?.code ? (
                  <span className="font-mono-chord rounded-xl border border-[#E5E0D8] bg-white px-3 py-1.5 text-xs font-bold tracking-wider text-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F2B463]">
                    {officialProgram.code}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={handleOpenOfficialProgram}
                  className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-3.5 text-xs font-bold text-white shadow-2xs active:scale-[0.98] sm:text-sm dark:bg-[#2A4E7E]"
                >
                  <span>Ver página publicada</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {officialProgram ? (
              <div className="mt-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChords((v) => !v)}
                    aria-pressed={showChords}
                    className={`flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition ${
                      showChords
                        ? 'border-[#B4691E] bg-[#FDF5EC] text-[#9A5512] dark:border-[#F2B463]/50 dark:bg-[#2A2014] dark:text-[#F2B463]'
                        : 'border-[#E5E0D8] bg-white text-[#525D70] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#9BA7B8]'
                    }`}
                  >
                    {showChords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showChords ? 'Ocultar Acordes' : 'Mostrar Acordes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHomeLyricsExpanded((v) => !v)}
                    className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-white px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8]"
                  >
                    {homeLyricsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span>
                      {homeLyricsExpanded ? 'Contraer letras' : 'Expandir todas las letras'}
                    </span>
                  </button>
                </div>

                <div className="space-y-3">
                  {SLOT_DEFINITIONS.map((def) => {
                    const sel = officialProgram.slots[def.key];
                    const song = sel ? SONG_BY_ID.get(sel.songId) : undefined;
                    return (
                      <div
                        key={def.key}
                        className="rounded-2xl border border-[#E5E0D8] bg-white p-4 dark:border-[#283344] dark:bg-[#0F141D]"
                      >
                        {sel ? (
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                                  {def.label}
                                </p>
                                <h3 className="mt-0.5 text-base font-bold leading-snug text-[#181D27] sm:text-lg dark:text-[#F3F5F8]">
                                  {sel.title}
                                </h3>
                                <p className="text-xs text-[#525D70] dark:text-[#9BA7B8]">
                                  {sel.categoryName} · Tono{' '}
                                  <span className="font-mono-chord font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                                    [{sel.tone}]
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  navigateTo({
                                    type: 'song',
                                    songId: sel.songId,
                                    returnTo: 'home',
                                  })
                                }
                                className="flex min-h-[44px] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#8AB4E8]"
                              >
                                <span>Abrir canto</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>

                            {homeLyricsExpanded ? (
                              <div className="mt-3 border-t border-[#EFECE6] pt-3 dark:border-[#242F40]">
                                <SongLyricsBlock
                                  song={song}
                                  showChords={showChords}
                                  fontSize={16}
                                  compact
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                              {def.label}
                            </p>
                            <p className="text-xs italic text-[#7B8494]">Sin asignar</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {allDates.length > 0 ? (
                <div>
                  <label
                    htmlFor="home-other-sunday"
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                    <span>Revisar otro domingo</span>
                  </label>
                  <select
                    id="home-other-sunday"
                    value={officialProgram?.sundayDate ?? ''}
                    onChange={(e) => {
                      if (e.target.value) void handleSelectPublicDate(e.target.value);
                    }}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm font-bold text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8]"
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

              <form onSubmit={handleLookupCode}>
                <label
                  htmlFor="program-code-input"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
                >
                  <Hash className="h-3.5 w-3.5 text-[#B4691E] dark:text-[#F2B463]" />
                  <span>Tengo un Código de Programa</span>
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="program-code-input"
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      setCodeLookupError('');
                    }}
                    placeholder="Ej: SF1001"
                    maxLength={12}
                    className="font-mono-chord min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#E5E0D8] bg-white px-3 text-sm font-bold uppercase tracking-wider text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8]"
                  />
                  <button
                    type="submit"
                    disabled={lookingUpCode}
                    className="min-h-[44px] shrink-0 whitespace-nowrap rounded-xl bg-[#181D27] px-4 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60 dark:bg-[#F2B463] dark:text-[#0F141D]"
                  >
                    {lookingUpCode ? '...' : 'Abrir'}
                  </button>
                </div>
                {codeLookupError ? (
                  <p className="mt-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                    {codeLookupError}
                  </p>
                ) : null}
              </form>
            </div>

            {isEditor ? (
              <div className="mt-4 border-t border-[#E5E0D8] pt-3.5 dark:border-[#283344]">
                <button
                  type="button"
                  onClick={() => navigateTo({ type: 'program-edit' })}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1E3A5F] bg-[#EEF3F8] px-4 text-sm font-bold text-[#1E3A5F] active:scale-[0.99] dark:border-[#6CA0DC] dark:bg-[#172334] dark:text-[#D5E4F7]"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Abrir Calendario de Editores para crear o modificar fechas</span>
                </button>
              </div>
            ) : null}
          </section>

          <section className="mt-5">
            <div className="grid gap-2.5 sm:grid-cols-[1fr_210px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8494]" />
                <input
                  type="search"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Buscar canto por nombre..."
                  className="min-h-[48px] w-full rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] pl-10 pr-4 text-base font-medium text-[#181D27] outline-none focus:border-[#1E3A5F] focus:bg-white dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
                />
              </div>

              <select
                value={globalTone}
                onChange={(e) => setGlobalTone(e.target.value)}
                aria-label="Filtrar todo el cancionero por tono"
                className="min-h-[48px] w-full rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 text-sm font-bold text-[#181D27] outline-none focus:border-[#1E3A5F] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
              >
                <option value="">Filtrar por tono (todos)</option>
                {ALL_TONES_ORDERED.map((t) => (
                  <option key={t} value={t}>
                    Tono [{t}]
                  </option>
                ))}
              </select>
            </div>
          </section>

          {isGlobalFiltering ? (
            <section className="mt-5">
              <div className="flex items-center justify-between gap-2 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                  Resultados en orden oficial ({filteredGlobalSongs.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalQuery('');
                    setGlobalTone('');
                  }}
                  className="min-h-[44px] whitespace-nowrap px-2 text-xs font-bold text-[#1E3A5F] dark:text-[#8AB4E8]"
                >
                  Limpiar filtro
                </button>
              </div>

              <div className="divide-y divide-[#EFECE6] rounded-3xl border border-[#E5E0D8] bg-white lg:grid lg:grid-cols-2 lg:divide-y-0 lg:gap-px lg:bg-[#EFECE6] lg:overflow-hidden dark:divide-[#242F40] dark:border-[#283344] dark:bg-[#171F2C] dark:lg:bg-[#242F40]">
                {filteredGlobalSongs.length === 0 ? (
                  <div className="col-span-2 bg-white px-5 py-10 text-center dark:bg-[#171F2C]">
                    <p className="text-base font-medium text-[#525D70] dark:text-[#9BA7B8]">
                      No hay cantos que coincidan con esa búsqueda.
                    </p>
                  </div>
                ) : (
                  filteredGlobalSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex min-h-[64px] items-center justify-between gap-2 bg-white px-4 py-2.5 hover:bg-[#FAF8F5] dark:bg-[#171F2C] dark:hover:bg-[#1E293B]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigateTo({
                            type: 'song',
                            songId: song.id,
                            returnTo: 'home',
                          })
                        }
                        className="flex min-h-[48px] min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold leading-snug text-[#181D27] dark:text-[#F3F5F8]">
                            {song.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#525D70] dark:text-[#9BA7B8]">
                            {song.categoryName} ·{' '}
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
                          onClick={() => setSheetSong(song)}
                          aria-label={`Agregar ${song.title} al programa`}
                          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-[#1E3A5F] active:bg-[#EEF3F8] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8] dark:active:bg-[#222D3F]"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : (
            <section className="mt-6">
              <div className="flex items-center justify-between pb-3">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                  <BookOpen className="h-4 w-4" />
                  <span>Índice por Categorías (Orden Exacto)</span>
                </h2>
                <span className="text-xs font-semibold text-[#525D70] dark:text-[#9BA7B8]">
                  24 categorías
                </span>
              </div>

              <div className="divide-y divide-[#EFECE6] rounded-3xl border border-[#E5E0D8] bg-white lg:grid lg:grid-cols-2 lg:divide-y-0 lg:gap-px lg:bg-[#EFECE6] lg:overflow-hidden dark:divide-[#242F40] dark:border-[#283344] dark:bg-[#171F2C] dark:lg:bg-[#242F40]">
                {SONGBOOK_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => navigateTo({ type: 'category', categoryId: category.id })}
                    className="flex min-h-[62px] w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition hover:bg-[#FAF8F5] active:bg-[#F2EDE5] dark:bg-[#171F2C] dark:hover:bg-[#1E293B] dark:active:bg-[#243145]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] font-mono-chord text-xs font-bold text-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8]">
                        {String(category.order).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold leading-snug text-[#181D27] dark:text-[#F3F5F8]">
                          {category.name}
                        </p>
                        <p className="text-xs text-[#525D70] dark:text-[#9BA7B8]">
                          {category.songs.length} {category.songs.length === 1 ? 'canto' : 'cantos'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#9AA2B1]" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      ) : null}

      {view.type === 'category' && activeCategory ? (
        <CategoryListView
          category={activeCategory}
          darkMode={darkMode}
          isEditor={isEditor}
          onToggleDarkMode={toggleDarkMode}
          onBack={() => navigateTo({ type: 'home' })}
          onSelectSong={(song) =>
            navigateTo({
              type: 'song',
              songId: song.id,
              returnTo: 'category',
              categoryId: activeCategory.id,
            })
          }
          onQuickAddSong={(song) => setSheetSong(song)}
        />
      ) : null}

      {view.type === 'song' && activeSong ? (
        <SongReaderView
          song={activeSong}
          showChords={showChords}
          onToggleChords={() => setShowChords((v) => !v)}
          fontSize={fontSize}
          onChangeFontSize={(delta) =>
            setFontSize((prev) => Math.min(28, Math.max(15, prev + delta)))
          }
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          isEditor={isEditor}
          onBack={() => {
            if (view.returnTo === 'category' && view.categoryId) {
              navigateTo({ type: 'category', categoryId: view.categoryId });
            } else if (view.returnTo === 'program-view') {
              navigateTo({ type: 'program-view', mode: lastProgramMode });
            } else {
              navigateTo({ type: 'home' });
            }
          }}
          onOpenAddToProgram={(song) => setSheetSong(song)}
        />
      ) : null}

      {view.type === 'program-view' ? (
        <ProgramSharedView
          program={viewedProgram}
          mode={view.mode}
          loading={loadingProgram}
          isEditor={isEditor}
          allDates={allDates}
          showChords={showChords}
          onToggleChords={() => setShowChords((v) => !v)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSelectSundayDate={(d) => void handleSelectPublicDate(d)}
          onBackHome={() => navigateTo({ type: 'home' })}
          onOpenSong={handleOpenSongFromProgram}
          onEditProgram={handleOpenEditorForDate}
          onToast={showToast}
        />
      ) : null}

      {view.type === 'program-edit' ? (
        <ProgramEditorView
          editorToken={editorToken}
          sundayDate={draftDate}
          note={draftNote}
          slots={draftSlots}
          allDates={allDates}
          loadingDate={loadingEditorDate}
          showChords={showChords}
          onToggleChords={() => setShowChords((v) => !v)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSelectCalendarDate={(d) => void loadEditorDate(d)}
          onChangeNote={(n) => {
            draftTouchedRef.current = true;
            setDraftNote(n);
          }}
          onAssignSlot={handleAssignDraftSlot}
          onSaved={handleSavedProgram}
          onViewPublishedPage={handleOpenOfficialProgram}
          onBackHome={() => navigateTo({ type: 'home' })}
          onAuthExpired={() => {
            setEditorToken(null);
            try {
              window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            } catch {
              // ignore
            }
            setLoginModalOpen(true);
            showToast('Tu sesión expiró. Inicia sesión nuevamente.');
          }}
          onToast={showToast}
        />
      ) : null}

      {view.type === 'manual' ? (
        <ManualView
          isEditor={isEditor}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onBackHome={() => navigateTo({ type: 'home' })}
          onOpenLogin={() => {
            navigateTo({ type: 'home' });
            setLoginModalOpen(true);
          }}
          onOpenCalendar={() => navigateTo({ type: 'program-edit' })}
          onOpenPublishedProgram={handleOpenOfficialProgram}
          onToast={showToast}
        />
      ) : null}

      {showBottomProgramBar ? (
        <div className="print-hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E0D8] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-[#283344] dark:bg-[#0F141D]/95">
          <div className="mx-auto flex max-w-5xl items-center justify-center">
            <button
              type="button"
              onClick={handleOpenOfficialProgram}
              className="flex min-h-[44px] w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-[#1E3A5F] px-5 text-sm font-bold text-white shadow-sm active:scale-[0.98] dark:bg-[#2A4E7E]"
            >
              <CalendarCheck className="h-4 w-4 text-[#F6C88B]" />
              <span>Ver Programa del Domingo</span>
            </button>
          </div>
        </div>
      ) : null}

      <AddToProgramSheet
        song={sheetSong}
        draftSlots={draftSlots}
        onAssign={handleAssignFromSheet}
        onClose={() => setSheetSong(null)}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {toastMsg ? (
        <div
          role="status"
          className="print-hidden fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#181D27] px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:border dark:border-[#344257] dark:bg-[#1E293B]"
        >
          <span>{toastMsg}</span>
          {toastMsg.includes('agregado a') ? (
            <button
              type="button"
              onClick={() => {
                setToastMsg(null);
                navigateTo({ type: 'program-edit' });
              }}
              className="whitespace-nowrap rounded-lg bg-[#B4691E] px-2.5 py-1 text-xs font-bold text-white"
            >
              Ir a Guardar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
