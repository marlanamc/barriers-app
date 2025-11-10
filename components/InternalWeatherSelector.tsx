'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface WeatherOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

interface InternalWeatherSelectorProps {
  selectedKey?: string | null;
  onSelect: (option: WeatherOption) => void;
  suppressAutoSelect?: boolean;
  onUserInteract?: () => void;
}

export const internalWeatherOptions: WeatherOption[] = [
  { key: 'clear', label: 'Clear', description: 'Focused, light, steady', icon: '☀️' },
  { key: 'cloudy', label: 'Cloudy', description: 'A bit foggy but okay', icon: '🌤' },
  { key: 'rainy', label: 'Rainy', description: 'Heavy, slow, hard to get going', icon: '🌧' },
  { key: 'stormy', label: 'Stormy', description: 'Overwhelmed, scattered, tense', icon: '🌪' },
  { key: 'quiet', label: 'Quiet', description: 'Detached, tired, low input', icon: '🌙' },
];

export function InternalWeatherSelector({ selectedKey, onSelect, suppressAutoSelect = false, onUserInteract }: InternalWeatherSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const isScrollingRef = useRef(false);
  const isInitializingRef = useRef(true);
  const pendingSyncIndexRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const isUserScrollingRef = useRef(false);

  // Create looped array (3 copies for infinite scroll effect)
  const loopedOptions = [...internalWeatherOptions, ...internalWeatherOptions, ...internalWeatherOptions];
  const startIndex = internalWeatherOptions.length; // Start in the middle copy
  const itemWidth = 120; // Fixed width for each emoji item
  const gapWidth = 8; // gap-2 = 8px
  const totalItemWidth = itemWidth + gapWidth; // Total width including gap
  const scrollIdleDelay = 140; // How long to wait before snapping after scrolling stops

  // Initialize scroll position to middle set
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Center the first item on mount
    const containerWidth = scrollContainer.offsetWidth;
    const initialScroll = (startIndex * totalItemWidth) - (containerWidth / 2) + (itemWidth / 2);
    scrollContainer.scrollLeft = initialScroll;

    // Mark initialization as complete after a short delay to allow scroll events to settle
    setTimeout(() => {
      isInitializingRef.current = false;
    }, 300);
  }, [startIndex, totalItemWidth, itemWidth]);

  // Update selected option based on scroll position
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const snapToNearestItem = () => {
      const container = scrollRef.current;
      if (!container || isScrollingRef.current) {
        return;
      }

      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const snapIndex = Math.round((scrollLeft + containerWidth / 2) / totalItemWidth);
      const targetScroll = snapIndex * totalItemWidth - containerWidth / 2 + itemWidth / 2;

      if (Math.abs(targetScroll - scrollLeft) < 0.5) {
        return;
      }

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    };

    const handleScroll = () => {
      // Mark that user is actively scrolling
      isUserScrollingRef.current = true;
      lastScrollTimeRef.current = Date.now();
      
      // Clear any pending timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Mark scrolling as stopped after a delay
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
        snapToNearestItem();
      }, scrollIdleDelay);

      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use RAF to throttle scroll updates
      rafRef.current = requestAnimationFrame(() => {
        if (isScrollingRef.current) return;

        const containerWidth = scrollContainer.offsetWidth;
        const scrollLeft = scrollContainer.scrollLeft;
        const centerPosition = scrollLeft + (containerWidth / 2);
        const currentIndex = Math.round(centerPosition / totalItemWidth);

        // Calculate the actual weather index (0-4)
        const weatherIndex = currentIndex % internalWeatherOptions.length;

        // Only update if changed
        setCenterIndex((prevIndex) => {
          if (weatherIndex !== prevIndex) {
            return weatherIndex;
          }
          return prevIndex;
        });

        // Reset scroll position if we're at the edges (infinite loop effect)
        // Use very conservative thresholds to prevent premature resets and shaking
        const totalItems = loopedOptions.length;
        const threshold = 1; // Only reset when we're 1 item away from edge (very conservative)
        
        // Only do infinite scroll reset if user is not actively scrolling
        if (!isUserScrollingRef.current) {
          if (currentIndex <= threshold) {
            // Near the start, jump forward
            if (!isScrollingRef.current) {
              isScrollingRef.current = true;
              const newScroll = scrollLeft + (internalWeatherOptions.length * totalItemWidth);
              scrollContainer.scrollLeft = newScroll;
              setTimeout(() => { isScrollingRef.current = false; }, 150);
            }
          } else if (currentIndex >= totalItems - threshold - 1) {
            // Near the end, jump backward
            if (!isScrollingRef.current) {
              isScrollingRef.current = true;
              const newScroll = scrollLeft - (internalWeatherOptions.length * totalItemWidth);
              scrollContainer.scrollLeft = newScroll;
              setTimeout(() => { isScrollingRef.current = false; }, 150);
            }
          }
        }
      });
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [loopedOptions.length, totalItemWidth, itemWidth, scrollIdleDelay]);

  // Keep the carousel aligned with externally selected weather (e.g., when restoring saved check-ins)
  useEffect(() => {
    if (!selectedKey || !scrollRef.current) {
      return;
    }

    const desiredIndex = internalWeatherOptions.findIndex((option) => option.key === selectedKey);
    if (desiredIndex === -1) {
      return;
    }

    const scrollContainer = scrollRef.current;
    const containerWidth = scrollContainer.offsetWidth;
    const targetScroll = startIndex * totalItemWidth - containerWidth / 2 + itemWidth / 2 + desiredIndex * totalItemWidth;

    pendingSyncIndexRef.current = desiredIndex;
    isScrollingRef.current = true;
    setCenterIndex(desiredIndex);
    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    const timer = window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 350);

    return () => {
      window.clearTimeout(timer);
      isScrollingRef.current = false;
    };
  }, [selectedKey, itemWidth, startIndex, totalItemWidth]);

  // Auto-select the centered option only on initial load (when no selection exists yet)
  useEffect(() => {
    const option = internalWeatherOptions[centerIndex];
    if (!option) {
      return;
    }

    if (pendingSyncIndexRef.current === centerIndex) {
      pendingSyncIndexRef.current = null;
      return;
    }

    // Only auto-select when there is no selected weather yet and suppressAutoSelect is false
    // This handles the initial selection, but doesn't auto-select during scrolling
    if (!selectedKey && !suppressAutoSelect) {
      onSelect(option);
    }
    // Don't auto-select when scrolling - user must explicitly click/tap to select
  }, [centerIndex, selectedKey, onSelect, suppressAutoSelect]);

  const selectedOption = internalWeatherOptions[centerIndex];

  return (
    <div className="space-y-6">
      {/* Emoji Carousel with Fixed Center Indicator */}
      <div className="relative">
        {/* Fixed center indicator - behind the emojis */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full bg-cyan-100/80 ring-4 ring-cyan-200/60 dark:bg-cyan-400/20 dark:ring-cyan-500/30"
            style={{ width: '100px', height: '100px' }}
          />
        </div>

        {/* Scrollable emoji container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-2 py-4">
            {loopedOptions.map((option, index) => {
              const weatherIndex = index % internalWeatherOptions.length;
              const isCenter = weatherIndex === centerIndex && index >= startIndex - 2 && index <= startIndex + internalWeatherOptions.length + 2;
              return (
                <div
                  key={`${option.key}-${index}`}
                  className="flex-shrink-0"
                  style={{ width: `${itemWidth}px` }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // Prevent selection if user was just scrolling (within last 200ms)
                      const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
                      if (isUserScrollingRef.current || timeSinceScroll < 200) {
                        return;
                      }

                      // Prevent selection if we're programmatically scrolling
                      if (isScrollingRef.current) {
                        return;
                      }

                      if (typeof onUserInteract === 'function') {
                        onUserInteract();
                      }
                      
                      // Directly select the clicked option
                      onSelect(option);
                      
                      // Also scroll to center it for visual feedback
                      const scrollContainer = scrollRef.current;
                      if (scrollContainer) {
                        isScrollingRef.current = true;
                        const containerWidth = scrollContainer.offsetWidth;
                        const targetScroll = (index * totalItemWidth) - (containerWidth / 2) + (itemWidth / 2);
                        scrollContainer.scrollTo({
                          left: targetScroll,
                          behavior: 'smooth'
                        });
                        setTimeout(() => {
                          isScrollingRef.current = false;
                        }, 300);
                      }
                    }}
                    className={clsx(
                      'w-full h-24 flex items-center justify-center transition-all duration-200 select-none active:scale-95',
                      isCenter ? 'scale-110' : 'scale-75 opacity-40'
                    )}
                    style={{ minHeight: '96px' }}
                  >
                    <div className={clsx('transition-all duration-200 pointer-events-none', isCenter ? 'text-6xl' : 'text-4xl')}>
                      {option.icon}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Description */}
      <div className="text-center space-y-1 min-h-[80px]">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedOption?.label || ''}</h3>
        <p className="text-base text-slate-600 dark:text-slate-300">{selectedOption?.description || ''}</p>
      </div>
    </div>
  );
}
