'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}

export function AddThoughtModal({ isOpen, onClose, onSave }: AddThoughtModalProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(text.trim());

      // Show micro-success message
      setShowSuccess(true);
      setText('');

      // Auto-close after brief success message
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to save thought:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div
          className="relative mt-24 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {showSuccess ? (
            // Success state
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-crimson text-center">
                Thought saved. Your mind has more space now.
              </p>
            </div>
          ) : (
            // Input state
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-cinzel">
                  Capture a Thought
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[140px] rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-0 dark:focus:border-slate-500 resize-none font-crimson"
                />
                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  Don't worry about details, just write.
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-700 px-5 py-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 font-crimson"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!text.trim() || isSubmitting}
                  className="flex-1 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-crimson"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
