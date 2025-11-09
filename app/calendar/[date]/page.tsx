"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCheckInByDate } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import type { DailyCheckIn } from "@/lib/supabase";

export default function DayDetailPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setupUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadCheckIn(user.id);
      } else {
        // Try dummy user for development
        const testEmail = 'test@example.com';
        const testPassword = 'test123456';
        
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (signInData?.user) {
          setUserId(signInData.user.id);
          loadCheckIn(signInData.user.id);
        }
      }
    }

    setupUser();
  }, [date]);

  async function loadCheckIn(userId: string) {
    setLoading(true);
    try {
      const checkInData = await getCheckInByDate(userId, date);
      setCheckIn(checkInData);
    } catch (error) {
      console.error('Error loading check-in:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <p className="text-gray-700">Loading...</p>
      </main>
    );
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4">
        <Link href="/calendar" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-semibold">
          <span className="text-gray-900">ADHD</span> <span className="text-pink-500">Barrier</span> <span className="text-gray-900">Tracker</span>
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formattedDate}
          </h2>
        </div>

        {checkIn ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logged Life Areas</h3>
            {checkIn.selected_barriers && checkIn.selected_barriers.length > 0 ? (
              <div className="space-y-2">
                {checkIn.selected_barriers.map((slug, index) => (
                  <div key={index} className="p-3 bg-pink-50 rounded-lg">
                    <span className="text-gray-700">{slug}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No life areas logged for this day.</p>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-500">No check-in found for this day.</p>
            <Link 
              href="/check-in"
              className="mt-4 inline-block px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
            >
              Log a Check-in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

