'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/lib/onboarding-context';

export default function DailySchedulePage() {
  const router = useRouter();
  const { setCurrentStep, setDailySchedule, skipStep } = useOnboarding();
  const [wakeTime, setWakeTime] = useState('07:00');
  const [workStart, setWorkStart] = useState('09:00');
  const [hardStop, setHardStop] = useState('18:00');
  const [bedtime, setBedtime] = useState('22:00');

  const handleNext = () => {
    setDailySchedule(wakeTime, workStart, hardStop, bedtime);
    setCurrentStep(3);
    router.push('/onboarding/energy-schedule');
  };

  const handleSkip = () => {
    skipStep('daily-schedule');
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
            Let's map out your typical day
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We'll help you plan around your natural rhythms
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="wake-time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              🌅 When do you usually wake up?
            </label>
            <input
              type="time"
              id="wake-time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="work-start"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              ☀️ When can you start deep work?
            </label>
            <input
              type="time"
              id="work-start"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 Most people need 1-2 hours after waking to be ready for focused work
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="hard-stop"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              🌙 When does your brain shut down?
            </label>
            <input
              type="time"
              id="hard-stop"
              value={hardStop}
              onChange={(e) => setHardStop(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 Deep work usually stops around 6-8pm for most brains
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bedtime"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              💤 When do you go to bed?
            </label>
            <input
              type="time"
              id="bedtime"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="rounded-xl bg-cyan-50 p-4 dark:bg-cyan-900/20">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            ✨ You can customize times for each day later in Settings
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
