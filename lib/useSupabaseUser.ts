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
    let timeoutId: NodeJS.Timeout;

    async function ensureUser() {
      setLoading(true);
      
      // Set timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('User check timed out, proceeding without user');
          setLoading(false);
        }
      }, 5000);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted) {
          clearTimeout(timeoutId);
          return;
        }

        if (error) {
          console.error('Error getting user:', error);
          setError(error.message);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        if (data.user) {
          setUser(data.user);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
      } catch (error) {
        if (!isMounted) {
          clearTimeout(timeoutId);
          return;
        }
        console.error('Failed to get user:', error);
        setError(error instanceof Error ? error.message : 'Failed to get user');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      if (!autoCreateTestUser) {
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // Only auto-create test users in development mode for security
      if (process.env.NODE_ENV === 'production') {
        console.warn('Test user auto-creation is disabled in production');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // SECURITY: Use environment variables for test credentials, never hardcode
      // In production, these should not be set, preventing auto-creation
      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;
      
      // If test credentials are not configured, skip auto-creation
      if (!testEmail || !testPassword) {
        console.warn('Test credentials not configured. Skipping auto-creation.');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

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
            setLoading(false);
            clearTimeout(timeoutId);
          }
          return;
        }

        if (isMounted) {
          setUser(signUpData.user ?? null);
        }
      } else if (isMounted) {
        setUser(signInData.user ?? null);
      }

      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    ensureUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // When user metadata is updated (USER_UPDATED event), refetch the user
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ?? session?.user ?? null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, [autoCreateTestUser]);

  return { user, loading, error };
}
