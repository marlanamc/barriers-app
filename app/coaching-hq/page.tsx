'use client';

import { useState, useEffect } from 'react';
import { Star, Navigation, Anchor, Compass as CompassIcon } from 'lucide-react';

interface CoachingHQData {
    northStar: string | null;
    lighthouse: string | null;
    lighthouseTimeframe?: '3mo' | '6mo' | '1yr' | '5yr';
    anchorQuestion: string | null;
    anchorType?: 'preset' | 'custom';
    updatedAt: string;
}

const ANCHOR_PRESETS = [
    "Is this helping me build the life I want?",
    "Am I giving myself space to be human?",
    "What's the absolute minimum I need today?",
    "What would I tell a friend in this situation?",
];

export default function CoachingHQPage() {
    const [hqData, setHQData] = useState<CoachingHQData>({
        northStar: null,
        lighthouse: null,
        anchorQuestion: null,
        updatedAt: new Date().toISOString(),
    });
    const [editing, setEditing] = useState<'north-star' | 'lighthouse' | 'anchor' | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [selectedAnchor, setSelectedAnchor] = useState<string>('');

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('coaching-hq');
        if (saved) {
            try {
                setHQData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load coaching HQ data:', e);
            }
        }
    }, []);

    const saveHQData = (updates: Partial<CoachingHQData>) => {
        const newData = {
            ...hqData,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        setHQData(newData);
        localStorage.setItem('coaching-hq', JSON.stringify(newData));
    };

    const handleSaveNorthStar = () => {
        saveHQData({ northStar: tempValue });
        setEditing(null);
        setTempValue('');
    };

    const handleSaveLighthouse = () => {
        saveHQData({ lighthouse: tempValue });
        setEditing(null);
        setTempValue('');
    };

    const handleSaveAnchor = () => {
        saveHQData({
            anchorQuestion: selectedAnchor || tempValue,
            anchorType: selectedAnchor ? 'preset' : 'custom'
        });
        setEditing(null);
        setTempValue('');
        setSelectedAnchor('');
    };

    const openEdit = (type: 'north-star' | 'lighthouse' | 'anchor') => {
        setEditing(type);
        if (type === 'north-star' && hqData.northStar) {
            setTempValue(hqData.northStar);
        } else if (type === 'lighthouse' && hqData.lighthouse) {
            setTempValue(hqData.lighthouse);
        } else if (type === 'anchor' && hqData.anchorQuestion) {
            if (ANCHOR_PRESETS.includes(hqData.anchorQuestion)) {
                setSelectedAnchor(hqData.anchorQuestion);
            } else {
                setTempValue(hqData.anchorQuestion);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
            <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-3">
                        <CompassIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                        Coaching HQ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Your foundation for the journey ahead
                    </p>
                </div>

                {/* North Star Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">North Star</h2>
                        </div>
                        <button
                            onClick={() => openEdit('north-star')}
                            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                        >
                            {hqData.northStar ? 'Edit' : 'Set'}
                        </button>
                    </div>
                    {hqData.northStar ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{hqData.northStar}</p>
                    ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">What's your why? Tap "Set" to define it.</p>
                    )}
                </div>

                {/* Lighthouse Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Navigation className="w-6 h-6 text-blue-500" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lighthouse</h2>
                        </div>
                        <button
                            onClick={() => openEdit('lighthouse')}
                            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                        >
                            {hqData.lighthouse ? 'Edit' : 'Set'}
                        </button>
                    </div>
                    {hqData.lighthouse ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{hqData.lighthouse}</p>
                    ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">Where are you heading in 6 months?</p>
                    )}
                </div>

                {/* Anchor Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Anchor className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Anchor Question</h2>
                        </div>
                        <button
                            onClick={() => openEdit('anchor')}
                            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                        >
                            {hqData.anchorQuestion ? 'Change' : 'Set'}
                        </button>
                    </div>
                    {hqData.anchorQuestion ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">"{hqData.anchorQuestion}"</p>
                    ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">What keeps you steady when things feel chaotic?</p>
                    )}
                </div>

            </div>

            {/* North Star Modal */}
            {editing === 'north-star' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            Find Your North Star
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                            Why does this work matter to you? What values make this goal meaningful?
                        </p>
                        <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder="I want to prove I can depend on myself..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                        />
                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setTempValue('');
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNorthStar}
                                disabled={!tempValue.trim()}
                                className="px-6 py-2 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lighthouse Modal */}
            {editing === 'lighthouse' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                            <Navigation className="w-6 h-6 text-blue-500" />
                            Set Your Lighthouse
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                            Where do you want to be in 6 months? 1 year? Describe the glow on the horizon.
                        </p>
                        <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            placeholder="In 6 months I will..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                        />
                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setTempValue('');
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLighthouse}
                                disabled={!tempValue.trim()}
                                className="px-6 py-2 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Anchor Modal */}
            {editing === 'anchor' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                            <Anchor className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            Choose Your Anchor
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                            A question to ask yourself when things feel chaotic
                        </p>

                        <div className="space-y-2 mb-4">
                            {ANCHOR_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setSelectedAnchor(preset)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedAnchor === preset
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-100'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <span className="text-sm">⚓ {preset}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                Or write your own:
                            </label>
                            <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => {
                                    setTempValue(e.target.value);
                                    setSelectedAnchor('');
                                }}
                                placeholder="Your custom anchor question..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setTempValue('');
                                    setSelectedAnchor('');
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAnchor}
                                disabled={!selectedAnchor && !tempValue.trim()}
                                className="px-6 py-2 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
