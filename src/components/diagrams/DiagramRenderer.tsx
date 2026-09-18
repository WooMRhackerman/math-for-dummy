import React from 'react';
import { DiagramConfig, Language } from '../../types';
import { FractionBarDiagram } from './FractionBarDiagram';
import { AngleProtractorDiagram } from './AngleProtractorDiagram';
import { PolygonAngleDiagram } from './PolygonAngleDiagram';
import { PrismNetDiagram } from './PrismNetDiagram';
import { NumberLineDiagram } from './NumberLineDiagram';
import { ClockDiagram } from './ClockDiagram';

interface DiagramRendererProps {
  config: DiagramConfig;
  language: Language;
  interactive?: boolean;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  config,
  language,
  interactive = true
}) => {
  const isInteractive = config.interactive !== undefined ? config.interactive : interactive;
  const initial = config.initialData || {};

  switch (config.type) {
    case 'fraction-bar':
      return (
        <FractionBarDiagram
          initialNumerator={initial.numerator}
          initialDenominator={initial.denominator}
          comparisonDenominator={initial.comparisonDenominator}
          showComparison={initial.showComparison}
          interactive={isInteractive}
          language={language}
        />
      );

    case 'angle-protractor':
      return (
        <AngleProtractorDiagram
          initialAngle={initial.angle}
          interactive={isInteractive}
          language={language}
        />
      );

    case 'polygon-angle':
      return (
        <PolygonAngleDiagram
          initialSides={initial.sides}
          interactive={isInteractive}
          language={language}
        />
      );

    case 'prism-net':
      return (
        <PrismNetDiagram
          initialFold={initial.fold}
          initialType={initial.solidType}
          interactive={isInteractive}
          language={language}
        />
      );

    case 'number-line':
      return (
        <NumberLineDiagram
          initialStart={initial.start}
          initialStep={initial.step}
          mode={initial.mode}
          interactive={isInteractive}
          language={language}
        />
      );

    case 'clock':
      return (
        <ClockDiagram
          initialHours={initial.hours}
          initialMinutes={initial.minutes}
          interactive={isInteractive}
          language={language}
        />
      );

    default:
      return null;
  }
};
