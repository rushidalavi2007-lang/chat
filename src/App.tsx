/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Conversation, 
  Message, 
  AppSettings, 
  WorkspaceItem, 
  ServerHealth, 
  Artifact,
  Attachment,
  ModelOption,
  AppTheme
} from './types';
import { 
  loadConversations, 
  saveConversations, 
  loadSettings, 
  saveSettings, 
  loadWorkspaceItems, 
  saveWorkspaceItems, 
  loadActiveConversationId, 
  saveActiveConversationId,
  exportConversationToMarkdown,
  clearAllLocalData
} from './services/storage';
import { fetchHealth, streamChat } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageItem } from './components/MessageItem';
import { MessageComposer } from './components/MessageComposer';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { ArtifactWorkspace } from './components/ArtifactWorkspace';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { ApiKeyHelpBanner } from './components/ApiKeyHelpBanner';
import { ArrowDown, Loader2, UploadCloud } from 'lucide-react';

export default function App() {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);
  
  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [showKeyBanner, setShowKeyBanner] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Status & Streaming
  const [serverHealth, setServerHealth] = useState<ServerHealth>({
    status: 'connecting',
    aiConfigured: false,
    model: 'gemini-3.1-flash-lite',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedConvs = loadConversations();
    setConversations(loadedConvs);

    const savedActiveId = loadActiveConversationId();
    if (savedActiveId && loadedConvs.some((c) => c.id === savedActiveId)) {
      setActiveId(savedActiveId);
    }

    setWorkspaceItems(loadWorkspaceItems());
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setServerHealth((prev) => ({ ...prev, status: 'connecting' }));
    const health = await fetchHealth();
    setServerHealth(health);
    if (!health.aiConfigured || health.status !== 'healthy') {
      setShowKeyBanner(true);
    } else {
      setShowKeyBanner(false);
    }
  };

  // Keyboard shortcuts (⌘K or Ctrl+K for new conversation, Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewConversation();
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsWorkspaceOpen(false);
        setIsSidebarOpen(false);
        setIsPromptLibraryOpen(false);
        setActiveArtifact(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Save active conversation id
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  // Save settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Switch active model
  const handleSwitchModel = (model: ModelOption) => {
    const updated = { ...settings, activeModel: model };
    setSettings(updated);
    saveSettings(updated);
  };

  // Theme toggle helper
  const handleToggleTheme = () => {
    const nextTheme: AppTheme = settings.theme === 'studio-light' ? 'violet-dark' : 'studio-light';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    saveSettings(updated);
  };

  // Save workspace items
  const handleUpdateWorkspace = (newItems: WorkspaceItem[]) => {
    setWorkspaceItems(newItems);
    saveWorkspaceItems(newItems);
  };

  const handleAddWorkspaceItem = (item: WorkspaceItem) => {
    handleUpdateWorkspace([item, ...workspaceItems]);
  };

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Scroll tracking
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Auto-scroll when messages update
  useEffect(() => {
    if (isGenerating) {
      scrollToBottom('auto');
    }
  }, [activeConversation?.messages]);

  // Actions
  const handleNewConversation = () => {
    setActiveId(null);
    setActiveArtifact(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setActiveArtifact(null);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setActiveArtifact(null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleClearAllData = () => {
    clearAllLocalData();
    setConversations([]);
    setActiveId(null);
    setWorkspaceItems([]);
    setActiveArtifact(null);
  };

  // System instruction based on responseStyle
  const getSystemInstruction = () => {
    let base = `You are AETHER, a world-class personal AI assistant. Tagline: "Your Intelligence. Your Assistant."`;

    if (settings.responseStyle === 'code-specialist') {
      base += `\nYou are operating as a Principal Software Architect. Focus on production-grade code, clean architecture, line-by-line breakdowns, and robust error handling.`;
    } else if (settings.responseStyle === 'stem-researcher') {
      base += `\nYou are operating as a Senior STEM & Mathematical Researcher. Provide rigorous proofs, mathematical derivations, formal logic, and scientific foundations.`;
    } else if (settings.responseStyle === 'executive') {
      base += `\nYou are operating as an Executive Strategy & Product Advisor. Provide structured decision memos, MECE breakdowns, risk/return trade-offs, and actionable roadmaps.`;
    } else if (settings.responseStyle === 'concise') {
      base += `\nKeep answers remarkably concise, bulleted, and to the point. Avoid fluff or unnecessary filler.`;
    } else if (settings.responseStyle === 'detailed') {
      base += `\nProvide thorough, exhaustive conceptual deep dives, mathematical derivations, real-world analogies, and step-by-step logic.`;
    } else {
      base += `\nBalance intuitive conceptual summaries with structured bullet points, clear code examples, and practical guidance.`;
    }

    return base;
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send Message
  const handleSendMessage = async (
    text: string, 
    useWebSearch: boolean, 
    attachments: Attachment[] = []
  ) => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;

    let targetConvId = activeId;
    let currentConv = activeConversation;

    const userMessage: Message = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: text.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `msg-${Date.now()}-a`;
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: settings.activeModel,
    };

    if (!currentConv) {
      targetConvId = `conv-${Date.now()}`;
      const titlePrompt = text.trim() || (attachments[0] ? `Audit: ${attachments[0].name}` : 'New Session');
      const title = titlePrompt.slice(0, 36) + (titlePrompt.length > 36 ? '...' : '');
      const newConv: Conversation = {
        id: targetConvId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage, assistantMessage],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
      currentConv = newConv;
    } else {
      const updatedMessages = [...currentConv.messages, userMessage, assistantMessage];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
            : c
        )
      );
    }

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const historyMessages = currentConv
      ? [...currentConv.messages.filter((m) => !m.isError), userMessage]
      : [userMessage];

    let fullAnswer = '';

    await streamChat({
      messages: historyMessages,
      systemInstruction: getSystemInstruction(),
      useWebSearch,
      temperature: settings.temperature,
      model: settings.activeModel,
      enableThinking: settings.enableThinking,
      thinkingLevel: settings.thinkingLevel,
      signal: controller.signal,
      onChunk: (chunk: string) => {
        fullAnswer += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId ? { ...m, content: fullAnswer } : m
            );
            return { ...c, messages: msgs, updatedAt: Date.now() };
          })
        );
      },
      onGrounding: (chunks) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId ? { ...m, groundingChunks: chunks } : m
            );
            return { ...c, messages: msgs };
          })
        );
      },
      onMetadata: (meta) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, latencyMs: meta.latencyMs, modelUsed: meta.model || m.modelUsed }
                : m
            );
            return { ...c, messages: msgs };
          })
        );
      },
      onError: (errorText: string) => {
        console.error('Chat error:', errorText);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: errorText,
                    isError: true,
                  }
                : m
            );
            return { ...c, messages: msgs, updatedAt: Date.now() };
          })
        );
        setIsGenerating(false);
      },
      onDone: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  // Retry Response
  const handleRetry = () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isGenerating) return;

    const msgs = activeConversation.messages;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    const trimmedMsgs = msgs[msgs.length - 1].role === 'assistant' ? msgs.slice(0, -1) : msgs;

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: trimmedMsgs } : c))
    );

    handleSendMessage(lastUserMsg.content, settings.useWebSearch, lastUserMsg.attachments || []);
  };

  // Drag and drop file support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const loadedAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          loadedAttachments.push({
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            mimeType: file.type,
            data: ev.target?.result as string,
            size: file.size,
          });
          if (loadedAttachments.length === files.length) {
            handleSendMessage(`Please inspect and analyze the attached files: ${file.name}`, settings.useWebSearch, loadedAttachments);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        loadedAttachments.push({
          id: `att-${Date.now()}-${i}`,
          name: file.name,
          mimeType: file.type || 'text/plain',
          data: text,
          size: file.size,
          isText: true,
        });
      }
    }

    if (loadedAttachments.length > 0) {
      handleSendMessage(`Analyze the attached code file: ${files[0].name}`, settings.useWebSearch, loadedAttachments);
    }
  };

  const isLight = settings.theme === 'studio-light';
  const containerThemeClass = isLight
    ? 'theme-light bg-[#f8fafc] text-slate-900'
    : 'bg-[#090a0f] text-slate-100';

  const activeModelDisplay = settings.activeModel === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Flash Lite' : 'Gemini 3.8 Flash';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-screen flex flex-col ${containerThemeClass} font-sans selection:bg-violet-600/25 selection:text-violet-200 relative`}
    >
      {/* Drag & drop overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs border-2 border-dashed border-violet-500/60 flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
          <UploadCloud size={48} className="text-violet-400 mb-3 animate-bounce" />
          <h2 className="text-lg font-bold text-white mb-1">Drop files to analyze with AETHER</h2>
          <p className="text-xs text-slate-400">Supports C++, Python, TypeScript, SQL, Markdown, and Images</p>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onClose={() => setIsSidebarOpen(false)}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        currentTheme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 min-h-screen ${
          isSidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-64 xl:pl-72'
        } ${activeArtifact ? 'lg:pr-[480px] xl:pr-[560px]' : ''}`}
      >
        {/* Top Header Bar */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNewConversation={handleNewConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWorkspace={() => setIsWorkspaceOpen(true)}
          onExportCurrentChat={
            activeConversation
              ? () => exportConversationToMarkdown(activeConversation)
              : undefined
          }
          serverHealth={serverHealth}
          conversationTitle={activeConversation?.title}
          activeModelName={activeModelDisplay}
          currentTheme={settings.theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Missing API Key Guidance Banner */}
        {showKeyBanner && !serverHealth.aiConfigured && (
          <ApiKeyHelpBanner
            onDismiss={() => setShowKeyBanner(false)}
            onRefreshHealth={checkBackendHealth}
          />
        )}

        {/* Chat / Welcome Messages Area */}
        <main
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative flex flex-col justify-between"
        >
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSendMessage(prompt, settings.useWebSearch)}
            />
          ) : (
            <div className="flex-1 pb-36 sm:pb-40 pt-2">
              {activeConversation.messages.map((msg, index) => {
                const isLatest = index === activeConversation.messages.length - 1;
                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isLatest={isLatest}
                    isStreaming={isGenerating && isLatest}
                    voicePreference={settings.voice}
                    onRetry={isLatest && msg.role === 'assistant' ? handleRetry : undefined}
                    onOpenArtifact={(art) => setActiveArtifact(art)}
                  />
                );
              })}
            </div>
          )}

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="fixed bottom-24 right-6 z-20 p-2 rounded-full bg-[var(--bg-surface-elevated)] hover:bg-violet-600 text-white shadow-xl border border-[var(--border-subtle)] transition-all cursor-pointer animate-in fade-in"
              title="Scroll to bottom"
            >
              <ArrowDown size={14} />
            </button>
          )}

          {/* Thinking / Streaming Indicator Overlay */}
          {isGenerating &&
            activeConversation &&
            activeConversation.messages.length > 0 &&
            activeConversation.messages[activeConversation.messages.length - 1].content === '' && (
              <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-violet-400">
                <Loader2 size={13} className="animate-spin" />
                <span className="font-medium">AETHER is thinking...</span>
              </div>
            )}
        </main>

        {/* Floating Message Composer Footer */}
        <footer className="sticky bottom-0 z-20 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/95 to-transparent pt-4">
          <MessageComposer
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
            isGenerating={isGenerating}
            defaultWebSearch={settings.useWebSearch}
            activeModel={settings.activeModel}
            onSwitchModel={handleSwitchModel}
          />
        </footer>
      </div>

      {/* Artifact Workspace Side-Dock */}
      <ArtifactWorkspace
        artifact={activeArtifact}
        onClose={() => setActiveArtifact(null)}
        onAddToWorkspace={handleAddWorkspaceItem}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        conversations={conversations}
        workspaceItems={workspaceItems}
        onClearAllData={handleClearAllData}
      />

      <WorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        items={workspaceItems}
        onUpdateItems={handleUpdateWorkspace}
        onAskAether={(prompt) => handleSendMessage(prompt, settings.useWebSearch)}
      />

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt, settings.useWebSearch)}
      />
    </div>
  );
}
