'use client';

import { useState } from 'react';
import { ArrowLeft, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { PageBackground } from '@/components/PageBackground';

interface Barrier {
  slug: string;
  label: string;
  description: string;
  examples: string[];
  tips: string[];
}

const BARRIER_TYPES: Barrier[] = [
  {
    slug: 'too-vague',
    label: 'Too Vague',
    description: 'The task isn\'t specific enough - you don\'t know where to start.',
    examples: [
      '"Clean the house" → too big and unclear',
      '"Work on project" → what part? what\'s the first step?',
      '"Exercise" → when? what type? for how long?',
    ],
    tips: [
      'Break it into tiny, concrete steps',
      'Ask yourself: What\'s the very first physical action?',
      'Use the 2-minute rule: What can you do in 2 minutes?',
    ],
  },
  {
    slug: 'boring',
    label: 'Boring',
    description: 'Your brain can\'t engage - there\'s not enough stimulation.',
    examples: [
      'Data entry tasks',
      'Routine administrative work',
      'Repetitive chores',
    ],
    tips: [
      'Add stimulation: music, body doubling, change location',
      'Gamify it: race the clock, create mini-challenges',
      'Pair with something interesting (podcast while folding laundry)',
      'Do it with someone else (body doubling)',
    ],
  },
  {
    slug: 'overwhelming',
    label: 'Overwhelming',
    description: 'The task feels too big - your brain shuts down before you start.',
    examples: [
      'Major projects with many parts',
      'Tasks when you\'re already at capacity',
      'Anything when you\'re in a foggy state',
    ],
    tips: [
      'Break it into ridiculously small pieces',
      'Do just one tiny part (not the whole thing)',
      'Lower the bar: "good enough" is better than perfect',
      'Ask for help - you don\'t have to do it alone',
    ],
  },
  {
    slug: 'boring-and-hard',
    label: 'Boring & Hard',
    description: 'The worst combo - requires focus but provides no reward.',
    examples: [
      'Taxes and paperwork',
      'Insurance phone calls',
      'Complex administrative tasks',
    ],
    tips: [
      'Schedule during peak energy (not foggy/resting)',
      'Use external accountability (body double, deadline)',
      'Build in rewards after completion',
      'Consider: can someone else do this?',
    ],
  },
  {
    slug: 'requires-focus',
    label: 'Requires Deep Focus',
    description: 'Needs sustained attention - hard when you\'re distractible.',
    examples: [
      'Writing reports',
      'Complex problem-solving',
      'Learning new skills',
    ],
    tips: [
      'Save for sparky/steady energy times',
      'Eliminate distractions (phone away, close tabs)',
      'Use Pomodoro: 25 min focus, 5 min break',
      'Don\'t schedule back-to-back deep work',
    ],
  },
  {
    slug: 'anxiety-inducing',
    label: 'Anxiety-Inducing',
    description: 'Triggers worry, fear of failure, or emotional overwhelm.',
    examples: [
      'Difficult conversations',
      'Tasks with high stakes',
      'Things you\'ve procrastinated on',
    ],
    tips: [
      'Acknowledge the feeling - it\'s valid',
      'Do it with support (text a friend first)',
      'Lower stakes: what\'s the smallest version?',
      'Self-compassion: you\'re not "bad" for feeling anxious',
    ],
  },
];

export default function BarriersPage() {
  const [expandedBarrier, setExpandedBarrier] = useState<string | null>(null);

  const toggleBarrier = (slug: string) => {
    setExpandedBarrier(expandedBarrier === slug ? null : slug);
  };

  return (
    <>
      <PageBackground symbol="warning-buoys" />
      <main className="relative min-h-screen pb-24">

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Barriers</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Understanding what makes things hard
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800/30 dark:bg-rose-900/20">
          <p className="text-sm text-rose-900 dark:text-rose-100">
            🛡️ <strong>ADHD brains encounter invisible barriers</strong> that neurotypical people don't face. Understanding these barriers helps you work with your brain, not against it. You're not lazy - you're facing real obstacles.
          </p>
        </div>

        {/* Quick Reference */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Common ADHD Barriers
          </h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            When a task feels impossible, it's usually one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {BARRIER_TYPES.map((barrier) => (
              <button
                key={barrier.slug}
                onClick={() => toggleBarrier(barrier.slug)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  expandedBarrier === barrier.slug
                    ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {barrier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Barrier Cards */}
        <div className="space-y-3">
          {BARRIER_TYPES.map((barrier) => {
            const isExpanded = expandedBarrier === barrier.slug;
            return (
              <div
                key={barrier.slug}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <button
                  onClick={() => toggleBarrier(barrier.slug)}
                  className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {barrier.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {barrier.description}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700">
                    {/* Examples */}
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Examples:
                      </h4>
                      <ul className="space-y-1">
                        {barrier.examples.map((example, idx) => (
                          <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800/30 dark:bg-cyan-900/20">
                      <h4 className="mb-2 text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                        💡 What Helps:
                      </h4>
                      <ul className="space-y-1">
                        {barrier.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-cyan-800 dark:text-cyan-200">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Reminder */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800/30 dark:bg-purple-900/20">
          <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
            💜 Remember
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            These barriers are <strong>real neurological differences</strong>, not character flaws. When you identify the barrier, you can choose the right support. Self-compassion is part of the solution.
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
