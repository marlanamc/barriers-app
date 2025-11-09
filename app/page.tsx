"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is signed in
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <p className="text-gray-700">Loading...</p>
      </main>
    );
  }

  // If not logged in, redirect to onboarding
  if (!user) {
    router.push('/onboarding');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          <span className="text-gray-900">ADHD</span> <span className="text-pink-500">Barrier</span> <span className="text-gray-900">Tracker</span>
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}.
          </h2>
          <p className="text-gray-700">
            Ready to check in?
          </p>
        </div>

        {/* Main CTA */}
        <Link
          href="/check-in"
          className="block gradient-purple p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-6"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Start Check-in
          </h3>
          <p className="text-gray-700">
            Log barriers and get helpful tips
          </p>
        </Link>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/calendar"
            className="gradient-blue-purple p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-base text-gray-900 mb-1">
              View Calendar
            </h3>
            <p className="text-sm text-gray-700">
              See your check-ins
            </p>
          </Link>

          <Link
            href="/insights"
            className="gradient-yellow-green p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-base text-gray-900 mb-1">
              Track Patterns
            </h3>
            <p className="text-sm text-gray-700">
              See your barrier trends
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
