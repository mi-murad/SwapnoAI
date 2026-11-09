import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Clock, 
  Check, RefreshCw, ArrowRight, ArrowUpRight, ArrowDownRight, 
  Flame, Calendar, ShieldAlert, Award, FileText, Settings, Database, Plus, ChevronRight
} from 'lucide-react';
import { SwapnoAppState, ContentItem } from '../types';

interface CommandCenterProps {
  state: SwapnoAppState;
  onNavigate: (tab: string) => void;
  onApprovePost: (id: string) => void;
  onPublishNow: (id: string) => void;
  onRunPlanning: () => void;
  onRunResearch: () => void;
  metaConnected?: boolean;
}

export function CommandCenter({
  state,
  onNavigate,
  onApprovePost,
  onPublishNow,
  onRunPlanning,
  onRunResearch,
  metaConnected = false
}: CommandCenterProps) {
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<boolean>(true); // Focus Mode is default!

  // Interactive 27-step tracker local variables
  const [reportCompiled, setReportCompiled] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [activeReportLoading, setActiveReportLoading] = useState(false);
  const [activePdfLoading, setActivePdfLoading] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState(false);
  const [roadmapFilter, setRoadmapFilter] = useState<'All' | 'Completed' | 'Remaining'>('All');

  // Simulated triggers for reports and downloads
  const triggerCmoReport = () => {
    setActiveReportLoading(true);
    setTimeout(() => {
      setActiveReportLoading(true);
      setTimeout(() => {
        setActiveReportLoading(false);
        setReportCompiled(true);
        alert("CMO Executive Dossier compiled! Complete sustainable architectural branding and trend breakdowns loaded into active memory.");
      }, 800);
    }, 500);
  };

  const triggerPdfDownload = () => {
    setActivePdfLoading(true);
    setTimeout(() => {
      setActivePdfLoading(true);
      setTimeout(() => {
        setActivePdfLoading(false);
        setPdfDownloaded(true);
        alert("Sustainable Growth Audit PDF compiled & exported successfully!");
      }, 800);
    }, 500);
  };

  // 27-Step Operating System Roadmap Directory
  const steps = [
    { id: 1, title: 'Landing Splash Page', cat: 'Onboarding', desc: 'Splash introduction to Bangladesh’s premium Growth OS.', action: 'View Splash', trigger: () => window.location.reload(), done: true },
    { id: 2, title: 'Operator Registration', cat: 'Onboarding', desc: 'Secure operator credential generation and workspace mapping.', action: 'Secured Logged', done: true },
    { id: 3, title: 'Workspace Setup', cat: 'Onboarding', desc: 'Initial creation of brand coordinates (NiRBAAN Design Studio).', action: 'Set Coordinates', trigger: () => onNavigate('profile'), done: !!state.businessSetup.name },
    { id: 4, title: 'Brand Coordinates Map', cat: 'Onboarding', desc: 'Sync tone of voice, colors, target audience, and description.', action: 'Configure Profile', trigger: () => onNavigate('profile'), done: !!state.businessSetup.industry && !!state.businessSetup.targetAudience },
    { id: 5, title: 'Meta Integrations Link', cat: 'Integrations', desc: 'Link Facebook & Instagram page nodes to the publishing core.', action: 'Connect Meta API', trigger: () => onNavigate('automation'), done: !!metaConnected },
    { id: 6, title: 'AI Research Radar', cat: 'Intelligence', desc: 'Calibrate buyer personas (Farhan Ahmed, Nadia Rahman) and search trends.', action: 'Run Research', trigger: () => triggerAction('research', onRunResearch), done: !!state.research.approved },
    { id: 7, title: 'Strategic Camp Pillar', cat: 'Intelligence', desc: 'Align social pillars and campaign themes (Quiet Sanctuaries).', action: 'Define Pillars', trigger: () => onNavigate('profile'), done: !!state.strategy.approved },
    { id: 8, title: 'Campaign Calendar Draft', cat: 'Execution', desc: 'Map social campaign placeholders across scheduled dates.', action: 'Draft Calendar', trigger: () => triggerAction('plan', onRunPlanning), done: state.contentPlan.length > 0 },
    { id: 9, title: 'Copywriting Generation', cat: 'Execution', desc: 'Trigger Gemini to draft high-density copy copies.', action: 'Create Captions', trigger: () => onNavigate('content'), done: state.contentPlan.some(p => p.contentCopy) },
    { id: 10, title: 'Bespoke Image Gen', cat: 'Execution', desc: 'Synthesize premium timber and plaster photography with Imagen.', action: 'Synthesize Photo', trigger: () => onNavigate('content'), done: state.contentPlan.some(p => p.imageUrl) },
    { id: 11, title: 'Social Grid Mockups', cat: 'Execution', desc: 'Visual preview of the final campaigns as a cohesive grid.', action: 'Preview Grid', trigger: () => onNavigate('content'), done: true },
    { id: 12, title: 'Content Caption Editing', cat: 'Execution', desc: 'Fine-tune generated copy and edit captions directly.', action: 'Edit Draft', trigger: () => onNavigate('content'), done: true },
    { id: 13, title: 'Human Content Approval', cat: 'Execution', desc: 'Operators sign off drafted campaigns with satisfying checkbox clicks.', action: 'Approve Post', trigger: () => onNavigate('content'), done: state.contentPlan.some(p => p.status === 'approved' || p.status === 'published') },
    { id: 14, title: 'Live Publish Dispatch', cat: 'Execution', desc: 'Force immediate social API publication dispatch.', action: 'Publish Now', trigger: () => onNavigate('content'), done: state.contentPlan.some(p => p.status === 'published') },
    { id: 15, title: 'Organic Click Track', cat: 'Analytics', desc: 'Monitor active impressions, click conversions, and engagement rates.', action: 'Track Clicks', trigger: () => onNavigate('analytics'), done: true },
    { id: 16, title: 'Performance Sourced Ledger', cat: 'Analytics', desc: 'Evaluate high-performing vs lagging networks.', action: 'Ledger Audit', trigger: () => onNavigate('analytics'), done: true },
    { id: 17, title: 'CMO Executive Dossiers', cat: 'Analytics', desc: 'Render premium sustainable interior design summaries.', action: activeReportLoading ? 'Compiling...' : 'Compile Dossier', trigger: () => triggerCmoReport(), done: reportCompiled },
    { id: 18, title: 'Knowledge Vault Logs', cat: 'Memory', desc: 'Inject operational learnings directly into memory vaults.', action: 'Inject Memory', trigger: () => onNavigate('knowledge'), done: state.memoryLogs.length > 4 },
    { id: 19, title: 'Automation Chronicles', cat: 'Memory', desc: 'Oversee background cron schedules and release queues.', action: 'Monitor Cron', trigger: () => onNavigate('automation'), done: true },
    { id: 20, title: 'Floating AI Copilot', cat: 'Memory', desc: 'Consult context-aware assistant for advice.', action: 'Consult Chat', trigger: () => { const el = document.getElementById('floating-chat-trigger'); if (el) (el as HTMLElement).click(); }, done: true },
    { id: 21, title: 'Settings Tuning', cat: 'System', desc: 'Double-check AI model gateways and parameters.', action: 'Tweak Configs', trigger: () => onNavigate('settings'), done: true },
    { id: 22, title: 'Workspace Context Toggle', cat: 'System', desc: 'Swap between NiRBAAN and Gourmet Hub profiles.', action: 'Toggle Profile', trigger: () => onNavigate('settings'), done: true },
    { id: 23, title: 'Security Passkey Change', cat: 'System', desc: 'Update operator passkeys or reset factory parameters.', action: 'Passkey Settings', trigger: () => onNavigate('settings'), done: true },
    { id: 24, title: 'Campaign Bulk Sign-off', cat: 'Execution', desc: 'Bulk approve and dispatch planned posts.', action: 'Bulk Signoff', trigger: () => onNavigate('content'), done: state.contentPlan.every(p => p.status === 'approved' || p.status === 'published') },
    { id: 25, title: 'Biophilic Trend Alerts', cat: 'Intelligence', desc: 'Review trending eco-premium design hashtags.', action: 'Audit Trends', trigger: () => onNavigate('research'), done: true },
    { id: 26, title: 'PDF Dossier Export', cat: 'Analytics', desc: 'Download high-end sustainable growth briefs.', action: activePdfLoading ? 'Exporting...' : 'Export PDF', trigger: () => triggerPdfDownload(), done: pdfDownloaded },
    { id: 27, title: 'Operational Logout', cat: 'System', desc: 'Exit session and close secure console.', action: 'Exit Session', trigger: () => { const el = document.getElementById('logout-trigger-aside'); if (el) (el as HTMLElement).click(); }, done: false }
  ];

  const completedCount = steps.filter(s => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  // Dynamic Marketing Health Score Calculation
  const getHealthScore = () => {
    let score = 20; // Baseline
    if (state.businessSetup.name) score += 15;
    if (state.businessSetup.industry) score += 15;
    if (state.businessSetup.targetAudience) score += 15;
    
    const totalPosts = state.contentPlan.length;
    if (totalPosts > 0) {
      const approvedPosts = state.contentPlan.filter(p => p.status === 'approved' || p.status === 'published').length;
      score += Math.round((approvedPosts / totalPosts) * 20);
    }
    
    const published = state.contentPlan.filter(p => p.status === 'published').length;
    if (published > 0) score += 15;
    
    return Math.min(score, 100);
  };

  const healthScore = getHealthScore();

  // Content helper states
  const pendingApproval = state.contentPlan.filter(p => p.status === 'planned');
  const scheduledPosts = state.contentPlan.filter(p => p.status === 'approved');
  const publishedPosts = state.contentPlan.filter(p => p.status === 'published');

  // Trigger recommended action with simulator feedback
  const triggerAction = (actionId: string, callback: () => void) => {
    setRunningActionId(actionId);
    setTimeout(() => {
      callback();
      setRunningActionId(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* 1. Header & Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-950 p-6 border border-neutral-900 rounded-2xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">Swapno AI Operating System</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {state.businessSetup.name || 'Your Business'} Command Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Managing growth vectors, content pipelines, and active market intelligence.
          </p>
        </div>
        
        {/* Toggle between Focus Mode (default) and standard view */}
        <div className="flex items-center bg-black border border-neutral-900 p-1 rounded-xl">
          <button
            onClick={() => setFocusMode(true)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              focusMode 
                ? 'bg-orange-600 text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🎯 Focus Mode (Default)
          </button>
          <button
            onClick={() => setFocusMode(false)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !focusMode 
                ? 'bg-orange-600 text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🎛️ Standard View
          </button>
        </div>
      </div>

      {/* ================================== */}
      {/* FOCUS MODE EXECUTIVE BANNER        */}
      {/* ================================== */}
      {focusMode && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-300">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600/10 border border-orange-600/20 text-orange-500 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                Targeted Action Console Active
              </span>
              <span className="text-neutral-500 text-[10px]">•</span>
              <span className="text-neutral-400 text-[10px] font-mono">1-on-1 Workspace Focus</span>
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              {state.businessSetup.name.toLowerCase().includes('nirbaan') 
                ? 'NiRBAAN Architectural Launch Focus' 
                : state.businessSetup.name.toLowerCase().includes('gourmet')
                  ? 'Gourmet Hub Artisanal Launch Focus'
                  : 'Swapno AI Automated Launch Focus'}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              {state.businessSetup.name.toLowerCase().includes('nirbaan')
                ? 'Focusing strictly on biophilic design schedules, quiet sanctuary media previews, and structural competitor visual logs. Zero dashboard noise.'
                : state.businessSetup.name.toLowerCase().includes('gourmet')
                  ? 'Focusing strictly on kitchen prep logs, artisanal dining peak times scheduler, and similar premium gastronomy posts. Zero dashboard noise.'
                  : 'Focusing strictly on lean agency SaaS automations, active pipeline copy approval status, and database integrations. Zero dashboard noise.'}
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto flex-shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center bg-black border border-neutral-850 rounded-full flex-shrink-0">
              <span className="text-xs font-mono font-bold text-orange-500">{pct}%</span>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="21" stroke="transparent" strokeWidth="2.5" fill="transparent" />
                <circle cx="24" cy="24" r="21" stroke="#ea580c" strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 21} strokeDashoffset={2 * Math.PI * 21 * (1 - pct/100)} strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono block uppercase leading-none">OS Roadmap</span>
              <span className="text-xs font-bold text-white block mt-1">{completedCount} of 27 Milestones</span>
            </div>
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* 27-STAGE INTEGRATED OPERATING ROADMAP (Only in Standard View) */}
      {/* ================================== */}
      {!focusMode && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden transition-all duration-300">
          
          {/* Header Block with Progress Stats */}
          <div 
            onClick={() => setExpandedRoadmap(!expandedRoadmap)}
            className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-neutral-900/10 border-b border-neutral-900/60"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-orange-500 uppercase tracking-wider block">27-STAGE OPERATING SYSTEM ROADMAP</span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Secure Operational Progress</span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded">
                  {completedCount} / 27 Completed
                </span>
              </h2>
              <p className="text-xs text-neutral-450">
                The full lifecycle from Landing to Logout. Click any step to immediately execute or jump to that operational interface.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-[11px] font-mono font-bold leading-none">
                <span className="text-neutral-400 uppercase">SYSTEM READINESS</span>
                <span className="text-orange-500">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-black border border-neutral-900 rounded-full overflow-hidden flex">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Collapsible Roadmap content list */}
          {expandedRoadmap && (
            <div className="p-6 space-y-4 animate-in fade-in duration-300">
              
              {/* Filter buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-900">
                <div className="flex items-center gap-2 bg-black border border-neutral-900 p-1 rounded-xl">
                  {(['All', 'Completed', 'Remaining'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={(e) => { e.stopPropagation(); setRoadmapFilter(filter); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                        roadmapFilter === filter 
                          ? 'bg-neutral-900 text-white font-black' 
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {filter === 'All' ? `All (27)` : filter === 'Completed' ? `Completed (${completedCount})` : `Remaining (${27 - completedCount})`}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">ACTIVE BRAND: {state.businessSetup.name}</span>
              </div>

              {/* List block */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {steps
                  .filter(s => {
                    if (roadmapFilter === 'Completed') return s.done;
                    if (roadmapFilter === 'Remaining') return !s.done;
                    return true;
                  })
                  .map((step) => (
                    <div 
                      key={step.id} 
                      className={`p-3 bg-black/60 border rounded-xl flex items-start gap-3 transition-all ${
                        step.done 
                          ? 'border-neutral-900 hover:border-neutral-850' 
                          : 'border-orange-900/30 bg-orange-950/5 hover:border-orange-900/50'
                      }`}
                    >
                      {/* Tick box representation */}
                      <div className="mt-0.5 flex-shrink-0">
                        {step.done ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-mono text-neutral-500 uppercase">{step.cat}</span>
                          <span className="text-[9px] font-mono text-neutral-600 font-bold">STAGE #{step.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-100 truncate">{step.title}</h4>
                        <p className="text-[10px] text-neutral-450 leading-relaxed line-clamp-2">{step.desc}</p>
                        
                        {step.trigger && (
                          <button
                            onClick={(e) => { e.stopPropagation(); step.trigger(); }}
                            className={`mt-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                              step.done 
                                ? 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300' 
                                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/10'
                            }`}
                          >
                            <span>{step.action}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------------------------- */}
      {/* FOCUS MODE (Immediately show only 3 things) */}
      {/* ---------------------------------- */}
      {focusMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-350">
          
          {/* 1. What Needs Attention Today */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">1. Attention Required</span>
                <span className="px-2 py-0.5 bg-red-950/40 text-red-500 border border-red-900/40 rounded text-[9px] font-mono font-bold uppercase">Today</span>
              </div>

              <div className="space-y-4">
                {/* Attention Item 1: Pending Approvals */}
                {pendingApproval.length > 0 ? (
                  <div className="p-4 bg-black rounded-xl border border-neutral-900 space-y-2">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>Campaigns Pending Approval</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      You have <strong>{pendingApproval.length} content campaigns</strong> prepared by AI waiting for your review and approval.
                    </p>
                    <button 
                      onClick={() => onNavigate('content')}
                      className="text-xs text-white hover:text-orange-500 font-bold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
                    >
                      <span>Review in Content Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-black rounded-xl border border-neutral-900 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-neutral-300 leading-normal">
                      All created campaigns have been approved! No editorial backlog.
                    </p>
                  </div>
                )}

                {/* Attention Item 2: Empty Fields */}
                {(!state.businessSetup.targetAudience || !state.businessSetup.description) && (
                  <div className="p-4 bg-black rounded-xl border border-neutral-900 space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                      <Flame className="w-4 h-4" />
                      <span>Incomplete Brand Profile</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Your business target audience and description are partially blank. Fill these out to get highly-targeted AI results.
                    </p>
                    <button 
                      onClick={() => onNavigate('profile')}
                      className="text-xs text-white hover:text-orange-500 font-bold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
                    >
                      <span>Complete Brand Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Attention Item 3: Memory Nodes */}
                {state.memoryLogs.length < 5 && (
                  <div className="p-4 bg-black rounded-xl border border-neutral-900 space-y-2">
                    <div className="flex items-center gap-2 text-neutral-450 font-semibold text-xs">
                      <Database className="w-4 h-4 text-orange-500" />
                      <span>Add Brand Knowledge</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Your Knowledge Vault has only {state.memoryLogs.length} logs. Save strategies, competitor notes, or decisions to improve the AI's understanding.
                    </p>
                    <button 
                      onClick={() => onNavigate('knowledge')}
                      className="text-xs text-white hover:text-orange-500 font-bold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
                    >
                      <span>Visit Knowledge Vault</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setFocusMode(false)}
              className="w-full mt-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-350 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Explore standard view dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* 2. What Needs Approval */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">2. Awaiting Approval</span>
                <span className="px-2 py-0.5 bg-orange-950/40 text-orange-500 border border-orange-900/40 rounded text-[9px] font-mono font-bold">{pendingApproval.length} Posts</span>
              </div>

              {pendingApproval.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[200px] mx-auto">
                    All set! No draft posts are awaiting approval today. Let's create more content ideas!
                  </p>
                  <button
                    onClick={() => onNavigate('content')}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg transition-all"
                  >
                    Open Content Studio
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {pendingApproval.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-3 bg-black border border-neutral-900 rounded-xl space-y-2 hover:border-neutral-800 transition-all">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-orange-500 font-bold uppercase">{post.platform}</span>
                        <span className="text-neutral-500">{post.scheduledDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{post.title}</h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {post.contentCopy || "No caption generated yet. Open editor to generate instantly."}
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => onApprovePost(post.id)}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Approve Caption
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingApproval.length > 3 && (
                    <p className="text-[10px] text-neutral-500 text-center font-medium">
                      + {pendingApproval.length - 3} more pending campaigns
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('content')}
              className="w-full mt-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-350 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Manage Content Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {/* 3. What is Performing Well or Poorly */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between min-h-[420px]">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">3. Health & Performance</span>
                <span className="px-2 py-0.5 bg-orange-950/40 text-orange-500 border border-orange-900/40 rounded text-[9px] font-mono font-bold">Signals</span>
              </div>

              <div className="space-y-4">
                {/* Performing Well */}
                <div className="p-3.5 bg-black rounded-xl border border-neutral-900 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase block">🟢 Performing Well</span>
                    <h4 className="text-xs font-bold text-white">LinkedIn Impressions</h4>
                    <p className="text-[10px] text-neutral-500">8,750 organic impressions sourced</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+12%</span>
                  </div>
                </div>

                {/* Performing Poorly */}
                <div className="p-3.5 bg-black rounded-xl border border-neutral-900 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-red-500 uppercase block">🔴 Performing Poorly</span>
                    <h4 className="text-xs font-bold text-white">Instagram Click Conversion</h4>
                    <p className="text-[10px] text-neutral-500">4.2% Click-Through-Rate</p>
                  </div>
                  <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>-2%</span>
                  </div>
                </div>

                {/* Recommendations summary */}
                <div className="p-3 bg-neutral-900/60 rounded-xl space-y-1 text-xs">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400 block font-mono">Recommendation</span>
                  <p className="text-[11px] text-neutral-350 leading-relaxed font-medium">
                    LinkedIn impressions are climbing because of structured automation content. Instagram clickthrough is lagging due to lower media diversity. <strong>Action recommended: Generate a visual bento grid mockup for Instagram.</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('analytics')}
              className="w-full mt-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-350 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Open Growth Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

        </div>
      ) : (
        /* ---------------------------------- */
        /* STANDARD VIEW (The Complete Layout) */
        /* ---------------------------------- */
        <div className="space-y-8 animate-in fade-in duration-350">
          
          {/* ================================== */}
          {/* TOP SECTION                        */}
          {/* ================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Marketing Health Score */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                  <span className="text-xs font-bold uppercase text-neutral-400">Marketing Health Score</span>
                  <span className="text-orange-500 font-mono text-[10px] font-bold">Swapno Core</span>
                </div>
                
                {/* Health Score visual representation */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#171717" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        stroke="#ea580c" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - healthScore / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-white tracking-tight">{healthScore}</span>
                      <span className="text-[10px] text-neutral-500 block font-mono">/100</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-300 mt-4 block">
                    {healthScore >= 90 ? '🔥 Operational Excellence' : healthScore >= 70 ? '📈 Solid Growth Structure' : '⚠️ Account Configuration Required'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 text-center leading-normal border-t border-neutral-900 pt-3">
                Score increases as you complete your brand details and approve scheduled posts.
              </p>
            </div>

            {/* 2. Business Status */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase text-neutral-400">Business Status</span>
                  <span className="text-orange-500 font-mono text-[10px] font-bold">Live Status</span>
                </div>

                <div className="space-y-4">
                  {/* Status row 1 */}
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                    <span className="text-xs text-neutral-400">Current Industry</span>
                    <span className="text-xs font-bold text-white uppercase font-mono">{state.businessSetup.industry || 'Not Configured'}</span>
                  </div>

                  {/* Status row 2 */}
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                    <span className="text-xs text-neutral-400">Content Calendar</span>
                    <span className="text-xs font-bold text-white uppercase font-mono">{state.contentPlan.length} Active Posts</span>
                  </div>

                  {/* Status row 3 */}
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                    <span className="text-xs text-neutral-400">Approved Campaigns</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase font-mono">{scheduledPosts.length + publishedPosts.length} / {state.contentPlan.length}</span>
                  </div>

                  {/* Status row 4 */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-neutral-400">Connected Pages</span>
                    <span className="text-xs font-bold text-orange-500 uppercase font-mono">Meta API authorized</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('profile')}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-neutral-800 transition-colors cursor-pointer"
              >
                Refine Brand Profile Coordinates
              </button>
            </div>

            {/* 3. Top 3 AI Recommendations */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-neutral-900 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase text-neutral-400">Top 3 AI Recommendations</span>
                  <span className="text-orange-500 font-mono text-[10px] font-bold">Action Plan</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'rec-1', text: "Generate high-density organic content on LinkedIn using industry-focused templates.", impact: "Increase reach by +15%" },
                    { id: 'rec-2', text: "Audit competitor keywords inside the Research page to identify untapped social SEO queries.", impact: "Discover 10+ target tags" },
                    { id: 'rec-3', text: "Approve pending drafted campaigns in Content Studio to keep the publishing flow continuous.", impact: "Avoid posting lag today" }
                  ].map((rec, i) => (
                    <div key={rec.id} className="p-2.5 bg-black border border-neutral-900 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-orange-500 uppercase">
                        <span>Recommendation #{i+1}</span>
                        <span className="text-emerald-400">{rec.impact}</span>
                      </div>
                      <p className="text-[11px] text-neutral-200 font-semibold leading-normal">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => triggerAction('plan', onRunPlanning)}
                  disabled={runningActionId !== null}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:bg-neutral-900 disabled:text-neutral-600"
                >
                  {runningActionId === 'plan' ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Run AI Planner</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => triggerAction('research', onRunResearch)}
                  disabled={runningActionId !== null}
                  className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {runningActionId === 'research' ? (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Research</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* ================================== */}
          {/* MIDDLE SECTION                     */}
          {/* ================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* 1. Tasks That Need Attention Today */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Tasks Today</span>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2 p-2 bg-black rounded-lg border border-neutral-900">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded bg-neutral-900 border-neutral-800 text-orange-600 focus:ring-0" />
                  <div>
                    <p className="font-bold text-white line-through text-neutral-500">Configure brand voice tone</p>
                    <span className="text-[10px] text-neutral-500 font-mono">Completed 9:45 AM</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-black rounded-lg border border-neutral-900">
                  <input type="checkbox" className="mt-0.5 rounded bg-neutral-900 border-neutral-800 text-orange-600 focus:ring-0" />
                  <div>
                    <p className="font-bold text-white">Approve pending campaign queue</p>
                    <span className="text-[10px] text-orange-500 font-semibold font-mono">High Priority</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-black rounded-lg border border-neutral-900">
                  <input type="checkbox" className="mt-0.5 rounded bg-neutral-900 border-neutral-800 text-orange-600 focus:ring-0" />
                  <div>
                    <p className="font-bold text-white">Review active market trend indexes</p>
                    <span className="text-[10px] text-neutral-500 font-mono">Planned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Content Waiting for Approval */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Awaiting Approval</span>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {pendingApproval.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">No posts need approval.</p>
                ) : (
                  pendingApproval.map((post) => (
                    <div key={post.id} className="p-2.5 bg-black border border-neutral-900 rounded-lg flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-neutral-500 font-mono uppercase">{post.platform} • {post.scheduledDate}</span>
                      </div>
                      <button
                        onClick={() => onApprovePost(post.id)}
                        className="p-1 bg-orange-600 hover:bg-orange-500 rounded text-white text-[9px] font-bold"
                      >
                        Approve
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Scheduled Posts */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Scheduled Posts</span>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {scheduledPosts.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">No scheduled posts yet.</p>
                ) : (
                  scheduledPosts.map((post) => (
                    <div key={post.id} className="p-2.5 bg-black border border-neutral-900 rounded-lg flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-emerald-400 font-mono uppercase font-bold">{post.platform} • {post.scheduledDate}</span>
                      </div>
                      <button
                        onClick={() => onPublishNow(post.id)}
                        className="p-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded text-[9px] font-bold"
                      >
                        Publish Now
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. Trend Alerts */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Trend Alerts</span>
              
              <div className="space-y-3">
                <div className="p-2.5 bg-black rounded-lg border border-neutral-900 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">#AutonomousWorkflows</h5>
                    <span className="text-[9px] text-neutral-500 block font-mono">Momentum: +54% this week</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[8px] font-mono font-bold">HOT</span>
                </div>

                <div className="p-2.5 bg-black rounded-lg border border-neutral-900 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">Lean Team Overheads</h5>
                    <span className="text-[9px] text-neutral-500 block font-mono">Momentum: +42% this week</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[8px] font-mono font-bold">HOT</span>
                </div>
              </div>
            </div>

          </div>

          {/* ================================== */}
          {/* BOTTOM SECTION                     */}
          {/* ================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* 1. Weekly & Monthly Summary */}
            <div className="lg:col-span-1 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Growth Summaries</span>
                
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">Weekly Summary:</h4>
                  <p className="text-xs text-neutral-400 leading-normal mt-1">
                    Organic social reach is up 12%, brand ledger density increased by 2 nodes, and 4 campaigns are finalized for release.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-200">Monthly Summary:</h4>
                  <p className="text-xs text-neutral-400 leading-normal mt-1">
                    Target Goal: 12 posts published, 10,000 sourced impressions. Current pace: On track to hit 115% of performance metrics.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('analytics')}
                className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                View Analytics Reports
              </button>
            </div>

            {/* 2. Recent Activity (History Log Feed) */}
            <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Recent Operating Activity Logs</span>
              
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {state.memoryLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 bg-black rounded-xl border border-neutral-900 flex gap-4 items-start hover:border-neutral-850 transition-all">
                    <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded text-[8px] font-mono font-bold uppercase mt-0.5">{log.type}</span>
                    <div className="space-y-0.5">
                      <p className="text-xs text-neutral-300 font-medium leading-relaxed">{log.note}</p>
                      <span className="text-[9px] text-neutral-500 font-mono block">Timestamp: {log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Quick Actions */}
            <div className="lg:col-span-1 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-2 block">Quick Action Keys</span>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => onNavigate('content')}
                  className="p-3 bg-black hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-750 text-left rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="text-xs font-semibold text-white">Create New Post Draft</div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => onNavigate('research')}
                  className="p-3 bg-black hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-750 text-left rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="text-xs font-semibold text-white">Recalculate Trends</div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                <button
                  onClick={() => onNavigate('profile')}
                  className="p-3 bg-black hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-750 text-left rounded-xl transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="text-xs font-semibold text-white">Update Brand Profile</div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
