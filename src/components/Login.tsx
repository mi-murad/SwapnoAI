import React, { useState } from 'react';
import { z } from 'zod';
import { 
  Sparkles, ArrowRight, Lock, User, Briefcase, 
  ChevronRight, Globe, Layers, ArrowUpRight, Compass,
  CheckCircle2, Compass as CompassIcon, Shield, Laptop, Zap
} from 'lucide-react';
import { apiFetch } from '../api';
import { SwapnoAppState } from '../types';

interface LoginProps {
  onLogin: (
    workspace: 'A' | 'B', 
    customSetup?: {
      name: string;
      industry: string;
      targetAudience: string;
      description: string;
      tone: string;
    }
  ) => void;
  onAuthenticated: (workspaceId: string, state: SwapnoAppState) => void;
}

type ScreenState = 'landing' | 'signup' | 'onboarding' | 'login';

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({ message: z.string().optional() }).optional()
});

const WorkspaceStateSchema = z.object({
  businessSetup: z.object({
    name: z.string(),
    industry: z.string(),
    targetAudience: z.string(),
    description: z.string(),
    tone: z.string(),
    products: z.string().optional(),
    goals: z.string().optional(),
    colors: z.array(z.string()),
    keywords: z.array(z.string())
  }),
  businessBrain: z.object({
    elevatorPitch: z.string(),
    valueProposition: z.string(),
    competitorList: z.array(z.string()),
    synced: z.boolean()
  }),
  research: z.object({
    marketOverview: z.string(),
    competitorAnalysis: z.string(),
    trendingHashtags: z.array(z.string()),
    personaProfiles: z.array(z.object({
      name: z.string(),
      age: z.string(),
      goals: z.string(),
      painPoints: z.string(),
      mediaChannels: z.array(z.string())
    })),
    approved: z.boolean(),
    notes: z.string().optional()
  }),
  strategy: z.object({
    channels: z.array(z.object({ name: z.string(), frequency: z.string(), focus: z.string() })),
    pillars: z.array(z.string()),
    campaignThemes: z.array(z.object({
      title: z.string(),
      objective: z.string(),
      keyMessage: z.string()
    })),
    approved: z.boolean(),
    notes: z.string().optional()
  }),
  contentPlan: z.array(z.object({
    id: z.string(),
    title: z.string(),
    platform: z.string(),
    scheduledDate: z.string(),
    pillar: z.string(),
    status: z.enum(['planned', 'approved', 'published']),
    generationStatus: z.enum(['pending', 'generating', 'generated']),
    contentCopy: z.string(),
    imagePrompt: z.string(),
    imageUrl: z.string().optional(),
    notes: z.string().optional(),
    multipleImages: z.array(z.string()).optional(),
    hashtags: z.string().optional(),
    referenceImageUrl: z.string().optional(),
    referenceLinkUrl: z.string().optional(),
    similarPostReference1: z.string().optional(),
    similarPostReference2: z.string().optional()
  })),
  analytics: z.array(z.object({
    date: z.string(),
    platform: z.string(),
    title: z.string(),
    impressions: z.number(),
    engagement: z.number(),
    clicks: z.number()
  })),
  memoryLogs: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    type: z.string(),
    note: z.string()
  })),
  currentStep: z.string(),
  learningProgress: z.object({
    dismissed: z.boolean(),
    completedLessonIds: z.array(z.string()),
    completedAt: z.string().optional()
  }).optional()
});

async function readApiData(response: Response): Promise<unknown> {
  const json: unknown = await response.json().catch(() => null);
  const parsed = ApiResponseSchema.safeParse(json);
  if (!parsed.success || !response.ok || !parsed.data.success) {
    const message = parsed.success
      ? parsed.data.error?.message
      : undefined;
    throw new Error(message || `Request failed with status ${response.status}.`);
  }
  return parsed.data.data;
}

