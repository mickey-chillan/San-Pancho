import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function ThemeToggle({ darkMode, onToggle, compact = false }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={darkMode}
      aria-label={darkMode ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      title={darkMode ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      className={`flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border transition ${
        compact ? 'min-w-[44px] px-2.5' : 'px-3.5'
      } border-[#E5E0D8] bg-[#FAF8F5] text-sm font-semibold text-[#181D27] active:bg-[#EFECE6] dark:border-[#283344] dark:bg-[#171F2C] dark:text-[#F3F5F8] dark:active:bg-[#222D3F]`}
    >
      {darkMode ? (
        <>
          <Sun className="h-4 w-4 text-[#F2B463]" />
          {!compact ? <span>Modo Día</span> : null}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#1E3A5F]" />
          {!compact ? <span>Modo Noche</span> : null}
        </>
      )}
    </button>
  );
}
