'use client';

import { useState, useEffect } from 'react';
import { X, Anchor } from 'lucide-react';
import { BARRIER_LIST, BarrierType } from '@/lib/barriers';

interface BarrierSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (barrierId: BarrierType) => void;
}

export function BarrierSelector({ isOpen, onClose, onSelect }: BarrierSelectorProps) {
    const [anchorQuestion, setAnchorQuestion] = useState<string | null>(null);

    // Load anchor question from toolkit data
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('toolkit-data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setAnchorQuestion(data.anchorQuestion || null);
                } catch (e) {
                    console.error('Failed to load anchor question:', e);
                }
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            What's getting in the way?
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Name it to tame it. We'll suggest a strategy.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Anchor Question - grounding reminder */}
                {anchorQuestion && (
                    <div className="px-4 pt-4">
                        <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                            <div className="flex items-start gap-2">
                                <Anchor className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium">
                                    "{anchorQuestion}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-3">
                    {BARRIER_LIST.map((barrier) => {
                        const Icon = barrier.icon;
                        return (
                            <button
                                key={barrier.id}
                                onClick={() => onSelect(barrier.id)}
                                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group
                  ${barrier.bgColor} ${barrier.borderColor} hover:brightness-95 dark:hover:brightness-110
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 ${barrier.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${barrier.color}`}>
                                            {barrier.label}
                                        </h3>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                            {barrier.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
