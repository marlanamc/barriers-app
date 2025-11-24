'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinsForRange, type CheckinWithRelations } from '@/lib/supabase';
import { formatDateToLocalString } from '@/lib/date-utils';

// Types for the context
interface AppContextProps {
    userId: string | null;
    checkins: CheckinWithRelations[];
    loading: boolean;
    // Simple mission state (could be expanded later)
    currentMission: string | null;
    setCurrentMission: (mission: string | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useSupabaseUser();
    const [checkins, setCheckins] = useState<CheckinWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMission, setCurrentMission] = useState<string | null>(null);

    // Load checkins for the last 30 days when user is ready
    React.useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 29);
            const data = await getCheckinsForRange(
                user.id,
                formatDateToLocalString(start),
                formatDateToLocalString(end)
            );
            setCheckins(data || []);
            setLoading(false);
        };
        load();
    }, [user]);

    const value: AppContextProps = {
        userId: user?.id ?? null,
        checkins,
        loading: authLoading || loading,
        currentMission,
        setCurrentMission,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return ctx;
};
