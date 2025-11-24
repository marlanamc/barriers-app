'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MicroStrategy, BarrierType, BARRIERS } from '@/lib/barriers';

interface MicroStrategyCardProps {
    barrierId: BarrierType;
    onDismiss: () => void;
}

export function MicroStrategyCard({ barrierId, onDismiss }: MicroStrategyCardProps) {
    const barrier = BARRIERS[barrierId];
    // For now, just pick the first strategy. Later we could randomize or let user pick.
    const strategy = barrier.strategies[0];

    const Icon = barrier.icon;

    return (
        <div className={`rounded-2xl p-5 border-2 ${barrier.bgColor} ${barrier.borderColor} relative overflow-hidden`}>

            {/* Background Decoration */}
            <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
                <Icon className={`w-32 h-32 ${barrier.color}`} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-5 h-5 ${barrier.color}`} />
                    <span className={`text-sm font-bold uppercase tracking-wider ${barrier.color}`}>
                        {barrier.label} Detected
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Try: {strategy.title}
                </h3>

                <p className="text-slate-700 dark:text-slate-300 mb-4">
                    {strategy.description}
                </p>

                <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-white/50 dark:border-white/10 mb-4">
                    <div className="flex gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${barrier.color}`} />
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                            {strategy.action}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onDismiss}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
            bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200
          `}
                >
                    I'll try this
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
