"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { getUserBarrierPatterns, getUserCheckIns } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface BarrierPattern {
  user_id: string;
  barrier_slug: string;
  barrier_name: string;
  selection_count: number;
  first_selected: string;
  last_selected: string;
  dates_selected: string[];
}

export default function InsightsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [barrierPatterns, setBarrierPatterns] = useState<BarrierPattern[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    async function setupUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadData(user.id);
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
          loadData(signInData.user.id);
        }
      }
    }

    setupUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadData(userId);
    }
  }, [userId, timeRange]);

  async function loadData(userId: string) {
    setLoading(true);
    try {
      const [patterns, checkIns] = await Promise.all([
        getUserBarrierPatterns(userId),
        getUserCheckIns(userId, 30)
      ]);
      
      setBarrierPatterns(patterns as BarrierPattern[]);
      setRecentCheckIns(checkIns);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }

  function getFilteredPatterns() {
    if (timeRange === 'all') return barrierPatterns;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    return barrierPatterns.filter(pattern => {
      const lastSelected = new Date(pattern.last_selected);
      return lastSelected >= cutoffDate;
    });
  }

  function getTotalCheckIns() {
    return recentCheckIns.length;
  }

  function getMostCommonBarrier() {
    if (barrierPatterns.length === 0) return null;
    return barrierPatterns.sort((a, b) => b.selection_count - a.selection_count)[0];
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <p className="text-gray-700">Loading patterns...</p>
      </main>
    );
  }

  const filteredPatterns = getFilteredPatterns();
  const mostCommon = getMostCommonBarrier();

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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Track Patterns
          </h2>
          <p className="text-gray-700">
            See your barrier trends and insights
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Total Check-ins</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{getTotalCheckIns()}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Unique Barriers</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{barrierPatterns.length}</p>
          </div>

          {mostCommon && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Most Common</h3>
              </div>
              <p className="text-lg font-bold text-gray-900 truncate">{mostCommon.barrier_name}</p>
              <p className="text-sm text-gray-600">{mostCommon.selection_count} times</p>
            </div>
          )}
        </div>

        {/* Barrier Patterns List */}
        {filteredPatterns.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-600 mb-4">No barrier patterns found for this time period.</p>
            <Link
              href="/check-in"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Your First Check-in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Barrier Frequency ({filteredPatterns.length})
            </h3>
            {filteredPatterns
              .sort((a, b) => b.selection_count - a.selection_count)
              .map((pattern, index) => {
                const maxCount = Math.max(...filteredPatterns.map(p => p.selection_count));
                const percentage = (pattern.selection_count / maxCount) * 100;
                
                return (
                  <div
                    key={pattern.barrier_slug}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {pattern.barrier_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Selected {pattern.selection_count} time{pattern.selection_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-500">
                          {pattern.selection_count}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>First: {new Date(pattern.first_selected).toLocaleDateString()}</span>
                      <span>Last: {new Date(pattern.last_selected).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </main>
  );
}

