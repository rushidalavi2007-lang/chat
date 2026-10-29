export type Role = 'user' | 'assistant';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 or text content
  size: number;
  isText?: boolean;
}

export interface Artifact {
  id: string;
  title: string;
  language: string;
  content: string;
  type: 'code' | 'web' | 'markdown' | 'svg';
  sourceMessageId?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  groundingChunks?: GroundingChunk[];
  attachments?: Attachment[];
  latencyMs?: number;
  modelUsed?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  pinned?: boolean;
  category?: string;
}

export type ResponseStyle = 'balanced' | 'code-specialist' | 'concise' | 'detailed' | 'stem-researcher' | 'executive';
export type AppTheme = 'violet-dark' | 'cyber-obsidian' | 'velvet-twilight' | 'studio-light';
export type VoiceOption = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
export type ModelOption = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
export type ThinkingLevelOption = 'low' | 'medium' | 'high';

export interface AppSettings {
  temperature: number;
  responseStyle: ResponseStyle;
  useWebSearch: boolean;
  voice: VoiceOption;
  theme: AppTheme;
  activeModel: ModelOption;
  enableThinking: boolean;
  thinkingLevel: ThinkingLevelOption;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task';
  completed?: boolean;
  createdAt: number;
}

export interface ServerHealth {
  status: 'healthy' | 'unhealthy' | 'connecting';
  aiConfigured: boolean;
  model: string;
  timestamp?: string;
  error?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Engineering' | 'STEM & Math' | 'Architecture' | 'Productivity' | 'Writing';
  description: string;
  prompt: string;
  tags: string[];
}
