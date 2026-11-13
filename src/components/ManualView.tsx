import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  Check,
  EyeOff,
  FileDown,
  Hash,
  LogIn,
  MessageCircle,
  Moon,
  Printer,
  Save,
  Search,
  Share2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { SLOT_DEFINITIONS } from '../data/songbook';
import { exportManualToPdf } from '../utils/pdfExport';
import { ThemeToggle } from './ThemeToggle';

type ManualTab = 'users' | 'editors' | 'overview';

interface ManualViewProps {
  isEditor: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackHome: () => void;
  onOpenLogin: () => void;
  onOpenCalendar: () => void;
  onOpenPublishedProgram: () => void;
  onToast: (msg: string) => void;
}

export function ManualView({
  isEditor,
  darkMode,
  onToggleDarkMode,
  onBackHome,
  onOpenLogin,
  onOpenCalendar,
  onOpenPublishedProgram,
  onToast,
}: ManualViewProps) {
  const [activeTab, setActiveTab] = useState<ManualTab>(isEditor ? 'editors' : 'users');

  function handleDownloadPdf() {
    exportManualToPdf();
    onToast('Manual de Uso descargado en PDF');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-white/95 backdrop-blur-md print-hidden dark:border-[#283344] dark:bg-[#0F141D]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={onBackHome}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold text-[#1E3A5F] active:bg-[#EEF3F8] dark:text-[#8AB4E8] dark:active:bg-[#171F2C]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Portada</span>
          </button>

          <span className="truncate text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
            Manual de Uso
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Imprimir manual"
              className="hidden min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3 text-xs font-bold text-[#181D27] active:bg-[#EFECE6] sm:flex dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8]"
            >
              <Printer className="h-4 w-4 text-[#1E3A5F] dark:text-[#8AB4E8]" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#1E3A5F] bg-[#EEF3F8] px-3 text-xs font-bold text-[#1E3A5F] active:bg-[#DCE7F2] sm:text-sm dark:border-[#6CA0DC] dark:bg-[#172334] dark:text-[#8AB4E8]"
            >
              <FileDown className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} compact />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <header className="border-b border-[#E5E0D8] pb-5 dark:border-[#283344]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
            Guía práctica de apoyo · Convento San Francisco de Chillán
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#181D27] sm:text-3xl dark:text-[#F3F5F8]">
            Manual de Uso del Cancionero
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[#525D70] sm:text-base dark:text-[#9BA7B8]">
            Instrucciones paso a paso para ingresar a la plataforma, seguir los cantos en misa y armar el repertorio musical de cualquier domingo.
          </p>

          <div
            role="tablist"
            aria-label="Guías por rol"
            className="print-hidden mt-5 grid grid-cols-1 gap-1.5 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-1.5 sm:inline-grid sm:grid-cols-3 dark:border-[#283344] dark:bg-[#171F2C]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              className={`flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition ${
                activeTab === 'users'
                  ? 'bg-[#1E3A5F] text-white shadow-xs dark:bg-[#2A4E7E]'
                  : 'text-[#525D70] hover:text-[#181D27] dark:text-[#9BA7B8] dark:hover:text-[#F3F5F8]'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Usuarios Finales</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'editors'}
              onClick={() => setActiveTab('editors')}
              className={`flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition ${
                activeTab === 'editors'
                  ? 'bg-[#1E3A5F] text-white shadow-xs dark:bg-[#2A4E7E]'
                  : 'text-[#525D70] hover:text-[#181D27] dark:text-[#9BA7B8] dark:hover:text-[#F3F5F8]'
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>Editores y Repertorio</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className={`flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-[#1E3A5F] text-white shadow-xs dark:bg-[#2A4E7E]'
                  : 'text-[#525D70] hover:text-[#181D27] dark:text-[#9BA7B8] dark:hover:text-[#F3F5F8]'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Resumen Presentación</span>
            </button>
          </div>
        </header>

        {/* PESTAÑA 1: USUARIOS FINALES */}
        <section
          className={activeTab === 'users' ? 'mt-6 space-y-5' : 'hidden print-only mt-6 space-y-5'}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                Guía 1 · Asamblea y Músicos
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-[#181D27] sm:text-2xl dark:text-[#F3F5F8]">
                Cómo ingresar y usar el cancionero sin registro
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenPublishedProgram}
              className="print-hidden flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-4 text-sm font-bold text-white active:scale-[0.98] dark:bg-[#2A4E7E]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Ver programa actual</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 01 · Ingreso directo
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Entrar al enlace sin usuario ni contraseña
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Cualquier persona que abra el link desde su celular o computador ingresa directamente. En la portada aparece arriba el <strong className="text-[#181D27] dark:text-[#F3F5F8]">Último Programa Publicado</strong> con las letras completas ya desplegadas.
                </p>
              </div>
              <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs dark:border-[#283344] dark:bg-[#0F141D]">
                <p className="font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                  Portada → Último Programa Publicado
                </p>
                <p className="mt-1 text-[#525D70] dark:text-[#9BA7B8]">
                  1. Entrada · 2. Evangelio · 3. Ofertorio · 4. Comunión · 5. Final
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 02 · Lectura cómoda en misa
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Ocultar acordes y activar Modo Noche
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Si solo deseas cantar sin ver notas de guitarra, toca <strong className="text-[#181D27] dark:text-[#F3F5F8]">Ocultar Acordes</strong>. En lugares con poca luz, usa <strong className="text-[#181D27] dark:text-[#F3F5F8]">Modo Noche</strong> arriba a la derecha para descansar la vista.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs font-bold dark:border-[#283344] dark:bg-[#0F141D]">
                <span className="inline-flex items-center gap-1.5 text-[#9A5512] dark:text-[#F2B463]">
                  <EyeOff className="h-3.5 w-3.5" />
                  Ocultar Acordes
                </span>
                <span className="text-[#9AA2B1]">·</span>
                <span className="inline-flex items-center gap-1.5 text-[#1E3A5F] dark:text-[#8AB4E8]">
                  <Moon className="h-3.5 w-3.5" />
                  Modo Noche / Día
                </span>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 03 · Pantalla completa y otros domingos
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Agrandar letra y revisar fechas anteriores
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Toca <strong className="text-[#181D27] dark:text-[#F3F5F8]">Abrir canto</strong> en cualquier canción para ajustar el tamaño de letra con <strong className="font-mono-chord">-</strong> y <strong className="font-mono-chord">+</strong>. En <strong className="text-[#181D27] dark:text-[#F3F5F8]">Revisar otro domingo</strong> o ingresando un código (ej. <span className="font-mono-chord font-bold">SF1001</span>) puedes ver otras fechas publicadas.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs dark:border-[#283344] dark:bg-[#0F141D]">
                <Hash className="h-3.5 w-3.5 text-[#B4691E] dark:text-[#F2B463]" />
                <span className="font-mono-chord font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  SF1001
                </span>
                <span className="text-[#525D70] dark:text-[#9BA7B8]">
                  · Código corto o selector de domingo
                </span>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 04 · Compartir y descargar PDF
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  WhatsApp, impresión y PDF con todas las letras
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Al pulsar <strong className="text-[#181D27] dark:text-[#F3F5F8]">Ver página publicada</strong> (o el botón fijo inferior), puedes enviar la lista por <strong className="text-[#181D27] dark:text-[#F3F5F8]">WhatsApp</strong>, copiar el enlace o descargar <strong className="text-[#181D27] dark:text-[#F3F5F8]">Guardar PDF</strong> con las letras completas desplegadas.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs font-bold dark:border-[#283344] dark:bg-[#0F141D]">
                <span className="inline-flex items-center gap-1.5 text-[#15803D] dark:text-[#4ADE80]">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </span>
                <span className="text-[#9AA2B1]">·</span>
                <span className="inline-flex items-center gap-1.5 text-[#1E3A5F] dark:text-[#8AB4E8]">
                  <FileDown className="h-3.5 w-3.5" />
                  PDF con letras
                </span>
              </div>
            </article>

            <article className="md:col-span-2 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                Paso 05 · Catálogo completo (471 cantos)
              </p>
              <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                Buscar por nombre, filtrar por tono o recorrer las 24 categorías oficiales
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                Debajo del programa dominical en la portada se encuentra el buscador general del libro completo y el índice de las <strong className="text-[#181D27] dark:text-[#F3F5F8]">24 categorías en su orden oficial exacto</strong>, desde <span className="font-semibold">01 ENTRADA</span> hasta <span className="font-semibold">24 CANCIONES FRANCISCANAS</span>.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-xs text-[#525D70] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#9BA7B8]">
                <Search className="h-4 w-4 shrink-0 text-[#1E3A5F] dark:text-[#8AB4E8]" />
                <span>Ejemplo: escribe “Pescador” o elige “Tono [RE]” para filtrar sin perder el orden del libro.</span>
              </div>
            </article>
          </div>
        </section>

        {/* PESTAÑA 2: EDITORES (INGRESO Y ARMAR REPERTORIO DE UN DOMINGO) */}
        <section
          className={activeTab === 'editors' ? 'mt-6 space-y-5' : 'hidden print-only mt-8 space-y-5'}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                Guía 2 · Equipo Coordinador y Coro
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-[#181D27] sm:text-2xl dark:text-[#F3F5F8]">
                Cómo ingresar y armar el repertorio para un domingo cualquiera
              </h2>
            </div>

            {isEditor ? (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="print-hidden flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-4 text-sm font-bold text-white active:scale-[0.98] dark:bg-[#2A4E7E]"
              >
                <CalendarDays className="h-4 w-4 text-[#F6C88B]" />
                <span>Abrir Calendario</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="print-hidden flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-4 text-sm font-bold text-white active:scale-[0.98] dark:bg-[#2A4E7E]"
              >
                <LogIn className="h-4 w-4" />
                <span>Ir a Login de Editor</span>
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 01 · Cómo ingresar como editor
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Iniciar sesión desde el botón Login
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  <li>
                    En la parte superior de la portada, junto a <strong className="text-[#181D27] dark:text-[#F3F5F8]">Manual</strong> y <strong className="text-[#181D27] dark:text-[#F3F5F8]">Modo Noche</strong>, toca <strong className="text-[#181D27] dark:text-[#F3F5F8]">Login</strong>.
                  </li>
                  <li>
                    Ingresa el <strong className="text-[#181D27] dark:text-[#F3F5F8]">Usuario</strong> y la <strong className="text-[#181D27] dark:text-[#F3F5F8]">Contraseña</strong> asignados al equipo (ambos campos ocultan los caracteres con puntos por seguridad).
                  </li>
                  <li>
                    Pulsa <strong className="text-[#181D27] dark:text-[#F3F5F8]">Entrar como editor</strong> para acceder directo al Calendario de Editores.
                  </li>
                </ol>
              </div>
              <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs dark:border-[#283344] dark:bg-[#0F141D]">
                <p className="font-bold text-[#1E3A5F] dark:text-[#8AB4E8]">
                  Credenciales privadas · Sesión activa
                </p>
                <p className="mt-0.5 text-[#525D70] dark:text-[#9BA7B8]">
                  Cuando termines de editar, puedes cerrar sesión con el botón <strong>Salir</strong> en la portada.
                </p>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 02 · Elegir la fecha del domingo
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Seleccionar un domingo nuevo o uno anterior
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  <li>
                    Toca el botón <strong className="text-[#181D27] dark:text-[#F3F5F8]">Elegir fecha</strong> para abrir el calendario visual del mes y haz clic con el mouse sobre el domingo que quieres preparar.
                  </li>
                  <li>
                    Los domingos aparecen resaltados y las fechas ya programadas muestran una marca verde para identificarlas rápido.
                  </li>
                  <li>
                    Opcional: escribe un aviso breve en <strong className="text-[#181D27] dark:text-[#F3F5F8]">Nota para esta fecha</strong> (ej. <em>“Misa 11:00 hrs · Ensayo 10:30”</em>).
                  </li>
                </ol>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-xs dark:border-[#283344] dark:bg-[#0F141D]">
                <span className="font-semibold text-[#181D27] dark:text-[#F3F5F8]">
                  domingo, 15 de noviembre
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#1E3A5F] px-2.5 py-1 font-bold text-white dark:bg-[#2A4E7E]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Elegir fecha
                </span>
              </div>
            </article>
          </div>

          {/* Tabla visual de los 5 momentos litúrgicos */}
          <article className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
            <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
              Paso 03 · Reglas para armar los 5 momentos de la misa
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
              Qué categoría corresponde a cada espacio del repertorio dominical
            </h3>
            <p className="mt-1.5 text-sm text-[#525D70] dark:text-[#9BA7B8]">
              Para mantener el orden litúrgico del cancionero, los primeros cuatro espacios filtran automáticamente su categoría correspondiente, y el quinto espacio queda libre para cualquier canto:
            </p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {SLOT_DEFINITIONS.map((def) => (
                <div
                  key={def.key}
                  className="rounded-xl border border-[#E5E0D8] bg-white p-3.5 dark:border-[#283344] dark:bg-[#0F141D]"
                >
                  <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                    Espacio 0{def.order}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
                    {def.shortLabel}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[#525D70] dark:text-[#9BA7B8]">
                    {def.allowedCategoryName ?? 'Cualquier categoría (María, Franciscanas, Animación...)'}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 04 · Seleccionar y revisar cantos
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Dos formas de agregar canciones al programa
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  <li>
                    <strong className="text-[#181D27] dark:text-[#F3F5F8]">Desde el Calendario:</strong> pulsa <strong className="text-[#181D27] dark:text-[#F3F5F8]">Elegir canto</strong> (o <strong className="text-[#181D27] dark:text-[#F3F5F8]">Cambiar</strong>) en cada momento, busca por nombre o tono y selecciónalo.
                  </li>
                  <li>
                    <strong className="text-[#181D27] dark:text-[#F3F5F8]">Atajo desde el Cancionero:</strong> al leer cualquier canto o explorar una categoría, toca <strong className="text-[#181D27] dark:text-[#F3F5F8]">Agregar al Programa</strong> para asignarlo a la fecha que estás editando.
                  </li>
                  <li>
                    Debajo de cada espacio asignado verás <strong className="text-[#181D27] dark:text-[#F3F5F8]">la letra completa y sus acordes desplegados</strong> para revisar tonos y estrofas antes de publicar.
                  </li>
                </ul>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-2.5 text-xs font-bold text-[#1E3A5F] dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#8AB4E8]">
                <CalendarPlus className="h-4 w-4 shrink-0" />
                <span>Agregar al Programa · Revisión inmediata de letra y tono</span>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div>
                <p className="font-mono-chord text-xs font-bold text-[#B4691E] dark:text-[#F2B463]">
                  Paso 05 · Guardar y publicar
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Publicar para toda la comunidad y compartir
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  <li>
                    Cuando el repertorio esté listo, pulsa el botón inferior <strong className="text-[#181D27] dark:text-[#F3F5F8]">Guardar programación</strong>.
                  </li>
                  <li>
                    El sistema guarda esa fecha en el historial, genera un código corto (ej. <span className="font-mono-chord font-bold">SF4K8M</span>) y la deja visible de inmediato en la portada como el <strong className="text-[#181D27] dark:text-[#F3F5F8]">Último Programa Publicado</strong>.
                  </li>
                  <li>
                    Desde la página publicada resultante podrás enviar el enlace por <strong className="text-[#181D27] dark:text-[#F3F5F8]">WhatsApp</strong> al grupo del coro o descargar el <strong className="text-[#181D27] dark:text-[#F3F5F8]">PDF con todas las letras</strong>.
                  </li>
                </ol>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-3.5 py-2.5 text-xs font-bold text-white dark:bg-[#2A4E7E]">
                <Save className="h-4 w-4" />
                <span>Guardar programación (AAAA-MM-DD)</span>
              </div>
            </article>
          </div>
        </section>

        {/* PESTAÑA 3: RESUMEN PARA PRESENTACIÓN */}
        <section
          className={activeTab === 'overview' ? 'mt-6 space-y-5' : 'hidden print-only mt-8 space-y-5'}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
              Guía 3 · Apoyo visual para exposición
            </p>
            <h2 className="mt-0.5 font-display text-xl font-bold text-[#181D27] sm:text-2xl dark:text-[#F3F5F8]">
              Cómo funciona el sistema completo de punta a punta
            </h2>
          </div>

          {/* Diagrama de flujo limpio para proyectar */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                <LogIn className="h-4 w-4" />
                <span>1. Coordinación (Editores)</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                Prepara el domingo
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                Ingresa con usuario y contraseña ocultos, elige una fecha en el calendario, asigna los 5 cantos y pulsa <strong className="text-[#181D27] dark:text-[#F3F5F8]">Guardar programación</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A5F] dark:text-[#8AB4E8]">
                <Share2 className="h-4 w-4" />
                <span>2. Publicación automática</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                Se actualiza para todos
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                El servidor guarda la fecha en el historial, asigna un código corto y actualiza al instante la portada, el enlace de WhatsApp y el PDF multipágina.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 dark:border-[#283344] dark:bg-[#171F2C]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#15803D] dark:text-[#4ADE80]">
                <Check className="h-4 w-4" />
                <span>3. Comunidad en misa</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
                Canta sin barreras
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                Los feligreses entran al enlace sin clave, ven todas las letras desplegadas en la portada y pueden ocultar acordes o activar Modo Noche.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 dark:border-[#283344] dark:bg-[#171F2C]">
            <h3 className="font-display text-lg font-bold text-[#181D27] dark:text-[#F3F5F8]">
              Puntos clave para destacar en la presentación
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#EFECE6] bg-[#FAF8F5] p-3.5 dark:border-[#242F40] dark:bg-[#0F141D]">
                <p className="text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Cero registro para la asamblea
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Solo quienes arman la lista de cantos usan Login; el resto de la comunidad abre el link y canta de inmediato.
                </p>
              </div>
              <div className="rounded-xl border border-[#EFECE6] bg-[#FAF8F5] p-3.5 dark:border-[#242F40] dark:bg-[#0F141D]">
                <p className="text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  471 cantos en orden exacto
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Respeta fielmente las 24 categorías del cancionero físico del Convento San Francisco de Chillán, con tonos y acordes alineados.
                </p>
              </div>
              <div className="rounded-xl border border-[#EFECE6] bg-[#FAF8F5] p-3.5 dark:border-[#242F40] dark:bg-[#0F141D]">
                <p className="text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Historial por calendario
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Se pueden preparar domingos futuros con anticipación o revisar y corregir programaciones de fechas anteriores.
                </p>
              </div>
              <div className="rounded-xl border border-[#EFECE6] bg-[#FAF8F5] p-3.5 dark:border-[#242F40] dark:bg-[#0F141D]">
                <p className="text-sm font-bold text-[#181D27] dark:text-[#F3F5F8]">
                  Exportación PDF lista para imprimir
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#525D70] dark:text-[#9BA7B8]">
                  Genera un PDF completo con el orden de la misa y las letras desplegadas de todos los cantos, con o sin acordes.
                </p>
              </div>
            </div>
          </div>

          <div className="print-hidden flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E0D8] bg-[#EEF3F8] p-4 dark:border-[#283344] dark:bg-[#172334]">
            <div>
              <p className="text-sm font-bold text-[#1E3A5F] dark:text-[#D5E4F7]">
                ¿Listo para compartir o proyectar este manual?
              </p>
              <p className="text-xs text-[#3C506B] dark:text-[#9CB3CF]">
                Descarga la versión PDF para entregar a coordinadores o músicos durante la presentación.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1E3A5F] px-4 text-sm font-bold text-white active:scale-[0.98] dark:bg-[#2A4E7E]"
            >
              <FileDown className="h-4 w-4" />
              <span>Descargar Manual en PDF</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
