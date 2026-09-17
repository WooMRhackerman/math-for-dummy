import React from 'react';
import katex from 'katex';

interface KaTeXViewProps {
  content: string;
  className?: string;
}

export const KaTeXView: React.FC<KaTeXViewProps> = ({ content, className = '' }) => {
  // Parse content to support markdown newlines and $...$ / $$...$$ math
  const renderMathAndText = (text: string) => {
    // Regex matches $$...$$ or $...$
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false
          });
          return (
            <div
              key={index}
              className="katex-display my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <pre key={index} className="text-red-500">{part}</pre>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="text-red-500">{part}</span>;
        }
      } else {
        // Plain text with newlines
        return (
          <span key={index} className="whitespace-pre-line leading-relaxed">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className={`break-keep ${className}`}>
      {renderMathAndText(content)}
    </div>
  );
};
