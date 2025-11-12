'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Target, Plus, Check } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboarding } from '@/lib/onboarding-context';

const WEATHER_OPTIONS = [
  { value: 'sparky', label: 'Sparky', capacity: '3-4' },
  { value: 'steady', label: 'Steady', capacity: '2-3' },
  { value: 'flowing', label: 'Flowing', capacity: '1-2' },
  { value: 'foggy', label: 'Foggy', capacity: '0-1' },
  { value: 'resting', label: 'Resting', capacity: '0' },
];

export default function FirstTaskPage() {
  const router = useRouter();
  const { setCurrentStep } = useOnboarding();
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);

  const selectedWeatherOption = WEATHER_OPTIONS.find((opt) => opt.value === selectedWeather);

  const handleWeatherSelect = (weather: string) => {
    setSelectedWeather(weather);
    setShowInput(true);
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleNext = () => {
    setCurrentStep(5);
    router.push('/onboarding/complete');
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={6}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <Target className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Let's plan today together
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This is interactive - try it out!
          </p>
        </div>

        {!selectedWeather ? (
          <div className="space-y-4">
            <p className="text-center font-medium text-slate-700 dark:text-slate-300">
              How's your energy RIGHT NOW?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {WEATHER_OPTIONS.slice(0, 4).map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleWeatherSelect(option.value)}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 transition hover:border-cyan-500 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-cyan-900/20"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleWeatherSelect('resting')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 transition hover:border-cyan-500 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-cyan-900/20"
            >
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {WEATHER_OPTIONS[4].label}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-4 dark:from-cyan-900/20 dark:to-teal-900/20">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedWeatherOption?.label} energy
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Capacity: {selectedWeatherOption?.capacity} meaningful tasks
                </p>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-900/20"
                  >
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="space-y-3">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  What matters most TODAY?
                </p>

                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your first task here..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  autoFocus
                />

                <button
                  onClick={handleAddTask}
                  disabled={!taskInput.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                >
                  Add Task
                  <ArrowRight className="h-5 w-5" />
                </button>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Examples:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>"Apply to 3 jobs"</li>
                    <li>"Email recruiter"</li>
                    <li>"Clean out inbox"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Great! You added your first task
                  </p>
                </div>

                {tasks.length < 2 && (
                  <div>
                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                      Want to add one more? (Remember: Quality &gt; Quantity)
                    </p>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add another task..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />

                      <button
                        onClick={handleAddTask}
                        disabled={!taskInput.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-cyan-600 px-6 py-3 font-semibold text-cyan-600 transition hover:bg-cyan-50 disabled:opacity-50 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
                      >
                        <Plus className="h-5 w-5" />
                        Add another
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                >
                  I'm done for now
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
