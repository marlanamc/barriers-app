"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import { createPlannedItem } from "@/lib/supabase";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getRecurrenceDescription } from "@/lib/recurrence";
import { getCategoryEmoji } from "@/lib/categories";

export default function PlanAheadSavePage() {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const {
    recurrenceType,
    startDate,
    endDate,
    recurrenceDays,
    plannedItems,
    resetPlanning,
  } = usePlanning();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recurrenceInfo = getRecurrenceDescription({
    recurrenceType,
    startDate,
    endDate,
    recurrenceDays: recurrenceType === 'weekly' ? recurrenceDays : null,
  });

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save planned items');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save each planned item to the database
      const savePromises = plannedItems.map((item) => {
        return createPlannedItem({
          user_id: user.id,
          description: item.description,
          categories: item.categories,
          recurrence_type: recurrenceType,
          start_date: startDate,
          end_date: endDate,
          recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
          barrier_type_id: item.barrier?.barrierTypeId || null,
          custom_barrier: item.barrier?.custom || null,
          anchor_type: item.anchorType || null,
          anchor_value: item.anchorValue || null,
        });
      });

      // Use allSettled to handle partial failures
      const results = await Promise.allSettled(savePromises);
      const failures = results.filter((r) => r.status === 'rejected');
      
      if (failures.length > 0) {
        const failureCount = failures.length;
        const totalCount = plannedItems.length;
        
        if (failureCount === totalCount) {
          // All failed
          const firstError = failures[0];
          const errorMessage = firstError.status === 'rejected' && firstError.reason instanceof Error
            ? firstError.reason.message
            : 'Failed to save planned items';
          throw new Error(errorMessage);
        } else {
          // Partial failure
          throw new Error(
            `Saved ${totalCount - failureCount} of ${totalCount} items. Some items failed to save.`
          );
        }
      }

      // Reset the planning context
      resetPlanning();

      // Redirect to home with success message
      router.push('/?planned=success');
    } catch (err) {
      console.error('Error saving planned items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save planned items. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/plan-ahead/barriers"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-600">Plan Ahead</p>
            <h1 className="text-2xl font-bold text-slate-900">Review and save</h1>
            <p className="text-sm text-slate-600">Confirm your planned items</p>
          </div>
        </header>

        {/* Schedule Summary */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Schedule</p>
          <p className="text-lg font-semibold text-slate-900">{recurrenceInfo}</p>
        </section>

        {/* Planned Items */}
        <section className="space-y-3">
          <p className="text-sm font-medium text-slate-600">
            {plannedItems.length} {plannedItems.length === 1 ? 'item' : 'items'}
          </p>
          {plannedItems.map((item) => (
            <div
              key={item.id}
              className="space-y-2 rounded-3xl border border-white/30 bg-white/80 p-5 shadow-sm"
            >
              <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                {item.categories[0] && (
                  <span className="text-xl leading-none">{getCategoryEmoji(item.categories[0])}</span>
                )}
                <span>{item.description}</span>
              </p>

              {item.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {getCategoryEmoji(category)} {category}
                    </span>
                  ))}
                </div>
              )}

              {item.barrier && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Barrier:</span>{' '}
                  {item.barrier.custom || item.barrier.barrierTypeSlug}
                </p>
              )}

              {item.anchorType && item.anchorValue && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Anchor:</span> {item.anchorType} {item.anchorValue}
                </p>
              )}
            </div>
          ))}
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !user}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Check className="h-5 w-5" />
              Save Plan
            </>
          )}
        </button>

        {!user && (
          <p className="text-center text-sm text-slate-600">
            You must be logged in to save planned items
          </p>
        )}
      </div>
    </main>
  );
}
