import React, { useState } from 'react';
import { X, Sparkles, Shapes, Compass, Box, Clock, MoveRight, Layers, HelpCircle } from 'lucide-react';
import { DiagramType, Language } from '../types';
import { DiagramRenderer } from './diagrams/DiagramRenderer';

interface MathLabModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  initialType?: DiagramType;
}

interface LabItem {
  type: DiagramType;
  title: { ko: string; en: string };
  grade: string;
  domain: string;
  icon: React.ComponentType<{ className?: string }>;
  description: { ko: string; en: string };
  learningGoal: { ko: string; en: string };
}

export const MathLabModal: React.FC<MathLabModalProps> = ({
  isOpen,
  language,
  onClose,
  initialType = 'fraction-bar'
}) => {
  const [activeTab, setActiveTab] = useState<DiagramType>(initialType);

  if (!isOpen) return null;

  const labItems: LabItem[] = [
    {
      type: 'fraction-bar',
      title: { ko: '분수 막대와 동치분수', en: 'Fraction Strip & Equivalence' },
      grade: '3~5학년',
      domain: '수와 연산',
      icon: Layers,
      description: {
        ko: '분모가 달라도 색칠된 길이가 같으면 크기가 같은 분수(동치분수)입니다.',
        en: 'Fractions are equivalent if they cover the identical length on the strip.'
      },
      learningGoal: {
        ko: '1/2, 2/4, 4/8 등 크기가 같은 분수의 원리와 분수 덧셈을 시각적으로 이해합니다.',
        en: 'Understand equivalent fractions and visual fraction addition.'
      }
    },
    {
      type: 'angle-protractor',
      title: { ko: '각도기와 각 분류', en: 'Angle Protractor & Types' },
      grade: '3~4학년',
      domain: '도형 / 측정',
      icon: Compass,
      description: {
        ko: '직각(90°)을 기준으로 90°보다 작으면 예각, 90°보다 크고 180°보다 작으면 둔각, 180°는 평각입니다.',
        en: 'Angles smaller than 90° are acute; exactly 90° is right; between 90° and 180° is obtuse.'
      },
      learningGoal: {
        ko: '각도기의 눈금을 읽는 법과 각의 종류(예각, 직각, 둔각, 평각)를 직접 회전하며 체득합니다.',
        en: 'Practice reading protractor degrees and classifying acute, right, obtuse, and straight angles.'
      }
    },
    {
      type: 'polygon-angle',
      title: { ko: '삼각형/사각형 내각의 합', en: 'Interior Angles of Polygons' },
      grade: '4학년',
      domain: '도형',
      icon: Shapes,
      description: {
        ko: '모든 삼각형의 세 각의 합은 항상 180°이며, 사각형은 삼각형 2개로 나누어져 360°가 됩니다.',
        en: 'The interior angles of any triangle always sum to 180°, and a quadrilateral sums to 360°.'
      },
      learningGoal: {
        ko: '꼭짓점을 자유롭게 늘리고 줄여도 세 각의 합은 변함없이 180°임을 확인합니다.',
        en: 'Drag vertices to see that the angle sum remains invariant at 180°.'
      }
    },
    {
      type: 'prism-net',
      title: { ko: '입체도형 전개도 접기', en: '3D Net & Isometric View' },
      grade: '5~6학년',
      domain: '도형',
      icon: Box,
      description: {
        ko: '정육면체와 직육면체는 6개의 면, 12개의 모서리, 8개의 꼭짓점을 가지며, 마주보는 면은 평행합니다.',
        en: 'Cubes and rectangular prisms have 6 faces, 12 edges, and 8 vertices. Opposite faces are parallel.'
      },
      learningGoal: {
        ko: '2D 전개도가 3D 입체 겨냥도로 접히는 과정을 관찰하고 마주보는 면의 위치를 파악합니다.',
        en: 'Observe the folding process from a 2D net into a 3D isometric solid.'
      }
    },
    {
      type: 'number-line',
      title: { ko: '수직선 점프와 소수', en: 'Number Line & Decimals' },
      grade: '1~4학년',
      domain: '수와 연산',
      icon: MoveRight,
      description: {
        ko: '수직선에서 오른쪽으로 갈수록 수가 커지고, 덧셈은 앞으로 뛰고 뺄셈은 뒤로 뜁니다.',
        en: 'Moving right on the number line increases the value. Addition jumps forward.'
      },
      learningGoal: {
        ko: '자연수 덧셈의 원리와 0.1 단위 소수의 크기 감각을 수직선 위에서 익힙니다.',
        en: 'Visualize addition leaps and the placement of decimal increments.'
      }
    },
    {
      type: 'clock',
      title: { ko: '시계 보기와 시간', en: 'Interactive Analog Clock' },
      grade: '1~3학년',
      domain: '측정',
      icon: Clock,
      description: {
        ko: '짧은 바늘(시침)은 시를 나타내고, 긴 바늘(분침)은 5분 단위의 분을 나타냅니다.',
        en: 'The short hand shows hours, and the long hand shows minutes in 5-minute steps.'
      },
      learningGoal: {
        ko: '아날로그 시계의 바늘을 움직이며 몇 시 몇 분을 읽고, 1시간이 60분임을 배웁니다.',
        en: 'Learn to tell time on an analog clock face and understand that 1 hour = 60 minutes.'
      }
    }
  ];

  const currentItem = labItems.find((item) => item.type === activeTab) || labItems[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ko' ? '인터랙티브 수학 실험실' : 'Visual Math Lab'}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {language === 'ko' ? '만지며 배우는 수학' : 'Hands-on Math'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {language === 'ko' ? '도형, 각도, 분수를 손으로 직접 조작해보세요' : 'Touch and manipulate geometric shapes, angles, and fractions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Horizontal Tab Navigation */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {labItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.type === activeTab;
              return (
                <button
                  key={item.type}
                  onClick={() => setActiveTab(item.type)}
                  className={`min-h-10 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'ko' ? item.title.ko : item.title.en}</span>
                </button>
              );
            })}
          </div>

          {/* Educational Concept Guide Card */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-900 dark:text-blue-200">
                  {language === 'ko' ? currentItem.title.ko : currentItem.title.en}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {currentItem.grade}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {currentItem.domain}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {language === 'ko' ? currentItem.description.ko : currentItem.description.en}
            </p>

            <div className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1 pt-1 border-t border-blue-200/50 dark:border-blue-900/50">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ko' ? currentItem.learningGoal.ko : currentItem.learningGoal.en}</span>
            </div>
          </div>

          {/* Interactive Widget Display */}
          <div className="w-full">
            <DiagramRenderer
              config={{
                type: activeTab,
                interactive: true
              }}
              language={language}
              interactive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
