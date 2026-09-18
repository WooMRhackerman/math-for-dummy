import React, { useState, useRef } from 'react';
import { Shapes, Sparkles, RefreshCw } from 'lucide-react';
import { Language } from '../../types';

interface PolygonAngleDiagramProps {
  initialSides?: 3 | 4;
  interactive?: boolean;
  language?: Language;
}

interface Point {
  x: number;
  y: number;
}

export const PolygonAngleDiagram: React.FC<PolygonAngleDiagramProps> = ({
  initialSides = 3,
  interactive = true,
  language = 'ko'
}) => {
  const [polygonSides, setPolygonSides] = useState<3 | 4>(initialSides);
  const [showCombine, setShowCombine] = useState(false);

  // Triangle vertices state (width 320, height 220)
  const [trianglePoints, setTrianglePoints] = useState<[Point, Point, Point]>([
    { x: 160, y: 35 },   // Vertex A (Top)
    { x: 50, y: 175 },   // Vertex B (Bottom-Left)
    { x: 270, y: 175 }   // Vertex C (Bottom-Right)
  ]);

  // Quadrilateral vertices state
  const [quadPoints, setQuadPoints] = useState<[Point, Point, Point, Point]>([
    { x: 80, y: 45 },    // A
    { x: 240, y: 45 },   // B
    { x: 275, y: 175 },  // C
    { x: 55, y: 175 }    // D
  ]);

  const activeDragIndexRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Reset to equilateral / symmetric shape
  const handleReset = () => {
    if (polygonSides === 3) {
      setTrianglePoints([
        { x: 160, y: 35 },
        { x: 50, y: 175 },
        { x: 270, y: 175 }
      ]);
    } else {
      setQuadPoints([
        { x: 80, y: 45 },
        { x: 240, y: 45 },
        { x: 275, y: 175 },
        { x: 55, y: 175 }
      ]);
    }
  };

  // Helper: compute angle at vertex B between BA and BC in degrees
  const computeAngle = (prev: Point, vertex: Point, next: Point): number => {
    const v1x = prev.x - vertex.x;
    const v1y = prev.y - vertex.y;
    const v2x = next.x - vertex.x;
    const v2y = next.y - vertex.y;

    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.hypot(v1x, v1y);
    const mag2 = Math.hypot(v2x, v2y);
    if (mag1 * mag2 === 0) return 60;

    let cos = dot / (mag1 * mag2);
    cos = Math.max(-1, Math.min(1, cos));
    return Math.round((Math.acos(cos) * 180) / Math.PI);
  };

  // Calculate angles for triangle
  const angleA = computeAngle(trianglePoints[2], trianglePoints[0], trianglePoints[1]);
  const angleB = computeAngle(trianglePoints[0], trianglePoints[1], trianglePoints[2]);
  // Ensure sum equals 180 mathematically
  const angleC = 180 - angleA - angleB;

  // Handle vertex drag
  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    activeDragIndexRef.current = index;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeDragIndexRef.current === null || !svgRef.current) return;
    e.stopPropagation();

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 220 / rect.height;
    const px = Math.max(20, Math.min(300, (e.clientX - rect.left) * scaleX));
    const py = Math.max(20, Math.min(200, (e.clientY - rect.top) * scaleY));

    const idx = activeDragIndexRef.current;
    if (polygonSides === 3) {
      setTrianglePoints((prev) => {
        const next: [Point, Point, Point] = [...prev];
        next[idx] = { x: px, y: py };
        return next;
      });
    } else {
      setQuadPoints((prev) => {
        const next: [Point, Point, Point, Point] = [...prev];
        next[idx] = { x: px, y: py };
        return next;
      });
    }
  };

  const handlePointerUp = () => {
    activeDragIndexRef.current = null;
  };

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-3 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Shapes className="w-3.5 h-3.5" />
            {language === 'ko' ? '다각형 내각의 합 탐색기' : 'Polygon Angle Explorer'}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setPolygonSides(3); setShowCombine(false); }}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                polygonSides === 3
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '삼각형 (180°)' : 'Triangle (180°)'}
            </button>
            <button
              type="button"
              onClick={() => { setPolygonSides(4); setShowCombine(false); }}
              className={`min-h-7 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition ${
                polygonSides === 4
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {language === 'ko' ? '사각형 (360°)' : 'Quad (360°)'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {language === 'ko' ? '초기화' : 'Reset'}
        </button>
      </div>

      {/* Angle Formula Badge */}
      <div className="flex items-center justify-center gap-2 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold shadow-sm">
        {polygonSides === 3 ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-rose-600 dark:text-rose-400 font-extrabold">∠A ({angleA}°)</span>
            <span>+</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">∠B ({angleB}°)</span>
            <span>+</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">∠C ({angleC}°)</span>
            <span className="text-slate-400 font-black">=</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
              180° (항상 일정!)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <span>사각형의 네 각의 합 = </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">삼각형 2개 (180° × 2)</span>
            <span className="text-slate-400 font-black">=</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black">
              360°
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full flex justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 320 220"
          className="w-full max-w-xs sm:max-w-sm h-auto overflow-visible touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {polygonSides === 3 ? (
            /* Triangle Rendering */
            <g>
              {/* Triangle Body */}
              <polygon
                points={`${trianglePoints[0].x},${trianglePoints[0].y} ${trianglePoints[1].x},${trianglePoints[1].y} ${trianglePoints[2].x},${trianglePoints[2].y}`}
                className="fill-blue-500/15 dark:fill-blue-400/20 stroke-blue-600 dark:stroke-blue-400 stroke-2"
                strokeLinejoin="round"
              />

              {/* Angle Arcs at Vertices */}
              <circle cx={trianglePoints[0].x} cy={trianglePoints[0].y} r="18" className="fill-rose-500/25 stroke-rose-500 stroke-1" />
              <circle cx={trianglePoints[1].x} cy={trianglePoints[1].y} r="18" className="fill-blue-500/25 stroke-blue-500 stroke-1" />
              <circle cx={trianglePoints[2].x} cy={trianglePoints[2].y} r="18" className="fill-emerald-500/25 stroke-emerald-500 stroke-1" />

              {/* Vertex Labels */}
              <text x={trianglePoints[0].x} y={trianglePoints[0].y - 12} textAnchor="middle" className="text-[11px] font-black fill-rose-600 dark:fill-rose-400">
                A ({angleA}°)
              </text>
              <text x={trianglePoints[1].x - 12} y={trianglePoints[1].y + 16} textAnchor="middle" className="text-[11px] font-black fill-blue-600 dark:fill-blue-400">
                B ({angleB}°)
              </text>
              <text x={trianglePoints[2].x + 12} y={trianglePoints[2].y + 16} textAnchor="middle" className="text-[11px] font-black fill-emerald-600 dark:fill-emerald-400">
                C ({angleC}°)
              </text>

              {/* Draggable Vertex Knobs */}
              {interactive && trianglePoints.map((pt, i) => (
                <g
                  key={i}
                  onPointerDown={handlePointerDown(i)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <circle cx={pt.x} cy={pt.y} r="22" className="fill-transparent" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="fill-white dark:fill-slate-900 stroke-blue-600 dark:stroke-blue-400 stroke-2 shadow-md filter drop-shadow"
                  />
                  <circle cx={pt.x} cy={pt.y} r="3" className="fill-blue-600 dark:fill-blue-400" />
                </g>
              ))}
            </g>
          ) : (
            /* Quadrilateral Rendering */
            <g>
              {/* Quadrilateral Body */}
              <polygon
                points={`${quadPoints[0].x},${quadPoints[0].y} ${quadPoints[1].x},${quadPoints[1].y} ${quadPoints[2].x},${quadPoints[2].y} ${quadPoints[3].x},${quadPoints[3].y}`}
                className="fill-indigo-500/15 dark:fill-indigo-400/20 stroke-indigo-600 dark:stroke-indigo-400 stroke-2"
                strokeLinejoin="round"
              />

              {/* Diagonal Line dividing into 2 triangles */}
              <line
                x1={quadPoints[0].x}
                y1={quadPoints[0].y}
                x2={quadPoints[2].x}
                y2={quadPoints[2].y}
                className="stroke-amber-500 stroke-2 stroke-dasharray-4"
                strokeDasharray="4 4"
              />

              {/* Triangle 1 & 2 Labels */}
              <text
                x={(quadPoints[0].x + quadPoints[1].x + quadPoints[2].x) / 3}
                y={(quadPoints[0].y + quadPoints[1].y + quadPoints[2].y) / 3}
                textAnchor="middle"
                className="text-[10px] font-black fill-amber-600 dark:fill-amber-400"
              >
                삼각형 ① (180°)
              </text>
              <text
                x={(quadPoints[0].x + quadPoints[3].x + quadPoints[2].x) / 3}
                y={(quadPoints[0].y + quadPoints[3].y + quadPoints[2].y) / 3}
                textAnchor="middle"
                className="text-[10px] font-black fill-amber-600 dark:fill-amber-400"
              >
                삼각형 ② (180°)
              </text>

              {/* Draggable Vertex Knobs */}
              {interactive && quadPoints.map((pt, i) => (
                <g
                  key={i}
                  onPointerDown={handlePointerDown(i)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <circle cx={pt.x} cy={pt.y} r="22" className="fill-transparent" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    className="fill-white dark:fill-slate-900 stroke-indigo-600 dark:stroke-indigo-400 stroke-2 shadow-md"
                  />
                  <circle cx={pt.x} cy={pt.y} r="3" className="fill-indigo-600 dark:fill-indigo-400" />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Helper Prompt */}
      {interactive && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>💡 꼭짓점을 마우스나 손가락으로 드래그해 모양을 바꿔보세요.</span>
          {polygonSides === 3 && (
            <button
              type="button"
              onClick={() => setShowCombine(!showCombine)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showCombine ? '모양 보기' : '각 모아보기'}
            </button>
          )}
        </div>
      )}

      {/* Visual Tear & Combine explanation */}
      {showCombine && polygonSides === 3 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs space-y-1.5 animate-fade-in">
          <div className="font-bold text-blue-900 dark:text-blue-200">
            세 꼭짓점의 각을 잘라 한 점에 모으면:
          </div>
          <div className="flex items-center justify-center gap-1 py-1 font-bold">
            <span className="w-8 h-4 bg-rose-500 rounded-l-full text-[10px] text-white flex items-center justify-center">A</span>
            <span className="w-8 h-4 bg-blue-500 text-[10px] text-white flex items-center justify-center">B</span>
            <span className="w-8 h-4 bg-emerald-500 rounded-r-full text-[10px] text-white flex items-center justify-center">C</span>
            <span className="text-slate-700 dark:text-slate-300 ml-2">= 일직선 (평각 180°)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 text-center">
            어떤 모양의 삼각형이든 세 각을 모으면 항상 곧은 직선(180°)이 완성됩니다.
          </p>
        </div>
      )}
    </div>
  );
};
