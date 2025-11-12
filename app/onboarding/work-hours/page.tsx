'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/lib/onboarding-context';

export default function WorkHoursPage() {
  const router = useRouter();
  const { setCurrentStep, setWorkHours, skipStep } = useOnboarding();
  const [startTime, setStartTime] = useState('08:00');
  const [hardStop, setHardStop] = useState('18:00');

  const handleNext = () => {
    setWorkHours(startTime, hardStop);
    setCurrentStep(3);
    router.push('/onboarding/energy-schedule');
  };

  const handleSkip = () => {
    skipStep('work-hours');
    setCurrentStep(3);
    router.push('/onboarding/energy-schedule');
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={6}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <Clock className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Let's set realistic boundaries
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            When can you do focused work?
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="start-time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Start time
            </label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="hard-stop"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Hard stop (brain shuts down)
            </label>
            <input
              type="time"
              id="hard-stop"
              value={hardStop}
              onChange={(e) => setHardStop(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 Most people can't do deep work after 6-8pm. Be honest with yourself!
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleSkip}
            className="w-full rounded-xl px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Skip for now
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
