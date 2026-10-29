import React from 'react';
import { 
  Menu, 
  Sliders, 
  CheckSquare, 
  Share2, 
  Plus, 
  WifiOff, 
  PanelLeft, 
  PanelLeftClose,
  Sun,
  Moon
} from 'lucide-react';
import { ServerHealth, AppTheme } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  onOpenWorkspace: () => void;
  onExportCurrentChat?: () => void;
  serverHealth: ServerHealth;
  conversationTitle?: string;
  activeModelName?: string;
  currentTheme: AppTheme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleCollapse,
  onNewConversation,
  onOpenSettings,
  onOpenWorkspace,
  onExportCurrentChat,
  serverHealth,
  conversationTitle,
  activeModelName = 'gemini-3.8-flash',
  currentTheme,
  onToggleTheme,
}) => {
  const isHealthy = serverHealth.status === 'healthy' && serverHealth.aiConfigured;

  return (
    <header className="sticky top-0 z-30 h-14 backdrop-blur-md border-b border-[var(--border-subtle)] px-3 sm:px-4 flex items-center justify-between shrink-0 bg-[var(--bg-base)]/85 transition-colors">
      {/* Left: Mobile Drawer Trigger + Desktop Rail Toggle + Conversation Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop sidebar rail toggle button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 -ml-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {conversationTitle || 'New Conversation'}
          </span>

          <span className="text-[var(--text-muted)] hidden sm:inline select-none">/</span>

          {/* Model indicator */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-violet-400' : 'bg-amber-400'}`} />
            <span>{activeModelName}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Quick New Chat */}
        <button
          onClick={onNewConversation}
          className="p-1.5 px-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="New Conversation (⌘K)"
        >
          <Plus size={14} className="text-violet-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Workspace Trigger */}
        <button
          onClick={onOpenWorkspace}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
          title="Productivity Workspace (Tasks & Notes)"
        >
          <CheckSquare size={16} />
        </button>

        {/* Theme Quick Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
          title="Toggle Dark / Light Theme"
        >
          {currentTheme === 'studio-light' ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
        </button>

        {/* Export Current Chat (if active) */}
        {onExportCurrentChat && (
          <button
            onClick={onExportCurrentChat}
            className="hidden sm:flex p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Export conversation as Markdown"
          >
            <Share2 size={16} />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-violet-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
          title="Preferences & Engine Settings"
        >
          <Sliders size={16} />
        </button>

        {/* Status Dot */}
        <div
          className="ml-1 flex items-center"
          title={isHealthy ? 'Gemini Engine connected and verified' : 'Backend connecting or missing key'}
        >
          {isHealthy ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400/80 ring-2 ring-emerald-500/20" />
          ) : (
            <WifiOff size={13} className="text-rose-400" />
          )}
        </div>
      </div>
    </header>
  );
};
