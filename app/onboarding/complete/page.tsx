'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/lib/onboarding-context';

export default function CompletePage() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const handleGetStarted = () => {
    completeOnboarding();
    router.push('/');
  };

  return (
    <OnboardingLayout currentStep={5} totalSteps={6}>
      <div className="space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-5xl shadow-lg">
          <Sparkles className="h-12 w-12 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            You're all set!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Welcome to your command center
          </p>
        </div>

        <div className="space-y-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 p-6 text-left dark:from-cyan-900/20 dark:to-teal-900/20">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Everything you need in one place:
          </p>

          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-bold">Your energy</span> (at the top)
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">Your capacity</span> (how much you can handle)
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">Your tasks</span> (what matters today)
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">Your time</span> (when to stop)
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Helpful tips will appear as you use the app. You'll discover new features gradually!
          </p>
        </div>

        <button
          onClick={handleGetStarted}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-cyan-700 hover:to-teal-700 dark:from-cyan-500 dark:to-teal-500 dark:hover:from-cyan-600 dark:hover:to-teal-600"
        >
          Go to my day
          <ArrowRight className="h-6 w-6" />
        </button>

        <div className="space-y-2 border-t border-slate-200 pt-6 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Remember:
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This app works WITH you, not against you. Your energy matters. Your capacity is real.
            And 1-2 meaningful tasks completed is a successful day.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
