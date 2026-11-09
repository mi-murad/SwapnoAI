import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { SwapnoAppState } from '../types';

interface FloatingAIProps {
  state: SwapnoAppState;
  activeTab: string;
}

export function FloatingAI({ state, activeTab }: FloatingAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    sender: 'user' | 'agent';
    text: string;
    reasoning?: string;
    confidence?: string;
    businessImpact?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Map active tab to an internal specialist department
  const getDepartment = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { name: 'Growth Marketer', avatar: '📈', role: 'analyzing channel growth & high-priority performance' };
      case 'content':
        return { name: 'Content Strategist', avatar: '✍️', role: 'writing copy & optimizing monthly editorial content' };
      case 'strategy':
        return { name: 'Marketing Strategist', avatar: '🎯', role: 'sculpting content pillars & brand positioning' };
      case 'research':
        return { name: 'SEO & Trend Analyst', avatar: '🔍', role: 'indexing keyword momentum & competitor activity' };
      case 'analytics':
        return { name: 'Performance Analyst', avatar: '📊', role: 'auditing impressions, clicks, & engagement ROI' };
      case 'reports':
        return { name: 'Brand Consultant', avatar: '📋', role: 'assembling CMO Executive Dossiers & briefs' };
      case 'knowledge':
        return { name: 'Creative Director', avatar: '🧠', role: 'managing brand guidelines & memory ledgers' };
      case 'automation':
        return { name: 'Social Media Manager', avatar: '⚡', role: 'configuring social channels & publish schedulers' };
      case 'profile':
        return { name: 'Onboarding Partner', avatar: '👔', role: 'forming the Business Brain core coordinates' };
      default:
        return { name: 'Marketing Strategist', avatar: '✨', role: 'aligning operations' };
    }
  };

  const activeDept = getDepartment(activeTab);

  // Set initial warm greeting based on current tab context
  useEffect(() => {
    const greeting = `Hello! I am **Swapno AI**, your unified Marketing Partner. 

I behave as an experienced Digital Marketing Team. Right now, on the **${activeTab.toUpperCase()}** screen, I am consulting with our **${activeDept.name}** who is currently *${activeDept.role}* for **${state.businessSetup.name || 'your business'}**.

How can I help you optimize our operations today?`;

    setChatHistory([
      {
        sender: 'agent',
        text: greeting,
        reasoning: `Selected specialized agent '${activeDept.name}' for ${activeTab} context.`,
        confidence: '100%',
        businessImpact: 'Aligns AI reasoning with active workspace task flow.'
      }
    ]);
  }, [activeTab, state.businessSetup.name]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userText = message;
    setMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: activeDept.name,
          message: userText,
          state: state
        })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: data.reply || 'Apologies, I could not generate a recommendation right now.',
        reasoning: data.reasoning,
        confidence: data.confidence,
        businessImpact: data.businessImpact
      }]);
    } catch (err: any) {
      console.warn("Falling back to simulated partner recommendation:", err);
      // Fallback simulation matching the workspace context
      setTimeout(() => {
        let simulatedReply = '';
        let simulatedImpact = '';

        if (activeTab === 'dashboard') {
          simulatedReply = `Here is our strategic performance review for **${state.businessSetup.name}**:\n\n1. **Increase LinkedIn volume**: Our organic posting frequency is trailing competitors by 20%. Suggest releasing 1 of our planned posts tonight.\n2. **Optimize Hashtags**: Swap out low-volume hashtags for trend-momentum tags like \`#AutonomousWorkflows\` to boost visibility.`;
          simulatedImpact = "Organic impressions list: +15% lift in 7 days.";
        } else if (activeTab === 'content') {
          simulatedReply = `I have audited your scheduled calendar queue. The post draft **"${state.contentPlan[0]?.title || 'Untitled Campaign'}"** looks robust, but could benefit from a clearer call-to-action.\n\nWould you like me to rewrite it with a focus on conversion?`;
          simulatedImpact = "Click-Through-Rate: +2.5% increase on CTA link.";
        } else {
          simulatedReply = `I've analyzed the parameters on this page for **${state.businessSetup.name}**. Everything is synchronized and aligned with your brand guidelines. We should focus on publishing consistent content based on these exact specifications.`;
          simulatedImpact = "Brand coherence: 100% compliant across channels.";
        }

        setChatHistory(prev => [...prev, {
          sender: 'agent',
          text: simulatedReply,
          reasoning: "Public demo response based on sample workspace data; no AI provider was called.",
          confidence: "Sample response",
          businessImpact: "Illustrative only; not based on live data"
        }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    switch (activeTab) {
      case 'dashboard':
        return ["Explain Health Score", "Optimize Priorities", "Next growth steps?"];
      case 'content':
        return ["Improve captions", "Suggest hashtags", "Review mockups"];
      case 'strategy':
        return ["Review core pillars", "Brainstorm themes"];
      case 'research':
        return ["Analyze competitors", "Check trends"];
      default:
        return ["Review current page", "Suggest actions"];
    }
  };

  return (
    <>
      {/* Floating Action Bubble */}
      <button
        id="floating-ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-orange-600 hover:bg-orange-500 rounded-full shadow-2xl transition-all duration-300 transform cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center border border-orange-400/30 group ${
          isOpen ? 'rotate-90 bg-neutral-900 hover:bg-neutral-800 text-red-500 border-neutral-800' : 'text-white'
        }`}
        title="Consult Swapno AI Partner"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
          </div>
        )}
      </button>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div 
          id="floating-ai-panel"
          className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-black border border-neutral-850 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-neutral-950 border-b border-neutral-900 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base">
                {activeDept.avatar}
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-white uppercase font-display flex items-center gap-1">
                  SWAPNO AI <Sparkles className="w-3 h-3 text-orange-500 fill-orange-500" />
                </h3>
                <p className="text-[9px] text-orange-400 font-mono flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active: {activeDept.name} Specialist
                </p>
              </div>
            </div>
            <span className="text-[8px] font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800 uppercase tracking-wider">Marketing Partner</span>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/45">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] uppercase tracking-widest font-bold text-neutral-500 mb-1 font-mono">
                  {chat.sender === 'user' ? 'YOU' : `Swapno AI (${activeDept.name})`}
                </span>
                
                <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                  chat.sender === 'user'
                    ? 'bg-orange-600 text-white font-medium rounded-tr-none shadow shadow-orange-500/10'
                    : 'bg-black text-neutral-200 border border-neutral-850 rounded-tl-none'
                }`}>
                  {chat.text}
                </div>

                {/* Strategic Insights details from agent */}
                {chat.sender === 'agent' && (chat.reasoning || chat.businessImpact) && (
                  <div className="mt-1.5 ml-2 p-2 bg-black border border-neutral-900 rounded-lg space-y-1 text-[9px] max-w-[85%] font-mono">
                    {chat.reasoning && (
                      <p className="text-neutral-400"><strong className="text-orange-500 font-bold uppercase">Reasoning:</strong> {chat.reasoning}</p>
                    )}
                    {chat.businessImpact && (
                      <div className="text-orange-400 mt-1 border-t border-neutral-900 pt-1 flex items-center gap-1 font-bold">
                        <span className="text-emerald-400 uppercase">⚡ Impact:</span> {chat.businessImpact}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-neutral-500 text-[10px] font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></span>
                <span>Specialists consulting...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions rail */}
          <div className="px-4 py-1.5 bg-neutral-950 border-t border-neutral-900 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {getQuickActions().map((action, i) => (
              <button
                key={i}
                onClick={() => setMessage(action)}
                className="text-[9px] font-medium font-mono text-neutral-450 hover:text-white bg-black hover:bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 transition-all cursor-pointer"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-neutral-950 border-t border-neutral-900 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Consult with ${activeDept.name}...`}
              className="flex-1 bg-black border border-neutral-850 text-xs px-3 py-2 rounded-xl text-neutral-100 outline-none focus:border-orange-500 font-medium placeholder-neutral-600 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors cursor-pointer disabled:bg-neutral-900 disabled:text-neutral-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
