"use client";

import { useMemo } from "react";
import clsx from "clsx";

interface CheckinDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

function getTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().split("T")[0];
}

export function CheckinDatePicker({
  value,
  onChange,
  label = "Planning for",
  description,
  className,
}: CheckinDatePickerProps) {
  const today = useMemo(() => getTodayIso(), []);

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      <input
        type="date"
        value={value}
        min={today}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
      />
    </div>
  );
}
