import React, { useState, useRef, useCallback } from 'react';
import { Compass } from 'lucide-react';
import { Language } from '../../types';

interface AngleProtractorDiagramProps {
  initialAngle?: number;
  interactive?: boolean;
  language?: Language;
}

export const AngleProtractorDiagram: React.FC<AngleProtractorDiagramProps> = ({
  initialAngle = 60,
  interactive = true,
  language = 'ko'
}) => {
  const [angle, setAngle] = useState(initialAngle);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);

  // SVG Protractor geometry
  const width = 320;
  const height = 180;
  const cx = 160;
  const cy = 150;
  const radius = 120;

  // Angle classification
  const getAngleType = (deg: number) => {
    if (deg < 90) return { ko: '예각 (0° 초과 90° 미만)', en: 'Acute Angle (< 90°)', color: 'blue' };
    if (deg === 90) return { ko: '직각 (정확히 90°)', en: 'Right Angle (90°)', color: 'emerald' };
    if (deg < 180) return { ko: '둔각 (90° 초과 180° 미만)', en: 'Obtuse Angle (90° ~ 180°)', color: 'amber' };
    return { ko: '평각 (정확히 180°)', en: 'Straight Angle (180°)', color: 'purple' };
  };

  const angleType = getAngleType(angle);

  // Compute ray end coordinate
  // Angle in standard math: 0 deg = right (positive x), goes counterclockwise
  const rad = (angle * Math.PI) / 180;
  const rayX = cx + Math.cos(rad) * radius;
  const rayY = cy - Math.sin(rad) * radius; // SVG y is downwards

  // Arc path for angle: from (cx + 35, cy) to (cx + 35 * cos, cy - 35 * sin)
  const arcR = 40;
  const arcEndX = cx + Math.cos(rad) * arcR;
  const arcEndY = cy - Math.sin(rad) * arcR;
  const largeArcFlag = angle > 180 ? 1 : 0;
  const arcPath = `M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY} L ${cx} ${cy} Z`;

  // Update angle from pointer event
  const updateAngleFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Calculate relative to SVG viewBox scale
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    const dx = px - cx;
    const dy = cy - py; // Flip y so upwards is positive

    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    if (deg < 0) {
      // If below baseline
      deg = dx >= 0 ? 0 : 180;
    }
    deg = Math.max(0, Math.min(180, deg));
    setAngle(deg);
  }, [cx, cy, width, height]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateAngleFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    updateAngleFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    e.stopPropagation();
  };

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-3 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            {language === 'ko' ? '각도기 & 각 분류' : 'Angle Protractor'}
          </span>
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
            angleType.color === 'blue'
              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
              : angleType.color === 'emerald'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : angleType.color === 'amber'
              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
              : 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
          }`}>
            {language === 'ko' ? angleType.ko : angleType.en}
          </span>
        </div>

        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          {angle}°
        </div>
      </div>

      {/* SVG Protractor Visual Canvas */}
      <div className="w-full flex justify-center py-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-xs sm:max-w-sm h-auto overflow-visible touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Protractor Semi-Circle Base Fill */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy} Z`}
            className="fill-slate-100 dark:fill-slate-800/80 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />

          {/* Tick marks and degree guides */}
          {[0, 30, 45, 60, 90, 120, 135, 150, 180].map((deg) => {
            const radTick = (deg * Math.PI) / 180;
            const innerR = deg % 45 === 0 ? radius - 15 : radius - 10;
            const x1 = cx + Math.cos(radTick) * innerR;
            const y1 = cy - Math.sin(radTick) * innerR;
            const x2 = cx + Math.cos(radTick) * radius;
            const y2 = cy - Math.sin(radTick) * radius;

            const textR = radius - 24;
            const tx = cx + Math.cos(radTick) * textR;
            const ty = cy - Math.sin(radTick) * textR;

            return (
              <g key={deg}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={deg === 90 ? 'stroke-emerald-500 stroke-2' : 'stroke-slate-400 dark:stroke-slate-600'}
                />
                {deg % 30 === 0 && (
                  <text
                    x={tx}
                    y={ty + 3}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 select-none"
                  >
                    {deg}
                  </text>
                )}
              </g>
            );
          })}

          {/* Shaded Angle Arc */}
          {angle > 0 && (
            <path
              d={arcPath}
              className="fill-blue-500/20 dark:fill-blue-400/25 stroke-blue-500 dark:stroke-blue-400 stroke-1"
            />
          )}

          {/* Fixed Base Ray (0 deg) */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + radius}
            y2={cy}
            className="stroke-slate-700 dark:stroke-slate-200 stroke-[3]"
            strokeLinecap="round"
          />

          {/* Dynamic Angle Ray */}
          <line
            x1={cx}
            y1={cy}
            x2={rayX}
            y2={rayY}
            className="stroke-blue-600 dark:stroke-blue-400 stroke-[3.5]"
            strokeLinecap="round"
          />

          {/* Center Pivot Point */}
          <circle cx={cx} cy={cy} r="5" className="fill-slate-800 dark:fill-white" />

          {/* Draggable Touch Handle on Ray Tip */}
          {interactive && (
            <g className="cursor-grab active:cursor-grabbing">
              {/* Invisible large touch target (44x44) */}
              <circle cx={rayX} cy={rayY} r="22" className="fill-transparent" />
              {/* Visible knob */}
              <circle
                cx={rayX}
                cy={rayY}
                r="10"
                className="fill-blue-600 stroke-white dark:stroke-slate-900 stroke-2 shadow-md filter drop-shadow"
              />
              <circle cx={rayX} cy={rayY} r="3.5" className="fill-white" />
            </g>
          )}
        </svg>
      </div>

      {/* Slider & Quick Presets */}
      {interactive && (
        <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500">0°</span>
            <input
              type="range"
              min="0"
              max="180"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[11px] font-bold text-slate-500">180°</span>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {[
              { deg: 30, label: '30°' },
              { deg: 45, label: '45°' },
              { deg: 90, label: '90° (직각)' },
              { deg: 120, label: '120°' },
              { deg: 180, label: '180° (평각)' }
            ].map(({ deg, label }) => (
              <button
                key={deg}
                type="button"
                onClick={() => setAngle(deg)}
                className={`min-h-8 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                  angle === deg
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
