'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Zap, Sun, Waves, CloudFog, Moon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface EnergyTypeOption {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface InternalWeatherSelectorProps {
  selectedKey?: string | null;
  onSelect: (option: EnergyTypeOption) => void;
  suppressAutoSelect?: boolean;
  onUserInteract?: () => void;
}

export const internalWeatherOptions: EnergyTypeOption[] = [
  { key: 'sparky', label: 'Sparky', description: 'High energy, scattered', icon: Zap },
  { key: 'steady', label: 'Steady', description: 'Focused, consistent', icon: Sun },
  { key: 'flowing', label: 'Flowing', description: 'Moving but slow', icon: Waves },
  { key: 'foggy', label: 'Foggy', description: 'Hard to focus, unclear', icon: CloudFog },
  { key: 'resting', label: 'Resting', description: 'Low energy, need recovery', icon: Moon },
];

// Mapping from icon components to their string names
const iconNameMap = new Map<LucideIcon, string>([
  [Zap, 'zap'],
  [Sun, 'sun'],
  [Waves, 'waves'],
  [CloudFog, 'cloud-fog'],
  [Moon, 'moon'],
]);

// Reverse mapping from icon names to components (including legacy emoji support)
const iconComponentMap: Record<string, LucideIcon> = {
  'zap': Zap,
  'sun': Sun,
  'waves': Waves,
  'cloud-fog': CloudFog,
  'moon': Moon,
  // Legacy emoji support
  '🔥': Zap,
  '☀️': Sun,
  '🌊': Waves,
  '🌫️': CloudFog,
  '🛌': Moon,
};

// Helper function to get icon name from component
export function getIconName(icon: LucideIcon): string {
  return iconNameMap.get(icon) || 'zap';
}

// Helper function to get icon component from name (supports both new names and legacy emojis)
export function getIconComponent(iconName: string): LucideIcon {
  return iconComponentMap[iconName] || Zap;
}

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
  const autoSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // Calculate the actual energy type index (0-4)
        const energyIndex = currentIndex % internalWeatherOptions.length;

        // Only update if changed
        setCenterIndex((prevIndex) => {
          if (energyIndex !== prevIndex) {
            return energyIndex;
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

  // Keep the carousel aligned with externally selected energy type (e.g., when restoring saved check-ins)
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

  // Auto-select the centered option (Option B: no confirmation tap needed)
  // - Auto-selects on initial load
  // - Auto-selects when user scrolls to a different option (no tap needed)
  useEffect(() => {
    const option = internalWeatherOptions[centerIndex];
    if (!option) {
      return;
    }

    // Don't auto-select if we're syncing to an external selectedKey
    if (pendingSyncIndexRef.current === centerIndex) {
      pendingSyncIndexRef.current = null;
      return;
    }

    // Don't auto-select if suppressAutoSelect is true (e.g., when editing)
    if (suppressAutoSelect) {
      return;
    }

    // Auto-select the centered option if:
    // 1. No selection exists yet (initial load), OR
    // 2. User scrolled to a different option (current selection doesn't match center)
    const currentOptionKey = option.key;
    const needsSelection = !selectedKey || selectedKey !== currentOptionKey;
    
    if (!needsSelection) {
      return;
    }

    // Handle initial load case (no selection yet)
    if (!selectedKey) {
      // Wait for initialization to complete, then select immediately
      if (isInitializingRef.current) {
        // Will re-run after initialization completes
        return;
      }
      
      // Clear any pending timeout
      if (autoSelectTimeoutRef.current) {
        clearTimeout(autoSelectTimeoutRef.current);
        autoSelectTimeoutRef.current = null;
      }
      
      // Select immediately after initialization
      onSelect(option);
      return;
    }

    // Handle user scrolling to different option case
    // Don't auto-select while user is actively scrolling (wait for scroll to stop)
    if (isUserScrollingRef.current || isScrollingRef.current || isInitializingRef.current) {
      return;
    }

    // Clear any pending auto-select timeout
    if (autoSelectTimeoutRef.current) {
      clearTimeout(autoSelectTimeoutRef.current);
      autoSelectTimeoutRef.current = null;
    }
    
    // Small delay to ensure scroll has fully settled before auto-selecting
    autoSelectTimeoutRef.current = setTimeout(() => {
      // Double-check we're still not scrolling and the option hasn't changed
      if (!isUserScrollingRef.current && !isScrollingRef.current) {
        const currentOption = internalWeatherOptions[centerIndex];
        if (currentOption && currentOption.key === currentOptionKey) {
          onSelect(currentOption);
        }
      }
      autoSelectTimeoutRef.current = null;
    }, scrollIdleDelay + 50); // Wait a bit longer than the snap delay
    
    return () => {
      if (autoSelectTimeoutRef.current) {
        clearTimeout(autoSelectTimeoutRef.current);
        autoSelectTimeoutRef.current = null;
      }
    };
  }, [centerIndex, selectedKey, onSelect, suppressAutoSelect, scrollIdleDelay]);

  const selectedOption = internalWeatherOptions[centerIndex];

  return (
    <div className="space-y-6">
      {/* Icon Carousel with Fixed Center Indicator */}
      <div className="relative">
        {/* Fixed center indicator - behind the icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full bg-cyan-100/80 ring-4 ring-cyan-200/60 dark:bg-cyan-500/15 dark:ring-cyan-500/25"
            style={{ width: '100px', height: '100px' }}
          />
        </div>

        {/* Scrollable emoji container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          role="listbox"
          aria-label="Energy type selector"
        >
          <div className="flex items-center gap-2 py-4">
            {loopedOptions.map((option, index) => {
              const energyIndex = index % internalWeatherOptions.length;
              const isCenter = energyIndex === centerIndex && index >= startIndex - 2 && index <= startIndex + internalWeatherOptions.length + 2;
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
                    onKeyDown={(e) => {
                      // Keyboard navigation: Arrow keys to navigate, Enter/Space to select
                      const scrollContainer = scrollRef.current;
                      if (!scrollContainer) return;
                      
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const direction = e.key === 'ArrowRight' ? 1 : -1;
                        const currentEnergyIndex = centerIndex;
                        const newIndex = (currentEnergyIndex + direction + internalWeatherOptions.length) % internalWeatherOptions.length;
                        const targetOption = internalWeatherOptions[newIndex];
                        
                        // Find the target option in the looped array
                        const targetIndex = startIndex + newIndex;
                        const targetScroll = (targetIndex * totalItemWidth) - (scrollContainer.offsetWidth / 2) + (itemWidth / 2);
                        
                        isScrollingRef.current = true;
                        scrollContainer.scrollTo({
                          left: targetScroll,
                          behavior: 'smooth'
                        });
                        setTimeout(() => {
                          isScrollingRef.current = false;
                        }, 300);
                      } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(option);
                        if (typeof onUserInteract === 'function') {
                          onUserInteract();
                        }
                      }
                    }}
                    className={clsx(
                      'w-full h-24 flex items-center justify-center transition-all duration-200 select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-2xl',
                      isCenter ? 'scale-110' : 'scale-75 opacity-40'
                    )}
                    style={{ minHeight: '96px' }}
                    tabIndex={isCenter ? 0 : -1}
                    aria-label={`${option.label}: ${option.description}`}
                    aria-pressed={selectedKey === option.key}
                  >
                    <option.icon 
                      className={clsx(
                        'transition-all duration-200 pointer-events-none text-slate-900 dark:text-slate-100',
                        isCenter ? 'w-16 h-16' : 'w-12 h-12'
                      )}
                    />
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
