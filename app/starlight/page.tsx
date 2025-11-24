'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Star, Trash2, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface StarlightWin {
    id: string;
    description: string;
    category: 'win' | 'gratitude' | 'progress';
    createdAt: string;
}

const CATEGORY_OPTIONS = [
    { key: 'win', label: 'Win', icon: '🏆', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { key: 'gratitude', label: 'Gratitude', icon: '💛', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
    { key: 'progress', label: 'Progress', icon: '📈', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
];

const WIN_PROMPTS = [
    "What's one thing you did today that you're proud of?",
    "What task did you complete, even if it was small?",
    "Where did you show yourself kindness today?",
    "What did you handle better than expected?",
    "What's something you didn't procrastinate on?",
];

export default function StarlightPage() {
    const [wins, setWins] = useState<StarlightWin[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newWinText, setNewWinText] = useState('');
    const [newWinCategory, setNewWinCategory] = useState<'win' | 'gratitude' | 'progress'>('win');
    const [currentPrompt, setCurrentPrompt] = useState('');

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('starlight-wins');
        if (saved) {
            try {
                setWins(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load starlight wins:', e);
            }
        }
        // Set random prompt
        setCurrentPrompt(WIN_PROMPTS[Math.floor(Math.random() * WIN_PROMPTS.length)]);
    }, []);

    const saveWins = (updatedWins: StarlightWin[]) => {
        setWins(updatedWins);
        localStorage.setItem('starlight-wins', JSON.stringify(updatedWins));
    };

    const handleAddWin = () => {
        if (!newWinText.trim()) return;

        const newWin: StarlightWin = {
            id: crypto.randomUUID(),
            description: newWinText.trim(),
            category: newWinCategory,
            createdAt: new Date().toISOString(),
        };

        saveWins([newWin, ...wins]);
        setNewWinText('');
        setNewWinCategory('win');
        setShowAddModal(false);
        // Get new prompt for next time
        setCurrentPrompt(WIN_PROMPTS[Math.floor(Math.random() * WIN_PROMPTS.length)]);
    };

    const handleDeleteWin = (id: string) => {
        saveWins(wins.filter(w => w.id !== id));
    };

    // Group wins by date
    const groupedWins = wins.reduce((acc, win) => {
        const date = new Date(win.createdAt).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(win);
        return acc;
    }, {} as Record<string, StarlightWin[]>);

    const todayStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    const todayWins = wins.filter(w => {
        const winDate = new Date(w.createdAt).toDateString();
        return winDate === new Date().toDateString();
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pb-24">
            <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/toolkit"
                        className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                            Starlight
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Celebrate your wins and gratitude moments
                        </p>
                    </div>
                </div>

                {/* Today's Summary */}
                <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Today</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {todayWins.length}
                        </span>
                    </div>
                    {todayWins.length === 0 ? (
                        <p className="text-sm text-amber-700 dark:text-amber-300 italic">
                            No wins logged yet today. Even small ones count!
                        </p>
                    ) : (
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            {todayWins.length === 1 ? '1 moment captured' : `${todayWins.length} moments captured`} ✨
                        </p>
                    )}
                </div>

                {/* Quick Add Card */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left group"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">Log a win</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {currentPrompt}
                            </p>
                        </div>
                    </div>
                </button>

                {/* Wins List */}
                {wins.length === 0 ? (
                    <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 text-amber-300 dark:text-amber-600 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Your starlight collection is empty
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Start logging your wins, no matter how small. They add up and remind you how capable you are.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedWins).map(([date, dateWins]) => (
                            <div key={date}>
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                    {date === todayStr ? 'Today' : date}
                                </h3>
                                <div className="space-y-3">
                                    {dateWins.map((win) => {
                                        const category = CATEGORY_OPTIONS.find(c => c.key === win.category);
                                        return (
                                            <div
                                                key={win.id}
                                                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xl">{category?.icon}</span>
                                                    <div className="flex-1">
                                                        <p className="text-slate-900 dark:text-slate-100">
                                                            {win.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${category?.color}`}>
                                                                {category?.label}
                                                            </span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                {new Date(win.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteWin(win.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Win Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                            Log a Win
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                            {currentPrompt}
                        </p>

                        {/* Category selector */}
                        <div className="flex gap-2 mb-4">
                            {CATEGORY_OPTIONS.map((cat) => (
                                <button
                                    key={cat.key}
                                    onClick={() => setNewWinCategory(cat.key as 'win' | 'gratitude' | 'progress')}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all text-sm ${
                                        newWinCategory === cat.key
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={newWinText}
                            onChange={(e) => setNewWinText(e.target.value)}
                            placeholder="I completed... I'm grateful for... I made progress on..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                            autoFocus
                        />

                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewWinText('');
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddWin}
                                disabled={!newWinText.trim()}
                                className="px-6 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
