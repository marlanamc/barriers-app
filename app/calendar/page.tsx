"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getCalendarEntries, CalendarEntry } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

export default function CalendarPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setupUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadCalendarEntries(user.id);
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
          loadCalendarEntries(signInData.user.id);
        }
      }
    }

    setupUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadCalendarEntries(userId);
    }
  }, [currentDate, userId]);

  async function loadCalendarEntries(userId: string) {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const entries = await getCalendarEntries(
        userId,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );
      
      setCalendarEntries(entries);
    } catch (error) {
      console.error('Error loading calendar entries:', error);
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function getEntryForDate(date: Date): CalendarEntry | undefined {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEntries.find(entry => entry.date === dateStr);
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth();

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <p className="text-gray-700">Loading calendar...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-semibold">
          <span className="text-gray-900">ADHD</span> <span className="text-pink-500">Barrier</span> <span className="text-gray-900">Tracker</span>
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8 max-w-4xl mx-auto">
        {/* Calendar Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="text-sm text-pink-500 hover:text-pink-600 mt-1"
              >
                Go to Today
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const entry = getEntryForDate(date);
              const hasCheckIn = entry?.has_check_in || false;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    // Could navigate to day detail view
                    const dateStr = date.toISOString().split('T')[0];
                    router.push(`/calendar/${dateStr}`);
                  }}
                  className={`
                    aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                    transition-all relative
                    ${isTodayDate ? 'ring-2 ring-pink-500 ring-offset-2 bg-pink-50' : 'bg-white/60 hover:bg-white/80'}
                    ${hasCheckIn ? 'shadow-md' : 'shadow-sm'}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'text-pink-600' : 'text-gray-700'}
                  `}>
                    {date.getDate()}
                  </span>
                  {hasCheckIn && (
                    <div className="mt-1 flex gap-1">
                      {(entry?.barrier_count ?? 0) > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      )}
                      {(entry?.task_count ?? 0) > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-gray-700">Life Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-700">Tasks</span>
          </div>
        </div>
      </div>
    </main>
  );
}

