'use client';

import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showProgress = true,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-md px-4 py-8">
        {showProgress && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-cyan-600 dark:bg-cyan-400'
                    : index < currentStep
                    ? 'bg-cyan-400 dark:bg-cyan-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={`Step ${index + 1} of ${totalSteps}`}
              />
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
          {children}
        </div>
      </div>
    </main>
  );
}
