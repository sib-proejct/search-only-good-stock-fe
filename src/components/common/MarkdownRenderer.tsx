import React, { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper to format inline markdown (bold, italic, inline code, links)
const renderInline = (text: string): React.ReactNode[] => {
  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regex matching **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]\((.*?)\))/g;
  let match: RegExpExecArray | null;

  let keyIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const [, , boldText, italicText, codeText, linkText, linkUrl] = match;

    if (boldText !== undefined) {
      tokens.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
          {renderInline(boldText)}
        </strong>
      );
    } else if (italicText !== undefined) {
      tokens.push(
        <em key={`i-${keyIndex++}`} className="italic">
          {renderInline(italicText)}
        </em>
      );
    } else if (codeText !== undefined) {
      tokens.push(
        <code
          key={`c-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.1] font-mono text-xs text-[#0071E3] dark:text-[#2997FF]"
        >
          {codeText}
        </code>
      );
    } else if (linkText !== undefined && linkUrl !== undefined) {
      tokens.push(
        <a
          key={`l-${keyIndex++}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0071E3] dark:text-[#2997FF] underline hover:opacity-80"
        >
          {linkText}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    const flushList = (key: number) => {
      if (!currentList) return;
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc list-inside space-y-1 my-1.5 pl-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal list-inside space-y-1 my-1.5 pl-1">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, index) => {
      // Code block handling ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] font-mono text-xs overflow-x-auto my-2 border border-black/[0.06] dark:border-white/[0.08]"
            >
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          flushList(index);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Check unordered list (- or *)
      const ulMatch = line.match(/^[\s]*[-*]\s+(.*)$/);
      if (ulMatch) {
        if (currentList && currentList.type !== 'ul') {
          flushList(index);
        }
        if (!currentList) {
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(ulMatch[1]);
        return;
      }

      // Check ordered list (1. 2. etc)
      const olMatch = line.match(/^[\s]*\d+\.\s+(.*)$/);
      if (olMatch) {
        if (currentList && currentList.type !== 'ol') {
          flushList(index);
        }
        if (!currentList) {
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(olMatch[1]);
        return;
      }

      // If line is not a list item, flush existing list
      flushList(index);

      // Check headings (#, ##, ###)
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} className="text-base sm:text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-3 mb-1.5">
            {renderInline(line.slice(2))}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-2.5 mb-1">
            {renderInline(line.slice(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-xs sm:text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-2 mb-1">
            {renderInline(line.slice(4))}
          </h3>
        );
        return;
      }

      // Check blockquote (> )
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`bq-${index}`}
            className="border-l-[3px] border-[#0071E3] dark:border-[#2997FF] pl-3 py-1 my-1.5 text-[#6E6E73] dark:text-[#A1A1A6] italic bg-black/[0.02] dark:bg-white/[0.02] rounded-r-lg"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
        return;
      }

      // Blank line handling
      if (!line.trim()) {
        elements.push(<div key={`blank-${index}`} className="h-1.5" />);
        return;
      }

      // Regular paragraph line
      elements.push(
        <p key={`p-${index}`} className="leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });

    flushList(lines.length);

    return elements;
  }, [content]);

  return (
    <div className={`space-y-1 text-[#1D1D1F] dark:text-[#F5F5F7] text-xs sm:text-sm font-medium ${className}`}>
      {renderedElements}
    </div>
  );
};
