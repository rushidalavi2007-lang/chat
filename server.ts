import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 25mb limit for multimodal file/image attachments
app.use(express.json({ limit: '25mb' }));

// Ignore empty and common template values so health checks do not report a placeholder as configured.
function getConfiguredApiKey(): string | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (/^(MY_GEMINI_API_KEY|replace_with_your_real_gemini_api_key)$/i.test(apiKey)) return null;
  return apiKey;
}

// Helper to get initialized GoogleGenAI client
function getGeminiClient(): { ai: GoogleGenAI | null; error?: string } {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) {
    return {
      ai: null,
      error: "GEMINI_API_KEY is missing or is still a placeholder. Add a valid key in your Render service's Environment settings (or set it in your local .env file)."
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aether-assistant',
        },
      },
    });
    return { ai };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { ai: null, error: `Failed to initialize Gemini client: ${errorMsg}` };
  }
}

// 1. Backend Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const isKeyConfigured = Boolean(getConfiguredApiKey());

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiConfigured: isKeyConfigured,
    model: 'gemini-3.1-flash-lite',
    version: '1.2.0',
    capabilities: {
      streaming: true,
      webSearch: true,
      textToSpeech: true,
      multimodal: true,
      codeArtifacts: true,
      thinkingReasoning: true,
    }
  });
});

// Default system instruction for AETHER
const DEFAULT_SYSTEM_INSTRUCTION = `You are AETHER, a world-class intelligent personal AI assistant and staff-level software architect. Tagline: "Your Intelligence. Your Assistant."
You are deeply knowledgeable, articulate, precise, and helpful across all domains:
- Software engineering & computer science (C++, Python, TypeScript, React, Rust, Go, SQL, architecture, algorithms, debugging)
- Mathematics, physics, chemistry, biology, and advanced STEM reasoning
- Writing, communication, professional documentation, analysis, and strategy
- Personal productivity, task breakdowns, checklists, sprint plans, and schedules

Formatting rules:
- Format all code with markdown code blocks specifying the language name (e.g., \`\`\`cpp, \`\`\`python, \`\`\`typescript, \`\`\`html).
- For complete runnable code, self-contained scripts, or web components, provide clean, idiomatic code with clear comments.
- Structure responses with clean hierarchy, bold key concepts, bullet lists, or tables where appropriate.
- When explaining complex ideas, start with an intuitive summary, provide concrete examples, and offer logical deep dives.
- If asked to debug or critique code, explain the root cause clearly, provide the fixed code, and explain why the fix works.`;

interface MessageInput {
  role: string;
  content: string;
  attachments?: Array<{
    name: string;
    mimeType: string;
    data: string; // base64 or text
    isText?: boolean;
  }>;
}

// Helper to format messages into @google/genai contents
function formatContents(messages: MessageInput[]) {
  return messages.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Handle multimodal attachments if present on user message
    if (m.attachments && m.attachments.length > 0) {
      for (const att of m.attachments) {
        if (att.mimeType && att.mimeType.startsWith('image/') && att.data) {
          // Clean base64 header if present
          const cleanBase64 = att.data.replace(/^data:image\/[a-z]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: cleanBase64,
            },
          });
        } else if (att.data) {
          // Text or code attachment
          parts.push({
            text: `[Attached File: ${att.name}]\n\`\`\`\n${att.data}\n\`\`\`\n`,
          });
        }
      }
    }

    // Main text content
    if (m.content) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: '' });
    }

    return { role, parts };
  });
}

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

// Clean diagnostic error helper
function parseFriendlyError(errorMsg: string): string {
  if (
    errorMsg.includes('RESOURCE_EXHAUSTED') ||
    errorMsg.includes('429') ||
    errorMsg.includes('Quota exceeded') ||
    errorMsg.includes('quota')
  ) {
    return 'The AI model free-tier request quota is temporarily saturated. Please retry in a few moments or switch models in Settings.';
  }

  try {
    const jsonMatch = errorMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        const inner = parsed.error.message;
        if (inner.includes('Quota exceeded') || inner.includes('429') || inner.includes('RESOURCE_EXHAUSTED')) {
          return 'The AI model free-tier request quota is temporarily saturated. Please retry in a moment.';
        }
        return inner;
      }
    }
  } catch {
    // Ignore JSON parse error
  }

  if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('400')) {
    return "The provided GEMINI_API_KEY is invalid. Check the GEMINI_API_KEY value in your Render service Environment settings or local .env file.";
  } else if (errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('403')) {
    return 'Permission denied for Gemini API. Please ensure your API key has appropriate permissions.';
  } else if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
    return 'The model is experiencing temporary high demand. Please retry in a few seconds.';
  }

  return errorMsg;
}

