"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import type { RecurrenceType } from "@/lib/recurrence";
import { getPlannedItems, deletePlannedItem, type PlannedItemWithBarrier } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { getRecurrenceDescription } from "@/lib/recurrence";
import { getCategoryEmoji } from "@/lib/categories";
import { useToast } from "@/components/ToastProvider";
import { PageBackground } from "@/components/PageBackground";

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlanAheadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    recurrenceType,
    setRecurrenceType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    recurrenceDays,
    setRecurrenceDays,
  } = usePlanning();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [hasEndDate, setHasEndDate] = useState(false);
  const [existingPlannedItems, setExistingPlannedItems] = useState<PlannedItemWithBarrier[]>([]);
  const [loadingPlannedItems, setLoadingPlannedItems] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Initialize from URL query param if present
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setStartDate(dateParam);
      setRecurrenceType('once');
    }
  }, [searchParams, setStartDate, setRecurrenceType]);

  const handleNext = () => {
    // Validate based on recurrence type
    if (recurrenceType === 'weekly' && recurrenceDays.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }

    router.push('/plan-ahead/focus');
  };

  const toggleDay = (dayIndex: number) => {
    setRecurrenceDays(
      recurrenceDays.includes(dayIndex)
        ? recurrenceDays.filter((d) => d !== dayIndex)
        : [...recurrenceDays, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleEndDateToggle = (checked: boolean) => {
    setHasEndDate(checked);
    if (!checked) {
      setEndDate(null);
    }
  };

  // Load existing planned items
  useEffect(() => {
    if (!user?.id) return;
    
    const loadPlannedItems = async () => {
      try {
        const items = await getPlannedItems(user.id);
        setExistingPlannedItems(items);
      } catch (err) {
        console.error('Error loading planned items:', err);
      } finally {
        setLoadingPlannedItems(false);
      }
    };
    
    loadPlannedItems();
  }, [user?.id]);

  const handleDeletePlannedItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this planned item?')) return;
    
    try {
      const success = await deletePlannedItem(itemId);
      if (success) {
        setExistingPlannedItems((prev) => prev.filter((item) => item.id !== itemId));
        addToast('Deleted planned item.', 'success');
      }
    } catch (err) {
      console.error('Error deleting planned item:', err);
      addToast('Failed to delete planned item. Please try again.', 'error');
    }
  };

  return (
    <>
      <PageBackground symbol="route-line" />
      <main className="relative min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-600">Plan Ahead</p>
            <h1 className="text-2xl font-bold text-slate-900">When do you want to plan for?</h1>
            <p className="text-sm text-slate-600">Choose a date or set up a recurring schedule.</p>
          </div>
        </header>

        {/* Existing Planned Items */}
        {!loadingPlannedItems && existingPlannedItems.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Your Planned Items</h2>
            </div>
            <ul className="space-y-3">
              {existingPlannedItems.map((item) => {
                const recurrenceDesc = getRecurrenceDescription({
                  recurrenceType: item.recurrence_type as RecurrenceType,
                  startDate: item.start_date,
                  endDate: item.end_date || null,
                  recurrenceDays: item.recurrence_days || null,
                });
                const categoryEmoji = getCategoryEmoji(item.categories?.[0]);
                
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {categoryEmoji && <span className="text-xl">{categoryEmoji}</span>}
                        <p className="font-semibold text-slate-900">{item.description}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{recurrenceDesc}</p>
                      {item.categories && item.categories.length > 0 && (
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {item.categories.join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => router.push(`/plan-ahead/edit/${item.id}`)}
                        className="rounded-full border border-transparent p-2 text-slate-400 transition hover:border-emerald-200 hover:text-emerald-600"
                        aria-label="Edit planned item"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlannedItem(item.id)}
                        className="rounded-full border border-transparent p-2 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                        aria-label="Delete planned item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Create New Planned Item Section */}
        <section className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Create New Planned Item</h2>
          </div>
          {/* Recurrence Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Schedule type</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRecurrenceType('once')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  recurrenceType === 'once'
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-white/40 bg-white/70 hover:border-emerald-200'
                }`}
              >
                <p className="font-semibold text-slate-900">One-time</p>
                <p className="text-sm text-slate-600">For a specific date</p>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('daily')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  recurrenceType === 'daily'
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-white/40 bg-white/70 hover:border-emerald-200'
                }`}
              >
                <p className="font-semibold text-slate-900">Daily</p>
                <p className="text-sm text-slate-600">Every day</p>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('weekly')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  recurrenceType === 'weekly'
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-white/40 bg-white/70 hover:border-emerald-200'
                }`}
              >
                <p className="font-semibold text-slate-900">Weekly</p>
                <p className="text-sm text-slate-600">On specific days</p>
              </button>

              <button
                type="button"
                onClick={() => setRecurrenceType('monthly')}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  recurrenceType === 'monthly'
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-white/40 bg-white/70 hover:border-emerald-200'
                }`}
              >
                <p className="font-semibold text-slate-900">Monthly</p>
                <p className="text-sm text-slate-600">Same day each month</p>
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="start-date">
              {recurrenceType === 'once' ? 'Date' : 'Start date'}
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Day Selection for Weekly */}
          {recurrenceType === 'weekly' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Which days?</label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => {
                  const isSelected = recurrenceDays.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`min-w-[60px] rounded-full px-4 py-2 font-medium transition ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End Date Option (for recurring) */}
          {recurrenceType !== 'once' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="has-end-date"
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => handleEndDateToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="has-end-date" className="text-sm font-semibold text-slate-700">
                  Set an end date
                </label>
              </div>

              {hasEndDate && (
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
          >
            Next: Add Focus Items
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>
      </div>
    </main>
    </>
  );
}
