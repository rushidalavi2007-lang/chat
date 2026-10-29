import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  FileText, 
  Download, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { WorkspaceItem } from '../types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WorkspaceItem[];
  onUpdateItems: (items: WorkspaceItem[]) => void;
  onAskAether: (prompt: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  onAskAether,
}) => {
  const [tab, setTab] = useState<'tasks' | 'notes'>('tasks');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => (tab === 'tasks' ? item.type === 'task' : item.type === 'note'));

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: WorkspaceItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      type: tab === 'tasks' ? 'task' : 'note',
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateItems([newItem, ...items]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleToggleTask = (id: string) => {
    onUpdateItems(
      items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((it) => it.id !== id));
  };

  const handleExportWorkspace = () => {
    let md = `# AETHER Productivity Workspace\nExported: ${new Date().toLocaleString()}\n\n`;

    md += `## Tasks & Action Items\n`;
    items
      .filter((i) => i.type === 'task')
      .forEach((t) => {
        md += `- [${t.completed ? 'x' : ' '}] **${t.title}**${t.content ? `: ${t.content}` : ''}\n`;
      });

    md += `\n## Notes & Research Summaries\n`;
    items
      .filter((i) => i.type === 'note')
      .forEach((n) => {
        md += `### ${n.title}\n${n.content}\n\n`;
      });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-workspace-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Productivity Workspace</h2>
              <p className="text-xs text-[var(--text-secondary)]">Manage tasks, study schedules, notes, and project checklists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Subheader Tabs */}
        <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-elevated)]">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                tab === 'tasks'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckSquare size={14} />
              <span>Tasks & Checklists ({items.filter((i) => i.type === 'task').length})</span>
            </button>
            <button
              onClick={() => setTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                tab === 'notes'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={14} />
              <span>Notes & Study Plans ({items.filter((i) => i.type === 'note').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWorkspace}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Export workspace to Markdown"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export MD</span>
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-violet-600/30 cursor-pointer"
            >
              <Plus size={14} />
              <span>{isAdding ? 'Cancel' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <form onSubmit={handleAddItem} className="p-4 bg-[#141624] border-b border-white/10 space-y-3">
            <input
              type="text"
              placeholder={tab === 'tasks' ? 'Task title (e.g. Implement Dijkstra algorithm in C++)' : 'Note title (e.g. Quantum Computing Key Principles)'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 bg-[#0c0d16] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <textarea
              placeholder="Optional details, bullet points, or schedule notes..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#0c0d16] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              >
                Save {tab === 'tasks' ? 'Task' : 'Note'}
              </button>
            </div>
          </form>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Calendar size={32} className="mx-auto mb-2 opacity-30 text-violet-400" />
              No {tab === 'tasks' ? 'tasks' : 'notes'} yet.<br />
              Click &quot;Add Item&quot; or ask AETHER to generate an action plan for you.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/[0.07] border border-white/5 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.type === 'task' ? (
                    <button
                      onClick={() => handleToggleTask(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare size={17} className="text-emerald-400" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                  ) : (
                    <FileText size={17} className="mt-0.5 text-violet-400 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs font-semibold ${
                        item.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.content && (
                      <p className="text-[11px] text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 mt-1.5 inline-block">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      onAskAether(`Help me analyze and make progress on this item: "${item.title}". Context: ${item.content || 'None'}`);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors cursor-pointer"
                    title="Ask AETHER to assist with this item"
                  >
                    <Sparkles size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#141525] flex justify-between items-center text-xs text-slate-400">
          <span>Synced locally across sessions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
