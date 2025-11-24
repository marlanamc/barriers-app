'use client';

import React from 'react';
import { useCoachingFlow } from '@/hooks/useCoachingFlow';
import { CoachingDialogue } from '@/components/CoachingDialogue';

export function CoachingFlowManager() {
    const { currentStep, isFlowActive, nextStep, cancelFlow, flowData, updateFlowData } = useCoachingFlow();

    if (!isFlowActive) return null;

    // Render different dialogues based on currentStep
    switch (currentStep) {
        case 'briefing':
            return (
                <CoachingDialogue
                    isOpen={true}
                    onClose={cancelFlow}
                    title="Mission Briefing"
                    steps={[
                        {
                            message: "Captain, we have rough seas ahead but the ship is steady. Our goal is to navigate through the storm and find calm waters.",
                            input: {
                                type: 'text', // Placeholder, maybe just a confirm button
                                placeholder: "Ready to engage...",
                                value: flowData.briefingReady || '',
                                onChange: (val) => updateFlowData('briefingReady', val)
                            }
                        }
                    ]}
                    onComplete={nextStep}
                />
            );

        case 'check-in':
            return (
                <CoachingDialogue
                    isOpen={true}
                    onClose={cancelFlow}
                    title="Status Report"
                    steps={[
                        {
                            message: "How are the energy levels on deck? (1-10)",
                            input: {
                                type: 'select',
                                options: Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}`, icon: '⚡' })),
                                value: flowData.energyLevel || '5',
                                onChange: (val) => updateFlowData('energyLevel', val)
                            }
                        }
                    ]}
                    onComplete={nextStep}
                />
            );

        case 'barrier-check':
            return (
                <CoachingDialogue
                    isOpen={true}
                    onClose={cancelFlow}
                    title="Storm Watch"
                    steps={[
                        {
                            message: "What's the biggest wave hitting the ship right now?",
                            input: {
                                type: 'select',
                                options: [
                                    { label: 'Overwhelm (Too many waves)', value: 'overwhelm', icon: '🌊' },
                                    { label: 'Fog (Confusion)', value: 'clarity', icon: '🌫️' },
                                    { label: 'Drift (Distraction)', value: 'distraction', icon: '🍃' },
                                    { label: 'Becalmed (Low Energy)', value: 'energy', icon: '🔋' },
                                ],
                                value: flowData.barrierType || 'overwhelm',
                                onChange: (val) => updateFlowData('barrierType', val)
                            }
                        }
                    ]}
                    onComplete={nextStep}
                />
            );

        case 'strategy-select':
            return (
                <CoachingDialogue
                    isOpen={true}
                    onClose={cancelFlow}
                    title="Course Correction"
                    steps={[
                        {
                            message: "Aye, that's a tough one. Let's deploy a counter-measure. Which tool shall we use?",
                            input: {
                                type: 'select',
                                options: [
                                    { label: 'Break it down (Micro-steps)', value: 'micro-steps', icon: '🔨' },
                                    { label: 'Timer (Sprints)', value: 'timer', icon: '⏱️' },
                                    { label: 'Body Double (Crew Support)', value: 'body-double', icon: '👥' },
                                ],
                                value: flowData.strategy || 'micro-steps',
                                onChange: (val) => updateFlowData('strategy', val)
                            }
                        }
                    ]}
                    onComplete={nextStep}
                />
            );

        case 'commitment':
            return (
                <CoachingDialogue
                    isOpen={true}
                    onClose={cancelFlow}
                    title="Set Sail"
                    steps={[
                        {
                            message: "Excellent choice, Captain. We are ready to engage. One small step to start?",
                            input: {
                                type: 'text',
                                placeholder: "I will...",
                                value: flowData.commitment || '',
                                onChange: (val) => updateFlowData('commitment', val)
                            }
                        }
                    ]}
                    onComplete={nextStep}
                />
            );

        default:
            return null;
    }
}
