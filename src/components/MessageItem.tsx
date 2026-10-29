import React, { useState } from 'react';
import { 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Globe, 
  AlertCircle,
  ExternalLink,
  FileCode,
  Zap
} from 'lucide-react';
import { Message, VoiceOption, Artifact } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AetherLogo } from './AetherLogo';
import { requestTTS } from '../services/api';

interface MessageItemProps {
  message: Message;
  isLatest: boolean;
  isStreaming?: boolean;
  voicePreference: VoiceOption;
  onRetry?: () => void;
  onOpenArtifact?: (artifact: Artifact) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLatest,
  isStreaming = false,
  voicePreference,
  onRetry,
  onOpenArtifact,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    try {
      const audioDataUrl = await requestTTS(message.content, voicePreference);
      if (audioDataUrl) {
        const audio = new Audio(audioDataUrl);
        setAudioElement(audio);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackSpeechSynthesis();
        await audio.play();
        return;
      }
    } catch {
      // fallback
    }

    fallbackSpeechSynthesis();
  };

  const fallbackSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanSpeech = message.content
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_~]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 1000));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className={`w-full py-5 transition-colors ${isUser ? 'bg-transparent' : 'bg-[var(--bg-surface)]/30'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-3.5 sm:gap-4.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
              <User size={14} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-violet-950/40 border border-violet-500/30 flex items-center justify-center">
              <AetherLogo size={18} showWordmark={false} />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata Row */}
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-[var(--text-primary)]">
              {isUser ? 'You' : 'AETHER'}
            </span>
            <span className="text-[var(--text-muted)] text-[11px]">{formattedTime}</span>

            {!isUser && isStreaming && isLatest && (
              <span className="text-[10px] text-violet-400 font-mono animate-pulse">
                Generating...
              </span>
            )}

            {!isUser && message.latencyMs && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">
                · {(message.latencyMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>

          {/* Attachments preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 max-w-xs"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img src={att.data} alt={att.name} className="w-7 h-7 rounded object-cover" />
                  ) : (
                    <FileCode size={15} className="text-violet-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-200 truncate">{att.name}</div>
                    <div className="text-[10px] text-slate-500">{(att.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message Content */}
          {message.isError ? (
            <div className="p-3 my-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{message.content}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Retry request</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-primary)] leading-relaxed break-words">
              {isUser ? (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] whitespace-pre-wrap inline-block max-w-full">
                  {message.content}
                </div>
              ) : (
                <>
                  <MarkdownRenderer
                    content={message.content}
                    onOpenArtifact={onOpenArtifact}
                  />

                  {isStreaming && isLatest && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-violet-400 animate-pulse align-middle" />
                  )}
                </>
              )}
            </div>
          )}

          {/* Web Grounding Citations (Quiet unboxed links) */}
          {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-3.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5 text-[11px] font-medium">
                <Globe size={12} className="text-violet-400" />
                <span>Sources</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {message.groundingChunks.map((chunk, i) => {
                  const url = chunk.web?.uri || chunk.maps?.uri;
                  const title = chunk.web?.title || chunk.maps?.title || url;
                  if (!url) return null;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                      title={url}
                    >
                      <span className="truncate">{title}</span>
                      <ExternalLink size={10} className="shrink-0 text-[var(--text-muted)]" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          {!isUser && !message.isError && message.content && (
            <div className="mt-2.5 flex items-center gap-1 text-[var(--text-muted)]">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>

              <button
                onClick={handleToggleAudio}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isPlayingAudio ? 'text-violet-400 bg-violet-500/20' : 'hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
                }`}
                title={isPlayingAudio ? 'Stop speaking' : 'Read aloud'}
              >
                {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              {onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1.5 rounded-md hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
                  title="Retry generation"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
