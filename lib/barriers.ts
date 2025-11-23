import { Zap, CloudFog, Anchor, AlertTriangle, Clock, Shield, Brain } from 'lucide-react';

export type BarrierType =
    | 'dread'
    | 'fog'
    | 'boring'
    | 'perfectionism'
    | 'overwhelm'
    | 'distraction'
    | 'impulsivity';

export interface MicroStrategy {
    id: string;
    title: string;
    description: string;
    action: string; // The immediate "do this" step
}

export interface Barrier {
    id: BarrierType;
    label: string;
    type: 'storm' | 'drift'; // Levels framework: big challenges vs sneaky distractions
    icon: any; // Lucide icon component
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    strategies: MicroStrategy[];
}

export const BARRIERS: Record<BarrierType, Barrier> = {
    dread: {
        id: 'dread',
        label: 'Storm: Dread',
        type: 'storm',
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        description: "It feels painful or scary to even think about starting.",
        strategies: [
            {
                id: 'dread-1',
                title: 'The 2-Minute Rule',
                description: 'Dread usually lies about how hard it will be.',
                action: 'Commit to doing it for just 2 minutes. You can stop after that.'
            },
            {
                id: 'dread-2',
                title: 'Micro-Step',
                description: 'The task is too big for your current energy.',
                action: 'Identify the absolute smallest first step (e.g., "open the document").'
            }
        ]
    },
    fog: {
        id: 'fog',
        label: 'Storm: Brain Fog',
        type: 'storm',
        icon: CloudFog,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        borderColor: 'border-slate-200 dark:border-slate-700',
        description: "Can't think clearly, feeling fuzzy or slow.",
        strategies: [
            {
                id: 'fog-1',
                title: 'Externalize It',
                description: 'Your working memory is offline.',
                action: 'Write down every single step, no matter how obvious.'
            },
            {
                id: 'fog-2',
                title: 'Body Double',
                description: 'You need an anchor to the present moment.',
                action: 'Work in the presence of someone else (or a pet/video).'
            }
        ]
    },
    boring: {
        id: 'boring',
        label: 'Drift: Boring',
        type: 'drift',
        icon: Anchor,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        description: "Under-stimulated. It physically hurts to be this bored.",
        strategies: [
            {
                id: 'boring-1',
                title: 'Add Friction',
                description: 'Make it a game or challenge.',
                action: 'Set a timer for 10 minutes. How much can you get done?'
            },
            {
                id: 'boring-2',
                title: 'Pair It',
                description: 'Add dopamine to the situation.',
                action: 'Listen to a podcast or music while doing it.'
            }
        ]
    },
    perfectionism: {
        id: 'perfectionism',
        label: 'Storm: Perfectionism',
        type: 'storm',
        icon: Shield,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        description: "Afraid of doing it wrong or not doing it 'enough'.",
        strategies: [
            {
                id: 'perf-1',
                title: 'B- Work',
                description: 'Perfect is the enemy of done.',
                action: 'Aim for "B-" quality work. It is good enough.'
            },
            {
                id: 'perf-2',
                title: 'Rough Draft',
                description: 'You can edit a bad page, but not a blank one.',
                action: 'Create a "trash" version first. Make it intentionally bad.'
            }
        ]
    },
    overwhelm: {
        id: 'overwhelm',
        label: 'Storm: Overwhelm',
        type: 'storm',
        icon: Zap,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        description: "Too many moving parts, don't know where to start.",
        strategies: [
            {
                id: 'over-1',
                title: 'Brain Dump',
                description: 'Get it all out of your head.',
                action: 'Write everything down. Then pick just ONE thing.'
            },
            {
                id: 'over-2',
                title: 'Hide the Rest',
                description: 'Visual clutter creates mental clutter.',
                action: 'Cover up everything except the one thing you are doing.'
            }
        ]
    },
    distraction: {
        id: 'distraction',
        label: 'Drift: Distraction',
        type: 'drift',
        icon: Brain,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: "Everything else seems more interesting right now.",
        strategies: [
            {
                id: 'dist-1',
                title: 'Parking Lot',
                description: 'Don\'t lose the idea, but don\'t chase it.',
                action: 'Write the distraction down on a sticky note. Save it for later.'
            },
            {
                id: 'dist-2',
                title: 'Environment Reset',
                description: 'Your environment is triggering you.',
                action: 'Clear your immediate workspace of anything not related to the task.'
            }
        ]
    },
    impulsivity: {
        id: 'impulsivity',
        label: 'Drift: Impulsivity',
        type: 'drift',
        icon: Clock,
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-50 dark:bg-pink-900/20',
        borderColor: 'border-pink-200 dark:border-pink-800',
        description: "Acting without thinking, jumping between tasks.",
        strategies: [
            {
                id: 'imp-1',
                title: 'The Pause',
                description: 'Create a gap between impulse and action.',
                action: 'Take 3 deep breaths before switching tasks.'
            },
            {
                id: 'imp-2',
                title: 'Check the Plan',
                description: 'Re-orient to your original intention.',
                action: 'Look at your "Today" list. Is this new thing on it?'
            }
        ]
    }
};

export const BARRIER_LIST = Object.values(BARRIERS);
