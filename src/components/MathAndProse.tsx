'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

export function MathFormula({
  latex,
  displayMode = false,
}: {
  latex: string;
  displayMode?: boolean;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Parses lightweight inline markdown: $latex$, `code`, and **bold** cleanly into React nodes.
 */
export function RichText({ text }: { text: string }) {
  const tokens = useMemo(() => {
    const parts: Array<{ type: 'text' | 'math' | 'code' | 'bold'; value: string }> = [];
    // Order matters: $...$, `...`, **...**
    const regex = /(\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith('$')) {
        parts.push({ type: 'math', value: raw.slice(1, -1) });
      } else if (raw.startsWith('`')) {
        parts.push({ type: 'code', value: raw.slice(1, -1) });
      } else if (raw.startsWith('**')) {
        parts.push({ type: 'bold', value: raw.slice(2, -2) });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }
    return parts;
  }, [text]);

  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.type === 'math') return <MathFormula key={i} latex={tok.value} />;
        if (tok.type === 'code') {
          return (
            <code key={i} className="inline-code">
              {tok.value}
            </code>
          );
        }
        if (tok.type === 'bold') return <strong key={i}>{tok.value}</strong>;
        return <React.Fragment key={i}>{tok.value}</React.Fragment>;
      })}
    </>
  );
}
