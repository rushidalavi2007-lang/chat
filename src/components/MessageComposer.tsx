import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square, 
  Mic, 
  MicOff, 
  Globe, 
  Paperclip, 
  X, 
  FileCode, 
  BookOpen
} from 'lucide-react';
import { Attachment, ModelOption } from '../types';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface MessageComposerProps {
  onSendMessage: (text: string, useWebSearch: boolean, attachments: Attachment[]) => void;
  onStopGeneration: () => void;
  onOpenPromptLibrary: () => void;
  isGenerating: boolean;
  defaultWebSearch?: boolean;
  activeModel: ModelOption;
  onSwitchModel: (model: ModelOption) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  onOpenPromptLibrary,
  isGenerating,
  defaultWebSearch = false,
  activeModel,
  onSwitchModel,
}) => {
  const [input, setInput] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(defaultWebSearch);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setUseWebSearch(defaultWebSearch);
  }, [defaultWebSearch]);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 180)}px`;
    }
  }, [input]);

  // Voice dictation
  const toggleSpeechRecognition = () => {
    const win = window as IWindow;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        setSpeechError(event.error === 'not-allowed' ? 'Microphone permission denied.' : `Voice error: ${event.error}`);
        setIsRecording(false);
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechError('Voice dictation failed to initialize.');
      setIsRecording(false);
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  // File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB.`);
        continue;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${i}`,
              name: file.name,
              mimeType: file.type,
              data: base64,
              size: file.size,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${i}`,
            name: file.name,
            mimeType: file.type || 'text/plain',
            data: text,
            size: file.size,
            isText: true,
          },
        ]);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    onSendMessage(trimmed, useWebSearch, attachments);
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 pt-1">
      {/* Speech error toast */}
      {speechError && (
        <div className="mb-2 p-2 px-3 rounded-lg bg-amber-950/50 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-400 font-bold px-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Floating Composer Shell */}
      <div className="relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus-within:border-[var(--border-focus)] composer-shadow transition-all duration-200 overflow-hidden">
        {/* Attached Files Carousel */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-1 border-b border-[var(--border-subtle)]">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
              >
                {att.mimeType.startsWith('image/') ? (
                  <img src={att.data} alt={att.name} className="w-4 h-4 rounded object-cover" />
                ) : (
                  <FileCode size={13} className="text-violet-400" />
                )}
                <span className="truncate max-w-[130px] sm:max-w-[180px] text-[11px] font-mono">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 ml-0.5 cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Row */}
        <div className="px-3.5 pt-2.5 pb-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Listening to speech...'
                : 'Ask AETHER anything...'
            }
            rows={1}
            className="w-full bg-transparent border-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:ring-0 focus:outline-none resize-none px-0 py-1 min-h-[44px] max-h-[180px] leading-relaxed"
          />
        </div>

        {/* Action Controls Footer Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.py,.cpp,.ts,.js,.json,.sql,.csv,.html"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Attach code, documents, or images"
            >
              <Paperclip size={16} />
            </button>

            {/* Web Search Grounding Toggle */}
            <button
              type="button"
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                useWebSearch
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
              }`}
              title="Search the web for up-to-date sources"
            >
              <Globe size={13} className={useWebSearch ? 'text-violet-400' : ''} />
              <span>Web {useWebSearch ? 'On' : 'Off'}</span>
            </button>

            {/* Prompt Library Button */}
            <button
              type="button"
              onClick={onOpenPromptLibrary}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer hidden sm:inline-flex"
              title="Browse curated engineering and STEM prompts"
            >
              <BookOpen size={13} className="text-amber-400" />
              <span>Prompts</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Voice Dictation */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
              }`}
              title={isRecording ? 'Stop listening' : 'Voice input'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send / Stop Generation Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="w-8 h-8 rounded-xl bg-violet-600/40 hover:bg-violet-600/60 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Stop generation"
              >
                <Square size={13} className="fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!hasContent}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  hasContent
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                    : 'bg-white/[0.04] text-[var(--text-muted)] cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Keyboard Shortcuts Hint */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-[var(--text-muted)] select-none">
        <div className="flex items-center gap-2">
          <span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.04] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono">
              Enter
            </kbd>{' '}
            send
          </span>
          <span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.04] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono">
              Shift + Enter
            </kbd>{' '}
            new line
          </span>
        </div>
        <div className="hidden sm:block font-mono text-[10px]">
          <span>Gemini Intelligence Engine</span>
        </div>
      </div>
    </div>
  );
};
