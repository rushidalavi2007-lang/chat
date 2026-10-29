import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy, Terminal, ExternalLink } from 'lucide-react';
import { Artifact } from '../types';

interface MarkdownRendererProps {
  content: string;
  onOpenArtifact?: (artifact: Artifact) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onOpenArtifact }) => {
  return (
    <div className="markdown-body">
      {renderFormattedBlocks(content, onOpenArtifact)}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
  onOpenArtifact?: (artifact: Artifact) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, onOpenArtifact }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanLang = language.trim().toLowerCase() || 'text';
  const lineCount = code.split('\n').length;

  const handleArtifactClick = () => {
    if (onOpenArtifact) {
      onOpenArtifact({
        id: `art-${Date.now()}`,
        title: `${cleanLang.toUpperCase()} Snippet`,
        language: cleanLang,
        content: code,
        type: cleanLang === 'html' || cleanLang === 'svg' ? 'web' : 'code',
      });
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0b0d14] group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.02] border-b border-white/[0.06] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-violet-400" />
          <span className="font-mono uppercase font-semibold text-[11px] tracking-wider text-violet-300">
            {cleanLang}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Open in Canvas / Artifact Viewer */}
          {onOpenArtifact && lineCount > 2 && (
            <button
              onClick={handleArtifactClick}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-violet-300 hover:text-white hover:bg-violet-500/10 transition-colors text-xs cursor-pointer"
              title="Open in split-screen Artifact Workspace"
            >
              <ExternalLink size={11} />
              <span className="text-[11px]">Canvas</span>
            </button>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors text-xs cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <pre className="!m-0 !p-4 !bg-[#090b10] overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Splits markdown text into markdown chunks and code blocks
function renderFormattedBlocks(markdownText: string, onOpenArtifact?: (artifact: Artifact) => void) {
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdownText)) !== null) {
    const textBefore = markdownText.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      const html = marked.parse(textBefore, { breaks: true, gfm: true }) as string;
      elements.push(
        <div
          key={`md-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    const language = match[1] || 'text';
    const code = match[2];
    elements.push(
      <CodeBlock
        key={`code-${match.index}`}
        language={language}
        code={code.trimEnd()}
        onOpenArtifact={onOpenArtifact}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < markdownText.length) {
    const textRemaining = markdownText.substring(lastIndex);
    if (textRemaining.trim()) {
      const html = marked.parse(textRemaining, { breaks: true, gfm: true }) as string;
      elements.push(
        <div
          key={`md-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  if (elements.length === 0) {
    const html = marked.parse(markdownText || '', { breaks: true, gfm: true }) as string;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return elements;
}
