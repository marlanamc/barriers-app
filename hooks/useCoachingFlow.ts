'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';

export type CoachingStep =
    | 'briefing'
    | 'check-in'
    | 'barrier-check'
    | 'strategy-select'
    | 'commitment'
    | 'complete';

export function useCoachingFlow() {
    const { currentMission, setCurrentMission } = useAppContext();
    const [currentStep, setCurrentStep] = useState<CoachingStep>('briefing');
    const [isFlowActive, setIsFlowActive] = useState(false);
    const [flowData, setFlowData] = useState<Record<string, any>>({});

    // Reset flow when mission changes
    useEffect(() => {
        if (currentMission === 'mission-1') {
            setIsFlowActive(true);
            setCurrentStep('briefing');
            setFlowData({});
        } else {
            setIsFlowActive(false);
        }
    }, [currentMission]);

    const updateFlowData = (key: string, value: any) => {
        setFlowData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        switch (currentStep) {
            case 'briefing':
                setCurrentStep('check-in');
                break;
            case 'check-in':
                setCurrentStep('barrier-check');
                break;
            case 'barrier-check':
                setCurrentStep('strategy-select');
                break;
            case 'strategy-select':
                setCurrentStep('commitment');
                break;
            case 'commitment':
                setCurrentStep('complete');
                break;
            case 'complete':
                setIsFlowActive(false);
                setCurrentMission('focus-mode'); // Move to focus mode
                break;
        }
    };

    const cancelFlow = () => {
        setIsFlowActive(false);
        setCurrentMission(null);
    };

    return {
        currentStep,
        isFlowActive,
        nextStep,
        cancelFlow,
        flowData,
        updateFlowData
    };
}
