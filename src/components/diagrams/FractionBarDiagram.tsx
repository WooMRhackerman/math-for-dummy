import React, { useState } from 'react';
import { Plus, Minus, Equal, HelpCircle } from 'lucide-react';
import { Language } from '../../types';

interface FractionBarDiagramProps {
  initialNumerator?: number;
  initialDenominator?: number;
  comparisonDenominator?: number;
  interactive?: boolean;
  showComparison?: boolean;
  language?: Language;
}

export const FractionBarDiagram: React.FC<FractionBarDiagramProps> = ({
  initialNumerator = 1,
  initialDenominator = 2,
  comparisonDenominator = 4,
  interactive = true,
  showComparison = true,
  language = 'ko'
}) => {
  const [denom1, setDenom1] = useState(initialDenominator);
  const [num1, setNum1] = useState(initialNumerator);

  const [denom2, setDenom2] = useState(comparisonDenominator);
  const [num2, setNum2] = useState(
    Math.round((initialNumerator / initialDenominator) * comparisonDenominator) || 2
  );

  const val1 = denom1 > 0 ? num1 / denom1 : 0;
  const val2 = denom2 > 0 ? num2 / denom2 : 0;
  const isEquivalent = Math.abs(val1 - val2) < 0.0001;

  const handleBlockClick1 = (index: number) => {
    if (!interactive) return;
    if (num1 === index + 1) {
      setNum1(index);
    } else {
      setNum1(index + 1);
    }
  };

  const handleBlockClick2 = (index: number) => {
    if (!interactive) return;
    if (num2 === index + 1) {
      setNum2(index);
    } else {
      setNum2(index + 1);
    }
  };

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 select-none space-y-4 text-slate-800 dark:text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header & Equivalence Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {language === 'ko' ? '분수 막대 시각화' : 'Fraction Strip Visualizer'}
          </span>
          {showComparison && (
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isEquivalent 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              {isEquivalent ? <Equal className="w-3.5 h-3.5" /> : null}
              {isEquivalent 
                ? (language === 'ko' ? '크기가 같은 분수 (동치분수)' : 'Equivalent Fractions')
                : (language === 'ko' ? '크기가 다름' : 'Different Fractions')}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {interactive && (language === 'ko' ? '조각을 터치하여 색칠하세요' : 'Tap pieces to shade')}
        </div>
      </div>

      {/* Bar 1 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
            <span>{language === 'ko' ? '기준 분수' : 'Fraction 1'}:</span>
            <span className="text-sm font-black bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {num1} / {denom1}
            </span>
          </span>

          {interactive && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">{language === 'ko' ? '등분 수' : 'Parts'}:</span>
              <button
                type="button"
                onClick={() => {
                  if (denom1 > 1) {
                    const nextD = denom1 - 1;
                    setDenom1(nextD);
                    if (num1 > nextD) setNum1(nextD);
                  }
                }}
                disabled={denom1 <= 1}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-4 text-center font-bold text-xs">{denom1}</span>
              <button
                type="button"
                onClick={() => {
                  if (denom1 < 12) setDenom1(denom1 + 1);
                }}
                disabled={denom1 >= 12}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Bar 1 Segments */}
        <div className="w-full h-11 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden flex border-2 border-slate-300 dark:border-slate-700 shadow-inner">
          {Array.from({ length: denom1 }).map((_, i) => {
            const isFilled = i < num1;
            return (
              <div
                key={i}
                onClick={() => handleBlockClick1(i)}
                className={`flex-1 h-full border-r last:border-r-0 border-slate-400/40 flex items-center justify-center font-bold text-xs cursor-pointer transition-all duration-150 ${
                  isFilled
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                1/{denom1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar 2 (Comparison) */}
      {showComparison && (
        <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span>{language === 'ko' ? '비교 분수' : 'Fraction 2'}:</span>
              <span className="text-sm font-black bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {num2} / {denom2}
              </span>
            </span>

            {interactive && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">{language === 'ko' ? '등분 수' : 'Parts'}:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (denom2 > 1) {
                      const nextD = denom2 - 1;
                      setDenom2(nextD);
                      if (num2 > nextD) setNum2(nextD);
                    }
                  }}
                  disabled={denom2 <= 1}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-4 text-center font-bold text-xs">{denom2}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (denom2 < 12) setDenom2(denom2 + 1);
                  }}
                  disabled={denom2 >= 12}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Bar 2 Segments */}
          <div className="w-full h-11 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden flex border-2 border-slate-300 dark:border-slate-700 shadow-inner">
            {Array.from({ length: denom2 }).map((_, i) => {
              const isFilled = i < num2;
              return (
                <div
                  key={i}
                  onClick={() => handleBlockClick2(i)}
                  className={`flex-1 h-full border-r last:border-r-0 border-slate-400/40 flex items-center justify-center font-bold text-xs cursor-pointer transition-all duration-150 ${
                    isFilled
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  1/{denom2}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Math Note */}
      <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-blue-500" />
        <span>
          {language === 'ko'
            ? '전체(1)를 나눈 칸 수(분모)가 달라도, 색칠된 전체 길이(크기)가 같으면 크기가 같은 분수입니다.'
            : 'Fractions are equivalent if the total shaded length is identical, even with different denominators.'}
        </span>
      </div>
    </div>
  );
};
