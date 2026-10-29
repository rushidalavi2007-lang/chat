import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Code, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { Artifact, WorkspaceItem } from '../types';

interface ArtifactWorkspaceProps {
  artifact: Artifact | null;
  onClose: () => void;
  onAddToWorkspace: (item: WorkspaceItem) => void;
}

export const ArtifactWorkspace: React.FC<ArtifactWorkspaceProps> = ({
  artifact,
  onClose,
  onAddToWorkspace,
}) => {
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedNote, setAddedNote] = useState(false);

  if (!artifact) return null;

  const isPreviewable = 
    artifact.language === 'html' || 
    artifact.language === 'svg' || 
    artifact.language === 'markdown' || 
    artifact.type === 'web';

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      cpp: 'cpp',
      c: 'c',
      python: 'py',
      py: 'py',
      typescript: 'ts',
      ts: 'ts',
      javascript: 'js',
      js: 'js',
      html: 'html',
      css: 'css',
      sql: 'sql',
      json: 'json',
      markdown: 'md',
      md: 'md',
      svg: 'svg',
    };

    const ext = extMap[artifact.language.toLowerCase()] || 'txt';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'artifact'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToWorkspace = () => {
    onAddToWorkspace({
      id: `art-${Date.now()}`,
      title: `Artifact: ${artifact.title}`,
      content: `\`\`\`${artifact.language}\n${artifact.content}\n\`\`\``,
      type: 'note',
      createdAt: Date.now(),
    });
    setAddedNote(true);
    setTimeout(() => setAddedNote(false), 2500);
  };

  // Generate iframe sandbox srcdoc
  const getPreviewSrcDoc = () => {
    if (artifact.language === 'svg') {
      return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f101b;">${artifact.content}</body></html>`;
    }
    if (artifact.language === 'html' || artifact.type === 'web') {
      return artifact.content;
    }
    return '';
  };

  // Split lines for line numbering
  const codeLines = artifact.content.split('\n');

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 z-40 bg-[#0d0e17] border-l border-white/10 flex flex-col shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-full lg:w-4/5' : 'w-full lg:w-[480px] xl:w-[560px]'
      }`}
    >
      {/* Artifact Header */}
      <div className="h-14 px-4 bg-[#121320] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
              {artifact.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="uppercase text-violet-300">{artifact.language}</span>
              <span>•</span>
              <span>{codeLines.length} lines</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand full width'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Close Artifact Pane"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs & Action Toolbar */}
      <div className="px-4 py-2 bg-[#10111d] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'code'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code size={13} />
            <span>Code</span>
          </button>

          {isPreviewable && (
            <button
              onClick={() => setTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'preview'
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye size={13} />
              <span>Live Preview</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add to Workspace Note */}
          <button
            onClick={handleSaveToWorkspace}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Save snippet to Workspace Notes"
          >
            {addedNote ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <PlusCircle size={14} />
            )}
            <span className="hidden sm:inline text-[11px]">{addedNote ? 'Saved!' : 'Save Note'}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Download file"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#0a0b12]">
        {tab === 'code' ? (
          <div className="flex font-mono text-xs leading-relaxed min-w-full">
            {/* Line numbers column */}
            <div className="select-none py-4 px-3 text-right text-slate-600 bg-[#0d0e17] border-r border-white/5 shrink-0">
              {codeLines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <pre className="p-4 overflow-x-auto text-slate-200 flex-1 leading-6 whitespace-pre font-mono">
              <code>{artifact.content}</code>
            </pre>
          </div>
        ) : (
          <div className="w-full h-full p-2 bg-slate-950 flex flex-col">
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Isolated Sandboxed Environment</span>
              <ExternalLink size={12} className="text-violet-400" />
            </div>
            <iframe
              title="Artifact Preview Sandbox"
              srcDoc={getPreviewSrcDoc()}
              sandbox="allow-scripts"
              className="w-full flex-1 rounded-xl border border-white/10 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
