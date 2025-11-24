'use client';

import { useState } from 'react';
import { Anchor, Waves, CloudFog, ArrowRight } from 'lucide-react';
import { UserContext, FocusLevel, getPersonalizedGuidance } from '@/lib/user-context';

interface FocusSelectorProps {
  userContext: UserContext;
  onSelectFocus: (focus: FocusLevel) => void;
  onContinue?: () => void;
  hasDeadlines?: boolean;
}

const FOCUS_OPTIONS = [
  {
    level: 'focused' as FocusLevel,
    icon: Anchor,
    title: "Smooth Sailing",
    description: "Clear waters ahead - your mind is steady and you can navigate with ease",
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    level: 'scattered' as FocusLevel,
    icon: Waves,
    title: "Choppy Waters",
    description: "The seas are a bit rough - you're staying afloat but focus comes in waves",
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    level: 'unfocused' as FocusLevel,
    icon: CloudFog,
    title: "Navigating Fog",
    description: "Thick fog today - visibility is low and that's completely valid",
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
  },
];

export function FocusSelector({
  userContext,
  onSelectFocus,
  onContinue,
  hasDeadlines = false
}: FocusSelectorProps) {
  const [selectedFocus, setSelectedFocus] = useState<FocusLevel | null>(null);

  const handleFocusSelect = (focus: FocusLevel) => {
    setSelectedFocus(focus);
    onSelectFocus(focus);
  };

  const selectedGuidance = selectedFocus
    ? getPersonalizedGuidance(userContext, selectedFocus, 'medium', hasDeadlines)
    : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          What are the seas like today?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your navigation conditions help us suggest what you can realistically handle
        </p>
      </div>

      <div className="grid gap-4">
        {FOCUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFocus === option.level;

          return (
            <button
              key={option.level}
              onClick={() => handleFocusSelect(option.level)}
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
                    {isSelected && (
                      <div className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-full">
                        Selected
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedGuidance && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                ✓
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {selectedGuidance.label}
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              {selectedGuidance.description}
            </p>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                Today you can realistically handle:
              </h4>
              <p className="text-slate-700 dark:text-slate-300">
                {selectedGuidance.recommendedCapacity}
              </p>
            </div>

            {/* Harm Reduction Section */}
            {selectedGuidance.includeHarmReduction && selectedGuidance.harmReduction && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  💡 Survival Strategy
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-amber-800 dark:text-amber-200">
                    {selectedGuidance.harmReduction.validation}
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    {selectedGuidance.harmReduction.realityCheck}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    {selectedGuidance.harmReduction.survivalStrategy}
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              {selectedGuidance.encouragement}
            </p>
          </div>

          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full mt-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
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
