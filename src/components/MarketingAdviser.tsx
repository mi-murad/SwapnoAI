import React from 'react';
import { ArrowRight, MessageSquareText, Sparkles } from 'lucide-react';
import { SwapnoAppState } from '../types';

interface MarketingAdviserProps {
  state: SwapnoAppState;
  isSample: boolean;
  onAskPrompt: (prompt: string) => void;
  onNavigate: (tab: string) => void;
}

const PROMPTS = [
  { text: 'Help me understand my competitors.', tab: 'research' },
  { text: 'Create a marketing strategy for my business.', tab: 'profile' },
  { text: 'Plan my social media content for this week.', tab: 'content' },
  { text: 'Give me ideas to increase customer engagement.', tab: 'research' }
];

export function MarketingAdviser({ state, isSample, onAskPrompt, onNavigate }: MarketingAdviserProps) {
  const profileReady = Boolean(
    state.businessSetup.name.trim()
    && state.businessSetup.industry.trim()
    && state.businessSetup.targetAudience.trim()
    && state.businessSetup.description.trim()
  );

  return (
    <section className="mx-auto max-w-4xl space-y-5" aria-labelledby="marketing-adviser-title">
      <header className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#FF4F00]/15 p-3 text-[#FFD400]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#FFD400]">Your Marketing Adviser</p>
            <h1 id="marketing-adviser-title" className="mt-1 text-2xl font-bold text-white">
              {isSample ? 'Ready to help' : 'Your business. Understood.'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
              {profileReady
                ? `Suggestions can be tailored to ${state.businessSetup.name}. Review your business details before relying on any recommendation.`
                : 'Start by adding your products, audience, and goals. Your Adviser needs this context to give relevant marketing guidance.'}
            </p>
          </div>
        </div>
        {!isSample && (
          <div role="status" className="mt-5 rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
            Account AI is not connected yet. These prompts will not send requests or use trial actions. You can still update your profile and plan drafts.
          </div>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROMPTS.map(({ text, tab }) => (
          <button
            key={text}
            type="button"
            onClick={() => isSample ? onAskPrompt(text) : onNavigate(tab)}
            className="group flex min-h-20 items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left hover:border-[#FF4F00]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
          >
            <span className="flex items-start gap-3">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[#FF4F00]" aria-hidden="true" />
              <span className="text-sm font-medium leading-6 text-neutral-100">{text}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        ))}
      </div>

      {!profileReady && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-sm font-semibold text-white">A helpful next step</p>
          <p className="mt-1 text-sm leading-6 text-neutral-300">
            Tell SWAPNO AI what you sell or provide, who you want to reach, and one goal. You can skip anything you do not know yet.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="mt-3 min-h-11 rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#FF7933] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
          >
            Add business details
          </button>
        </div>
      )}
    </section>
  );
}
