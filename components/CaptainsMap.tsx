'use client';

import { useState, useEffect } from 'react';
import { Lock, Ship, Anchor } from 'lucide-react';

interface FrameworkSection {
    id: string;
    title: string;
    emoji: string;
    completed: boolean;
    unlocked: boolean;
    items: {
        id: string;
        name: string;
        emoji: string;
        description: string;
        completed: boolean;
        data?: any;
    }[];
}

interface CaptainsMapProps {
    userId?: string;
}

export function CaptainsMap({ userId: _userId }: CaptainsMapProps) {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [progress, setProgress] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadProgress = () => {
            try {
                const toolkitData = localStorage.getItem('toolkit-data');
                const today = new Date().toISOString().split('T')[0];
                const fuelData = localStorage.getItem('fuel-status-' + today);

                setProgress({
                    toolkit: toolkitData ? JSON.parse(toolkitData) : {},
                    fuel: fuelData ? JSON.parse(fuelData) : {},
                });
            } catch (e) {
                console.error('Failed to load progress:', e);
            }
        };

        loadProgress();
    }, []);

    // Map sections as levels
    const baseLevels: Omit<FrameworkSection, 'unlocked'>[] = [
        {
            id: 'dockside',
            title: 'Dockside Prep',
            emoji: '⚓',
            completed: false,
            items: [
                {
                    id: 'life-vest',
                    name: 'Life Vest',
                    emoji: '🦺',
                    description: 'Your personal rescue gear',
                    completed: !!progress.toolkit?.lifeVest,
                    data: progress.toolkit?.lifeVest,
                },
                {
                    id: 'fuel-up',
                    name: 'Fuel-Up',
                    emoji: '☕️',
                    description: 'Daily fuel check',
                    completed: Object.values(progress.fuel || {}).some(Boolean),
                    data: progress.fuel,
                },
                {
                    id: 'north-star',
                    name: 'North Star',
                    emoji: '💫',
                    description: 'Your personal "why"',
                    completed: !!progress.toolkit?.northStar,
                    data: progress.toolkit?.northStar,
                },
            ],
        },
        {
            id: 'destination',
            title: 'Lighthouse',
            emoji: '🗼',
            completed: !!progress.toolkit?.lighthouse,
            items: [
                {
                    id: 'lighthouse',
                    name: 'Lighthouse',
                    emoji: '◎',
                    description: 'Your long-term vision',
                    completed: !!progress.toolkit?.lighthouse,
                    data: progress.toolkit?.lighthouse,
                },
            ],
        },
        {
            id: 'anchor',
            title: 'Anchor Isle',
            emoji: '⚓',
            completed: !!progress.toolkit?.anchorQuestion,
            items: [
                {
                    id: 'anchor-question',
                    name: 'Anchor Question',
                    emoji: '⚓',
                    description: 'Your grounding phrase',
                    completed: !!progress.toolkit?.anchorQuestion,
                    data: progress.toolkit?.anchorQuestion,
                },
            ],
        },
        {
            id: 'navigation',
            title: 'Navigation Bay',
            emoji: '🧭',
            completed: false,
            items: [
                {
                    id: 'compass',
                    name: 'Compass',
                    emoji: '🧭',
                    description: 'Top 1-3 weekly priorities',
                    completed: false,
                },
                {
                    id: 'sails-oars',
                    name: 'Sails/Oars',
                    emoji: '⛵️',
                    description: 'Your energy patterns',
                    completed: false,
                },
            ],
        },
        {
            id: 'hazards',
            title: 'Storm Watch',
            emoji: '🌩️',
            completed: false,
            items: [
                {
                    id: 'storms',
                    name: 'Storms',
                    emoji: '🌩️',
                    description: 'Big challenges',
                    completed: false,
                },
                {
                    id: 'drift',
                    name: 'Drift/Sirens',
                    emoji: '🕯️',
                    description: 'Sneaky distractions',
                    completed: false,
                },
            ],
        },
        {
            id: 'lifeboat',
            title: 'Lifeboat Cove',
            emoji: '🛶',
            completed: false,
            items: [
                {
                    id: 'clarity-tools',
                    name: 'Clarity Tools',
                    emoji: '🛶',
                    description: 'Systems to organize your ideas',
                    completed: false,
                },
            ],
        },
        {
            id: 'support',
            title: 'Harbor of Friends',
            emoji: '🥳',
            completed: false,
            items: [
                {
                    id: 'buoy',
                    name: 'Buoy',
                    emoji: '🛟',
                    description: 'Check-in cue',
                    completed: false,
                },
                {
                    id: 'crew',
                    name: 'Your Crew',
                    emoji: '🥳',
                    description: 'People who support you',
                    completed: false,
                },
            ],
        },
        {
            id: 'reflection',
            title: 'Starlight Shore',
            emoji: '⭐',
            completed: false,
            items: [
                {
                    id: 'logbook',
                    name: 'Logbook',
                    emoji: '📖',
                    description: 'Track your progress',
                    completed: false,
                },
                {
                    id: 'starlight',
                    name: 'Starlight',
                    emoji: '⭐️',
                    description: 'Wins and gratitude',
                    completed: false,
                },
            ],
        },
    ];

    // Calculate unlocked status based on previous level completion
    const levels: FrameworkSection[] = baseLevels.map((level, index) => {
        const allItemsComplete = level.items.every(item => item.completed);
        const previousLevelComplete = index === 0 ? true :
            baseLevels[index - 1].items.every(item => item.completed);

        return {
            ...level,
            completed: allItemsComplete,
            unlocked: previousLevelComplete,
        };
    });

    // Calculate stars (0-3) based on completion percentage
    const getStars = (level: FrameworkSection): number => {
        const completedCount = level.items.filter(item => item.completed).length;
        const total = level.items.length;
        if (completedCount === 0) return 0;
        if (completedCount === total) return 3;
        if (completedCount >= total / 2) return 2;
        return 1;
    };

    const totalItems = levels.reduce((sum, level) => sum + level.items.length, 0);
    const completedItems = levels.reduce(
        (sum, level) => sum + level.items.filter(item => item.completed).length,
        0
    );
    const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Path positions for winding layout (alternating left/center/right)
    const getPosition = (index: number): 'left' | 'center' | 'right' => {
        const pattern: ('left' | 'center' | 'right')[] = ['center', 'left', 'center', 'right', 'center', 'left', 'center', 'right'];
        return pattern[index % pattern.length];
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c] pb-24 overflow-hidden relative">
            {/* Textured background - waves */}
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="waves-pattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 Q 25 5, 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-400 dark:text-cyan-600" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#waves-pattern)" />
                </svg>
            </div>

            {/* Nautical decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[12%] right-[8%] text-2xl opacity-20">⚓</div>
                <div className="absolute top-[35%] left-[6%] text-2xl opacity-20">🧭</div>
                <div className="absolute top-[55%] right-[10%] text-xl opacity-20">⛵</div>
                <div className="absolute top-[75%] left-[8%] text-xl opacity-20">🐚</div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d4a574] dark:to-[#c49a6c] shadow-lg shadow-amber-500/30 dark:shadow-[#d4a574]/30 mb-4">
                        <Ship className="w-8 h-8 text-white dark:text-[#0a1628]" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-[#f4e9d8] mb-2 tracking-tight">
                        Captain's Map
                    </h1>
                    <p className="text-slate-600 dark:text-[#a8c5d8] text-sm">
                        {Math.round(progressPercent)}% Complete
                    </p>
                </div>

                {/* Level Path */}
                <div className="relative py-8">
                    {/* Connecting path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                                <circle cx="4" cy="4" r="2" fill="#be185d" />
                            </pattern>
                        </defs>
                    </svg>

                    {/* Levels */}
                    <div className="space-y-6">
                        {levels.map((level, index) => {
                            const position = getPosition(index);
                            const stars = getStars(level);
                            const isSelected = selectedLevel === level.id;

                            return (
                                <div key={level.id} className="relative">
                                    {/* Dotted path to next level */}
                                    {index < levels.length - 1 && (
                                        <div className="absolute left-1/2 top-full -translate-x-1/2 h-6 flex flex-col items-center justify-center gap-1">
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${
                                                        level.completed ? 'bg-amber-500 dark:bg-[#d4a574]' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Level node */}
                                    <div
                                        className={`flex flex-col items-center ${
                                            position === 'left' ? 'mr-auto ml-8' :
                                            position === 'right' ? 'ml-auto mr-8' :
                                            'mx-auto'
                                        }`}
                                        style={{ width: 'fit-content' }}
                                    >
                                        {/* Stars */}
                                        {level.unlocked && stars > 0 && (
                                            <div className="flex gap-0.5 mb-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                                        }`}
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        )}

                                        {/* Level button */}
                                        <button
                                            onClick={() => level.unlocked && setSelectedLevel(isSelected ? null : level.id)}
                                            disabled={!level.unlocked}
                                            className={`
                                                relative w-16 h-16 rounded-full flex items-center justify-center
                                                text-xl font-bold transition-all duration-200
                                                border-4 border-white dark:border-[#d4a574]
                                                ${level.unlocked
                                                    ? level.completed
                                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/40 hover:scale-110'
                                                        : 'bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d4a574] dark:to-[#c49a6c] text-white dark:text-[#0a1628] shadow-lg shadow-amber-500/40 dark:shadow-[#d4a574]/40 hover:scale-110'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300 dark:border-slate-600'
                                                }
                                                ${isSelected ? 'scale-110 ring-4 ring-amber-300/50 dark:ring-[#d4a574]/50' : ''}
                                            `}
                                        >
                                            {level.unlocked ? (
                                                <span>{index + 1}</span>
                                            ) : (
                                                <Lock className="w-6 h-6" />
                                            )}

                                            {/* Active indicator */}
                                            {isSelected && level.unlocked && (
                                                <div className="absolute inset-0 rounded-full animate-ping bg-amber-500/30 dark:bg-[#d4a574]/30" />
                                            )}
                                        </button>

                                        {/* Level title */}
                                        <p className="mt-2 text-xs text-slate-600 dark:text-[#a8c5d8] text-center max-w-[100px]">
                                            {level.title}
                                        </p>
                                    </div>

                                    {/* Level details popup */}
                                    {isSelected && level.unlocked && (
                                        <div className="mt-4 mx-4 bg-white/95 dark:bg-[#0f2847]/95 backdrop-blur-sm rounded-2xl border-2 border-amber-200 dark:border-[#d4a574] p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-2xl">{level.emoji}</span>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-[#f4e9d8]">
                                                    {level.title}
                                                </h3>
                                            </div>
                                            <div className="space-y-2">
                                                {level.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className={`p-3 rounded-xl ${
                                                            item.completed
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700'
                                                                : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{item.emoji}</span>
                                                            <span className="font-medium text-sm text-slate-800 dark:text-[#f4e9d8]">
                                                                {item.name}
                                                            </span>
                                                            {item.completed && (
                                                                <span className="ml-auto text-emerald-500 text-sm">✓</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-[#a8c5d8] mt-1 ml-7">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <a
                                                href="/toolkit"
                                                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-[#d4a574] dark:to-[#c49a6c] hover:opacity-90 text-white dark:text-[#0a1628] rounded-xl font-medium text-sm transition-all"
                                            >
                                                <Anchor className="w-4 h-4" />
                                                Open in Toolkit
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
