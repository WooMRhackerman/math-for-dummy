import React, { useState } from 'react';
import { Clock, Plus, RotateCcw } from 'lucide-react';
import { Language } from '../../types';

interface ClockDiagramProps {
  initialHours?: number;
  initialMinutes?: number;
  interactive?: boolean;
  language?: Language;
}

export const ClockDiagram: React.FC<ClockDiagramProps> = ({
  initialHours = 3,
  initialMinutes = 0,
  interactive = true,
  language = 'ko'
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  const cx = 130;
  const cy = 130;
  const radius = 105;

  // Angles
  // 1 minute = 360 / 60 = 6 deg
  const minuteAngle = minutes * 6;
  // 1 hour = 360 / 12 = 30 deg + 0.5 deg per minute
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  // Add minutes helper
  const addMinutes = (delta: number) => {
    let totalMin = hours * 60 + minutes + delta;
    if (totalMin < 0) totalMin += 12 * 60;
    const newH = Math.floor(totalMin / 60) % 12 || 12;
    const newM = totalMin % 60;
    setHours(newH);
    setMinutes(newM);
  };

  // Convert angles to radian
  const mRad = ((minuteAngle - 90) * Math.PI) / 180;
  const hRad = ((hourAngle - 90) * Math.PI) / 180;

  const mLen = 78;
  const hLen = 52;

  const mX = cx + Math.cos(mRad) * mLen;
  const mY = cy + Math.sin(mRad) * mLen;

  const hX = cx + Math.cos(hRad) * hLen;
  const hY = cy + Math.sin(hRad) * hLen;

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-3 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {language === 'ko' ? '시계 보기와 시간 탐색기' : 'Interactive Clock'}
          </span>
        </div>

        {/* Digital Time Readout */}
        <div className="text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
          <span className="text-amber-600 dark:text-amber-400">{hours}시</span>
          <span className="text-blue-600 dark:text-blue-400">{minutes}분</span>
          <span className="text-xs text-slate-400 font-mono">
            ({String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')})
          </span>
        </div>
      </div>

      {/* SVG Clock Canvas */}
      <div className="w-full flex justify-center py-1">
        <svg
          viewBox="0 0 260 260"
          className="w-full max-w-[200px] sm:max-w-[220px] h-auto overflow-visible"
        >
          {/* Clock Outer Rim */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 stroke-[4] shadow-md"
          />

          {/* Minute Ticks (60 ticks) */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHour = i % 5 === 0;
            const angleDeg = i * 6;
            const rad = ((angleDeg - 90) * Math.PI) / 180;
            const innerR = isHour ? radius - 10 : radius - 5;
            const x1 = cx + Math.cos(rad) * innerR;
            const y1 = cy + Math.sin(rad) * innerR;
            const x2 = cx + Math.cos(rad) * (radius - 2);
            const y2 = cy + Math.sin(rad) * (radius - 2);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isHour ? 'stroke-slate-600 dark:stroke-slate-400 stroke-[2]' : 'stroke-slate-300 dark:stroke-slate-600 stroke-[1]'}
              />
            );
          })}

          {/* Hour Numbers (1~12) */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
            const angleDeg = i * 30;
            const rad = ((angleDeg - 90) * Math.PI) / 180;
            const numR = radius - 22;
            const nx = cx + Math.cos(rad) * numR;
            const ny = cy + Math.sin(rad) * numR;

            return (
              <text
                key={h}
                x={nx}
                y={ny + 4}
                textAnchor="middle"
                className="text-[12px] font-black fill-slate-800 dark:fill-slate-200 select-none"
              >
                {h}
              </text>
            );
          })}

          {/* Hour Hand (Thicker, Shorter, Amber) */}
          <line
            x1={cx}
            y1={cy}
            x2={hX}
            y2={hY}
            className="stroke-amber-500 stroke-[4.5]"
            strokeLinecap="round"
          />

          {/* Minute Hand (Thinner, Longer, Blue) */}
          <line
            x1={cx}
            y1={cy}
            x2={mX}
            y2={mY}
            className="stroke-blue-600 dark:stroke-blue-400 stroke-[3]"
            strokeLinecap="round"
          />

          {/* Center Pin */}
          <circle cx={cx} cy={cy} r="5" className="fill-slate-900 dark:fill-white" />
          <circle cx={cx} cy={cy} r="2" className="fill-amber-400" />
        </svg>
      </div>

      {/* Quick Time Adjustment Controls */}
      {interactive && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-600 dark:text-slate-400">
                <span>시(Hour):</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{hours}시</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-600 dark:text-slate-400">
                <span>분(Minute):</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{minutes}분</span>
              </div>
              <input
                type="range"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-1.5 justify-center flex-wrap pt-1">
            <button
              type="button"
              onClick={() => addMinutes(5)}
              className="min-h-8 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 5분
            </button>
            <button
              type="button"
              onClick={() => addMinutes(15)}
              className="min-h-8 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 15분
            </button>
            <button
              type="button"
              onClick={() => addMinutes(30)}
              className="min-h-8 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 30분
            </button>
            <button
              type="button"
              onClick={() => addMinutes(60)}
              className="min-h-8 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 1시간
            </button>
            <button
              type="button"
              onClick={() => { setHours(3); setMinutes(0); }}
              className="min-h-8 px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
