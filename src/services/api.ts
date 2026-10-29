import { GroundingChunk, Message, ServerHealth, VoiceOption, ModelOption, ThinkingLevelOption } from '../types';

export async function fetchHealth(): Promise<ServerHealth> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check failed with HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      status: 'healthy',
      aiConfigured: Boolean(data.aiConfigured),
      model: data.model || 'gemini-3.8-flash',
      timestamp: data.timestamp,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      status: 'unhealthy',
      aiConfigured: false,
      model: 'gemini-3.1-flash-lite',
      error: message,
    };
  }
}

interface StreamChatParams {
  messages: Message[];
  systemInstruction?: string;
  useWebSearch?: boolean;
  temperature?: number;
  model?: ModelOption;
  enableThinking?: boolean;
  thinkingLevel?: ThinkingLevelOption;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onGrounding?: (chunks: GroundingChunk[]) => void;
  onMetadata?: (meta: { latencyMs?: number; model?: string }) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function streamChat({
  messages,
  systemInstruction,
  useWebSearch = false,
  temperature = 0.7,
  model = 'gemini-3.1-flash-lite',
  enableThinking = false,
  thinkingLevel = 'medium',
  signal,
  onChunk,
  onGrounding,
  onMetadata,
  onError,
  onDone,
}: StreamChatParams): Promise<void> {
  try {
    const payloadMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments?.map((a) => ({
        name: a.name,
        mimeType: a.mimeType,
        data: a.data,
        isText: a.isText,
      })),
    }));

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: payloadMessages,
        systemInstruction,
        useWebSearch,
        temperature,
        model,
        enableThinking,
        thinkingLevel,
      }),
      signal,
    });

    if (!response.ok) {
      let errDetail = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errDetail = errJson.error;
      } catch {
        // use default message
      }
      onError(errDetail);
      return;
    }

    if (!response.body) {
      onError('Response body is empty or streaming is unsupported by network.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.slice(5).trim();

        if (jsonStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.text) {
            onChunk(parsed.text);
          }
          if (parsed.groundingChunks && onGrounding) {
            onGrounding(parsed.groundingChunks);
          }
          if ((parsed.latencyMs || parsed.model) && onMetadata) {
            onMetadata({ latencyMs: parsed.latencyMs, model: parsed.model });
          }
        } catch {
          // Ignore incomplete chunk parse errors
        }
      }
    }

    onDone();
  } catch (err: unknown) {
    if (signal?.aborted) {
      onDone();
      return;
    }
    const message = err instanceof Error ? err.message : 'Unknown streaming error';
    onError(message);
  }
}

export async function requestTTS(text: string, voice: VoiceOption = 'Kore'): Promise<string> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        return data.audio;
      }
    }
  } catch (e) {
    console.warn('Backend TTS request failed, using Web Speech API fallback', e);
  }

  return '';
}
