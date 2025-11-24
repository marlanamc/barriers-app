'use client';

import Link from 'next/link';
import {
  Heart,
  Fuel,
  Star,
  Target,
  Home,
  Anchor,
  Compass,
  Wind,
  CloudLightning,
  AlertTriangle,
  LifeBuoy,
  Bell,
  Users,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { LucideIconName } from '@/lib/map-modules';

// Map icon names to actual Lucide components
const ICON_MAP: Record<LucideIconName, LucideIcon> = {
  Heart,
  Fuel,
  Star,
  Target,
  Home,
  Anchor,
  Compass,
  Wind,
  CloudLightning,
  AlertTriangle,
  LifeBuoy,
  Bell,
  Users,
  BookOpen,
  Sparkles,
};

export interface MapModuleCardProps {
  moduleKey: string;
  iconName: LucideIconName;
  iconColor: string;
  title: string;
  subtitle?: string;
  hasContent: boolean;
  href: string;
}

export function MapModuleCard({
  moduleKey,
  iconName,
  iconColor,
  title,
  subtitle,
  hasContent,
  href,
}: MapModuleCardProps) {
  const IconComponent = ICON_MAP[iconName];

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300 active:scale-[0.98] dark:bg-slate-800/80 dark:ring-slate-700 dark:hover:ring-slate-600"
    >
      {/* Content indicator dot */}
      {hasContent && (
        <span
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400"
          aria-label="Has content"
        />
      )}

      {/* Icon */}
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors dark:bg-slate-700 ${iconColor}`}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Title */}
      <span className="text-center text-sm font-medium text-slate-900 dark:text-slate-100">
        {title}
      </span>

      {/* Optional subtitle - only shown on larger cards */}
      {subtitle && (
        <span className="mt-0.5 text-center text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </span>
      )}
    </Link>
  );
}
