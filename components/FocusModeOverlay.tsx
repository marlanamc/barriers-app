'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, CheckCircle, AlertTriangle, Minimize2, RotateCcw, Plus, Minus, Trash2 } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';
import { BARRIERS, type BarrierType } from '@/lib/barriers';

interface FocusModeTask {
    id: string;
    description: string;
    complexity: TaskComplexity;
    barrier?: {
        type: string;
        icon?: string;
        custom?: string;
    };
    anchors?: {
        type: 'at' | 'while' | 'before' | 'after';
        value: string;
    }[];
    categories?: string[];
}

interface FocusModeOverlayProps {
    task: FocusModeTask;
    onComplete: () => void;
    onMinimize: () => void;
    onStuck: () => void;
    onDelete?: () => void;
}

export function FocusModeOverlay({
    task,
    onComplete,
    onMinimize,
    onStuck,
    onDelete
}: FocusModeOverlayProps) {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 mins
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play sound
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const adjustTime = (minutes: number) => {
        setTimeLeft(prev => {
            const newTime = prev + (minutes * 60);
            return Math.max(60, newTime); // Minimum 1 minute
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = async () => {
        setIsCompleted(true);
        // Dynamically import canvas-confetti to avoid SSR issues
        const confetti = (await import('canvas-confetti')).default;
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#34d399', '#a78bfa']
        });
        setTimeout(() => {
            onComplete();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button
                    onClick={onMinimize}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <Minimize2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Minimize</span>
                </button>

                <div className="flex items-center gap-2">
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center space-y-12">

                {/* Task Display */}
                <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500 delay-100">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 mb-4">
                        <span className="text-sm font-bold uppercase tracking-wider">Current Focus</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {task.description}
                        {task.anchors && task.anchors.length > 0 && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal text-3xl md:text-4xl">
                                {' '}{task.anchors[0].type} {task.anchors[0].value}
                            </span>
                        )}
                    </h1>

                    {/* Categories & Barrier */}
                    {(task.categories?.length || task.barrier) && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                            {task.categories?.map((category) => (
                                <span
                                    key={category}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-medium border border-emerald-200 dark:border-emerald-800"
                                >
                                    {category}
                                </span>
                            ))}
                            {task.barrier && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200 text-sm font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    {task.barrier.custom || BARRIERS[task.barrier.type as BarrierType]?.label || task.barrier.type}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 duration-500 delay-200">
                    <div className="group relative flex items-center gap-6">
                        <button
                            onClick={() => adjustTime(-5)}
                            className="p-3 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-all"
                            aria-label="Decrease time by 5 minutes"
                        >
                            <Minus className="h-6 w-6" />
                        </button>

                        <div className="text-7xl md:text-8xl font-mono font-light tracking-tight text-slate-900 dark:text-slate-100 tabular-nums select-none">
                            {formatTime(timeLeft)}
                        </div>

                        <button
                            onClick={() => adjustTime(5)}
                            className="p-3 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:text-slate-600 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-all"
                            aria-label="Increase time by 5 minutes"
                        >
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTimer}
                            className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 active:scale-95 ${isActive
                                ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100'
                                : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20'
                                }`}
                        >
                            {isActive ? (
                                <>
                                    <Pause className="h-6 w-6" /> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="h-6 w-6" /> Start Focus
                                </>
                            )}
                        </button>

                        <button
                            onClick={resetTimer}
                            className="p-4 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                            title="Reset Timer"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-in slide-in-from-bottom-10 duration-500 delay-300">
                    <button
                        onClick={onStuck}
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                    >
                        <AlertTriangle className="h-5 w-5" />
                        I'm Stuck
                    </button>

                    <button
                        onClick={handleComplete}
                        disabled={isCompleted}
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="h-5 w-5" />
                        {isCompleted ? 'Done!' : 'Complete'}
                    </button>
                </div>

            </div>
        </div>
    );
}
