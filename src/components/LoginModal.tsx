import { Lock, LogIn, X } from 'lucide-react';
import { useState } from 'react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        username?: string;
        error?: string;
      };
      if (!res.ok || !data.token) {
        setError(data.error || 'Usuario o contraseña incorrectos.');
        return;
      }
      setUsername('');
      setPassword('');
      onSuccess(data.token, data.username || 'cancionero');
    } catch {
      setError('Error de conexión al iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Acceso de editores"
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 dark:border dark:border-[#283344] dark:bg-[#171F2C]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#D7D1C7] sm:hidden dark:bg-[#344257]" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F8] text-[#1E3A5F] dark:bg-[#22334D] dark:text-[#8AB4E8]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B4691E] dark:text-[#F2B463]">
                Acceso Editores
              </p>
              <h2 className="font-display text-xl font-bold text-[#181D27] dark:text-[#F3F5F8]">
                Iniciar sesión
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar login"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#E5E0D8] text-[#525D70] active:bg-[#FAF8F5] dark:border-[#283344] dark:text-[#9BA7B8] dark:active:bg-[#222D3F]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2.5 text-sm text-[#525D70] dark:text-[#9BA7B8]">
          Ingresa tus credenciales de editor para crear o modificar los cancioneros de cualquier fecha en el calendario.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
            >
              Usuario
            </label>
            <input
              id="login-username"
              type="password"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              autoFocus
              className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-4 text-base font-medium text-[#181D27] outline-none focus:border-[#1E3A5F] focus:bg-white dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#525D70] dark:text-[#9BA7B8]"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-4 text-base font-medium text-[#181D27] outline-none focus:border-[#1E3A5F] focus:bg-white dark:border-[#283344] dark:bg-[#0F141D] dark:text-[#F3F5F8] dark:focus:border-[#6CA0DC]"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A5F] px-5 text-base font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-60 dark:bg-[#2A4E7E]"
          >
            <LogIn className="h-5 w-5" />
            <span>{submitting ? 'Ingresando...' : 'Entrar como editor'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
