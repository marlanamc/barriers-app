'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface UseSupabaseUserOptions {
  autoCreateTestUser?: boolean;
}

const defaultOptions: UseSupabaseUserOptions = {
  autoCreateTestUser: true,
};

export function useSupabaseUser(options: UseSupabaseUserOptions = defaultOptions) {
  const { autoCreateTestUser } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function ensureUser() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        if (!isMounted) return;
        setUser(data.user);
        setLoading(false);
        return;
      }

      if (!autoCreateTestUser) {
        setLoading(false);
        return;
      }

      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL || 'test@example.com';
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD || 'test123456';

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) {
          console.error('Error creating test user', signUpError);
          if (isMounted) {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        if (isMounted) {
          setUser(signUpData.user ?? null);
        }
      } else if (isMounted) {
        setUser(signInData.user ?? null);
      }

      setLoading(false);
    }

    ensureUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [autoCreateTestUser]);

  return { user, loading, error };
}
