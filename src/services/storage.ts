import { AppSettings, Conversation, WorkspaceItem } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'aether_conversations_v1',
  SETTINGS: 'aether_settings_v1',
  WORKSPACE: 'aether_workspace_v1',
  ACTIVE_ID: 'aether_active_conv_id',
};

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.7,
  responseStyle: 'code-specialist',
  useWebSearch: false,
  voice: 'Kore',
  theme: 'violet-dark',
  activeModel: 'gemini-3.1-flash-lite',
  enableThinking: false,
  thinkingLevel: 'medium',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    const list: Conversation[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations:', err);
  }
}

export function loadActiveConversationId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
}

export function saveActiveConversationId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
  }
}

export function loadWorkspaceItems(): WorkspaceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
    if (!raw) {
      // Seed initial helpful items
      return [
        {
          id: 'welcome-task-1',
          title: 'Explore AETHER Assistant',
          content: 'Test programming, mathematics, or web-grounded research capabilities.',
          type: 'task',
          completed: false,
          createdAt: Date.now(),
        },
        {
          id: 'welcome-note-1',
          title: 'Quick Command Reference',
          content: 'Press ⌘K or Ctrl+K to start a fresh conversation. Toggle Web Search for current live information.',
          type: 'note',
          createdAt: Date.now(),
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWorkspaceItems(items: WorkspaceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save workspace items:', err);
  }
}

export function exportConversationToMarkdown(conv: Conversation): void {
  let md = `# ${conv.title}\n`;
  md += `*Exported from AETHER on ${new Date().toLocaleString()}*\n\n---\n\n`;

  for (const msg of conv.messages) {
    const author = msg.role === 'user' ? '👤 **You**' : '✨ **AETHER**';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    md += `### ${author} (${time})\n\n${msg.content}\n\n`;

    if (msg.groundingChunks && msg.groundingChunks.length > 0) {
      md += `**Sources Grounded:**\n`;
      msg.groundingChunks.forEach((c) => {
        if (c.web?.uri) {
          md += `- [${c.web.title || c.web.uri}](${c.web.uri})\n`;
        }
      });
      md += `\n`;
    }
    md += `---\n\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aether-${conv.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'chat'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllData(conversations: Conversation[], workspace: WorkspaceItem[]): void {
  const exportPayload = {
    app: 'AETHER',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    conversations,
    workspace,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aether-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.WORKSPACE);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
}
