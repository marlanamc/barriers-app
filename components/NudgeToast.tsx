'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Zap, ArrowRight, X } from 'lucide-react';

interface NudgeToastProps {
    taskDescription: string;
    onBreakDown: () => void;
    onSwitchTask: () => void;
    onDismiss: () => void;
}

export function NudgeToast({
    taskDescription,
    onBreakDown,
    onSwitchTask,
    onDismiss
}: NudgeToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                                Stuck on "{taskDescription}"?
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                It's been a while. Want to try a different approach?
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={onBreakDown}
                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                >
                                    🔨 Break it Down
                                </button>
                                <button
                                    onClick={onSwitchTask}
                                    className="flex-1 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold transition-colors dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 dark:text-cyan-300"
                                >
                                    ⚡ Switch Task
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="h-1 bg-amber-100 dark:bg-amber-900/30">
                    <div className="h-full bg-amber-400 w-full animate-[shrink_10s_linear_forwards]" />
                </div>
            </div>
        </div>
    );
}