async function loadWorkspaceState(workspaceId: string): Promise<SwapnoAppState> {
  const response = await apiFetch(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/state`);
  const data = await readApiData(response);
  const parsed = WorkspaceStateSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('The server returned an invalid workspace state.');
  }
  return parsed.data;
}

function getRequestError(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Could not reach the account server. Check the API URL and connection, then try again.';
  }
  return error instanceof Error ? error.message : 'The request failed. Please try again.';
}

export function Login({ onLogin, onAuthenticated }: LoginProps) {
  const [screen, setScreen] = useState<ScreenState>('landing');
  
  // Credentials / Signup states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [bizName, setBizName] = useState('');
  const [bizIndustry, setBizIndustry] = useState('');
  const [bizAudience, setBizAudience] = useState('');
  const [bizTone, setBizTone] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  const [bizProducts, setBizProducts] = useState('');
  const [bizGoals, setBizGoals] = useState('');

  // Onboarding steps tracker
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [syncStatusText, setSyncStatusText] = useState('');

  const finishAuthentication = async (workspaceId: string) => {
    const workspaceState = await loadWorkspaceState(workspaceId);
    onAuthenticated(workspaceId, workspaceState);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      const response = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      const data = await readApiData(response);
      const parsed = z.object({
        workspaces: z.array(z.object({
          workspace: z.object({ id: z.string().min(1) })
        })).min(1)
      }).safeParse(data);
      if (!parsed.success) {
        throw new Error('This account does not have an available workspace.');
      }
      await finishAuthentication(parsed.data.workspaces[0].workspace.id);
    } catch (error) {
      setFormError(getRequestError(error));
      setLoading(false);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setScreen('onboarding');
  };

  const handleOnboardingComplete = async () => {
    setLoading(true);
    setFormError('');
    setSyncStatusText('Creating your account and workspace...');
    try {
      const response = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          password,
          fullName,
          businessName: bizName,
          initialSetup: {
            name: bizName,
            ...(bizIndustry.trim() ? { industry: bizIndustry.trim() } : {}),
            ...(bizAudience.trim() ? { targetAudience: bizAudience.trim() } : {}),
            ...(bizDesc.trim() ? { description: bizDesc.trim() } : {}),
            ...(bizTone.trim() ? { tone: bizTone.trim() } : {}),
            ...(bizProducts.trim() ? { products: bizProducts.trim() } : {}),
            ...(bizGoals.trim() ? { goals: bizGoals.trim() } : {})
          }
        })
      });
      const data = await readApiData(response);
      const parsed = z.object({ workspace: z.object({ id: z.string().min(1) }) }).safeParse(data);
      if (!parsed.success) {
        throw new Error('Account creation did not return a workspace.');
      }
      await finishAuthentication(parsed.data.workspace.id);
    } catch (error) {
      setFormError(getRequestError(error));
      setLoading(false);
      setSyncStatusText('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col justify-between p-6 font-sans text-neutral-200 overflow-x-hidden selection:bg-orange-600/30">
      
      {/* Top Mini Brand Navigation */}
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white leading-none">
              SWAPNO AI
            </h2>
            <span className="mt-1 block text-xs text-neutral-400">by SWAPNO TECH</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {screen === 'landing' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setFormError(''); setScreen('login'); }}
                className="min-h-10 rounded-lg px-3 text-sm font-medium text-neutral-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD400]"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setFormError(''); setScreen('signup'); }}
                className="min-h-10 rounded-lg bg-[#FF4F00] px-3 text-sm font-semibold text-neutral-950 hover:bg-[#FF7933] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD400]"
              >
                Create account
              </button>
            </div>
          )}
          {screen !== 'landing' && (
            <button 
              onClick={() => { setScreen('landing'); setOnboardingStep(1); }}
              className="text-[10px] font-mono text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back to Overview
            </button>
          )}
          <div className="hidden text-xs text-neutral-400 bg-neutral-950 px-3 py-1.5 border border-neutral-800 rounded-lg md:block">
            Marketing support for business owners
          </div>
        </div>
      </div>

      {/* RENDER STATE: LANDING PAGE */}
      {screen === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-7xl w-full mx-auto">
          
          {/* Main Hero Copy Grid */}
          <div className="text-center max-w-4xl space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/20 border border-orange-900/30 text-xs text-[#FFD400] mx-auto font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]" aria-hidden="true"></span>
              One marketing partner for your business
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white font-display tracking-tight leading-[1.05]">
              Your business. Understood. <span className="text-[#FF4F00]">Marketing that moves you forward.</span>
            </h1>
            
            <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              SWAPNO AI brings your business profile, marketing advice, research, strategy, and content planning together. Preview fictional sample workspaces—no real accounts, AI requests, social connections, or publishing are used.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <button
                onClick={() => onLogin('A')}
                className="w-full sm:w-auto min-h-12 px-8 py-3.5 bg-[#FF4F00] hover:bg-[#FF7933] text-neutral-950 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
              >
                <span>Explore NiRBAAN Sample</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onLogin('B')}
                className="w-full sm:w-auto min-h-12 px-8 py-3.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
              >
                <span>Explore Gourmet Hub Sample</span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* 10-Second Value Bento Block Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in duration-700 delay-200">
            
            {/* Bento Card 1: What is happening */}
            <div className="bg-neutral-950/80 border border-neutral-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-800 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Understand your business</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Keep your business details, audience, and goals together so your marketing work has a clear starting point.
                </p>
              </div>
              <span className="text-xs text-neutral-400">Start with a profile you can review</span>
            </div>

            {/* Bento Card 2: What needs attention */}
            <div className="bg-neutral-950/80 border border-neutral-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-800 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500">
                  <CompassIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Choose what to work on</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Explore how market research, a practical strategy, and a content calendar can fit together. Sample research is illustrative, not verified.
                </p>
              </div>
              <span className="text-xs text-neutral-400">Review information before relying on it</span>
            </div>

            {/* Bento Card 3: What should be done next */}
            <div className="bg-neutral-950/80 border border-neutral-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-800 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Create and review content</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Plan draft posts and check every detail before sharing. Social connections and publishing are not available in this preview.
                </p>
              </div>
              <span className="text-xs text-neutral-400">You stay in control of each next step</span>
            </div>

          </div>

        </div>
      )}

      {/* RENDER STATE: SIGN UP */}
      {screen === 'signup' && (
        <div className="flex-1 flex items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-mono font-black tracking-widest text-orange-500 uppercase">STEP 1 OF 3</span>
              <h1 className="text-2xl font-bold text-white font-display">
                Create your account
              </h1>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Create an account and workspace. Public account creation remains unavailable until the backend is configured.
              </p>
              <p className="text-[10px] text-amber-400/80 max-w-xs mx-auto leading-relaxed">
                Development auth does not send email verification or password recovery messages.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="signup-full-name" className="text-sm text-neutral-200 font-semibold block">Your name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full min-h-11 pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FF4F00] transition-colors"
                    placeholder="e.g. Farhan Ahmed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-sm text-neutral-200 font-semibold block">Email address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full min-h-11 pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FF4F00] transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-sm text-neutral-200 font-semibold block">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={12}
                    maxLength={128}
                    className="w-full min-h-11 pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FF4F00] transition-colors"
                    placeholder="At least 12 characters"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-11 py-3 bg-[#FF4F00] hover:bg-[#FF7933] text-neutral-950 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400] disabled:opacity-50"
              >
                <span>Continue to Workspace Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {formError && <p role="alert" className="text-xs text-red-400">{formError}</p>}
            
            <div className="text-center pt-2">
              <button 
                onClick={() => { setFormError(''); setScreen('login'); }}
                className="text-[10px] text-neutral-500 hover:text-white font-mono uppercase tracking-wider transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER STATE: ONBOARDING WIZARD */}
      {screen === 'onboarding' && (
        <div className="flex-1 flex items-center justify-center py-12 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-900 p-8 rounded-3xl shadow-2xl space-y-6">
            
            {/* Wizard Header */}
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-mono font-black tracking-widest text-orange-500 uppercase">
                {onboardingStep === 1 ? 'STEP 2 OF 3: BUSINESS PROFILE' : 'STEP 3 OF 3: REVIEW'}
              </span>
              <h1 className="text-2xl font-bold text-white font-display tracking-tight">
                {onboardingStep === 1 ? 'Set up your business profile' : 'Review your details'}
              </h1>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                {onboardingStep === 1 
                  ? 'Your business. Understood. Add what you know now; you can skip optional details and come back later.'
                  : 'Check the information for your workspace. Your seven-day free trial needs no card and will not charge you automatically.'
                }
              </p>
            </div>

            {/* Step 1 Form */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-business-name">Business name <span aria-hidden="true">*</span></label>
                    <input
                      id="signup-business-name"
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="For example, Riverbend Bakery"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                    <p className="text-xs text-neutral-400">This names your workspace.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-industry">What does your business do? <span className="text-neutral-400">(optional)</span></label>
                    <input
                      id="signup-industry"
                      type="text"
                      value={bizIndustry}
                      onChange={(e) => setBizIndustry(e.target.value)}
                      placeholder="For example, bakery or accounting"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-audience">Who do you want to reach? <span className="text-neutral-400">(optional)</span></label>
                    <input
                      id="signup-audience"
                      type="text"
                      value={bizAudience}
                      onChange={(e) => setBizAudience(e.target.value)}
                      placeholder="For example, nearby families"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-tone">How should your writing sound? <span className="text-neutral-400">(optional)</span></label>
                    <input
                      id="signup-tone"
                      type="text"
                      value={bizTone}
                      onChange={(e) => setBizTone(e.target.value)}
                      placeholder="For example, warm and helpful"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-description">What do you offer? <span className="text-neutral-400">(optional)</span></label>
                  <textarea
                    id="signup-description"
                    value={bizDesc}
                    onChange={(e) => setBizDesc(e.target.value)}
                    rows={4}
                    placeholder="Describe a product or service you provide."
                    className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-products">Products or services <span className="text-neutral-400">(optional)</span></label>
                    <textarea
                      id="signup-products"
                      value={bizProducts}
                      onChange={e => setBizProducts(e.target.value)}
                      rows={2}
                      placeholder="For example, custom cakes and weekend baking classes"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FF4F00] transition-colors leading-relaxed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-neutral-200 font-semibold block" htmlFor="signup-goals">What would you like to achieve? <span className="text-neutral-400">(optional)</span></label>
                    <textarea
                      id="signup-goals"
                      value={bizGoals}
                      onChange={e => setBizGoals(e.target.value)}
                      rows={2}
                      placeholder="For example, reach more local customers"
                      className="w-full px-4 py-2.5 bg-black border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none focus:border-[#FF4F00] transition-colors leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setOnboardingStep(2)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
                >
                  <span>Review Business Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2 Review & Loading State */}
            {onboardingStep === 2 && (
              <div className="space-y-5">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-orange-600/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-2 text-center animate-pulse">
                      <p className="text-xs font-mono font-bold text-orange-500 uppercase tracking-widest">
                        CREATING WORKSPACE
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {syncStatusText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-black border border-neutral-900 rounded-2xl space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <span className="text-neutral-300 font-semibold text-sm">Business details</span>
                              <span className="text-neutral-300 text-xs">Preview before creating</span>
                      </div>
                      
                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                              <span className="text-neutral-300">Business name</span>
                        <span className="text-white font-bold">{bizName}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-300">What you do</span>
                        <span className="text-white font-bold">{bizIndustry || 'Not added yet'}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-300">Who you serve</span>
                        <span className="text-white font-bold">{bizAudience || 'Not added yet'}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-300">Writing style</span>
                        <span className="text-white font-bold">{bizTone || 'Not added yet'}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-300">Products or services</span>
                        <span className="text-white font-bold">{bizProducts || 'Not added yet'}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-300">Marketing goal</span>
                        <span className="text-white font-bold">{bizGoals || 'Not added yet'}</span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-neutral-300 block">Offer or description</span>
                        <span className="text-neutral-300 block leading-relaxed font-sans text-[11px] font-medium bg-neutral-950 p-2.5 border border-neutral-900 rounded-xl">
                          {bizDesc || 'Not added yet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => setOnboardingStep(1)}
                        className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit business details
                      </button>
                      <button
                        onClick={handleOnboardingComplete}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
                      >
                        <span>Create Account & Workspace</span>
                        <Sparkles className="w-4 h-4 fill-white" />
                      </button>
                    </div>
                  </div>
                )}
                {formError && <p role="alert" className="text-xs text-red-400">{formError}</p>}
              </div>
            )}

          </div>
        </div>
      )}

      {/* RENDER STATE: ACCOUNT LOGIN */}
      {screen === 'login' && (
        <div className="flex-1 flex items-center justify-center py-12 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 p-8 rounded-3xl shadow-2xl space-y-6">
            
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-mono font-black tracking-widest text-orange-500 uppercase">ACCOUNT SIGN IN</span>
              <h1 className="text-2xl font-bold text-white font-display">
                Sign in to your workspace
              </h1>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Use the email address and password you registered with.                 Password recovery emails are not configured in this build.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm text-neutral-200 font-semibold block">Email address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-sm text-neutral-200 font-semibold block">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Login Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10 disabled:bg-neutral-900 disabled:text-neutral-600"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Unlock Operating Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
            {formError && <p role="alert" className="text-xs text-red-400">{formError}</p>}
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="text-center max-w-7xl w-full mx-auto text-[9px] font-mono text-neutral-600 mt-8">
        SWAPNO AI by SWAPNO TECH · Sample preview only
      </div>
    </div>
  );
}
