'use client';

import { useState } from 'react';
import { Target, CheckSquare, Moon, ArrowRight } from 'lucide-react';
import type { WorkWindow } from '@/lib/capacity';
import { getCapacityMessage, getCapacityRangeText, WINDOW_CAPACITY } from '@/lib/capacity';

interface WorkWindowSelectorProps {
  selectedWindow: WorkWindow | null;
  onSelectWindow: (window: WorkWindow) => void;
  onContinue?: () => void;
}

const WORK_WINDOW_OPTIONS = [
  {
    type: 'deep' as WorkWindow,
    icon: Target,
    title: 'Deep Work',
    description: 'Focus on complex tasks that require concentration',
    examples: 'Writing reports, coding, strategic planning',
    capacity: WINDOW_CAPACITY.deep,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    type: 'light' as WorkWindow,
    icon: CheckSquare,
    title: 'Light Tasks',
    description: 'Handle maintenance and simpler tasks',
    examples: 'Emails, quick calls, organizing',
    capacity: WINDOW_CAPACITY.light,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    type: 'rest' as WorkWindow,
    icon: Moon,
    title: 'Rest Day',
    description: 'Focus on recovery and self-care',
    examples: 'Reading, walks, gentle activities',
    capacity: WINDOW_CAPACITY.rest,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export function WorkWindowSelector({
  selectedWindow,
  onSelectWindow,
  onContinue
}: WorkWindowSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          What kind of day is today?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Choose your work window to see what you can realistically accomplish
        </p>
      </div>

      <div className="grid gap-4">
        {WORK_WINDOW_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedWindow === option.type;

          return (
            <button
              key={option.type}
              onClick={() => onSelectWindow(option.type)}
              className={`
                w-full p-6 rounded-3xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? `${option.bgColor} ${option.borderColor} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500/50`
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                  ${isSelected ? `bg-gradient-to-r ${option.color}` : 'bg-slate-100 dark:bg-slate-700'}
                `}>
                  <Icon className={`w-6 h-6 ${
                    isSelected ? 'text-white' : option.iconColor
                  }`} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {option.title}
                    </h3>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {option.capacity} tasks
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                    {option.examples}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedWindow && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                ✓
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Today I Can
            </h3>
          </div>

          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-300">
              {getCapacityMessage(selectedWindow)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Capacity: {getCapacityRangeText(selectedWindow)}
            </p>
          </div>

          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full mt-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Planning
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
