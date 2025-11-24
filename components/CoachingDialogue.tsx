'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, MessageCircle } from 'lucide-react';

interface CoachingDialogueProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    steps: {
        message: string;
        input?: {
            type: 'text' | 'textarea' | 'select' | 'multi-select';
            placeholder?: string;
            options?: { label: string; value: string; icon?: string }[];
            value: any;
            onChange: (val: any) => void;
        };
        action?: {
            label: string;
            onClick: () => void;
        };
    }[];
    onComplete: () => void;
}

export function CoachingDialogue({ isOpen, onClose, title, steps, onComplete }: CoachingDialogueProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    // Reset step when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setIsExiting(false);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(() => {
            onComplete();
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
                onClick={onClose}
            />

            {/* Dialogue Card */}
            <div
                className={`relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${isExiting ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}
            >
                {/* Header */}
                <div className="bg-sky-50 dark:bg-sky-900/20 p-4 flex items-center justify-between border-b border-sky-100 dark:border-sky-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center text-xl shadow-sm">
                            🧢
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 font-cinzel">{title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson">Captain's Log</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-sky-100 dark:hover:bg-sky-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Message Bubble */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-2xl rounded-tl-none p-4 text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm border border-slate-100 dark:border-slate-700">
                            {step.message}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="space-y-4">
                        {step.input && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {step.input.type === 'textarea' && (
                                    <textarea
                                        value={step.input.value}
                                        onChange={(e) => step.input.onChange(e.target.value)}
                                        placeholder={step.input.placeholder}
                                        className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none shadow-sm"
                                        autoFocus
                                    />
                                )}
                                {step.input.type === 'text' && (
                                    <input
                                        type="text"
                                        value={step.input.value}
                                        onChange={(e) => step.input.onChange(e.target.value)}
                                        placeholder={step.input.placeholder}
                                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && step.input?.value) {
                                                handleNext();
                                            }
                                        }}
                                    />
                                )}
                                {step.input.type === 'select' && step.input.options && (
                                    <div className="grid gap-2">
                                        {step.input.options.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    step.input?.onChange(option.value);
                                                    // Auto advance for single select
                                                    setTimeout(handleNext, 150);
                                                }}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${step.input.value === option.value
                                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-100'
                                                        : 'border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                                    }`}
                                            >
                                                {option.icon && <span className="text-xl">{option.icon}</span>}
                                                <span className="font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-1">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep
                                        ? 'w-6 bg-sky-500'
                                        : idx < currentStep
                                            ? 'w-1.5 bg-sky-200 dark:bg-sky-800'
                                            : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={step.input && !step.input.value && step.input.type !== 'multi-select'} // Allow empty for multi-select if needed, or adjust logic
                        className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
