'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Calendar, X } from 'lucide-react';

export type QuickAddType = 'focus' | 'life';

export interface QuickAddHandle {
    focus: () => void;
    setType: (type: QuickAddType) => void;
}

interface QuickAddProps {
    onAddFocusTask: (text: string) => Promise<void>;
    onAddLifeTask: (text: string) => Promise<void>;
    onAddInboxItem: (text: string) => Promise<void>;
    onAddFutureItem: (text: string, date: string) => Promise<void>;
}

export const QuickAdd = forwardRef<QuickAddHandle, QuickAddProps>(({
    onAddFocusTask,
    onAddLifeTask,
    onAddInboxItem,
    onAddFutureItem
}, ref) => {
    const [text, setText] = useState('');
    const [selectedType, setSelectedType] = useState<QuickAddType>('focus');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        },
        setType: (type: QuickAddType) => {
            setSelectedType(type);
        }
    }));

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (selectedDate) {
                await onAddFutureItem(text, selectedDate);
            } else {
                switch (selectedType) {
                    case 'focus':
                        await onAddFocusTask(text);
                        break;
                    case 'life':
                        await onAddLifeTask(text);
                        break;
                }
            }
            setText('');
            setSelectedDate('');
            setShowDatePicker(false);
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setIsSubmitting(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const getPlaceholder = () => {
        // Simplified, friendlier placeholder
        return "What's one thing to focus on?";
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="relative">
                {/* Simplified - removed tab switcher to reduce cognitive load */}
                {/* Type can still be switched via the colored submit button or programmatically */}

                <div className="relative flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-cyan-500 dark:bg-slate-800 dark:ring-slate-700">
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={getPlaceholder()}
                        className="flex-1 bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                        disabled={isSubmitting}
                        autoFocus
                    />

                    {/* Date Picker Toggle / Indicator */}
                    <div className="relative">
                        {selectedDate ? (
                            <div className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                <span>{new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="ml-1 rounded-full p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`rounded-xl p-2 transition-colors ${showDatePicker
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700'
                                    }`}
                                title="Boomerang (Schedule for later)"
                            >
                                <Calendar className="h-5 w-5" />
                            </button>
                        )}

                        {/* Date Picker Popup */}
                        {showDatePicker && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Boomerang to...</p>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setShowDatePicker(false);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            setSelectedDate(tomorrow.toISOString().split('T')[0]);
                                            setShowDatePicker(false);
                                            inputRef.current?.focus();
                                        }}
                                        className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                    >
                                        Tomorrow
                                    </button>
                                    <button
                                        onClick={() => {
                                            const nextWeek = new Date();
                                            nextWeek.setDate(nextWeek.getDate() + 7);
                                            setSelectedDate(nextWeek.toISOString().split('T')[0]);
                                            setShowDatePicker(false);
                                            inputRef.current?.focus();
                                        }}
                                        className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                    >
                                        Next Week
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleSubmit()}
                        disabled={!text.trim() || isSubmitting}
                        className="rounded-xl p-2.5 text-white transition-all disabled:opacity-50 bg-sky-500 hover:bg-sky-600 disabled:hover:bg-sky-500"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

QuickAdd.displayName = 'QuickAdd';
