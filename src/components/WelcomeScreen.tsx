import React from 'react';
import { 
  Lightbulb, 
  Code2, 
  Target, 
  Compass, 
  ArrowUpRight 
} from 'lucide-react';
import { AetherLogo } from './AetherLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

interface SuggestionCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
}

const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    id: 'explore',
    icon: <Lightbulb size={18} className="text-violet-400" />,
    title: 'Explore an Idea',
    description: 'Understand complex topics in simple terms.',
    prompt: 'Explain quantum computing and quantum superposition using an intuitive analogy, and show how it differs fundamentally from classical binary computation.',
  },
  {
    id: 'build',
    icon: <Code2 size={18} className="text-indigo-400" />,
    title: 'Build Something',
    description: 'Write, debug, and improve your code.',
    prompt: 'Write a thread-safe, high-performance LRU Cache in modern C++ (or TypeScript) with clean line-by-line explanations and edge-case handling.',
  },
  {
    id: 'plan',
    icon: <Target size={18} className="text-emerald-400" />,
    title: 'Make a Plan',
    description: 'Turn your goals into actionable steps.',
    prompt: 'Create a structured 4-week execution roadmap to design, build, and deploy a production-grade full-stack web application with milestone gates.',
  },
  {
    id: 'discover',
    icon: <Compass size={18} className="text-amber-400" />,
    title: 'Discover Something New',
    description: 'Explore fresh perspectives and possibilities.',
    prompt: 'What are the most promising breakthroughs at the intersection of AI and biotechnology in 2026? Synthesize the key developments and their implications.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center animate-in fade-in duration-300">
      {/* Abstract Orbital Geometric Intelligence Motif */}
      <div className="mb-8 relative flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
        <AetherLogo size={46} showWordmark={false} className="relative z-10" />
      </div>

      {/* Main Heading and Supporting Editorial Text */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
        Your ideas, in a <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">new light.</span>
      </h1>

      <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-md mx-auto mb-9 leading-relaxed font-normal">
        Think clearly. Explore deeply. Create something extraordinary.
      </p>

      {/* 4 Refined Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {SUGGESTION_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectPrompt(card.prompt)}
            className="group relative p-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-violet-500/40 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer min-h-[105px] shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] border border-[var(--border-subtle)] flex items-center justify-center transition-colors group-hover:bg-violet-500/10">
                  {card.icon}
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-[var(--text-muted)] group-hover:text-violet-400 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-violet-300 transition-colors">
                {card.title}
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-normal mt-1">
              {card.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
