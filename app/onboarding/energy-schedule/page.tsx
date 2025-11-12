'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { EnergyScheduleBuilder, EnergyLevel } from '@/components/onboarding/EnergyScheduleBuilder';
import { useOnboarding } from '@/lib/onboarding-context';

export default function EnergySchedulePage() {
  const router = useRouter();
  const { setCurrentStep, skipStep } = useOnboarding();
  const [schedule, setSchedule] = useState<EnergyLevel[]>([]);

  const handleNext = () => {
    // TODO: Save energy schedule to user profile
    setCurrentStep(4);
    router.push('/onboarding/first-task');
  };

  const handleSkip = () => {
    skipStep('energy-schedule');
    setCurrentStep(4);
    router.push('/onboarding/first-task');
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={6}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <Zap className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Your typical day's energy
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tap any time to adjust your energy flow
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This works for everyone, not just people who take meds! Energy naturally changes
            throughout the day.
          </p>
        </div>

        <EnergyScheduleBuilder onScheduleChange={setSchedule} />

        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          >
            Looks good
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleSkip}
            className="w-full rounded-xl px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Skip - set later
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
