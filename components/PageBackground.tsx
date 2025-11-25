import React from 'react';

type SymbolType =
  | 'compass'
  | 'ship-wheel'
  | 'nautical-chart'
  | 'book-quill'
  | 'moon-stars'
  | 'moon-phases'
  | 'ocean-currents'
  | 'route-line'
  | 'warning-buoys'
  | 'sailboat'
  | 'navigation-instruments'
  | 'none';

interface PageBackgroundProps {
  symbol?: SymbolType;
}

const symbols = {
  compass: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M50 5 L52 15 L50 12 L48 15 Z" fill="currentColor" />
      <path d="M50 95 L48 85 L50 88 L52 85 Z" fill="currentColor" />
      <path d="M5 50 L15 48 L12 50 L15 52 Z" fill="currentColor" />
      <path d="M95 50 L85 52 L88 50 L85 48 Z" fill="currentColor" />
      <line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" strokeWidth="0.3" />
      <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="0.3" />
      <line x1="10" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="0.3" />
      <line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  ),
  'ship-wheel': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 10 * Math.cos(rad);
        const y1 = 50 + 10 * Math.sin(rad);
        const x2 = 50 + 40 * Math.cos(rad);
        const y2 = 50 + 40 * Math.sin(rad);
        const handleX = 50 + 45 * Math.cos(rad);
        const handleY = 50 + 45 * Math.sin(rad);
        return (
          <g key={angle}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.4" />
            <circle cx={handleX} cy={handleY} r="3" fill="currentColor" />
          </g>
        );
      })}
    </svg>
  ),
  'nautical-chart': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Chart grid lines */}
      {[20, 40, 60, 80].map((pos) => (
        <g key={pos}>
          <line x1={pos} y1="0" x2={pos} y2="100" stroke="currentColor" strokeWidth="0.2" opacity="0.3" />
          <line x1="0" y1={pos} x2="100" y2={pos} stroke="currentColor" strokeWidth="0.2" opacity="0.3" />
        </g>
      ))}
      {/* Sextant */}
      <path d="M 30 30 L 30 40 L 40 35 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <line x1="30" y1="22" x2="30" y2="18" stroke="currentColor" strokeWidth="0.3" />
      {/* Dividers/compass */}
      <line x1="65" y1="65" x2="70" y2="75" stroke="currentColor" strokeWidth="0.4" />
      <line x1="75" y1="65" x2="70" y2="75" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="70" cy="65" r="2" fill="currentColor" />
      {/* Small compass roses in corners */}
      <g transform="translate(15, 15)">
        <circle r="5" fill="none" stroke="currentColor" strokeWidth="0.2" />
        <path d="M0 -5 L1 -1 L0 -2 L-1 -1 Z" fill="currentColor" />
      </g>
      <g transform="translate(85, 85)">
        <circle r="5" fill="none" stroke="currentColor" strokeWidth="0.2" />
        <path d="M0 -5 L1 -1 L0 -2 L-1 -1 Z" fill="currentColor" />
      </g>
    </svg>
  ),
  'book-quill': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Open book pages */}
      <path d="M 25 30 Q 25 25 30 25 L 48 25 L 48 75 L 30 75 Q 25 75 25 70 Z"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
      <path d="M 52 25 L 70 25 Q 75 25 75 30 L 75 70 Q 75 75 70 75 L 52 75 Z"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
      {/* Book binding */}
      <line x1="50" y1="25" x2="50" y2="75" stroke="currentColor" strokeWidth="0.5" />
      {/* Page lines */}
      {[35, 42, 49, 56, 63].map((y) => (
        <g key={y}>
          <line x1="30" y1={y} x2="45" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
          <line x1="55" y1={y} x2="70" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
        </g>
      ))}
      {/* Quill */}
      <path d="M 65 35 Q 70 30 75 20 L 76 21 Q 71 31 66 36"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
      <path d="M 75 20 L 76 21 L 74 22 Z" fill="currentColor" />
    </svg>
  ),
  'moon-stars': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Crescent moon */}
      <path d="M 45 25 Q 35 35 35 50 Q 35 65 45 75 Q 40 72 37 65 Q 32 55 32 50 Q 32 45 37 35 Q 40 28 45 25 Z"
            fill="currentColor" />
      {/* Stars */}
      {[
        { x: 60, y: 30, size: 4 },
        { x: 70, y: 45, size: 3 },
        { x: 65, y: 65, size: 3.5 },
        { x: 25, y: 35, size: 2.5 },
        { x: 30, y: 65, size: 3 },
        { x: 75, y: 25, size: 2 }
      ].map((star, i) => (
        <g key={i}>
          <line x1={star.x - star.size} y1={star.y} x2={star.x + star.size} y2={star.y}
                stroke="currentColor" strokeWidth="0.3" />
          <line x1={star.x} y1={star.y - star.size} x2={star.x} y2={star.y + star.size}
                stroke="currentColor" strokeWidth="0.3" />
        </g>
      ))}
      {/* Water reflection (wavy lines) */}
      <path d="M 20 80 Q 30 78 40 80 Q 50 82 60 80 Q 70 78 80 80"
            fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
      <path d="M 20 85 Q 30 83 40 85 Q 50 87 60 85 Q 70 83 80 85"
            fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
    </svg>
  ),
  'moon-phases': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Moon phases in a circle */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 35 * Math.cos(rad);
        const y = 50 + 35 * Math.sin(rad);
        const phase = i / 8;
        return (
          <g key={angle} transform={`translate(${x}, ${y})`}>
            <circle r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
            {phase > 0 && phase < 0.5 && (
              <path d={`M 0 -4 A 4 4 0 0 1 0 4 A ${4 * (1 - phase * 2)} 4 0 0 ${phase < 0.25 ? 1 : 0} 0 -4 Z`}
                    fill="currentColor" />
            )}
            {phase >= 0.5 && phase < 1 && (
              <path d={`M 0 -4 A 4 4 0 0 0 0 4 A ${4 * ((phase - 0.5) * 2)} 4 0 0 ${phase < 0.75 ? 0 : 1} 0 -4 Z`}
                    fill="currentColor" />
            )}
          </g>
        );
      })}
      {/* Center circle */}
      <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.4" />
      {/* Tidal wave pattern */}
      <path d="M 15 75 Q 25 70 35 75 Q 45 80 55 75 Q 65 70 75 75 Q 85 80 95 75"
            fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
    </svg>
  ),
  'ocean-currents': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Flowing current lines */}
      <path d="M 10 20 Q 30 15 50 20 Q 70 25 90 20"
            fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      <path d="M 5 35 Q 25 30 45 35 Q 65 40 85 35"
            fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      <path d="M 15 50 Q 35 45 55 50 Q 75 55 95 50"
            fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      <path d="M 10 65 Q 30 60 50 65 Q 70 70 90 65"
            fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      <path d="M 5 80 Q 25 75 45 80 Q 65 85 85 80"
            fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      {/* Flow direction arrows */}
      {[
        { x: 30, y: 20 }, { x: 70, y: 20 },
        { x: 25, y: 35 }, { x: 65, y: 35 },
        { x: 35, y: 50 }, { x: 75, y: 50 },
        { x: 30, y: 65 }, { x: 70, y: 65 },
        { x: 25, y: 80 }, { x: 65, y: 80 }
      ].map((arrow, i) => (
        <path key={i} d={`M ${arrow.x} ${arrow.y - 2} L ${arrow.x + 3} ${arrow.y} L ${arrow.x} ${arrow.y + 2}`}
              fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
      ))}
    </svg>
  ),
  'route-line': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Plotted course line with waypoints */}
      <path d="M 20 70 L 35 50 L 50 45 L 65 55 L 80 30"
            fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.6" />
      {/* Waypoint markers */}
      {[
        { x: 20, y: 70, label: 'A' },
        { x: 35, y: 50, label: 'B' },
        { x: 50, y: 45, label: 'C' },
        { x: 65, y: 55, label: 'D' },
        { x: 80, y: 30, label: 'E' }
      ].map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="3" fill="currentColor" />
          <circle cx={point.x} cy={point.y} r="5" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </g>
      ))}
      {/* Direction arrows along route */}
      <path d="M 27 60 L 30 59 L 28 57" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M 42 47 L 45 47 L 43 45" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M 57 50 L 60 51 L 58 53" fill="none" stroke="currentColor" strokeWidth="0.3" />
      <path d="M 72 42 L 75 40 L 73 38" fill="none" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  ),
  'warning-buoys': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Warning buoys */}
      {[
        { x: 30, y: 35 },
        { x: 70, y: 35 },
        { x: 50, y: 60 }
      ].map((buoy, i) => (
        <g key={i}>
          {/* Buoy body */}
          <ellipse cx={buoy.x} cy={buoy.y} rx="6" ry="8" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <line x1={buoy.x - 6} y1={buoy.y} x2={buoy.x + 6} y2={buoy.y} stroke="currentColor" strokeWidth="0.4" />
          {/* Top marker */}
          <circle cx={buoy.x} cy={buoy.y - 12} r="2" fill="currentColor" />
          <line x1={buoy.x} y1={buoy.y - 8} x2={buoy.x} y2={buoy.y - 10} stroke="currentColor" strokeWidth="0.3" />
          {/* Anchor line */}
          <line x1={buoy.x} y1={buoy.y + 8} x2={buoy.x} y2={buoy.y + 15}
                stroke="currentColor" strokeWidth="0.2" opacity="0.4" strokeDasharray="1,1" />
        </g>
      ))}
      {/* Hazard markers (rocks) */}
      {[
        { x: 25, y: 70 },
        { x: 55, y: 75 },
        { x: 75, y: 65 }
      ].map((rock, i) => (
        <path key={`rock-${i}`}
              d={`M ${rock.x} ${rock.y} L ${rock.x + 3} ${rock.y - 4} L ${rock.x + 6} ${rock.y} Z`}
              fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
      ))}
    </svg>
  ),
  'sailboat': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Sailboat hull */}
      <path d="M 40 65 L 30 70 L 70 70 L 60 65 Z"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
      {/* Mast */}
      <line x1="50" y1="30" x2="50" y2="65" stroke="currentColor" strokeWidth="0.5" />
      {/* Main sail */}
      <path d="M 50 35 L 70 55 L 50 60 Z"
            fill="none" stroke="currentColor" strokeWidth="0.4" />
      {/* Front sail (jib) */}
      <path d="M 50 40 L 35 50 L 50 55 Z"
            fill="none" stroke="currentColor" strokeWidth="0.3" />
      {/* Flag at top */}
      <path d="M 50 30 L 55 32 L 50 34"
            fill="currentColor" />
      {/* Water waves */}
      <path d="M 10 75 Q 20 73 30 75 Q 40 77 50 75 Q 60 73 70 75 Q 80 77 90 75"
            fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
      <path d="M 10 80 Q 20 78 30 80 Q 40 82 50 80 Q 60 78 70 80 Q 80 82 90 80"
            fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
      {/* Oars (crossed) */}
      <line x1="25" y1="55" x2="35" y2="65" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
      <line x1="25" y1="65" x2="35" y2="55" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
      <ellipse cx="23" cy="55" rx="2" ry="3" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <ellipse cx="23" cy="65" rx="2" ry="3" fill="none" stroke="currentColor" strokeWidth="0.2" />
    </svg>
  ),
  'navigation-instruments': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Compass in center */}
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <path d="M 50 35 L 52 40 L 50 38 L 48 40 Z" fill="currentColor" />
      <line x1="50" y1="37" x2="50" y2="48" stroke="currentColor" strokeWidth="0.3" />

      {/* Sextant (top left) */}
      <g transform="translate(25, 25)">
        <path d="M 0 0 L 0 8 L 8 4 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <circle r="6" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <line x1="0" y1="-6" x2="0" y2="-9" stroke="currentColor" strokeWidth="0.2" />
      </g>

      {/* Dividers (top right) */}
      <g transform="translate(75, 25)">
        <line x1="-5" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="0.3" />
        <line x1="5" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="0.3" />
        <circle cy="-2" r="1.5" fill="currentColor" />
      </g>

      {/* Chronometer/Clock (bottom left) */}
      <g transform="translate(25, 75)">
        <circle r="6" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <line y1="0" y2="-3" stroke="currentColor" strokeWidth="0.3" />
        <line x1="0" y1="0" x2="2" y2="1" stroke="currentColor" strokeWidth="0.2" />
      </g>

      {/* Telescope (bottom right) */}
      <g transform="translate(75, 75)">
        <rect x="-8" y="-2" width="10" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
        <rect x="-3" y="-1.5" width="6" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.3" />
      </g>
    </svg>
  ),
};

export function PageBackground({ symbol = 'none' }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">

        {/* Grid overlay - softer */}
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Symbol overlay - softer */}
        {symbol !== 'none' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.08] dark:opacity-[0.06] text-slate-400 dark:text-[#d4a574]">
            {symbols[symbol]}
          </div>
        )}

        {/* Texture overlay - softer */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
