import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const rules = [
  { label: 'At least 8 characters',        test: (p: string) => p.length >= 8 },
  { label: 'At least 1 letter',            test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: 'At least 1 number',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'At least 1 special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';
  const pwValid = rules.every(r => r.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !pwValid) return;
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Genos, sans-serif' }}>DI Class Calendar</h1>
        <p className="text-gray-400 mt-1 text-sm">Dance competition schedule manager</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-surface-800 rounded-2xl border border-white/10 shadow-2xl p-6">
          {/* Tab switcher */}
          <div className="flex bg-surface-700 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="mymail@mail.com"
                required
                autoComplete="username"
                className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password rules — only shown on register */}
            {isRegister && (
              <div className="bg-surface-700/60 rounded-xl px-4 py-3 space-y-1.5">
                {rules.map(r => {
                  const ok = r.test(password);
                  return (
                    <div key={r.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        ok ? 'bg-emerald-500' : 'bg-surface-600'
                      }`}>
                        {ok
                          ? <Check size={10} strokeWidth={3} className="text-white" />
                          : <X size={10} strokeWidth={3} className="text-gray-500" />
                        }
                      </div>
                      <span className={`text-xs transition-colors ${ok ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {r.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || (isRegister && !pwValid)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? (isRegister ? 'Creating account…' : 'Signing in…')
                : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Footer toggle */}
          <p className="text-center text-xs text-gray-500 mt-5">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
