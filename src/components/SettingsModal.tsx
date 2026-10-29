import React from 'react';
import { 
  X, 
  Sliders, 
  Download, 
  Trash2, 
  Key, 
  Check, 
  Globe, 
  ShieldCheck,
  BrainCircuit,
  Cpu
} from 'lucide-react';
import { AppSettings, Conversation, WorkspaceItem, ResponseStyle, VoiceOption, AppTheme, ModelOption, ThinkingLevelOption } from '../types';
import { exportAllData } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  conversations: Conversation[];
  workspaceItems: WorkspaceItem[];
  onClearAllData: () => void;
}

const RESPONSE_STYLES: { id: ResponseStyle; title: string; desc: string }[] = [
  {
    id: 'code-specialist',
    title: 'Staff Software Architect',
    desc: 'Production code, strict typing, edge-case mitigation, and line-by-line breakdowns.',
  },
  {
    id: 'stem-researcher',
    title: 'STEM & Math Researcher',
    desc: 'Rigorous mathematical derivations, formal proofs, scientific foundations.',
  },
  {
    id: 'executive',
    title: 'Executive Strategy & Product',
    desc: 'Strategic decision memos, MECE breakdowns, sprint roadmaps, and trade-off matrices.',
  },
  {
    id: 'balanced',
    title: 'Balanced & Articulate',
    desc: 'Intuitive explanations with clear structure and real-world examples.',
  },
  {
    id: 'concise',
    title: 'Minimalist & Direct',
    desc: 'Bullet points, zero fluff, immediate dense solutions.',
  },
  {
    id: 'detailed',
    title: 'Deep & Exhaustive',
    desc: 'Comprehensive deep dives, conceptual analogies, and detailed architectural context.',
  },
];

const VOICES: { id: VoiceOption; label: string; tone: string }[] = [
  { id: 'Kore', label: 'Kore (Default)', tone: 'Clear, balanced, pleasant' },
  { id: 'Puck', label: 'Puck', tone: 'Engaging, lively, friendly' },
  { id: 'Fenrir', label: 'Fenrir', tone: 'Deep, resonant, authoritative' },
  { id: 'Zephyr', label: 'Zephyr', tone: 'Calm, smooth, gentle' },
  { id: 'Charon', label: 'Charon', tone: 'Warm, low-pitched, thoughtful' },
];

const THEMES: { id: AppTheme; label: string; preview: string }[] = [
  { id: 'violet-dark', label: 'AETHER Violet', preview: 'from-violet-600 to-purple-900' },
  { id: 'cyber-obsidian', label: 'Cyber Obsidian', preview: 'from-zinc-950 to-slate-900' },
  { id: 'velvet-twilight', label: 'Velvet Twilight', preview: 'from-indigo-900 to-purple-950' },
  { id: 'studio-light', label: 'Studio Light', preview: 'from-slate-100 to-slate-200' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  conversations,
  workspaceItems,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  const handleExportBackup = () => {
    exportAllData(conversations, workspaceItems);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all conversation history and workspace items? This cannot be undone.')) {
      onClearAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Assistant Engine & Preferences</h2>
              <p className="text-xs text-[var(--text-secondary)]">Configure AI model, reasoning level, persona, and voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* 1. Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Gemini Model Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, activeModel: 'gemini-3.1-flash-lite' })}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  settings.activeModel === 'gemini-3.1-flash-lite'
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/10'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Cpu size={14} className="text-cyan-400" />
                    <span>Gemini 3.1 Flash Lite</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Fast</span>
                  </div>
                  {settings.activeModel === 'gemini-3.1-flash-lite' && <Check size={14} className="text-violet-400" />}
                </div>
                <p className="text-[11px] text-slate-400">High availability, ultra-responsive 800ms speed for coding, writing, and STEM answers.</p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, activeModel: 'gemini-3.8-flash' })}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  settings.activeModel === 'gemini-3.8-flash'
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/10'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Cpu size={14} className="text-violet-400" />
                    <span>Gemini 3.8 Flash</span>
                  </div>
                  {settings.activeModel === 'gemini-3.8-flash' && <Check size={14} className="text-violet-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Deep STEM reasoning and complex synthesis. (Includes auto-failover to Flash Lite).</p>
              </button>
            </div>
          </div>

          {/* 2. Reasoning & Thinking Config */}
          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-200">
                <BrainCircuit size={16} className="text-violet-400" />
                <span>Extended Reasoning Mode (Thinking Process)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableThinking}
                onChange={(e) => onUpdateSettings({ ...settings, enableThinking: e.target.checked })}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When enabled, AETHER executes deep reasoning loops to verify logic before synthesizing answers.
            </p>

            {settings.enableThinking && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">Reasoning Depth</span>
                <div className="flex gap-1.5">
                  {(['low', 'medium', 'high'] as ThinkingLevelOption[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, thinkingLevel: level })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all cursor-pointer ${
                        settings.thinkingLevel === level
                          ? 'bg-violet-600 text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Persona / Response Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Persona & Response Tone
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RESPONSE_STYLES.map((style) => {
                const isSelected = settings.responseStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => onUpdateSettings({ ...settings, responseStyle: style.id })}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/10'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{style.title}</span>
                      {isSelected && <Check size={14} className="text-violet-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{style.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Temperature */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Temperature Tuning ({settings.temperature.toFixed(2)})
              </label>
              <span className="text-[11px] text-violet-400 font-mono">
                {settings.temperature < 0.3 ? 'Deterministic / Strict' : settings.temperature > 0.8 ? 'Creative / Exploratory' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-violet-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* 5. Web Search Grounding */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Globe size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Default Web Search Grounding</div>
                <div className="text-[11px] text-slate-400">Always ground answers with Google Search for live events & links</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.useWebSearch}
              onChange={(e) => onUpdateSettings({ ...settings, useWebSearch: e.target.checked })}
              className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
            />
          </div>

          {/* 6. Speech Voice */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Gemini Text-to-Speech Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VOICES.map((v) => {
                const isSelected = settings.voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onUpdateSettings({ ...settings, voice: v.id })}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold">{v.label}</span>
                      {isSelected && <Check size={12} className="text-violet-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{v.tone}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Theme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEMES.map((th) => {
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: th.id })}
                    className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-full h-7 rounded-lg bg-gradient-to-r ${th.preview} mb-1.5`} />
                    <span className="text-[11px] font-medium">{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Data Management */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Data Management & Backup
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <Download size={14} className="text-violet-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <button
                onClick={handleClearData}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Clear All Chats & Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-600/30 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
