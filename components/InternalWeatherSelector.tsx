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
}

export const internalWeatherOptions: WeatherOption[] = [
  { key: 'clear', label: 'Clear', description: 'Focused, light, steady', icon: '☀️' },
  { key: 'cloudy', label: 'Cloudy', description: 'A bit foggy but okay', icon: '🌤' },
  { key: 'rainy', label: 'Rainy', description: 'Heavy, slow, hard to get going', icon: '🌧' },
  { key: 'stormy', label: 'Stormy', description: 'Overwhelmed, scattered, tense', icon: '🌪' },
  { key: 'quiet', label: 'Quiet', description: 'Detached, tired, low input', icon: '🌙' },
];

export function InternalWeatherSelector({ selectedKey, onSelect }: InternalWeatherSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const isScrollingRef = useRef(false);

  // Create looped array (3 copies for infinite scroll effect)
  const loopedOptions = [...internalWeatherOptions, ...internalWeatherOptions, ...internalWeatherOptions];
  const startIndex = internalWeatherOptions.length; // Start in the middle copy
  const itemWidth = 120; // Fixed width for each emoji item
  const gapWidth = 8; // gap-2 = 8px
  const totalItemWidth = itemWidth + gapWidth; // Total width including gap

  // Initialize scroll position to middle set
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Center the first item on mount
    const containerWidth = scrollContainer.offsetWidth;
    const initialScroll = (startIndex * totalItemWidth) - (containerWidth / 2) + (itemWidth / 2);
    scrollContainer.scrollLeft = initialScroll;
  }, [startIndex, totalItemWidth, itemWidth]);

  // Update selected option based on scroll position
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const containerWidth = scrollContainer.offsetWidth;
      const scrollLeft = scrollContainer.scrollLeft;
      const centerPosition = scrollLeft + (containerWidth / 2);
      const currentIndex = Math.round(centerPosition / totalItemWidth);

      // Calculate the actual weather index (0-4)
      const weatherIndex = currentIndex % internalWeatherOptions.length;

      // Only update if changed
      if (weatherIndex !== centerIndex) {
        setCenterIndex(weatherIndex);
      }

      // Reset scroll position if we're at the edges (infinite loop effect)
      const totalItems = loopedOptions.length;
      if (currentIndex <= internalWeatherOptions.length / 2) {
        isScrollingRef.current = true;
        const newScroll = scrollLeft + (internalWeatherOptions.length * totalItemWidth);
        scrollContainer.scrollLeft = newScroll;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      } else if (currentIndex >= totalItems - (internalWeatherOptions.length / 2)) {
        isScrollingRef.current = true;
        const newScroll = scrollLeft - (internalWeatherOptions.length * totalItemWidth);
        scrollContainer.scrollLeft = newScroll;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loopedOptions.length, centerIndex, totalItemWidth]);

  // Auto-select the centered option
  useEffect(() => {
    const option = internalWeatherOptions[centerIndex];
    if (option && option.key !== selectedKey) {
      onSelect(option);
    }
  }, [centerIndex, selectedKey, onSelect]);

  const selectedOption = internalWeatherOptions[centerIndex];

  return (
    <div className="space-y-6">
      {/* Emoji Carousel with Fixed Center Indicator */}
      <div className="relative">
        {/* Fixed center indicator - behind the emojis */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-cyan-100/80 ring-4 ring-cyan-200/60" style={{ width: '100px', height: '100px' }} />
        </div>

        {/* Scrollable emoji container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto snap-x snap-mandatory scrollbar-hide relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-2 py-4">
            {loopedOptions.map((option, index) => {
              const weatherIndex = index % internalWeatherOptions.length;
              const isCenter = weatherIndex === centerIndex && index >= startIndex - 2 && index <= startIndex + internalWeatherOptions.length + 2;
              return (
                <div
                  key={`${option.key}-${index}`}
                  className="snap-center flex-shrink-0"
                  style={{ width: `${itemWidth}px` }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const scrollContainer = scrollRef.current;
                      if (scrollContainer) {
                        const containerWidth = scrollContainer.offsetWidth;
                        const targetScroll = (index * totalItemWidth) - (containerWidth / 2) + (itemWidth / 2);
                        scrollContainer.scrollTo({
                          left: targetScroll,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={clsx(
                      'w-full flex items-center justify-center transition-all duration-200',
                      isCenter ? 'scale-110' : 'scale-75 opacity-40'
                    )}
                  >
                    <div className={clsx('transition-all duration-200', isCenter ? 'text-6xl' : 'text-4xl')}>
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
        <h3 className="text-2xl font-bold text-slate-900">{selectedOption?.label || ''}</h3>
        <p className="text-base text-slate-600">{selectedOption?.description || ''}</p>
      </div>
    </div>
  );
}
