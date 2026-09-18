import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, ChevronLeft, Award } from 'lucide-react';
import { Flashcard, Language, MathDomain } from '../types';
import { KaTeXView } from './KaTeXView';
import { DiagramRenderer } from './diagrams/DiagramRenderer';
import { getTranslation } from '../i18n';

interface StudyCardProps {
  card: Flashcard;
  currentIndex: number;
  totalCards: number;
  language: Language;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
  onExit: () => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  card,
  currentIndex,
  totalCards,
  language,
  onRate,
  onExit
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      onRate(rating);
    },
    [onRate]
  );

  // Keyboard shortcut listener with Korean IME safety guard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Critical Korean IME guard
      if (e.isComposing || e.keyCode === 229) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRate(1);
        else if (e.key === '2') handleRate(2);
        else if (e.key === '3') handleRate(3);
        else if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped]);

  // Color mapping based on 5 Math Domains with dark mode support
  const getDomainBadgeStyle = (domain: MathDomain) => {
    switch (domain) {
      case '수와 연산':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
      case '도형':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case '측정':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case '규칙성':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
      case '자료와 가능성':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const frontText = language === 'en' && card.front.en ? card.front.en : card.front.ko;
  const backText = language === 'en' && card.back.en ? card.back.en : card.back.ko;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Bar: Progress & Exit */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="min-h-11 min-w-11 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('backToDecks')}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {totalCards}
          </span>
          <div className="w-24 sm:w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[380px] sm:min-h-[420px] perspective-1000 cursor-pointer select-none relative group"
      >
        <div
          className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl p-6 sm:p-8 border shadow-lg transition-transform duration-500 preserve-3d flex flex-col justify-between ${
            isFlipped
              ? 'rotate-y-180 bg-slate-900 dark:bg-black text-white border-slate-800 dark:border-slate-800'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Card Front */}
          {!isFlipped ? (
            <div className="flex flex-col justify-between h-full">
              {/* Card Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDomainBadgeStyle(card.domain)}`}>
                  {card.domain}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.grade}학년 {card.semester}학기 · {card.unit}
                </span>
              </div>

              {/* Front Question Content */}
              <div className="my-auto py-4 text-center overflow-y-auto max-h-[55vh] overscroll-contain pr-1">
                <div className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-2">
                  QUESTION / 개념 질문
                </div>
                <KaTeXView
                  content={frontText}
                  className="text-lg sm:text-2xl font-semibold text-slate-800 dark:text-slate-100"
                />
                {card.diagram && (card.diagram.position === 'front' || card.diagram.position === 'both') && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 w-full text-left"
                  >
                    <DiagramRenderer config={card.diagram} language={language} interactive={true} />
                  </div>
                )}
              </div>

              {/* Bottom Flip Prompt */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <RotateCw className="w-4 h-4" />
                <span>{t('flipCard')} (Space / 탭하여 뒤집기)</span>
              </div>
            </div>
          ) : (
            /* Card Back (Rotated 180deg) */
            <div className="flex flex-col justify-between h-full rotate-y-180">
              {/* Card Meta */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 text-slate-400 text-xs">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Award className="w-4 h-4" />
                  정답 및 핵심 풀이
                </span>
                <span className="text-slate-400">{card.unit}</span>
              </div>

              {/* Back Answer Content */}
              <div className="my-auto py-4 text-center overflow-y-auto max-h-[55vh] overscroll-contain pr-1">
                <KaTeXView
                  content={backText}
                  className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed"
                />
                {card.diagram && (!card.diagram.position || card.diagram.position === 'back' || card.diagram.position === 'both') && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 w-full text-left"
                  >
                    <DiagramRenderer config={card.diagram} language={language} interactive={true} />
                  </div>
                )}
              </div>

              {/* Flip back reminder */}
              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
                <span>Space 키 또는 터치하여 다시 앞면 보기</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action / Rating Bar (Thumb Zone) */}
      <div className="w-full mt-6 pb-safe">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full min-h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-2xl shadow-md text-base transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RotateCw className="w-5 h-5" />
            {t('showAnswer')}
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={() => handleRate(1)}
              className="min-h-12 py-2 px-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 active:scale-95 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 font-bold rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition"
            >
              <span>{t('ratingAgain')}</span>
            </button>
            <button
              onClick={() => handleRate(2)}
              className="min-h-12 py-2 px-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 active:scale-95 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 font-bold rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition"
            >
              <span>{t('ratingHard')}</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="min-h-12 py-2 px-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/70 active:scale-95 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 font-bold rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition"
            >
              <span>{t('ratingGood')}</span>
            </button>
            <button
              onClick={() => handleRate(4)}
              className="min-h-12 py-2 px-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 active:scale-95 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-xs sm:text-sm flex flex-col items-center justify-center transition"
            >
              <span>{t('ratingEasy')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
