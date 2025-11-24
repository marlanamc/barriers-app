'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Eye, EyeOff, Loader2, Compass, Anchor } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        // Supabase may or may not require email confirmation depending on settings
        if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          setMessage('Account created! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          // Email confirmation required
          setMessage('Account created! Please check your email to confirm your account.');
          setLoading(false);
        }
      }
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
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Decorative blur accents - light mode only */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl dark:hidden" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl dark:hidden" />
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
                Begin Your Voyage
              </h1>
              <p className="text-slate-600 dark:text-[#a8c5d8] font-crimson text-lg">
                Create your account to start navigating
              </p>
            </div>
          </div>

          {/* Signup card */}
          <div className="bg-white/80 dark:bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 dark:border-[#d4a574]/20 shadow-xl">
            <form onSubmit={handleSignup} className="space-y-5">
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
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#d4a574]/30 bg-white dark:bg-[#0a1628]/60 px-4 py-3.5 pr-12 text-slate-800 dark:text-[#f4e9d8] placeholder:text-slate-400 dark:placeholder:text-[#a8c5d8]/50 focus:border-sky-400 dark:focus:border-[#d4a574]/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-[#d4a574]/20 font-crimson transition-all duration-300"
                    placeholder="At least 8 characters"
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
                <p className="text-xs text-slate-500 dark:text-[#a8c5d8]/60 font-crimson">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-[#d4a574] tracking-wide font-crimson">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#d4a574]/30 bg-white dark:bg-[#0a1628]/60 px-4 py-3.5 pr-12 text-slate-800 dark:text-[#f4e9d8] placeholder:text-slate-400 dark:placeholder:text-[#a8c5d8]/50 focus:border-sky-400 dark:focus:border-[#d4a574]/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-[#d4a574]/20 font-crimson transition-all duration-300"
                    placeholder="Re-enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#d4a574]/50 hover:text-slate-600 dark:hover:text-[#d4a574] transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password || !confirmPassword}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] px-6 py-4 text-lg font-bold text-white dark:text-[#0a1628] transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/20 dark:hover:shadow-[#d4a574]/20 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 font-cinzel"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="tracking-wide">Creating account...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">Create Account</span>
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

            {/* Sign in link */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-[#a8c5d8] font-crimson">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold text-sky-600 dark:text-[#d4a574] hover:text-sky-700 dark:hover:text-[#f4e9d8] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer quote */}
          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-[#a8c5d8]/50 font-crimson italic">
              "Every expert was once a beginner."
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
