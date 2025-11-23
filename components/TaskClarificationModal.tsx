'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Clock, AlertTriangle, Zap, Anchor as AnchorIcon } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';
import type { BarrierType } from '@/lib/barriers';
import { BARRIERS } from '@/lib/barriers';
import { CATEGORY_OPTIONS } from '@/lib/categories';

interface TaskClarificationModalProps {
    taskDescription: string;
    onSave: (data: {
        complexity: TaskComplexity;
        barrier?: BarrierType;
        category?: string;
        anchor?: { type: 'at' | 'while' | 'before' | 'after'; value: string };
    }) => void;
    onCancel: () => void;
}

export function TaskClarificationModal({
    taskDescription,
    onSave,
    onCancel
}: TaskClarificationModalProps) {
    const [complexity, setComplexity] = useState<TaskComplexity>('medium');
    const [barrier, setBarrier] = useState<BarrierType | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [anchorType, setAnchorType] = useState<'at' | 'while' | 'before' | 'after' | null>(null);
    const [anchorValue, setAnchorValue] = useState('');

    const handleSave = () => {
        onSave({
            complexity,
            barrier: barrier || undefined,
            category: category || undefined,
            anchor: anchorType && anchorValue ? { type: anchorType, value: anchorValue } : undefined,
        });
    };

    // Focus Trap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }

            if (e.key === 'Tab') {
                // Simple focus trap logic could go here, or use a library.
                // For now, we'll rely on the modal being a distinct layer.
                // A robust implementation would querySelectorAll focusable elements.
            }
        };

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div
                    className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 max-h-[85vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Clarify Task</h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                {taskDescription}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">

                        {/* 1. Complexity (How Big?) */}
                        <section>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <Zap className="h-4 w-4 text-amber-500" />
                                Sails (Energy needed?)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setComplexity('quick')}
                                    className={`rounded-lg border-2 p-2.5 text-center transition ${complexity === 'quick'
                                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        🚣 Quick
                                    </div>
                                </button>
                                <button
                                    onClick={() => setComplexity('medium')}
                                    className={`rounded-lg border-2 p-2.5 text-center transition ${complexity === 'medium'
                                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        ⛵ Focus
                                    </div>
                                </button>
                                <button
                                    onClick={() => setComplexity('deep')}
                                    className={`rounded-lg border-2 p-2.5 text-center transition ${complexity === 'deep'
                                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        ⛵⛵ Deep
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* 2. Barriers */}
                        <section>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Known Storm or Drift?
                            </label>
                            <div className="space-y-4">
                                {/* Storms: Big Challenges */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                                        ⛈️ Storms (Big Challenges)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(BARRIERS)
                                            .filter(([_, b]) => b.type === 'storm')
                                            .map(([key, b]) => {
                                                const IconComponent = b.icon;
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => setBarrier(barrier === key ? null : key as BarrierType)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${barrier === key
                                                            ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                                                            }`}
                                                    >
                                                        <IconComponent className="h-3 w-3" />
                                                        {b.label.replace('Storm: ', '')}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Drift: Sneaky Distractions */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                                        🌊 Drift (Sneaky Distractions)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(BARRIERS)
                                            .filter(([_, b]) => b.type === 'drift')
                                            .map(([key, b]) => {
                                                const IconComponent = b.icon;
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => setBarrier(barrier === key ? null : key as BarrierType)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${barrier === key
                                                            ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                                                            }`}
                                                    >
                                                        <IconComponent className="h-3 w-3" />
                                                        {b.label.replace('Drift: ', '')}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Category (Tag) */}
                        <section>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <Tag className="h-4 w-4 text-purple-500" />
                                Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <button
                                        key={cat.label}
                                        onClick={() => setCategory(category === cat.label ? null : cat.label)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${category === cat.label
                                            ? 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <span>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 4. Anchor (When?) */}
                        <section>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                <AnchorIcon className="h-4 w-4 text-cyan-500" />
                                Oars (Support & Anchors)
                            </label>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    {(['at', 'before', 'after', 'while'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setAnchorType(anchorType === type ? null : type)}
                                            className={`flex-1 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${anchorType === type
                                                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                                }`}
                                        >
                                            {type === 'at' ? 'At Time' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {anchorType && anchorType !== 'at' && (() => {
                                    // Context-aware anchor suggestions based on category
                                    const getPresets = () => {
                                        const categoryPresets: Record<string, Record<string, string[]>> = {
                                            'Health': {
                                                'before': ['the Gym', 'my Workout', 'my Shower', 'Bedtime'],
                                                'after': ['my Workout', 'my Run', 'Yoga', 'a Meal'],
                                                'while': ['on the Treadmill', 'Stretching', 'Waiting at the Doctor', 'Walking']
                                            },
                                            'Work': {
                                                'before': ['Standup', 'the Meeting', 'Lunch Break', 'End of Day'],
                                                'after': ['Standup', 'the Meeting', 'Coffee', 'my Review'],
                                                'while': ['Commuting', 'on Call', 'Waiting for the Build', 'Pair Programming']
                                            },
                                            'School': {
                                                'before': ['Class', 'the Lecture', 'Study Group', 'Bedtime'],
                                                'after': ['Class', 'the Lecture', 'Lab', 'Office Hours'],
                                                'while': ['Commuting', 'in Study Hall', 'at Tutoring', 'in Group Study']
                                            },
                                            'Home': {
                                                'before': ['Dinner', 'Bedtime', 'Guests Arrive', 'Cleaning'],
                                                'after': ['Dinner', 'Dishes', 'Laundry', 'my Shower'],
                                                'while': ['Cooking', 'Laundry is Running', 'TV is On', 'Music is Playing']
                                            },
                                            'Errands': {
                                                'before': ['Leaving the House', 'the Store Closes', 'my Appointment', 'Traffic'],
                                                'after': ['Grocery Shopping', 'my Appointment', 'Pickup', 'Running Errands'],
                                                'while': ['Driving', 'in Line', 'in the Waiting Room', 'Commuting']
                                            }
                                        };

                                        // Use category-specific presets if available, otherwise use defaults
                                        if (category && categoryPresets[category]) {
                                            return categoryPresets[category][anchorType] || [];
                                        }

                                        // Default presets when no category selected
                                        const defaults: Record<string, string[]> = {
                                            'before': ['Lunch', 'the Meeting', 'my Commute', 'Bedtime'],
                                            'after': ['Lunch', 'the Meeting', 'Coffee', 'my Workout'],
                                            'while': ['Listening to a Podcast', 'Music is Playing', 'TV/YouTube is On', 'Body Doubling']
                                        };

                                        return defaults[anchorType] || [];
                                    };

                                    const presets = getPresets();

                                    return (
                                        <div className="space-y-2">
                                            {presets.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {presets.map(preset => (
                                                        <button
                                                            key={preset}
                                                            onClick={() => setAnchorValue(preset)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${anchorValue === preset
                                                                ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                                                }`}
                                                        >
                                                            {preset}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                value={anchorValue}
                                                onChange={(e) => setAnchorValue(e.target.value)}
                                                placeholder="Or type your own..."
                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                    );
                                })()}

                                {anchorType === 'at' && (
                                    <input
                                        type="time"
                                        value={anchorValue}
                                        onChange={(e) => setAnchorValue(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                        autoFocus
                                    />
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Skip Details
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                        >
                            Save Task
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
