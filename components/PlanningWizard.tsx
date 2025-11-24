'use client';

import { useState } from 'react';
import { FocusSelector } from '@/components/FocusSelector';
import { ArrowRight, Compass, AlertTriangle, CheckCircle2, Anchor } from 'lucide-react';
import type { FocusLevel, UserContext } from '@/lib/user-context';
import type { BarrierType } from '@/lib/barriers';
import { BARRIERS } from '@/lib/barriers';

interface PlanningWizardProps {
    userContext: UserContext;
    onComplete: (data: PlanningData) => void;
    initialData?: Partial<PlanningData>;
    userName?: string;
}

export interface PlanningData {
    focusLevel: FocusLevel;
    topTasks: string[]; // Descriptions of top 1-3 tasks
    anticipatedBarriers: BarrierType[];
}

export function PlanningWizard({ userContext, onComplete, initialData, userName }: PlanningWizardProps) {
    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState<PlanningData>({
        focusLevel: initialData?.focusLevel || 'focused',
        topTasks: initialData?.topTasks || [],
        anticipatedBarriers: initialData?.anticipatedBarriers || [],
    });

    const [newTaskInput, setNewTaskInput] = useState('');

    const handleFocusSelect = (focus: FocusLevel) => {
        setData(prev => ({ ...prev, focusLevel: focus }));
        // FocusSelector handles its own internal steps, so we wait for its onContinue
    };

    const handleFocusContinue = () => {
        setStep(2);
    };

    const handleAddTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTaskInput.trim()) return;
        if (data.topTasks.length >= 3) return;

        setData(prev => ({
            ...prev,
            topTasks: [...prev.topTasks, newTaskInput.trim()]
        }));
        setNewTaskInput('');
    };

    const removeTask = (index: number) => {
        setData(prev => ({
            ...prev,
            topTasks: prev.topTasks.filter((_, i) => i !== index)
        }));
    };

    const toggleBarrier = (barrierId: BarrierType) => {
        setData(prev => {
            const exists = prev.anticipatedBarriers.includes(barrierId);
            return {
                ...prev,
                anticipatedBarriers: exists
                    ? prev.anticipatedBarriers.filter(b => b !== barrierId)
                    : [...prev.anticipatedBarriers, barrierId]
            };
        });
    };

    // Step 1: Internal Weather (FocusSelector)
    if (step === 1) {
        return (
            <FocusSelector
                userContext={userContext}
                onSelectFocus={handleFocusSelect}
                onContinue={handleFocusContinue}
                userName={userName}
            />
        );
    }

    // Step 2: Set Compass (Priorities)
    if (step === 2) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a1628] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 dark:bg-[#d4a574]/10 mb-4">
                            <Compass className="w-8 h-8 text-sky-600 dark:text-[#d4a574]" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-[#f4e9d8] font-cinzel">Set Your Compass</h2>
                        <p className="text-lg text-slate-600 dark:text-[#a8c5d8] font-crimson max-w-md mx-auto">
                            What are the 1-3 most important things to navigate towards today?
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#0f2847] rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-[#d4a574]/20">
                        <div className="space-y-4">
                            {data.topTasks.map((task, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#0a1628]/50 rounded-xl border border-slate-200 dark:border-[#d4a574]/10 animate-in fade-in slide-in-from-bottom-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500 dark:bg-[#d4a574] text-white dark:text-[#0a1628] flex items-center justify-center text-sm font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 font-medium text-slate-700 dark:text-[#f4e9d8]">{task}</span>
                                    <button
                                        onClick={() => removeTask(idx)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {data.topTasks.length < 3 && (
                                <form onSubmit={handleAddTask} className="relative">
                                    <input
                                        type="text"
                                        value={newTaskInput}
                                        onChange={(e) => setNewTaskInput(e.target.value)}
                                        placeholder="Add a compass task..."
                                        className="w-full p-4 pr-12 rounded-xl bg-white dark:bg-[#0a1628] border-2 border-slate-200 dark:border-[#d4a574]/20 focus:border-sky-500 dark:focus:border-[#d4a574] outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newTaskInput.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-100 dark:bg-[#d4a574]/10 rounded-lg text-slate-600 dark:text-[#d4a574] hover:bg-sky-50 dark:hover:bg-[#d4a574]/20 disabled:opacity-50 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <button
                                onClick={() => setStep(1)}
                                className="text-slate-500 dark:text-[#a8c5d8] hover:text-slate-700 dark:hover:text-[#f4e9d8] font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={data.topTasks.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-sky-600 dark:bg-[#d4a574] text-white dark:text-[#0a1628] rounded-xl font-bold hover:bg-sky-700 dark:hover:bg-[#c49a6c] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next: Identify Storms <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Identify Storms (Barriers)
    if (step === 3) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a1628] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-[#d4a574]/10 mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-[#d4a574]" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-[#f4e9d8] font-cinzel">Scan for Storms</h2>
                        <p className="text-lg text-slate-600 dark:text-[#a8c5d8] font-crimson max-w-md mx-auto">
                            What might get in your way today? Forewarned is forearmed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(BARRIERS).map(([key, barrier]) => {
                            const isSelected = data.anticipatedBarriers.includes(key as BarrierType);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleBarrier(key as BarrierType)}
                                    className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3
                    ${isSelected
                                            ? 'bg-amber-50 dark:bg-[#d4a574]/20 border-amber-500 dark:border-[#d4a574]'
                                            : 'bg-white dark:bg-[#0f2847] border-slate-200 dark:border-[#d4a574]/20 hover:border-amber-300 dark:hover:border-[#d4a574]/50'
                                        }
                  `}
                                >
                                    <span className="text-2xl">{barrier.icon}</span>
                                    <div>
                                        <h3 className={`font-bold ${isSelected ? 'text-amber-900 dark:text-[#f4e9d8]' : 'text-slate-800 dark:text-[#a8c5d8]'}`}>
                                            {barrier.label}
                                        </h3>
                                        <p className={`text-xs mt-1 ${isSelected ? 'text-amber-700 dark:text-[#d4a574]' : 'text-slate-500 dark:text-[#a8c5d8]/60'}`}>
                                            {barrier.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-8">
                        <button
                            onClick={() => setStep(2)}
                            className="text-slate-500 dark:text-[#a8c5d8] hover:text-slate-700 dark:hover:text-[#f4e9d8] font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            className="flex items-center gap-2 px-8 py-4 bg-amber-600 dark:bg-[#d4a574] text-white dark:text-[#0a1628] rounded-xl font-bold hover:bg-amber-700 dark:hover:bg-[#c49a6c] transition-all shadow-lg hover:shadow-amber-200 dark:hover:shadow-[#d4a574]/20"
                        >
                            Review Mission <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Launch (Review)
    if (step === 4) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a1628] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                            <Anchor className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-[#f4e9d8] font-cinzel">Mission Ready</h2>
                        <p className="text-xl text-slate-600 dark:text-[#a8c5d8] font-crimson">
                            Your compass is set. The seas await.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#0f2847] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-[#d4a574]/20 space-y-8">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-[#d4a574]/60 mb-3">Conditions</h3>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${data.focusLevel === 'focused' ? 'bg-emerald-500' :
                                            data.focusLevel === 'scattered' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`} />
                                    <span className="text-lg font-medium text-slate-800 dark:text-[#f4e9d8] capitalize">
                                        {data.focusLevel === 'focused' ? 'Smooth Sailing' :
                                            data.focusLevel === 'scattered' ? 'Choppy Waters' : 'Navigating Fog'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-[#d4a574]/60 mb-3">Anticipated Storms</h3>
                                {data.anticipatedBarriers.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {data.anticipatedBarriers.map(b => (
                                            <span key={b} className="px-3 py-1 rounded-full bg-amber-50 dark:bg-[#d4a574]/10 text-amber-700 dark:text-[#d4a574] text-sm font-medium border border-amber-100 dark:border-[#d4a574]/20">
                                                {BARRIERS[b].label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-slate-500 dark:text-[#a8c5d8] italic">None anticipated</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-[#d4a574]/60 mb-3">Compass Tasks</h3>
                            <div className="space-y-3">
                                {data.topTasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0a1628]/50 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-sky-500 dark:text-[#d4a574]" />
                                        <span className="font-medium text-slate-700 dark:text-[#f4e9d8]">{task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onComplete(data)}
                            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-[#d4a574] dark:to-[#c49a6c] text-white dark:text-[#0a1628] rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-cinzel"
                        >
                            Launch Mission
                        </button>
                    </div>

                    <button
                        onClick={() => setStep(3)}
                        className="text-slate-500 dark:text-[#a8c5d8] hover:text-slate-700 dark:hover:text-[#f4e9d8] font-medium"
                    >
                        Back to Storms
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
