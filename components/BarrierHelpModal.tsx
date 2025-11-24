'use client';

import { X, ExternalLink, Lightbulb, Heart } from 'lucide-react';
import type { BarrierHelp } from '@/lib/barrier-help';

interface BarrierHelpModalProps {
  barrierHelp: BarrierHelp;
  isOpen: boolean;
  onClose: () => void;
  onReadMore?: () => void;
}

export function BarrierHelpModal({
  barrierHelp,
  isOpen,
  onClose,
  onReadMore
}: BarrierHelpModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {barrierHelp.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {barrierHelp.category}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Why This Happens */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Why This Happens
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {barrierHelp.quickWhy}
            </p>
          </div>

          {/* What to Try */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              What to Try Right Now
            </h3>
            <ul className="space-y-2">
              {barrierHelp.immediateTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Encouraging Reminder */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-pink-200/50 dark:border-pink-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                Remember
              </span>
            </div>
            <p className="text-sm text-pink-600 dark:text-pink-400 italic">
              {barrierHelp.reminder}
            </p>
          </div>
        </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Got it - Continue
            </button>
            {barrierHelp.fullArticleUrl && onReadMore && (
              <button
                onClick={onReadMore}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
              >
                <ExternalLink className="h-4 w-4" />
                Deep Dive
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Quick barrier help - shows inline without modal
 */
interface QuickBarrierHelpProps {
  barrierHelp: BarrierHelp;
  onReadMore?: () => void;
}

export function QuickBarrierHelp({ barrierHelp, onReadMore }: QuickBarrierHelpProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              {barrierHelp.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {barrierHelp.quickWhy}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quick fix:
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {barrierHelp.immediateTips[0]}
            </p>
          </div>

          {onReadMore && (
            <button
              onClick={onReadMore}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Learn more →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
