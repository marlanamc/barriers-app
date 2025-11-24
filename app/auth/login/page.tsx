'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AppWordmark } from '@/components/AppWordmark';
import { ArrowRight, Eye, EyeOff, Loader2, Compass, Anchor } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const returnTo = searchParams.get('returnTo') || '/';
        router.push(returnTo);
      }
    });
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setMessage('Successfully logged in! Redirecting...');
        const returnTo = searchParams.get('returnTo') || '/';
        router.push(returnTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setMessage('Password reset email sent! Check your inbox.');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Pastel background for light mode, nautical for dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Decorative blur accents - light mode only */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl dark:hidden" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl dark:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Compass icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] shadow-lg shadow-sky-500/20 dark:shadow-[#d4a574]/20 mb-2">
              <Compass className="w-8 h-8 text-white dark:text-[#0a1628]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
                Welcome Back
              </h1>
              <p className="text-slate-600 dark:text-[#a8c5d8] font-crimson text-lg">
                Sign in to continue your voyage
              </p>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white/80 dark:bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-[#d4a574]/20 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 font-crimson" role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 font-crimson" role="alert">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-[#d4a574] tracking-wide font-crimson">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#d4a574]/30 bg-white dark:bg-[#0a1628]/60 px-4 py-3.5 text-slate-800 dark:text-[#f4e9d8] placeholder:text-slate-400 dark:placeholder:text-[#a8c5d8]/50 focus:border-sky-400 dark:focus:border-[#d4a574]/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-[#d4a574]/20 font-crimson transition-all duration-300"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-[#d4a574] tracking-wide font-crimson">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#d4a574]/30 bg-white dark:bg-[#0a1628]/60 px-4 py-3.5 pr-12 text-slate-800 dark:text-[#f4e9d8] placeholder:text-slate-400 dark:placeholder:text-[#a8c5d8]/50 focus:border-sky-400 dark:focus:border-[#d4a574]/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-[#d4a574]/20 font-crimson transition-all duration-300"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#d4a574]/50 hover:text-slate-600 dark:hover:text-[#d4a574] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="text-sm font-medium text-sky-600 dark:text-[#7eb8d8] hover:text-sky-700 dark:hover:text-[#a8c5d8] font-crimson disabled:opacity-50 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] px-6 py-4 text-lg font-bold text-white dark:text-[#0a1628] transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/20 dark:hover:shadow-[#d4a574]/20 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 font-cinzel"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="tracking-wide">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-[#d4a574]/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/80 dark:bg-[#0a1628]/80 px-4">
                  <Anchor className="w-4 h-4 text-slate-300 dark:text-[#d4a574]/40" />
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-[#a8c5d8] font-crimson">
                New here?{' '}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-sky-600 dark:text-[#d4a574] hover:text-sky-700 dark:hover:text-[#f4e9d8] transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer quote */}
          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-[#a8c5d8]/50 font-crimson italic">
              "A smooth sea never made a skilled sailor."
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
