import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Code2, 
  Layers, 
  Calculator, 
  CheckSquare, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';
import { PromptTemplate } from '../types';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

const CURATED_PROMPTS: PromptTemplate[] = [
  {
    id: 'p-cpp-audit',
    title: 'C++ Code Concurrency & Memory Audit',
    category: 'Engineering',
    description: 'Review modern C++ code for race conditions, memory leaks, and RAII safety.',
    prompt: 'Review the following C++ code for thread safety, potential memory leaks, and RAII compliance. Provide an optimized, fixed version with line-by-line justification:\n\n```cpp\n// Paste C++ code here\n```',
    tags: ['C++', 'Concurrency', 'Memory Safety'],
  },
  {
    id: 'p-clean-arch',
    title: 'Refactor to Clean Architecture / Hexagonal',
    category: 'Architecture',
    description: 'Separate domain logic, ports, and adapters for maintainable software.',
    prompt: 'Analyze this codebase/module and outline how to refactor it into Clean Hexagonal Architecture. Clearly separate Domain Entities, Use Cases, Repositories, and Drivers:\n\n```typescript\n// Paste code here\n```',
    tags: ['Architecture', 'Refactoring', 'Design Patterns'],
  },
  {
    id: 'p-system-design',
    title: 'Distributed Rate Limiter Design',
    category: 'Architecture',
    description: 'Architecture blueprint for high-throughput distributed rate limiting.',
    prompt: 'Design a distributed rate limiter that handles 500,000 requests/second with low latency. Compare the Token Bucket, Leaky Bucket, and Sliding Window Counter algorithms. Detail Redis cluster usage and edge case handling.',
    tags: ['System Design', 'Redis', 'High Availability'],
  },
  {
    id: 'p-bayes-math',
    title: 'Rigorous Mathematical Derivation',
    category: 'STEM & Math',
    description: 'Step-by-step mathematical proof with intuition and boundary conditions.',
    prompt: 'Provide a formal mathematical derivation of Bayes\' Rule from conditional probability axioms. Walk through the derivation step-by-step, explain the intuitive meaning of the prior and posterior, and show a practical calculation.',
    tags: ['Mathematics', 'Probability', 'Proof'],
  },
  {
    id: 'p-dijkstra-proof',
    title: 'Graph Algorithm Invariance & Big-O Proof',
    category: 'STEM & Math',
    description: 'Proof of correctness using loop invariants and time-complexity breakdown.',
    prompt: 'Prove the correctness of Dijkstra\'s algorithm using loop invariants. Explain why it fails with negative edge weights, and contrast its complexity using a binary heap vs a Fibonacci heap.',
    tags: ['Algorithms', 'Graphs', 'Big-O'],
  },
  {
    id: 'p-sql-tune',
    title: 'PostgreSQL Query Plan & Index Tuning',
    category: 'Engineering',
    description: 'Analyze EXPLAIN ANALYZE output and suggest index strategies.',
    prompt: 'Here is a slow SQL query and its EXPLAIN ANALYZE output. Analyze why sequential scans are happening, recommend B-tree or GiST indexing, and rewrite the query for sub-10ms latency:\n\n```sql\n-- Paste query here\n```',
    tags: ['SQL', 'PostgreSQL', 'Performance'],
  },
  {
    id: 'p-exec-memo',
    title: 'Executive Decision Memo (Amazon 6-Pager style)',
    category: 'Writing',
    description: 'Draft a crisp, persuasive decision memo with metrics and trade-offs.',
    prompt: 'Draft an executive decision memo proposing an engineering migration to modern cloud-native microservices. Structure it with: 1. Context, 2. The Core Problem, 3. Proposed Solution & Architecture, 4. Strategic Trade-offs & Risks, 5. Projected ROI & Metrics.',
    tags: ['Executive', 'Strategy', 'Proposal'],
  },
  {
    id: 'p-sprint-schedules',
    title: '30-Day Engineering Sprint & Milestone Breakdown',
    category: 'Productivity',
    description: 'Turn an ambitious project goal into a crisp, risk-mitigated schedule.',
    prompt: 'I want to build and launch an AI-powered developer tool. Create a structured 4-week sprint schedule with clear weekly deliverables, testing checkpoints, deployment gates, and contingency buffers.',
    tags: ['Sprint', 'Planning', 'Checklist'],
  },
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Engineering', 'Architecture', 'STEM & Math', 'Productivity', 'Writing'];

  const filtered = CURATED_PROMPTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Engineering':
        return <Code2 size={16} className="text-violet-400" />;
      case 'Architecture':
        return <Layers size={16} className="text-cyan-400" />;
      case 'STEM & Math':
        return <Calculator size={16} className="text-fuchsia-400" />;
      case 'Productivity':
        return <CheckSquare size={16} className="text-emerald-400" />;
      case 'Writing':
        return <BookOpen size={16} className="text-amber-400" />;
      default:
        return <Sparkles size={16} className="text-violet-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0e0f1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141525]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Curated Engineering & STEM Prompt Library</h2>
              <p className="text-xs text-slate-400">Production-grade prompt blueprints for architecture, math, and code audits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#10111d] space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or language (e.g. C++, Redis, Bayes, Clean Architecture)..."
              className="w-full pl-9 pr-3 py-2 bg-[#0c0d16] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching prompts found. Try a different search keyword.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectPrompt(item.prompt);
                  onClose();
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 transition-all flex items-start justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-violet-500/10 transition-colors mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-200 transition-colors truncate">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs text-violet-400 group-hover:translate-x-1 transition-transform pt-1">
                  <span className="hidden sm:inline font-medium">Use Prompt</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#141525] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
