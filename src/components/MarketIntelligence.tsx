import React, { useState } from 'react';
import { 
  TrendingUp, Search, RefreshCw, Sparkles, Users, Award, 
  HelpCircle, ChevronRight, BarChart3, AlertCircle, Plus, Compass, Globe, MessageSquareQuote
} from 'lucide-react';
import { SwapnoAppState } from '../types';

interface MarketIntelligenceProps {
  state: SwapnoAppState;
  onRunResearch: () => void;
  onAddKeyword?: (kw: string) => void;
}

export function MarketIntelligence({ state, onRunResearch, onAddKeyword }: MarketIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('');

  const triggerResearch = () => {
    setLoading(true);
    setTimeout(() => {
      onRunResearch();
      setLoading(false);
    }, 1200);
  };

  const handleAddKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword.trim()) return;
    if (onAddKeyword) {
      onAddKeyword(customKeyword);
    }
    setCustomKeyword('');
  };

  // Pre-configured, high-density structured analysis cards answering: What Changed? Why It Matters? What Should I Do?
  const researchSections = [
    {
      id: "market",
      title: "Market Analysis",
      icon: <Globe className="w-5 h-5 text-orange-500" />,
      whatChanged: "Demand for zero-overhead procedural workflows surged by 38% among micro-agencies and local Bangladeshi business operators.",
      whyItMatters: "Agencies are facing sharp margin pressure. They are dropping expensive bespoke content writers for cohesive automation suites that keep original brand compliance.",
      whatTodo: "Position your solutions strictly as a complete '10-hour-a-week growth companion' rather than just a generalized copywriting assistant."
    },
    {
      id: "competitors",
      title: "Competitor Analysis",
      icon: <Users className="w-5 h-5 text-orange-500" />,
      whatChanged: "Top competitors began embedding hardcoded template galleries, but their outputs look generic and feel repetitive.",
      whyItMatters: "Standard AI template spamming is causing prompt fatigue. Customers instantly recognize low-effort, robot-generated copy.",
      whatTodo: "Highlight Swapno's bespoke Brand Memory Nodes to prove your posts adapt dynamically to authentic brand history, standing out from robotic template structures."
    },
    {
      id: "trends",
      title: "Trends & Topics",
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      whatChanged: "Organic reach for video mockups and custom visual bento grids is yielding 3x higher engagement than plain text or stock photos.",
      whyItMatters: "Social platforms are dampening raw external links, choosing to prioritize beautiful high-retention media sliders.",
      whatTodo: "Leverage Content Studio to pair every campaign with custom generated abstract graphic mockups, and bundle multiple files."
    },
    {
      id: "keywords",
      title: "Keywords & Social SEO",
      icon: <Compass className="w-5 h-5 text-orange-500" />,
      whatChanged: "Search queries like 'Lean team automation' and 'Brand voice guidelines generator' saw a 54% month-over-month spike in volume.",
      whyItMatters: "This confirms that business operators are actively searching for tools to automate workflow overhead rather than simply learning prompts.",
      whatTodo: "Incorporate keyword tags like #AutonomousWorkflows, #LeanOverhead, and #BrandVoice consistently into post captions and metadata."
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Panel with research trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-950 p-6 border border-neutral-900 rounded-2xl gap-4">
        <div>
          <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">
            Research Radar
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Evaluating market gaps, active social search trends, competitor vectors, and keywords.
          </p>
        </div>
        <button
          onClick={triggerResearch}
          disabled={loading}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-600/15 disabled:bg-neutral-850 disabled:text-neutral-500"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Recalculate Research Core</span>
        </button>
      </div>

      {/* Grid: Four Sections (Market, Competitors, Trends, Keywords) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {researchSections.map((sect) => (
          <div key={sect.id} className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between hover:border-neutral-800 transition-all">
            
            {/* Top title and icon */}
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-3">
              <div className="p-2 bg-black rounded-xl border border-neutral-850">
                {sect.icon}
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight font-display">{sect.title}</h3>
            </div>

            {/* Answers layout with bold structure */}
            <div className="space-y-4 flex-1">
              {/* Question 1 */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase block">What Changed?</span>
                <p className="text-xs text-neutral-200 font-semibold leading-relaxed">{sect.whatChanged}</p>
              </div>

              {/* Question 2 */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase block">Why It Matters?</span>
                <p className="text-xs text-neutral-350 leading-relaxed font-medium">{sect.whyItMatters}</p>
              </div>

              {/* Question 3 */}
              <div className="space-y-1 p-3 bg-black rounded-xl border border-neutral-900">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">What Should I Do?</span>
                <p className="text-xs text-neutral-300 leading-relaxed font-semibold">{sect.whatTodo}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Keywords & Sourced Tags form */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase font-mono">Active Tracked Keywords</h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {state.businessSetup.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-black border border-neutral-850 rounded-lg text-xs font-semibold text-neutral-300 font-mono">
                #{kw}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddKeywordSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={customKeyword}
            onChange={e => setCustomKeyword(e.target.value)}
            placeholder="Add keyword tracker..."
            className="w-full md:w-60 bg-black border border-neutral-850 text-xs px-3.5 py-2 rounded-xl outline-none text-neutral-100 placeholder-neutral-700 focus:border-orange-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
