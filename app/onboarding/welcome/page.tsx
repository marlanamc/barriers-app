'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/lib/onboarding-context';

export default function WelcomePage() {
  const router = useRouter();
  const { setCurrentStep } = useOnboarding();

  const handleGetStarted = () => {
    setCurrentStep(1);
    router.push('/onboarding/signup');
  };

  return (
    <OnboardingLayout currentStep={0} totalSteps={6} showProgress={false}>
      <div className="space-y-8 text-center">
        {/* App icon/logo placeholder */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-4xl font-bold text-white shadow-lg">
          🎯
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Your ADHD-friendly command center
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            For getting things done without burning out
          </p>
        </div>

        <button
          onClick={handleGetStarted}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="space-y-4 rounded-2xl bg-slate-50 p-6 text-left dark:bg-slate-900/50">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Not like other todo apps:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Works with your energy levels
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Honors your actual capacity
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Prevents time blindness and burnout
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
          <div className="rounded-xl bg-red-50 p-4 text-left dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Other apps say:
                </p>
                <p className="text-sm text-red-700 dark:text-red-200">
                  "Do 20 things today!"
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 text-left dark:bg-emerald-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  This app says:
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-200">
                  "You have energy for 2 meaningful tasks. Let's make them count."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
