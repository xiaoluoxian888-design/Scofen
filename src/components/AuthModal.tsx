import React, { useState } from 'react';
import { User } from '../types/schema';
import { X, UserPlus, LogIn, Music, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (firstName: string, lastName: string, email: string, bio: string) => Promise<User | null>;
  onLogin: (email: string) => Promise<User | null>;
  allUsers: User[];
  onSelectUser: (userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignup,
  onLogin,
  allUsers,
  onSelectUser,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please provide first name, last name, and email.');
      return;
    }

    setLoading(true);
    try {
      const user = await onSignup(firstName, lastName, email, bio);
      if (user) {
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      const user = await onLogin(email);
      if (user) {
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-zinc-850 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Music className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              {mode === 'signup' ? 'Join the Scofen Network' : 'Welcome Back'}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Connect as an independent music artist, curator, or listener.
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all font-semibold ${
              mode === 'signup' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all font-semibold ${
              mode === 'login' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-2xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {mode === 'signup' ? (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Kaelen"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Vance"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kaelen@scofen.network"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist / Curator Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Vocalist, sound designer, and curator focusing on modern electronic & soul."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Join Scofen'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scofen2015@gmail.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Quick Demo Accounts */}
            <div className="pt-2 border-t border-zinc-900">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">
                Quick Select Seeded Profile:
              </div>
              <div className="space-y-1.5">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelectUser(u.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 text-xs flex items-center justify-between text-zinc-300 transition-colors"
                  >
                    <span className="font-medium text-white">{u.first_name} {u.last_name}</span>
                    <span className="text-[11px] text-zinc-500">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
