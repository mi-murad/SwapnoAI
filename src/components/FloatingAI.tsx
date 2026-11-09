import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { SwapnoAppState } from '../types';
import { apiFetch } from '../api';

interface FloatingAIProps {
  state: SwapnoAppState;
  activeTab: string;
  isSample: boolean;
  promptRequest?: { id: number; prompt: string } | null;
}

export function FloatingAI({ state, activeTab, isSample, promptRequest }: FloatingAIProps) {
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

  const activeDept = {
    name: 'Marketing Adviser'
  };

  // Set initial warm greeting based on current tab context
  useEffect(() => {
    const greeting = `Hello. I’m your Marketing Adviser${state.businessSetup.name ? ` for ${state.businessSetup.name}` : ''}. What would you like to work on today?`;
    setChatHistory(previous => previous.length ? previous : [{ sender: 'agent', text: greeting }]);
  }, []);

  useEffect(() => {
    if (!promptRequest) return;
    setMessage(promptRequest.prompt);
    setIsOpen(true);
  }, [promptRequest]);

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
    if (!isSample) {
      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: 'Your request was not sent. Account AI is not connected yet, so no AI action was used. You can update your business profile or save a draft in the meantime.'
      }]);
      return;
    }
    setLoading(true);

    try {
      const res = await apiFetch('/api/ai/chat', {
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
      console.error('Sample adviser request failed.', err);
      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: 'The sample adviser could not complete that request. No recommendation was created. Please try again shortly.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    switch (activeTab) {
      case 'dashboard':
        return [
          'Help me understand my competitors.',
          'Create a marketing strategy for my business.',
          'Plan my social media content for this week.',
          'Give me ideas to increase customer engagement.'
        ];
      case 'content':
        return [
          'Plan my social media content for this week.',
          'Help me improve this post.',
          'Create a marketing strategy for my business.',
          'Give me ideas to increase customer engagement.'
        ];
      case 'strategy':
        return [
          'Create a marketing strategy for my business.',
          'Help me understand my competitors.',
          'Identify my target audience.',
          'Plan my social media content for this week.'
        ];
      case 'research':
        return [
          'Help me understand my competitors.',
          'Identify my target audience.',
          'Give me ideas to increase customer engagement.',
          'Create a marketing strategy for my business.'
        ];
      default:
        return [
          'Help me understand my competitors.',
          'Create a marketing strategy for my business.',
          'Plan my social media content for this week.',
          'Give me ideas to increase customer engagement.'
        ];
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
              <div className="w-9 h-9 bg-[#FF4F00] rounded-xl flex items-center justify-center text-neutral-950 shadow-md">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-white uppercase font-display flex items-center gap-1">
                  Your Marketing Adviser
                </h3>
                <p className="text-[11px] text-neutral-300">
                  {isSample ? 'Sample responses only' : 'AI is not connected for this workspace'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-neutral-900 px-2 py-1 rounded text-neutral-300 border border-neutral-800">Marketing Adviser</span>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/45">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[11px] uppercase tracking-wide font-semibold text-neutral-400 mb-1">
                {chat.sender === 'user' ? 'You' : 'Marketing Adviser'}
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
