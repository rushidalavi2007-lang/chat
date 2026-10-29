import React from 'react';
import { Key, ShieldAlert, ExternalLink, X, RefreshCw } from 'lucide-react';

interface ApiKeyHelpBannerProps {
  onDismiss: () => void;
  onRefreshHealth: () => void;
}

export const ApiKeyHelpBanner: React.FC<ApiKeyHelpBannerProps> = ({
  onDismiss,
  onRefreshHealth,
}) => {
  return (
    <div className="mx-4 my-3 p-4 rounded-2xl bg-[#180f1a] border border-amber-500/40 text-slate-200 shadow-2xl relative animate-in fade-in duration-300">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <ShieldAlert size={20} />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <span>Gemini API Key Required</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Render Environment
            </span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            To generate live answers with Google Gemini models, configure <code className="px-1.5 py-0.5 rounded bg-black/40 text-violet-300 border border-white/10 font-mono text-[11px]">GEMINI_API_KEY</code> as a server-side environment variable. Do not put this key in frontend code or commit it to GitHub:
          </p>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 mb-3">
            <li>Open your AETHER web service in the <strong>Render Dashboard</strong>.</li>
            <li>Open <strong>Environment</strong> and add <strong>GEMINI_API_KEY</strong> with your valid API key as the value.</li>
            <li>Save changes, wait for the service to redeploy, then click <strong>Verify Connection</strong>.</li>
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRefreshHealth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Verify Connection</span>
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Key size={13} className="text-amber-400" />
              <span>Get a Gemini Key</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss warning"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
