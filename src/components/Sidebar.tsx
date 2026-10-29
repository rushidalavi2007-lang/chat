import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Pin, 
  PinOff, 
  FileDown, 
  Sliders, 
  CheckSquare, 
  X, 
  Check, 
  PanelLeftClose, 
  PanelLeft,
  Sun,
  Moon,
  UserCheck
} from 'lucide-react';
import { Conversation, AppTheme } from '../types';
import { AetherLogo } from './AetherLogo';
import { exportConversationToMarkdown } from '../services/storage';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean; // mobile drawer state
  isCollapsed: boolean; // desktop collapsed state
  onToggleCollapse: () => void;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onOpenSettings: () => void;
  onOpenWorkspace: () => void;
  currentTheme: AppTheme;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  onOpenSettings,
  onOpenWorkspace,
  currentTheme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLElement>(null);

  // Close contextual action menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuOpenId && !(e.target as HTMLElement).closest('.conversation-menu-container')) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpenId]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const groups: { [key: string]: Conversation[] } = {
    'Pinned': [],
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': [],
  };

  filtered.forEach((conv) => {
    if (conv.pinned) {
      groups['Pinned'].push(conv);
      return;
    }

    const diff = now - conv.updatedAt;
    if (diff < ONE_DAY) {
      groups['Today'].push(conv);
    } else if (diff < 2 * ONE_DAY) {
      groups['Yesterday'].push(conv);
    } else if (diff < 7 * ONE_DAY) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups['Older'].push(conv);
    }
  });

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-64 xl:w-72'}`}
      >
        {/* Top Header */}
        <div className="h-14 px-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <AetherLogo size={24} showWordmark={true} showTagline={false} />
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeft size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 shrink-0">
          {!isCollapsed ? (
            <button
              onClick={() => {
                onNewConversation();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--border-subtle)] hover:border-violet-500/40 text-[var(--text-primary)] text-xs font-semibold transition-all duration-150 cursor-pointer group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span>New Chat</span>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 dark:bg-black/40 border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                ⌘K
              </kbd>
            </button>
          ) : (
            <button
              onClick={onNewConversation}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-violet-600/20 border border-[var(--border-subtle)] text-violet-400 hover:text-violet-200 transition-colors cursor-pointer"
              title="New Chat (⌘K)"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Search Input (visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-6 py-1.5 bg-white/[0.03] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-violet-500/40 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {!isCollapsed ? (
            conversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-[var(--text-muted)]">
                <MessageSquare size={20} className="mx-auto mb-2 opacity-30 text-violet-400" />
                No conversation history yet.
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                No matching chats.
              </div>
            ) : (
              Object.entries(groups).map(([groupTitle, list]) => {
                if (list.length === 0) return null;

                return (
                  <div key={groupTitle} className="space-y-0.5">
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)] px-2.5 py-1">
                      {groupTitle}
                    </div>

                    {list.map((conv) => {
                      const isActive = conv.id === activeId;
                      const isEditing = conv.id === editingId;
                      const isMenuOpen = conv.id === menuOpenId;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-violet-600/10 text-[var(--text-primary)] font-medium border-l-2 border-violet-400'
                              : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                autoFocus
                                className="flex-1 bg-[var(--bg-surface-elevated)] border border-violet-500/50 rounded px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none"
                              />
                              <button
                                onClick={(e) => handleSaveRename(conv.id, e)}
                                className="p-1 text-emerald-400 hover:text-emerald-300"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                                <MessageSquare
                                  size={13}
                                  className={isActive ? 'text-violet-400 shrink-0' : 'text-[var(--text-muted)] shrink-0'}
                                />
                                <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                              </div>

                              {/* Contextual More Menu */}
                              <div className="relative conversation-menu-container">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(isMenuOpen ? null : conv.id);
                                  }}
                                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Chat options"
                                >
                                  <MoreVertical size={13} />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-6 z-50 w-36 py-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-xl text-xs text-[var(--text-primary)] animate-in fade-in zoom-in-95"
                                  >
                                    <button
                                      onClick={() => {
                                        onTogglePin(conv.id);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.05] text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                      {conv.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                                      <span>{conv.pinned ? 'Unpin' : 'Pin'}</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleStartRename(conv, e)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.05] text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                      <Edit2 size={12} />
                                      <span>Rename</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        exportConversationToMarkdown(conv);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.05] text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                      <FileDown size={12} />
                                      <span>Export MD</span>
                                    </button>
                                    <div className="my-1 border-t border-[var(--border-subtle)]" />
                                    <button
                                      onClick={() => {
                                        onDeleteConversation(conv.id);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-left text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 size={12} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )
          ) : (
            /* Collapsed icon rail */
            <div className="flex flex-col items-center gap-2 py-2">
              {conversations.slice(0, 10).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    conv.id === activeId
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
                  }`}
                  title={conv.title}
                >
                  <MessageSquare size={14} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Utility Bar */}
        <div className="p-2 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-sidebar)]">
          {!isCollapsed ? (
            <div className="space-y-1">
              <button
                onClick={onOpenWorkspace}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <CheckSquare size={15} className="text-emerald-400 shrink-0" />
                <span className="truncate">Productivity Workspace</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Sliders size={15} className="text-violet-400 shrink-0" />
                <span className="truncate">Preferences & Engine</span>
              </button>

              <div className="pt-2 px-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <UserCheck size={13} className="text-emerald-400" />
                  <span className="truncate">Local Session</span>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                  title="Toggle Light/Dark Theme"
                >
                  {currentTheme === 'studio-light' ? <Sun size={13} className="text-amber-500" /> : <Moon size={13} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={onOpenWorkspace}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-emerald-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Productivity Workspace"
              >
                <CheckSquare size={16} />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-violet-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Settings"
              >
                <Sliders size={16} />
              </button>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {currentTheme === 'studio-light' ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
