import React, { useState, useMemo } from 'react';
import { BookOpen, Play, Calendar, Layers, Sparkles } from 'lucide-react';
import { Deck, Language, MathDomain } from '../types';
import { isCardDue } from '../services/srs';
import { getTranslation } from '../i18n';

interface DeckListProps {
  decks: Deck[];
  language: Language;
  onSelectDeck: (deck: Deck) => void;
  onImportCurriculum: () => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  decks,
  language,
  onSelectDeck,
  onImportCurriculum
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<MathDomain | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const domains: MathDomain[] = ['수와 연산', '도형', '측정', '규칙성', '자료와 가능성'];

  // Filter decks by selected grade and domain
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      if (selectedGrade !== null && deck.grade !== selectedGrade) {
        return false;
      }
      if (selectedDomain !== null) {
        const hasDomainCard = deck.cards.some((c) => c.domain === selectedDomain);
        if (!hasDomainCard) return false;
      }
      return true;
    });
  }, [decks, selectedGrade, selectedDomain]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            2022 개정 초등 수학 교육과정
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-2">
            매일 5분, 초등 수학 개념 완성
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mb-4 leading-relaxed">
            1학년 수의 기초부터 6학년 비와 비율, 원의 넓이까지 공식과 개념을 스마트 플래시카드로 마스터하세요.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-200" />
              <span>{decks.length}개 덱</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>
                {t('dueToday')}:{' '}
                {decks.reduce((acc, d) => acc + d.cards.filter((c) => isCardDue(c)).length, 0)}장
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Selector Tabs (1~6학년) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            학년별 필터 (Grade)
          </span>
          {selectedGrade !== null && (
            <button
              onClick={() => setSelectedGrade(null)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              전체 보기
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedGrade === null
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('allDecks')}
          </button>
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade === selectedGrade ? null : grade)}
              className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {grade}{t('grade')}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Domain Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            5대 영역별 필터 (5 Domains)
          </span>
          {selectedDomain !== null && (
            <button
              onClick={() => setSelectedDomain(null)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              전체 보기
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedDomain(null)}
            className={`min-h-11 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
              selectedDomain === null
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('allDomains')}
          </button>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom === selectedDomain ? null : dom)}
              className={`min-h-11 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                selectedDomain === dom
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">{t('emptyDecks')}</h3>
          <p className="text-xs text-slate-500 mb-6">
            EBS 기준 2022 개정 초등 수학 1~6학년 공식 교육과정을 한 번에 불러올 수 있습니다.
          </p>
          <button
            onClick={onImportCurriculum}
            className="min-h-11 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {t('importCurriculum')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => {
            const dueCardsCount = deck.cards.filter((c) => isCardDue(c)).length;
            const deckName = language === 'en' ? deck.name.en : deck.name.ko;

            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                      {deck.grade ? `${deck.grade}학년` : '공통'}
                    </span>
                    {dueCardsCount > 0 ? (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                        {dueCardsCount}장 복습 필요
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        복습 완료
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {deckName}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {deck.cards.map((c) => c.unit).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    총 {deck.cards.length}개 카드
                  </span>

                  <button
                    onClick={() => onSelectDeck(deck)}
                    className="min-h-11 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {t('startStudy')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