async function generateUnaryWithFailover(
  ai: GoogleGenAI,
  requestedModel: string,
  contents: any,
  baseConfig: Record<string, unknown>
): Promise<{ response: any; model: string }> {
  const modelQueue = [
    requestedModel,
    ...CANDIDATE_MODELS.filter((m) => m !== requestedModel)
  ];

  let lastError: any = null;

  for (const model of modelQueue) {
    try {
      console.log(`[AETHER Chat] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { ...baseConfig },
      });
      return { response, model };
    } catch (err: any) {
      lastError = err;
      const errStr = err?.message || String(err);
      console.warn(`[AETHER Chat] Model ${model} failed: ${errStr.slice(0, 120)}`);

      if (baseConfig.tools) {
        try {
          console.warn(`[AETHER Chat] Retrying ${model} without external tools...`);
          const configNoTools = { ...baseConfig };
          delete configNoTools.tools;
          const response = await ai.models.generateContent({
            model,
            contents,
            config: configNoTools,
          });
          return { response, model };
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }
    }
  }

  throw lastError;
}

async function generateStreamWithFailover(
  ai: GoogleGenAI,
  requestedModel: string,
  contents: any,
  baseConfig: Record<string, unknown>
): Promise<{ stream: AsyncIterable<any>; model: string }> {
  const modelQueue = [
    requestedModel,
    ...CANDIDATE_MODELS.filter((m) => m !== requestedModel)
  ];

  let lastError: any = null;

  for (const model of modelQueue) {
    try {
      console.log(`[AETHER Stream] Trying model: ${model}`);
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: { ...baseConfig },
      });
      return { stream, model };
    } catch (err: any) {
      lastError = err;
      const errStr = err?.message || String(err);
      console.warn(`[AETHER Stream] Model ${model} failed: ${errStr.slice(0, 120)}`);

      if (baseConfig.tools) {
        try {
          console.warn(`[AETHER Stream] Retrying ${model} without external tools...`);
          const configNoTools = { ...baseConfig };
          delete configNoTools.tools;
          const stream = await ai.models.generateContentStream({
            model,
            contents,
            config: configNoTools,
          });
          return { stream, model };
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }
    }
  }

  throw lastError;
}

// 2. Chat API (Unary)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { 
      messages, 
      systemInstruction, 
      useWebSearch, 
      temperature, 
      enableThinking, 
      thinkingLevel = 'medium',
      model = 'gemini-3.1-flash-lite' 
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const hasContent = typeof lastMessage?.content === 'string' && lastMessage.content.trim().length > 0;
    const hasAttachments = Array.isArray(lastMessage?.attachments) && lastMessage.attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      res.status(400).json({ error: 'The latest message cannot be empty.' });
      return;
    }

    const { ai, error: clientError } = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: clientError || 'Gemini API is not configured.',
        code: 'MISSING_API_KEY'
      });
      return;
    }

    const contents = formatContents(messages);

    const config: Record<string, unknown> = {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.7,
    };

    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (enableThinking) {
      config.thinkingConfig = {
        thinkingLevel: thinkingLevel === 'high' ? ThinkingLevel.HIGH : thinkingLevel === 'low' ? ThinkingLevel.LOW : ThinkingLevel.MEDIUM,
      };
    }

    const targetModel = model === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';
    const { response, model: effectiveModel } = await generateUnaryWithFailover(ai, targetModel, contents, config);

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const durationMs = Date.now() - startTime;

    res.json({
      text,
      groundingChunks: groundingChunks || null,
      model: effectiveModel,
      latencyMs: durationMs,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[AETHER Chat Error]:', errorMsg);
    const friendly = parseFriendlyError(errorMsg);
    res.status(500).json({ error: friendly });
  }
});

// 3. Streaming Chat API (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { 
      messages, 
      systemInstruction, 
      useWebSearch, 
      temperature, 
      enableThinking, 
      thinkingLevel = 'medium',
      model = 'gemini-3.1-flash-lite' 
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const hasContent = typeof lastMessage?.content === 'string' && lastMessage.content.trim().length > 0;
    const hasAttachments = Array.isArray(lastMessage?.attachments) && lastMessage.attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      res.status(400).json({ error: 'The latest message cannot be empty.' });
      return;
    }

    const { ai, error: clientError } = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: clientError || 'Gemini API is not configured.',
        code: 'MISSING_API_KEY'
      });
      return;
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const contents = formatContents(messages);

    const config: Record<string, unknown> = {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.7,
    };

    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Thinking config support
    if (enableThinking) {
      config.thinkingConfig = {
        thinkingLevel: thinkingLevel === 'high' ? ThinkingLevel.HIGH : thinkingLevel === 'low' ? ThinkingLevel.LOW : ThinkingLevel.MEDIUM,
      };
    }

    const targetModel = model === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';
    const { stream: streamResponse, model: effectiveModel } = await generateStreamWithFailover(ai, targetModel, contents, config);

    let groundingChunksSent = false;

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      const grounding = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

      const payload: { text?: string; groundingChunks?: unknown; latencyMs?: number; model?: string } = {};
      if (text) {
        payload.text = text;
      }
      if (grounding && !groundingChunksSent) {
        payload.groundingChunks = grounding;
        groundingChunksSent = true;
      }

      if (Object.keys(payload).length > 0) {
        payload.latencyMs = Date.now() - startTime;
        payload.model = effectiveModel;
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    }

    const totalDuration = Date.now() - startTime;
    res.write(`data: ${JSON.stringify({ done: true, latencyMs: totalDuration, model: effectiveModel })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[AETHER Stream Error]:', errorMsg);
    const userFriendly = parseFriendlyError(errorMsg);

    if (!res.headersSent) {
      res.status(500).json({ error: userFriendly });
    } else {
      res.write(`data: ${JSON.stringify({ error: userFriendly })}\n\n`);
      res.end();
    }
  }
});

// 4. Text-to-Speech API
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text parameter is required.' });
      return;
    }

    const { ai, error: clientError } = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: clientError || 'Gemini API is not configured.' });
      return;
    }

    const sanitizedText = text.slice(0, 800);

    const response = await ai.interactions.create({
      model: 'gemini-3.8-flash-lite-tts',
      input: [{
        type: 'user_input',
        content: [{
          type: 'text',
          text: sanitizedText,
          annotations: [{
            type: 'speech_metadata',
            style: 'Speak clearly in a natural, friendly conversational tone.',
          }],
        }],
      }],
      response_format: { type: 'audio' },
      generation_config: {
        speech_config: [{ voice }],
      },
    });

    const base64Audio = response.output_audio?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'Audio data was not returned by the model.' });
      return;
    }

    res.json({
      audio: `data:audio/wav;base64,${base64Audio}`,
      voice,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[AETHER TTS Warning]:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AETHER Server v1.2] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
