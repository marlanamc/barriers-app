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

  const handleContinue = () => {
    setWorkHours(startTime, hardStop);
    setCurrentStep(2);
    router.push('/onboarding/energy-schedule');
  };

  const handleSkip = () => {
    skipStep('work-hours');
    setCurrentStep(2);
    router.push('/onboarding/energy-schedule');
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={6}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <Clock className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Let's set realistic boundaries
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            When can you actually do focused work?
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Start time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hard stop (when your brain shuts down)
            </label>
            <input
              type="time"
              value={hardStop}
              onChange={(e) => setHardStop(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/40"
            />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            💡 <strong>Be honest!</strong> Most people can't do deep work after 6-8pm.
            Your nervous system needs to know when to stop.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleSkip}
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Skip for now
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          You can always change this later in Settings
        </p>
      </div>
    </OnboardingLayout>
  );
}
