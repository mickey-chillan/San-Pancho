import { Check, Lock, X } from 'lucide-react';
import { SLOT_DEFINITIONS, canSongFitSlot } from '../data/songbook';
import type { ProgramSlots, SlotKey, Song } from '../types';

interface AddToProgramSheetProps {
  song: Song | null;
  draftSlots: ProgramSlots;
  onAssign: (slotKey: SlotKey, song: Song) => void;
  onClose: () => void;
}

export function AddToProgramSheet({
  song,
  draftSlots,
  onAssign,
  onClose,
}: AddToProgramSheetProps) {
  if (!song) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Agregar canto al Programa del Domingo"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-[#171F2C] dark:border dark:border-[#283344]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto my-3 h-1.5 w-10 rounded-full bg-[#D7D1C7] sm:hidden dark:bg-[#344257]" />

        <div className="flex items-start justify-between gap-3 border-b border-[#E5E0D8] px-5 pb-4 pt-2 sm:pt-5 dark:border-[#283344]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
              Agregar al Programa
            </p>
            <h3 className="mt-1 font-display text-xl font-bold leading-tight text-[#181D27] dark:text-[#F3F5F8]">
              {song.title}
            </h3>
            <p className="mt-1 text-sm text-[#525D70] dark:text-[#9BA7B8]">
              {song.categoryName} ·{' '}
              <span className="font-mono-chord font-semibold text-[#1E3A5F] dark:text-[#8AB4E8]">
                [{song.tone}]
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] text-[#525D70] active:bg-[#FAF8F5] dark:border-[#283344] dark:text-[#9BA7B8] dark:active:bg-[#222D3F]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[68vh] space-y-2.5 overflow-y-auto px-5 py-4">
          <p className="text-sm text-[#525D70] dark:text-[#9BA7B8]">
            Elige en qué momento de la misa deseas ubicar este canto (el espacio 5 acepta cualquier categoría):
          </p>

          {SLOT_DEFINITIONS.map((def) => {
            const allowed = canSongFitSlot(song, def.key);
            const current = draftSlots[def.key];
            const isSameSong = current?.songId === song.id;

            return (
              <button
                key={def.key}
                type="button"
                disabled={!allowed}
                onClick={() => {
                  if (allowed) {
                    onAssign(def.key, song);
                  }
                }}
                className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  allowed
                    ? isSameSong
                      ? 'border-[#1E3A5F] bg-[#EEF3F8] active:scale-[0.99] dark:border-[#6CA0DC] dark:bg-[#1D2D44]'
                      : 'border-[#E5E0D8] bg-white hover:border-[#1E3A5F] active:bg-[#FAF8F5] dark:border-[#283344] dark:bg-[#0F141D] dark:hover:border-[#6CA0DC] dark:active:bg-[#1E293B]'
                    : 'cursor-not-allowed border-[#EFECE6] bg-[#FAF8F5] opacity-60 dark:border-[#222B3A] dark:bg-[#121823]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#181D27] dark:text-[#F3F5F8]">
                      {def.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#525D70] dark:text-[#9BA7B8]">
                    {allowed
                      ? current
                        ? `Actual: ${current.title} [${current.tone}]`
                        : 'Espacio disponible'
                      : def.ruleDescription}
                  </p>
                </div>

                <div className="shrink-0">
                  {!allowed ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-[#7B8494]">
                      <Lock className="h-4 w-4" />
                    </span>
                  ) : isSameSong ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F] text-white dark:bg-[#6CA0DC] dark:text-[#0F141D]">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="whitespace-nowrap text-sm font-semibold text-[#1E3A5F] dark:text-[#8AB4E8]">
                      Elegir
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#E5E0D8] px-5 py-3 dark:border-[#283344]">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#FAF8F5] text-sm font-semibold text-[#525D70] active:bg-[#EFECE6] dark:bg-[#0F141D] dark:text-[#9BA7B8] dark:active:bg-[#222D3F]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
