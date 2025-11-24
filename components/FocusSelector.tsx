'use client';

import { useState, useEffect } from 'react';
import {
  Anchor,
  Waves,
  CloudFog,
  ArrowRight,
  Sparkles,
  Droplets,
  Utensils,
  Pill,
  Footprints,
  Moon,
  Coffee,
  Compass
} from 'lucide-react';
import { UserContext, FocusLevel, getPersonalizedGuidance } from '@/lib/user-context';

interface FocusSelectorProps {
  userContext: UserContext;
  onSelectFocus: (focus: FocusLevel) => void;
  onContinue?: () => void;
  hasDeadlines?: boolean;
  userName?: string;
}

interface FuelStatus {
  water: boolean;
  food: boolean;
  caffeine: boolean;
  meds: boolean;
  movement: boolean;
  sleep: boolean;
}

interface ToolkitData {
  northStar: string | null;
  anchorQuestion: string | null;
}

const FOCUS_OPTIONS = [
  {
    level: 'focused' as FocusLevel,
    icon: Anchor,
    title: "Smooth Sailing",
    description: "Steady mind, clear focus.",
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    level: 'scattered' as FocusLevel,
    icon: Waves,
    title: "Choppy Waters",
    description: "Focus comes and goes.",
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    level: 'unfocused' as FocusLevel,
    icon: CloudFog,
    title: "Navigating Fog",
    description: "Low visibility, low energy.",
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

const FUEL_ITEMS = [
  {
    key: 'water',
    icon: Droplets,
    label: 'Water',
    activeColor: 'from-sky-400 to-cyan-500',
  },
  {
    key: 'food',
    icon: Utensils,
    label: 'Food',
    activeColor: 'from-orange-400 to-amber-500',
  },
  {
    key: 'caffeine',
    icon: Coffee,
    label: 'Caffeine',
    activeColor: 'from-amber-500 to-yellow-600',
  },
  {
    key: 'meds',
    icon: Pill,
    label: 'Meds',
    activeColor: 'from-rose-400 to-pink-500',
  },
  {
    key: 'movement',
    icon: Footprints,
    label: 'Move',
    activeColor: 'from-emerald-400 to-teal-500',
  },
  {
    key: 'sleep',
    icon: Moon,
    label: 'Sleep',
    activeColor: 'from-indigo-400 to-purple-500',
  },
];

function getTimeGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  return name ? `${greeting}, ${name}` : greeting;
}

export function FocusSelector({
  userContext,
  onSelectFocus,
  onContinue,
  hasDeadlines = false,
  userName
}: FocusSelectorProps) {
  const [selectedFocus, setSelectedFocus] = useState<FocusLevel | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [toolkitData, setToolkitData] = useState<ToolkitData>({ northStar: null, anchorQuestion: null });
  const [fuelStatus, setFuelStatus] = useState<FuelStatus>({
    water: false,
    food: false,
    caffeine: false,
    meds: false,
    movement: false,
    sleep: false,
  });

  useEffect(() => {
    const savedToolkit = localStorage.getItem('toolkit-data');
    if (savedToolkit) {
      try {
        const data = JSON.parse(savedToolkit);
        setToolkitData({
          northStar: data.northStar || null,
          anchorQuestion: data.anchorQuestion || null,
        });
      } catch (e) {
        console.error('Failed to load toolkit data:', e);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const savedFuel = localStorage.getItem('fuel-status-' + today);
    if (savedFuel) {
      try {
        setFuelStatus(JSON.parse(savedFuel));
      } catch (e) {
        console.error('Failed to load fuel status:', e);
      }
    }
  }, []);

  const saveFuelStatus = (updates: Partial<FuelStatus>) => {
    const newStatus = { ...fuelStatus, ...updates };
    setFuelStatus(newStatus);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('fuel-status-' + today, JSON.stringify(newStatus));
  };

  const handleFocusSelect = (focus: FocusLevel) => {
    setSelectedFocus(focus);
    setStep(2);
  };

  const handleSetSail = () => {
    if (selectedFocus) {
      onSelectFocus(selectedFocus);
      onContinue?.();
    }
  };

  const selectedGuidance = selectedFocus
    ? getPersonalizedGuidance(userContext, selectedFocus, 'medium', hasDeadlines)
    : null;

  const fuelComplete = Object.values(fuelStatus).filter(Boolean).length;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 2) as 0 | 1 | 2);
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0) as 0 | 1 | 2);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background - Light mode: warm soft pastels, Dark mode: deep ocean */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Compass rose decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] dark:opacity-[0.02]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-[#d4a574]"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-400 dark:text-[#d4a574]"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M50 5 L52 15 L50 12 L48 15 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M50 95 L48 85 L50 88 L52 85 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M5 50 L15 48 L12 50 L15 52 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M95 50 L85 52 L88 50 L85 48 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
          </svg>
        </div>

        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Back Button */}
      {step > 0 && (
        <div className="relative z-10 max-w-lg mx-auto px-6 pt-4">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 text-slate-500 dark:text-[#d4a574]/60 hover:text-slate-700 dark:hover:text-[#d4a574] transition-colors text-sm font-medium tracking-wide font-crimson"
          >
            <span className="text-lg">←</span> Back
          </button>
        </div>
      )}

      {/* Step 1: Fuel Check */}
      {step === 0 && (
        <div className="relative z-10 space-y-8 pt-8 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center space-y-5 px-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300 dark:to-[#d4a574]/40" />
              <span className="px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-slate-500 dark:text-[#d4a574]/70 font-crimson">
                1 of 2
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300 dark:to-[#d4a574]/40" />
            </div>

            {/* Greeting badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-50 dark:bg-[#d4a574]/10 rounded-full border border-amber-200 dark:border-[#d4a574]/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#d4a574]" />
              <span className="text-sm font-medium text-slate-700 dark:text-[#f4e9d8] font-crimson">
                {getTimeGreeting(userName)}
              </span>
            </div>

            {/* Main title */}
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
                Check Your Vessel
              </h2>
              <p className="text-slate-600 dark:text-[#a8c5d8] max-w-md mx-auto text-lg leading-relaxed font-crimson">
                Let's check your vitals. What systems are currently online?
              </p>
            </div>

            {/* North Star reminder */}
            {toolkitData.northStar && (
              <div className="mt-6 mx-auto max-w-md px-5 py-4 bg-amber-50 dark:bg-[#d4a574]/10 rounded-xl border border-amber-200 dark:border-[#d4a574]/20">
                <p className="text-sm text-amber-700 dark:text-[#d4a574] font-crimson">
                  <span className="opacity-80">Remember your why:</span>{' '}
                  <span className="font-semibold italic">
                    "{toolkitData.northStar.slice(0, 60)}{toolkitData.northStar.length > 60 ? '...' : ''}"
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Fuel gauges grid */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto px-6">
            {FUEL_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = fuelStatus[item.key as keyof FuelStatus];
              return (
                <button
                  key={item.key}
                  onClick={() => saveFuelStatus({ [item.key]: !isActive })}
                  className="group relative"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`
                    relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-500
                    ${isActive
                      ? 'bg-white dark:bg-[#f4e9d8]/10 border-2 border-sky-400 dark:border-[#d4a574]/60 shadow-lg shadow-sky-100 dark:shadow-[#d4a574]/10'
                      : 'bg-white/70 dark:bg-[#0a1628]/40 border border-slate-200 dark:border-[#d4a574]/20 hover:border-slate-300 dark:hover:border-[#d4a574]/40'
                    }
                  `}>
                    {/* Ring effect */}
                    <div className={`
                      absolute inset-0 rounded-2xl transition-opacity duration-500
                      ${isActive ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <div className="absolute inset-1 rounded-xl border border-sky-200 dark:border-[#d4a574]/30" />
                    </div>

                    {/* Icon */}
                    <div className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500
                      ${isActive
                        ? `bg-gradient-to-br ${item.activeColor} shadow-lg`
                        : 'bg-slate-100 dark:bg-[#d4a574]/10'
                      }
                    `}>
                      <Icon className={`
                        w-5 h-5 transition-all duration-300
                        ${isActive ? 'text-white scale-110' : 'text-slate-400 dark:text-[#d4a574]/50 group-hover:text-slate-500 dark:group-hover:text-[#d4a574]/70'}
                      `} />
                    </div>

                    <span className={`
                      text-xs font-medium tracking-wide transition-colors duration-300 font-crimson
                      ${isActive ? 'text-slate-800 dark:text-[#f4e9d8]' : 'text-slate-400 dark:text-[#d4a574]/50 group-hover:text-slate-500 dark:group-hover:text-[#d4a574]/70'}
                    `}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coaching Nudge */}
          <div className="max-w-md mx-auto px-6 min-h-[4rem] flex items-center justify-center text-center">
            {(() => {
              const baseStyle = "text-sm leading-relaxed animate-in fade-in duration-500 font-crimson";

              if (fuelComplete === 0) return (
                <p className={`${baseStyle} text-slate-500 dark:text-[#a8c5d8]/80`}>
                  Starting from scratch? Take a moment to grab some water or stretch.
                </p>
              );

              if (!fuelStatus.meds && !fuelStatus.caffeine) return (
                <p className={`${baseStyle} text-amber-600 dark:text-[#d4a574]`}>
                  <span className="opacity-70">⚠</span> No chemical support today? Be gentle with your expectations.
                </p>
              );

              if (!fuelStatus.water || !fuelStatus.food) return (
                <p className={`${baseStyle} text-sky-600 dark:text-[#7eb8d8]`}>
                  Engine running hot? Hydration or a snack might help you cool down.
                </p>
              );

              if (!fuelStatus.sleep) return (
                <p className={`${baseStyle} text-indigo-600 dark:text-[#9b8ed4]`}>
                  Low visibility today? It's okay to take it slow.
                </p>
              );

              return (
                <p className={`${baseStyle} text-emerald-600 dark:text-emerald-400`}>
                  You're well-provisioned and ready for the high seas!
                </p>
              );
            })()}
          </div>

          {/* Continue button */}
          <div className="flex justify-center pt-2 px-6">
            <button
              onClick={nextStep}
              className={`
                group relative flex items-center gap-3 px-8 py-4 rounded-xl font-semibold
                transition-all duration-300 overflow-hidden
                ${fuelComplete < 2
                  ? 'bg-amber-100 dark:bg-[#d4a574]/20 text-amber-700 dark:text-[#d4a574] border border-amber-300 dark:border-[#d4a574]/40 hover:bg-amber-200 dark:hover:bg-[#d4a574]/30'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] text-white dark:text-[#0a1628] hover:shadow-xl hover:shadow-sky-200 dark:hover:shadow-[#d4a574]/20 hover:scale-[1.02]'
                }
              `}
            >
              <span className="relative z-10 tracking-wide font-crimson">
                {fuelComplete < 2 ? 'Proceed with Caution' : 'Check Conditions'}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Sea Conditions */}
      {step === 1 && (
        <div className="relative z-10 space-y-8 pt-8 pb-24 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center space-y-4 px-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300 dark:to-[#d4a574]/40" />
              <span className="px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-slate-500 dark:text-[#d4a574]/70 font-crimson">
                2 of 2
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300 dark:to-[#d4a574]/40" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
              What are the seas like?
            </h2>
            <p className="text-slate-600 dark:text-[#a8c5d8] text-lg font-crimson">
              Be honest with yourself—any condition is valid for sailing.
            </p>
          </div>

          <div className="grid gap-4 max-w-lg mx-auto px-6">
            {FOCUS_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.level}
                  onClick={() => handleFocusSelect(option.level)}
                  className="w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group
                    bg-white/80 dark:bg-[#0a1628]/60 backdrop-blur-sm border-slate-200 dark:border-slate-700/30
                    hover:bg-white dark:hover:bg-[#0a1628]/80 hover:border-slate-300 dark:hover:border-[#d4a574]/40 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      bg-slate-100 dark:bg-[#d4a574]/10 border border-slate-200 dark:border-[#d4a574]/20
                      group-hover:bg-slate-200 dark:group-hover:bg-[#d4a574]/20 transition-all duration-300">
                      <Icon className={`w-7 h-7 ${option.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-[#a8c5d8] mt-0.5 font-crimson">
                        {option.description}
                      </p>
                    </div>

                    <div className="self-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-slate-400 dark:text-[#d4a574]">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Guidance */}
      {step === 2 && selectedGuidance && (
        <div className="relative z-10 space-y-6 pt-6 pb-24 animate-in fade-in slide-in-from-right-8 duration-500 max-w-lg mx-auto px-6">
          <div className="bg-white/90 dark:bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-[#d4a574]/20 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] flex items-center justify-center shadow-lg">
                <Compass className="w-7 h-7 text-white dark:text-[#0a1628]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
                  {selectedGuidance.label}
                </h3>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-slate-700 dark:text-[#a8c5d8] leading-relaxed text-lg font-crimson">
                {selectedGuidance.description}
              </p>

              <div className="bg-sky-50 dark:bg-[#7eb8d8]/10 rounded-xl p-4 border border-sky-200 dark:border-[#7eb8d8]/20 flex items-start gap-3">
                <Anchor className="w-5 h-5 text-sky-600 dark:text-[#7eb8d8] flex-shrink-0 mt-0.5" />
                <p className="text-sky-700 dark:text-[#7eb8d8] text-sm font-medium font-crimson">
                  {selectedGuidance.recommendedCapacity}
                </p>
              </div>

              {selectedGuidance.includeHarmReduction && selectedGuidance.harmReduction && (
                <div className="bg-amber-50 dark:bg-[#d4a574]/10 rounded-xl p-4 border border-amber-200 dark:border-[#d4a574]/20">
                  <h4 className="font-semibold text-amber-700 dark:text-[#d4a574] mb-3 text-sm tracking-wide font-cinzel">
                    Survival Strategy
                  </h4>
                  <div className="space-y-2 text-sm font-crimson">
                    <p className="text-slate-700 dark:text-[#f4e9d8]/80">
                      {selectedGuidance.harmReduction.validation}
                    </p>
                    <p className="text-amber-600 dark:text-[#d4a574]/80">
                      {selectedGuidance.harmReduction.realityCheck}
                    </p>
                    <p className="text-amber-700 dark:text-[#d4a574] font-medium">
                      {selectedGuidance.harmReduction.survivalStrategy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {onContinue && (
              <button
                onClick={handleSetSail}
                className="w-full mt-8 bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] text-white dark:text-[#0a1628] px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-sky-200 dark:hover:shadow-[#d4a574]/20 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 font-cinzel"
              >
                <span className="tracking-wide">Set Sail</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
