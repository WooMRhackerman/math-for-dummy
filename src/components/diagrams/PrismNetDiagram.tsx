import React, { useState } from 'react';
import { Box, Layers } from 'lucide-react';
import { Language } from '../../types';

interface PrismNetDiagramProps {
  initialFold?: number; // 0 (flat net) to 100 (folded 3D)
  initialType?: 'cube' | 'prism';
  interactive?: boolean;
  language?: Language;
}

export const PrismNetDiagram: React.FC<PrismNetDiagramProps> = ({
  initialFold = 0,
  initialType = 'cube',
  interactive = true,
  language = 'ko'
}) => {
  const [solidType, setSolidType] = useState<'cube' | 'prism'>(initialType);
  const [foldProgress, setFoldProgress] = useState(initialFold); // 0 (flat net) ~ 100 (folded)
  const [selectedPair, setSelectedPair] = useState<number | null>(null);

  // Colors for 3 pairs of opposite parallel faces
  const faceColors = [
    { bg: 'bg-blue-500/80', stroke: 'stroke-blue-600', fill: 'fill-blue-500/30 dark:fill-blue-400/40', text: 'text-blue-700 dark:text-blue-300', name: language === 'ko' ? '윗면 / 아랫면' : 'Top / Bottom' },
    { bg: 'bg-emerald-500/80', stroke: 'stroke-emerald-600', fill: 'fill-emerald-500/30 dark:fill-emerald-400/40', text: 'text-emerald-700 dark:text-emerald-300', name: language === 'ko' ? '앞면 / 뒷면' : 'Front / Back' },
    { bg: 'bg-amber-500/80', stroke: 'stroke-amber-600', fill: 'fill-amber-500/30 dark:fill-amber-400/40', text: 'text-amber-700 dark:text-amber-300', name: language === 'ko' ? '왼쪽면 / 오른쪽면' : 'Left / Right' }
  ];

  // Width & height
  const w = 320;
  const h = 220;

  // 3D Isometric constants (folded view)
  const isoCx = 160;
  const isoCy = 125;
  const s = solidType === 'cube' ? 45 : 40;
  const sh = solidType === 'cube' ? 45 : 60; // Height for prism
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);

  // Isometric vertices
  const pTop = { x: isoCx, y: isoCy - sh - s * sin30 };
  const pTopR = { x: isoCx + s * cos30, y: isoCy - sh };
  const pTopL = { x: isoCx - s * cos30, y: isoCy - sh };
  const pCenter = { x: isoCx, y: isoCy - sh + s * sin30 };
  const pBottom = { x: isoCx, y: isoCy + s * sin30 };
  const pBottomR = { x: isoCx + s * cos30, y: isoCy };
  const pBottomL = { x: isoCx - s * cos30, y: isoCy };

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-3 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <Box className="w-3.5 h-3.5" />
            {language === 'ko' ? '입체도형 전개도 & 겨냥도' : '3D Prism Net Explorer'}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSolidType('cube')}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                solidType === 'cube'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '정육면체' : 'Cube'}
            </button>
            <button
              type="button"
              onClick={() => setSolidType('prism')}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                solidType === 'prism'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '직육면체' : 'Prism'}
            </button>
          </div>
        </div>

        <div className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800">
          {foldProgress === 0 
            ? (language === 'ko' ? '전개도 (2D)' : 'Flat Net (2D)')
            : foldProgress === 100 
            ? (language === 'ko' ? '겨냥도 (3D)' : '3D Isometric')
            : `${foldProgress}% ${language === 'ko' ? '접는 중...' : 'Folding...'}`}
        </div>
      </div>

      {/* Visual Canvas (2D Net <--> 3D Isometric transition) */}
      <div className="w-full flex justify-center py-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-xs sm:max-w-sm h-auto overflow-visible"
        >
          {foldProgress < 50 ? (
            /* 2D Flat Net Representation */
            <g className="transition-opacity duration-300">
              {/* T-shaped Cube / Prism Net */}
              {/* Standard cross net:
                  Row 0: [  ][top][  ][  ]
                  Row 1: [left][front][right][back]
                  Row 2: [  ][bottom][  ][  ]
              */}
              {(() => {
                const bw = solidType === 'cube' ? 38 : 34;
                const bh = solidType === 'cube' ? 38 : 34;
                const startX = 160 - bw * 1.5;
                const startY = 30;

                // 6 Faces coordinate:
                // 0: Top (Blue), 1: Bottom (Blue)
                // 2: Front (Emerald), 3: Back (Emerald)
                // 4: Left (Amber), 5: Right (Amber)
                const faces = [
                  { x: startX + bw, y: startY, w: bw, h: bh, pair: 0, label: '① 윗면' },
                  { x: startX, y: startY + bh, w: bw, h: bh, pair: 2, label: '⑤ 좌' },
                  { x: startX + bw, y: startY + bh, w: bw, h: bh, pair: 1, label: '③ 앞면' },
                  { x: startX + bw * 2, y: startY + bh, w: bw, h: bh, pair: 2, label: '⑥ 우' },
                  { x: startX + bw * 3, y: startY + bh, w: bw, h: bh, pair: 1, label: '④ 뒷면' },
                  { x: startX + bw, y: startY + bh * 2, w: bw, h: bh, pair: 0, label: '② 아랫면' }
                ];

                return faces.map((f, i) => (
                  <g
                    key={i}
                    onClick={() => setSelectedPair(selectedPair === f.pair ? null : f.pair)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={f.x}
                      y={f.y}
                      width={f.w}
                      height={f.h}
                      rx="3"
                      className={`stroke-2 transition-all duration-200 ${faceColors[f.pair].stroke} ${
                        selectedPair === f.pair
                          ? 'fill-blue-500/60 dark:fill-blue-400/60 stroke-[3]'
                          : faceColors[f.pair].fill
                      }`}
                    />
                    <text
                      x={f.x + f.w / 2}
                      y={f.y + f.h / 2 + 3}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-slate-800 dark:fill-slate-100 select-none"
                    >
                      {f.label}
                    </text>
                  </g>
                ));
              })()}

              <text x={160} y={185} textAnchor="middle" className="text-[11px] font-bold fill-slate-500">
                {language === 'ko' 
                  ? '💡 같은 색의 면(①-②, ③-④, ⑤-⑥)은 마주보는 평행한 면입니다.' 
                  : 'Matching colored faces are parallel opposite faces.'}
              </text>
            </g>
          ) : (
            /* 3D Isometric View */
            <g className="transition-opacity duration-300">
              {/* Top Face (Pair 0: Blue) */}
              <polygon
                points={`${pTop.x},${pTop.y} ${pTopR.x},${pTopR.y} ${pCenter.x},${pCenter.y} ${pTopL.x},${pTopL.y}`}
                className={`${faceColors[0].fill} ${faceColors[0].stroke} stroke-2 cursor-pointer transition-colors`}
                onClick={() => setSelectedPair(0)}
              />
              <text x={isoCx} y={isoCy - sh} textAnchor="middle" className="text-[10px] font-black fill-blue-700 dark:fill-blue-200">
                윗면 ①
              </text>

              {/* Front-Right Face (Pair 1: Emerald) */}
              <polygon
                points={`${pCenter.x},${pCenter.y} ${pTopR.x},${pTopR.y} ${pBottomR.x},${pBottomR.y} ${pBottom.x},${pBottom.y}`}
                className={`${faceColors[1].fill} ${faceColors[1].stroke} stroke-2 cursor-pointer transition-colors`}
                onClick={() => setSelectedPair(1)}
              />
              <text x={isoCx + s * cos30 * 0.5} y={isoCy - sh * 0.3} textAnchor="middle" className="text-[10px] font-black fill-emerald-700 dark:fill-emerald-200">
                앞면 ③
              </text>

              {/* Front-Left Face (Pair 2: Amber) */}
              <polygon
                points={`${pTopL.x},${pTopL.y} ${pCenter.x},${pCenter.y} ${pBottom.x},${pBottom.y} ${pBottomL.x},${pBottomL.y}`}
                className={`${faceColors[2].fill} ${faceColors[2].stroke} stroke-2 cursor-pointer transition-colors`}
                onClick={() => setSelectedPair(2)}
              />
              <text x={isoCx - s * cos30 * 0.5} y={isoCy - sh * 0.3} textAnchor="middle" className="text-[10px] font-black fill-amber-700 dark:fill-amber-200">
                옆면 ⑤
              </text>

              {/* Dashed Hidden Edges */}
              <line x1={pTop.x} y1={pTop.y + sh} x2={pBottom.x} y2={pBottom.y} className="stroke-slate-400/60 stroke-dasharray-3 stroke-1" strokeDasharray="3 3" />
              <line x1={pTop.x} y1={pTop.y + sh} x2={pBottomL.x} y2={pBottomL.y} className="stroke-slate-400/60 stroke-dasharray-3 stroke-1" strokeDasharray="3 3" />
              <line x1={pTop.x} y1={pTop.y + sh} x2={pBottomR.x} y2={pBottomR.y} className="stroke-slate-400/60 stroke-dasharray-3 stroke-1" strokeDasharray="3 3" />

              <text x={160} y={195} textAnchor="middle" className="text-[11px] font-bold fill-slate-500">
                {language === 'ko' ? '면 6개, 모서리 12개, 꼭짓점 8개' : '6 Faces, 12 Edges, 8 Vertices'}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Fold / Unfold Slider */}
      {interactive && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {language === 'ko' ? '전개도 접기 / 펼치기' : 'Fold / Unfold Slider'}:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {foldProgress < 50 ? (language === 'ko' ? '2D 전개도' : '2D Net') : (language === 'ko' ? '3D 입체 겨냥도' : '3D Solid')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500">{language === 'ko' ? '펼침' : 'Flat'}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={foldProgress}
              onChange={(e) => setFoldProgress(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[11px] font-bold text-slate-500">{language === 'ko' ? '접힘' : 'Solid'}</span>
          </div>

          <div className="flex gap-2 justify-center pt-1">
            <button
              type="button"
              onClick={() => setFoldProgress(0)}
              className="min-h-8 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              전개도(펼치기)
            </button>
            <button
              type="button"
              onClick={() => setFoldProgress(100)}
              className="min-h-8 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              겨냥도(3D 접기)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
