import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, Lock, User, Briefcase, 
  ChevronRight, Globe, Layers, ArrowUpRight, Compass,
  CheckCircle2, Compass as CompassIcon, Shield, Laptop, Zap
} from 'lucide-react';

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
}

type ScreenState = 'landing' | 'signup' | 'onboarding' | 'login';

export function Login({ onLogin }: LoginProps) {
  const [screen, setScreen] = useState<ScreenState>('landing');
  
  // Credentials / Signup states
  const [username, setUsername] = useState('operator@nirbaan.design');
  const [password, setPassword] = useState('••••••••');
  const [selectedWorkspace, setSelectedWorkspace] = useState<'A' | 'B'>('A');
  const [loading, setLoading] = useState(false);

  // Onboarding Wizard parameters (pre-filled with luxurious NiRBAAN coordinates)
  const [bizName, setBizName] = useState('NiRBAAN Design Studio');
  const [bizIndustry, setBizIndustry] = useState('Interior Design');
  const [bizAudience, setBizAudience] = useState('Luxury Homeowners');
  const [bizTone, setBizTone] = useState('Professional, Luxury, Minimal');
  const [bizDesc, setBizDesc] = useState(
    'A premium sustainable interior design studio in Bangladesh, crafting bespoke, minimalist architectural environments. We combine international minimalist aesthetics with local Bangladeshi heritage craftsmanship, utilizing raw, sustainable, non-toxic materials.'
  );

  // Onboarding steps tracker
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [syncStatusText, setSyncStatusText] = useState('');

  // Handle traditional Login Preset submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(selectedWorkspace);
      setLoading(false);
    }, 1200);
  };

  // Handle Signup transition to Onboarding
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setScreen('onboarding');
      setLoading(false);
    }, 1000);
  };

  // Run dynamic onboarding AI synchronization simulator
  const handleOnboardingComplete = () => {
    setLoading(true);
    
    // Phase 1: Initialize
    setSyncStatusText('Initializing brand memory vaults...');
    
    setTimeout(() => {
      // Phase 2: Compute buyer personas
      setSyncStatusText('Analyzing buyer demographics & biophilic trends...');
      
      setTimeout(() => {
        // Phase 3: Calibrate copywriting tone
        setSyncStatusText('Calibrating AI copywriting engine to premium voice...');
        
        setTimeout(() => {
          // Phase 4: Ready
          setSyncStatusText('Gateway coordinates locked successfully!');
          
          setTimeout(() => {
            onLogin('A', {
              name: bizName,
              industry: bizIndustry,
              targetAudience: bizAudience,
              description: bizDesc,
              tone: bizTone
            });
            setLoading(false);
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col justify-between p-6 font-sans text-neutral-200 overflow-x-hidden selection:bg-orange-600/30">
      
      {/* Top Mini Brand Navigation */}
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-600/20">
            S
          </div>
          <div>
            <h2 className="text-xs font-black tracking-widest text-white uppercase font-display flex items-center gap-1 leading-none">
              SWAPNO AI <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            </h2>
            <span className="text-[8px] font-mono font-bold tracking-wider text-neutral-500 uppercase mt-0.5 block">Operating System Beta v1.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {screen !== 'landing' && (
            <button 
              onClick={() => { setScreen('landing'); setOnboardingStep(1); }}
              className="text-[10px] font-mono text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              ← Back to Overview
            </button>
          )}
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-950 px-3 py-1.5 border border-neutral-900 rounded-lg">
            Bangladeshi Business Growth OS
          </div>
        </div>
      </div>

      {/* RENDER STATE: LANDING PAGE */}
      {screen === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-7xl w-full mx-auto">
          
          {/* Main Hero Copy Grid */}
          <div className="text-center max-w-4xl space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/20 border border-orange-900/30 text-[10px] font-mono text-orange-400 uppercase tracking-widest mx-auto font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              THE AUTONOMOUS OPERATING SYSTEM FOR BUSINESS OWNERS
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white font-display tracking-tight leading-[1.05] uppercase">
              REPLACE SCATTERED AGENT CHATS WITH A <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">SINGLE PIPELINE</span>.
            </h1>
            
            <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Explore the interactive product preview using fictional sample workspaces. This demo does not create accounts, call live AI services, connect social accounts, or publish posts. Changes stay in your browser and reset when you refresh.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <button
                onClick={() => onLogin('A')}
                className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10 hover:translate-x-0.5 active:translate-x-0"
              >
                <span>Explore NiRBAAN Sample</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onLogin('B')}
                className="w-full sm:w-auto px-8 py-3.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                <h3 className="text-sm font-black text-white uppercase tracking-tight">1. WHAT IS HAPPENING</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  No empty dashboards. Focus Mode lists active operational telemetry immediately: current campaign metrics, buyer search signals, and active scheduled content.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-600 uppercase font-semibold">COMMAND CENTER HUB</span>
            </div>

            {/* Bento Card 2: What needs attention */}
            <div className="bg-neutral-950/80 border border-neutral-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-800 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500">
                  <CompassIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">2. WHAT NEEDS ATTENTION</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Instant visual flags for pending items. Review drafted campaigns, approve social copies, generate bespoke timber/aesthetic layouts, or check raw market gaps.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-600 uppercase font-semibold">HUMAN-IN-THE-LOOP CORE</span>
            </div>

            {/* Bento Card 3: What should be done next */}
            <div className="bg-neutral-950/80 border border-neutral-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-neutral-800 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-900/30 flex items-center justify-center text-orange-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">3. WHAT TO DO NEXT</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  One-click operational suggestions. Clear recommendations mapped out with live quick-action triggers so you never have to search for features.
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-600 uppercase font-semibold">ACTION RECOMMENDATION CARDS</span>
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
              <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Create Operator Account
              </h1>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Configure your secure operator passkey for the Bangladesh Growth Operating System console.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Operator Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. Farhan Ahmed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Operator ID Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    placeholder="name@nirbaan.design"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Security Passkey</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
              >
                <span>Initialize Operator Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            <div className="text-center pt-2">
              <button 
                onClick={() => { setSelectedWorkspace('A'); setScreen('login'); }}
                className="text-[10px] text-neutral-500 hover:text-white font-mono uppercase tracking-wider transition-colors"
              >
                Already have an operator account? Sign In preset
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
                {onboardingStep === 1 ? 'STEP 2 OF 3: BRAND COORDINATES' : 'STEP 3 OF 3: AI SYNCHRONIZATION'}
              </span>
              <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                {onboardingStep === 1 ? 'Configure Brand Coordinates' : 'Verify & Synchronize OS Gateway'}
              </h1>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                {onboardingStep === 1 
                  ? 'Input your business details. The AI uses this as a single source of truth for all strategy and copy formulations.' 
                  : 'Double check these calibrated variables before syncing. The gateway will run trend modeling and construct user personas.'
                }
              </p>
            </div>

            {/* Step 1 Form */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Business Name</label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Industry Category</label>
                    <input
                      type="text"
                      value={bizIndustry}
                      onChange={(e) => setBizIndustry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Target Audience Demographics</label>
                    <input
                      type="text"
                      value={bizAudience}
                      onChange={(e) => setBizAudience(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Writing Voice / Tone</label>
                    <input
                      type="text"
                      value={bizTone}
                      onChange={(e) => setBizTone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Brand Mission / Description</label>
                  <textarea
                    value={bizDesc}
                    onChange={(e) => setBizDesc(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors leading-relaxed"
                    required
                  />
                </div>

                <button
                  onClick={() => setOnboardingStep(2)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
                >
                  <span>Review AI Coordinates Mapping</span>
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
                        COORDINATING AI GATEWAYS
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {syncStatusText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-black border border-neutral-900 rounded-2xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <span className="text-neutral-500 font-bold text-[10px] uppercase">Coordinate Class</span>
                        <span className="text-orange-500 font-bold text-[10px] uppercase">Calibrated Value</span>
                      </div>
                      
                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-400">Business Name:</span>
                        <span className="text-white font-bold">{bizName}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-400">Target Industry:</span>
                        <span className="text-white font-bold">{bizIndustry}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-400">Target Segment:</span>
                        <span className="text-white font-bold">{bizAudience}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-neutral-900/50">
                        <span className="text-neutral-400">Content Tone:</span>
                        <span className="text-white font-bold">{bizTone}</span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-neutral-400 block">Description Outline:</span>
                        <span className="text-neutral-300 block leading-relaxed font-sans text-[11px] font-medium bg-neutral-950 p-2.5 border border-neutral-900 rounded-xl">
                          {bizDesc}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOnboardingStep(1)}
                        className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Edit Coordinates
                      </button>
                      <button
                        onClick={handleOnboardingComplete}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/10"
                      >
                        <span>Build Brand Workspace</span>
                        <Sparkles className="w-4 h-4 fill-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* RENDER STATE: LOGIN PRESETS */}
      {screen === 'login' && (
        <div className="flex-1 flex items-center justify-center py-12 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 p-8 rounded-3xl shadow-2xl space-y-6">
            
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-mono font-black tracking-widest text-orange-500 uppercase">DIRECT OPERATOR DECK</span>
              <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Access Workspace Console
              </h1>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Sign in using configured credential presets to instantly test premium interior design features or Italian bistros.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Operator ID Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Security Passkey</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-900 rounded-xl text-xs text-white placeholder-neutral-700 outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Brand Presets */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Select Brand Memory Core</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkspace('A');
                      setUsername('operator@nirbaan.design');
                    }}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedWorkspace === 'A'
                        ? 'border-orange-500 bg-orange-950/10 text-white'
                        : 'border-neutral-900 bg-black text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 mb-2 ${selectedWorkspace === 'A' ? 'text-orange-500' : 'text-neutral-500'}`} />
                    <div>
                      <h3 className="text-xs font-bold font-display uppercase tracking-tight">NiRBAAN</h3>
                      <span className="text-[9px] text-neutral-500 font-mono">Interior Design</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkspace('B');
                      setUsername('chef@gourmethub.it');
                    }}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedWorkspace === 'B'
                        ? 'border-orange-500 bg-orange-950/10 text-white'
                        : 'border-neutral-900 bg-black text-neutral-400 hover:border-neutral-800'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 mb-2 ${selectedWorkspace === 'B' ? 'text-orange-500' : 'text-neutral-500'}`} />
                    <div>
                      <h3 className="text-xs font-bold font-display uppercase tracking-tight">Gourmet Hub</h3>
                      <span className="text-[9px] text-neutral-500 font-mono">Italian Dining</span>
                    </div>
                  </button>
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
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="text-center max-w-7xl w-full mx-auto text-[9px] font-mono text-neutral-600 mt-8">
        Swapno AI Business Growth Operating System • Internal Release v1.0 • Built with Pride in Bangladesh
      </div>
    </div>
  );
}
