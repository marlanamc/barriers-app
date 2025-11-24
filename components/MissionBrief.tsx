import React from 'react';
import { useAppContext } from '@/app/context/AppContext';


export function MissionBrief() {
    const { currentMission, setCurrentMission, checkins, loading } = useAppContext();

    const startMission = () => {
        setCurrentMission('mission-1');
    };

    const endMission = () => {
        setCurrentMission(null);
    };

    if (loading) {
        return null; // or a spinner
    }

    return (
        <section className="card-parchment p-6 mb-6">
            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200 font-cinzel mb-2">
                Captain's Mission
            </h2>
            {currentMission ? (
                <p className="text-amber-800 dark:text-amber-300 font-crimson mb-4">
                    Current mission: <strong>{currentMission}</strong>
                </p>
            ) : (
                <p className="text-amber-800 dark:text-amber-300 font-crimson mb-4">
                    No active mission. Ready to set sail?
                </p>
            )}
            {currentMission === 'focus-mode' ? (
                <div className="flex gap-2">
                    <button
                        className="bg-emerald-600 text-white font-medium px-4 py-2 rounded cursor-default"
                    >
                        Mission Active
                    </button>
                    <button
                        onClick={endMission}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded"
                    >
                        End Mission
                    </button>
                </div>
            ) : (
                <button
                    onClick={startMission}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded"
                >
                    {currentMission ? 'Continue Mission' : 'Start New Mission'}
                </button>
            )}
        </section>
    );
}
