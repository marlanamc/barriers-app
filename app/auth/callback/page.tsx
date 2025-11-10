'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppWordmark } from '@/components/AppWordmark';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the hash fragment from the URL (Supabase OAuth redirects use hash fragments)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const errorParam = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // Handle OAuth errors
      if (errorParam) {
        setError(errorDescription || errorParam);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      // Handle email confirmation tokens
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'signup') {
        // Email confirmation
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });

        if (verifyError) {
          setError(verifyError.message);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Successfully verified, redirect to home
        router.push('/');
        return;
      }

      if (token && type === 'recovery') {
        // Password reset
        router.push(`/auth/reset-password?token=${token}`);
        return;
      }

      // If we have tokens in the hash, exchange them for a session
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Successfully authenticated, redirect to home
        router.push('/');
        return;
      }

      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
        return;
      }

      // No tokens found, redirect to login
      router.push('/auth/login');
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <AppWordmark className="text-2xl font-bold mx-auto mb-4" />
        
        {error ? (
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 shadow-lg">
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" role="alert">
              {error}
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/20 bg-white/80 p-8 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Completing authentication...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

