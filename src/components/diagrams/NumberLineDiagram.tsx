import React, { useState } from 'react';
import { MoveRight } from 'lucide-react';
import { Language } from '../../types';

interface NumberLineDiagramProps {
  initialStart?: number;
  initialStep?: number;
  mode?: 'integers' | 'decimals';
  interactive?: boolean;
  language?: Language;
}

export const NumberLineDiagram: React.FC<NumberLineDiagramProps> = ({
  initialStart = 3,
  initialStep = 4,
  mode = 'integers',
  interactive = true,
  language = 'ko'
}) => {
  const [currentMode, setCurrentMode] = useState<'integers' | 'decimals'>(mode);
  const [startVal, setStartVal] = useState(initialStart);
  const [stepVal, setStepVal] = useState(initialStep);

  // Constants
  const w = 320;
  const h = 160;
  const lineY = 100;
  const startX = 35;
  const endX = 285;
  const lineLen = endX - startX;

  // Max range based on mode
  // integers: 0 to 10
  // decimals: 0 to 1.0 (steps of 0.1)
  const maxVal = currentMode === 'integers' ? 10 : 1.0;
  const numTicks = currentMode === 'integers' ? 10 : 10;

  const resultVal = currentMode === 'integers'
    ? Math.min(10, startVal + stepVal)
    : Math.min(1.0, Math.round((startVal + stepVal) * 10) / 10);

  // Helper coordinate converter
  const getX = (v: number) => startX + (v / maxVal) * lineLen;

  // Jump Arc Path from startVal to resultVal
  const p1X = getX(startVal);
  const p2X = getX(resultVal);
  const midX = (p1X + p2X) / 2;
  const arcHeight = Math.min(45, Math.max(20, Math.abs(p2X - p1X) * 0.4));
  const arcPath = `M ${p1X} ${lineY} Q ${midX} ${lineY - arcHeight * 2} ${p2X} ${lineY}`;

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-3 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <MoveRight className="w-3.5 h-3.5" />
            {language === 'ko' ? '수직선 점프 탐색기' : 'Number Line Visualizer'}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setCurrentMode('integers'); setStartVal(2); setStepVal(3); }}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                currentMode === 'integers'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '자연수 0~10' : 'Integers 0~10'}
            </button>
            <button
              type="button"
              onClick={() => { setCurrentMode('decimals'); setStartVal(0.3); setStepVal(0.4); }}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                currentMode === 'decimals'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '소수 0~1.0' : 'Decimals 0~1.0'}
            </button>
          </div>
        </div>

        {/* Live Equation Badge */}
        <div className="text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          {startVal} + {stepVal} = <span className="text-blue-600 dark:text-blue-400">{resultVal}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full flex justify-center py-1">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-xs sm:max-w-sm h-auto overflow-visible"
        >
          {/* Main Axis Line with Arrowhead */}
          <line
            x1={startX - 15}
            y1={lineY}
            x2={endX + 15}
            y2={lineY}
            className="stroke-slate-700 dark:stroke-slate-300 stroke-2"
            strokeLinecap="round"
          />
          <polygon
            points={`${endX + 20},${lineY} ${endX + 12},${lineY - 4} ${endX + 12},${lineY + 4}`}
            className="fill-slate-700 dark:fill-slate-300"
          />

          {/* Tick Marks & Labels */}
          {Array.from({ length: numTicks + 1 }).map((_, i) => {
            const v = currentMode === 'integers' ? i : Math.round(i * 0.1 * 10) / 10;
            const x = getX(v);
            const isHighlight = v === startVal || v === resultVal;

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={lineY - 6}
                  x2={x}
                  y2={lineY + 6}
                  className={isHighlight ? 'stroke-blue-600 dark:stroke-blue-400 stroke-2' : 'stroke-slate-400 dark:stroke-slate-600 stroke-1'}
                />
                <text
                  x={x}
                  y={lineY + 20}
                  textAnchor="middle"
                  className={`text-[9px] font-bold select-none ${
                    isHighlight
                      ? 'fill-blue-600 dark:fill-blue-400 text-[10px]'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Jumping Curved Arc */}
          {stepVal > 0 && (
            <g>
              <path
                d={arcPath}
                className="fill-none stroke-blue-500 dark:stroke-blue-400 stroke-[2.5]"
                strokeDasharray="4 2"
              />
              <text
                x={midX}
                y={lineY - arcHeight * 1.5}
                textAnchor="middle"
                className="text-[11px] font-black fill-blue-600 dark:fill-blue-400"
              >
                +{stepVal}
              </text>
            </g>
          )}

          {/* Start Point Dot */}
          <circle cx={p1X} cy={lineY} r="5" className="fill-amber-500 stroke-white dark:stroke-slate-900 stroke-2" />

          {/* Result Point Dot */}
          <circle cx={p2X} cy={lineY} r="6" className="fill-blue-600 stroke-white dark:stroke-slate-900 stroke-2 shadow-md" />
        </svg>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1 font-semibold text-slate-600 dark:text-slate-400">
                <span>{language === 'ko' ? '시작 위치' : 'Start'}: {startVal}</span>
              </div>
              <input
                type="range"
                min="0"
                max={currentMode === 'integers' ? 7 : 0.6}
                step={currentMode === 'integers' ? 1 : 0.1}
                value={startVal}
                onChange={(e) => setStartVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 font-semibold text-slate-600 dark:text-slate-400">
                <span>{language === 'ko' ? '점프 크기' : 'Jump'}: +{stepVal}</span>
              </div>
              <input
                type="range"
                min="0"
                max={currentMode === 'integers' ? (10 - startVal) : Math.round((1.0 - startVal) * 10) / 10}
                step={currentMode === 'integers' ? 1 : 0.1}
                value={stepVal}
                onChange={(e) => setStepVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
