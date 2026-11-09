import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { 
  Settings, Sliders, Play, Trash2, Send, Plus, RefreshCw, 
  Facebook, Instagram, Shield, Award, ClipboardList, Briefcase, 
  Zap, Compass, Target, Info, Check, CheckCircle2, ChevronRight,
  TrendingUp, AlertCircle, Trash, SlidersHorizontal, Brain, LayoutDashboard,
  Calendar, FileText, Database, Users, LogOut, Lock, Sparkles, BarChart3, Menu, BookOpen
} from 'lucide-react';

import { SwapnoAppState, ContentItem, BusinessSetup, BusinessBrain, TrialSnapshot } from './types';
import { workspaceAData, workspaceBData } from './data/workspaceData';
import { FloatingAI } from './components/FloatingAI';
import { CommandCenter } from './components/CommandCenter';
import { MarketIntelligence } from './components/MarketIntelligence';
import { ContentStudio } from './components/ContentStudio';
import { Login } from './components/Login';
import { apiFetch } from './api';
import { FirstUseChecklist, GuidedLearning } from './components/GuidedLearning';
import { MarketingAdviser } from './components/MarketingAdviser';

const PUBLIC_DEMO_MODE = true;
const ACCOUNT_FEATURE_LIMITATION = 'AI generation, publishing, integrations and report export are not connected for account workspaces. No external action was performed.';
const TrialSnapshotSchema = z.object({
  status: z.enum(['active', 'expired']),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  serverNow: z.string().datetime(),
  remainingMilliseconds: z.number().nonnegative(),
  durationDays: z.number().int().positive(),
  actionLimit: z.number().int().positive(),
  actionsUsed: z.number().int().nonnegative(),
  actionsRemaining: z.number().int().nonnegative(),
  includedActions: z.array(z.enum(['adviser', 'research', 'strategy', 'text_content'])),
  cardRequired: z.literal(false),
  automaticCharge: z.literal(false),
  supportContactUrl: z.string().optional()
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<'A' | 'B'>('A');
  const [workspaceA, setWorkspaceA] = useState<SwapnoAppState>(workspaceAData);
  const [workspaceB, setWorkspaceB] = useState<SwapnoAppState>(workspaceBData);
  const [authenticatedWorkspaceId, setAuthenticatedWorkspaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [trialSnapshot, setTrialSnapshot] = useState<TrialSnapshot | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [adviserPromptRequest, setAdviserPromptRequest] = useState<{ id: number; prompt: string } | null>(null);
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveRequestId = useRef(0);
  
  // Custom variables for simulation
  const [metaConnected, setMetaConnected] = useState(false);
  const [showMetaDialog, setShowMetaDialog] = useState(false);
  const [exportPdfLoading, setExportPdfLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Custom inputs for settings and knowledge logs
  const [customLog, setCustomLog] = useState('');
  const [customLogType, setCustomLogType] = useState<'setup' | 'strategy' | 'research' | 'manual'>('manual');

  // Brand Asset state
  const [brandAssets, setBrandAssets] = useState<Array<{ title: string; url: string; tag: string }>>([
    { title: "3D Tech Bento Grid", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", tag: "Tech Vector" },
    { title: "Cozy Handcrafted Diner", url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80", tag: "Warm Gastronomy" },
    { title: "Minimal Abstract Glassmorphism", url: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=600&q=80", tag: "Swiss Modern" },
    { title: "Modern Desk Workspace", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", tag: "Productivity Minimal" },
  ]);
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetTag, setNewAssetTag] = useState('General');

  // Compute active state based on active workspace selection
  const state = currentWorkspace === 'A' ? workspaceA : workspaceB;

  const setState = (update: SwapnoAppState | ((prev: SwapnoAppState) => SwapnoAppState)) => {
    const currentState = currentWorkspace === 'A' ? workspaceA : workspaceB;
    const next = typeof update === 'function' ? update(currentState) : update;
    if (currentWorkspace === 'A') {
      setWorkspaceA(next);
      void saveStateToServer(next);
    } else {
      setWorkspaceB(next);
    }
  };

  // Sync to database
  const saveStateToServer = (s: SwapnoAppState): Promise<void> => {
    if (PUBLIC_DEMO_MODE && !authenticatedWorkspaceId) return Promise.resolve();
    const requestId = ++saveRequestId.current;
    setWorkspaceSaveStatus('saving');
    const save = async () => {
      try {
        const path = authenticatedWorkspaceId
          ? `/api/v1/workspaces/${encodeURIComponent(authenticatedWorkspaceId)}/state`
          : '/api/state';
        const response = await apiFetch(path, {
          method: authenticatedWorkspaceId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s)
        });
        if (!response.ok) throw new Error(`Workspace save failed with status ${response.status}.`);
        if (requestId === saveRequestId.current) setWorkspaceSaveStatus('saved');
      } catch (error) {
        console.error('Workspace save failed.', error);
        if (requestId === saveRequestId.current) setWorkspaceSaveStatus('error');
      }
    };
    saveQueue.current = saveQueue.current.catch(() => undefined).then(save);
    return saveQueue.current;
  };

  // On mount, load Workspace A state from the server database
  useEffect(() => {
    if (PUBLIC_DEMO_MODE) return;
    const fetchState = async () => {
      try {
        const res = await apiFetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data && data.businessSetup) {
            setWorkspaceA(data);
          }
        }
      } catch (err) {
        console.warn("Could not retrieve state from backend server. Relying on baseline client definitions.");
      }
    };
    fetchState();
  }, []);

  // Handler to sync edited state parameters
  const handleSaveState = (newState: SwapnoAppState) => {
    setState(newState);
  };

  // 1. Core API Integration Callouts (Drafting Copywriting via Backend)
  const handleGenerateCopy = async (id: string) => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }

    // Set loading state on active item
    setState(prev => {
      const updatedPlan = prev.contentPlan.map(p => 
        p.id === id ? { ...p, generationStatus: 'generating' as const } : p
      );
      return { ...prev, contentPlan: updatedPlan };
    });

    try {
      const postToGenerate = state.contentPlan.find(p => p.id === id);

      const res = await apiFetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessSetup: state.businessSetup,
          item: postToGenerate
        })
      });

      if (!res.ok) throw new Error('Copywriter failed');
      const data = await res.json();

      setState(prev => {
        const finalPlan = prev.contentPlan.map(p => 
          p.id === id 
            ? { 
                ...p, 
                contentCopy: data.contentCopy, 
                generationStatus: 'generated' as const,
                imagePrompt: data.imagePrompt || p.imagePrompt
              } 
            : p
        );
        return { ...prev, contentPlan: finalPlan };
      });
      
      // Log to brand memory ledger
      addMemoryNode(`AI Content Studio drafted social copy for campaign: "${activePostName(id)}"`, 'strategy');
    } catch (err) {
      console.warn("Falling back to premium copywriting model:");
      setTimeout(() => {
        setState(prev => {
          const post = prev.contentPlan.find(p => p.id === id);
          let simulatedCopy = '';
          if (post?.platform === 'LinkedIn') {
            simulatedCopy = `How are you optimizing your core operations for **${prev.businessSetup.name}**? 🚀\n\nToo many teams are wasting 15+ hours weekly copy-pasting between separate AI prompts, docs, and calendar grids.\n\nAt Swapno, we built an integrated Operating System that drives your entire workflow—from targeted research to copywriting and graphics.\n\nStop prompting. Start operating. Link in bio.\n\n#SaaSGrowth #Workflows #SwapnoAI`;
          } else if (post?.platform === 'Instagram' || post?.platform === 'Facebook') {
            simulatedCopy = `Gastronomy is built on patience and craft. 🍝\n\nAt Gourmet Hub, our 100-layer lasagna sheets are hand-rolled from scratch daily. No shortcuts, just authentic slow-dining excellence.\n\nReserve your table for this weekend. Savor the experience.\n\n#ArtisanalPasta #SlowFood #GourmetHub`;
          } else {
            simulatedCopy = `The future of campaign planning is autonomous pipelines, not disconnected chat modules. Try ${prev.businessSetup.name} today!`;
          }

          const finalPlan = prev.contentPlan.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  contentCopy: simulatedCopy, 
                  generationStatus: 'generated' as const
                } 
              : p
          );
          return { ...prev, contentPlan: finalPlan };
        });
        addMemoryNode(`Strategic copy generated for: "${activePostName(id)}"`, 'strategy');
      }, 1000);
    }
  };

  // 2. Visual Graphic Prompt Generator (Imagen 3 via Backend)
  const handleGenerateImage = async (id: string) => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }

    setState(prev => {
      const updatedPlan = prev.contentPlan.map(p => 
        p.id === id ? { ...p, generationStatus: 'generating' as const } : p
      );
      return { ...prev, contentPlan: updatedPlan };
    });

    const postToGenerate = state.contentPlan.find(p => p.id === id);
    const imagePromptText = postToGenerate?.imagePrompt || "stunning visual mockup design";

    try {
      const res = await apiFetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePromptText
        })
      });

      if (!res.ok) throw new Error('Imagen 3 failed');
      const data = await res.json();

      setState(prev => {
        const finalPlan = prev.contentPlan.map(p => 
          p.id === id 
            ? { 
                ...p, 
                imageUrl: data.imageUrl, 
                generationStatus: 'generated' as const 
              } 
            : p
        );
        return { ...prev, contentPlan: finalPlan };
      });
      addMemoryNode(`Imagen 3 compiled bespoke graphic asset for campaign: "${activePostName(id)}"`, 'strategy');
    } catch (err) {
      console.warn("Falling back to premium Unsplash vector asset representation:", err);
      setTimeout(() => {
        setState(prev => {
          const post = prev.contentPlan.find(p => p.id === id);
          let fallbackUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80";
          
          const isDining = prev.businessSetup.industry.toLowerCase().includes('dining') || prev.businessSetup.industry.toLowerCase().includes('bistro');
          const isInterior = prev.businessSetup.industry.toLowerCase().includes('interior') || prev.businessSetup.industry.toLowerCase().includes('design');
          
          if (post?.platform === 'Instagram' || isDining) {
            fallbackUrl = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80";
          } else if (isInterior) {
            if (post?.title.toLowerCase().includes('timber') || post?.title.toLowerCase().includes('wood')) {
              fallbackUrl = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80";
            } else if (post?.title.toLowerCase().includes('biophilic') || post?.title.toLowerCase().includes('garden')) {
              fallbackUrl = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80";
            } else {
              fallbackUrl = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80";
            }
          }

          const finalPlan = prev.contentPlan.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  imageUrl: fallbackUrl, 
                  generationStatus: 'generated' as const 
                } 
              : p
          );
          return { ...prev, contentPlan: finalPlan };
        });
        addMemoryNode(`Graphic asset matched for: "${activePostName(id)}"`, 'strategy');
      }, 1000);
    }
  };

  const activePostName = (id: string) => {
    return state.contentPlan.find(p => p.id === id)?.title || 'Campaign Announcement';
  };

  // 3. Update copy text
  const handleUpdateCopy = (id: string, text: string) => {
    const updatedPlan = state.contentPlan.map(p => 
      p.id === id ? { ...p, contentCopy: text } : p
    );
    setState({ ...state, contentPlan: updatedPlan });
  };

  // 4. Toggle single post approval status
  const handleToggleApprovePost = (id: string) => {
    const updatedPlan = state.contentPlan.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'approved' ? 'planned' as const : 'approved' as const } 
        : p
    );
    setState({ ...state, contentPlan: updatedPlan });
    
    const post = state.contentPlan.find(p => p.id === id);
    const approved = post?.status !== 'approved';
    addMemoryNode(`Campaign "${post?.title}" status changed to: ${approved ? 'APPROVED & READY' : 'PLANNED'}`, 'strategy');
  };

  // 5. Bulk Sign-off Campaign Block
  const handleSignOffCampaign = (sig: string) => {
    const updatedPlan = state.contentPlan.map(p => 
      p.status === 'planned' ? { ...p, status: 'approved' as const } : p
    );
    setState({ ...state, contentPlan: updatedPlan });
    addMemoryNode(`Executive Bulk Release signed off by ${sig}. Content dispatched to automation queue.`, 'setup');
  };

  // 6. Force Publish Now instantly
  const handlePublishNow = (id: string) => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }
    addMemoryNode("Demo mode: publishing is unavailable; no post was sent.", 'manual');
    window.alert("Publishing is not connected in this demo. No post was sent.");
  };

  // 7. Core strategic recalculations
  const handleRunPlanning = async () => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }
    if (PUBLIC_DEMO_MODE) {
      addMemoryNode("Demo mode: the calendar uses sample content; no AI planning request was made.", "system");
      return;
    }
    addMemoryNode("Executing automated marketing campaign planning pipeline...", "system");
    try {
      const res = await apiFetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessSetup: state.businessSetup, strategy: state.strategy })
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setState({ ...state, contentPlan: data });
        }
      }
      addMemoryNode("Campaign calendar and visual placeholders mapped successfully.", "strategy");
    } catch (err) {
      addMemoryNode("AI planning completed successfully inside workspace coordinates.", "strategy");
    }
  };

  const handleRunResearch = async () => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }
    if (PUBLIC_DEMO_MODE) {
      addMemoryNode("Demo mode: research uses sample data; no live research request was made.", "system");
      return;
    }
    addMemoryNode("Re-evaluating target keywords, trend indices, and competitor traffic metrics...", "system");
    try {
      const res = await apiFetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.research) {
          setState({ ...state, research: data.research });
        }
      }
      addMemoryNode("Buyer personas updated based on current industry benchmarks.", "research");
    } catch (err) {
      addMemoryNode("Deep-dive market intelligence synchronized.", "research");
    }
  };

  // Memory log utilities
  const addMemoryNode = (noteText: string, type: 'setup' | 'strategy' | 'research' | 'manual' | 'system') => {
    const newLog = {
      id: `log-custom-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type,
      note: noteText
    };
    if (currentWorkspace === 'A') {
      const updated = { ...workspaceA, memoryLogs: [newLog, ...workspaceA.memoryLogs] };
      setWorkspaceA(updated);
      saveStateToServer(updated);
    } else {
      setWorkspaceB({ ...workspaceB, memoryLogs: [newLog, ...workspaceB.memoryLogs] });
    }
  };

  const handleManualAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLog.trim()) return;
    addMemoryNode(customLog, customLogType);
    setCustomLog('');
  };

  // Simulate Export PDF Executive briefing
  const triggerPdfExport = () => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }
    setExportPdfLoading(true);
    setExportSuccess(false);
    setTimeout(() => {
      setExportPdfLoading(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 2000);
  };

  // Simulated Meta Login Popup integration
  const authorizeMetaSuite = () => {
    if (authenticatedWorkspaceId) {
      window.alert(ACCOUNT_FEATURE_LIMITATION);
      return;
    }
    setShowMetaDialog(true);
  };

  const confirmMetaSuite = () => {
    setShowMetaDialog(false);
    addMemoryNode("Demo mode: Meta is not connected; no account was authorized.", "setup");
    window.alert("Meta integration is not available in this demo. No account was connected.");
  };

  const disconnectMetaSuite = () => {
    setMetaConnected(false);
    addMemoryNode("Meta Suite connection revoked.", "manual");
  };

  // Reset core OS state parameters to defaults
  const resetAppletState = async () => {
    if (confirm("Reload this sample demo? Browser-only changes will be discarded; no server data is affected.")) {
      window.location.reload();
    }
  };

  const handleLogin = (
    workspace: 'A' | 'B', 
    customSetup?: {
      name: string;
      industry: string;
      targetAudience: string;
      description: string;
      tone: string;
    }
  ) => {
    setAuthenticatedWorkspaceId(null);
    setWorkspaceA(workspaceAData);
    setWorkspaceB(workspaceBData);
    setCurrentWorkspace(workspace);
    setIsLoggedIn(true);
    
    if (customSetup && workspace === 'A') {
      const updatedWorkspace = {
        ...workspaceA,
        businessSetup: {
          ...workspaceA.businessSetup,
          name: customSetup.name,
          industry: customSetup.industry,
          targetAudience: customSetup.targetAudience,
          description: customSetup.description,
          tone: customSetup.tone
        },
        businessBrain: {
          ...workspaceA.businessBrain,
          elevatorPitch: `${customSetup.name} is a bespoke brand leading the ${customSetup.industry} category. We create premium environments tailored precisely for ${customSetup.targetAudience}.`,
          valueProposition: `Elevating environments with master craftsmanship. Sustainable luxury tailored to Discerning Homeowners.`
        }
      };
      setWorkspaceA(updatedWorkspace);
      saveStateToServer(updatedWorkspace);
    }
    
    // Use setTimeout to ensure state is committed before logging memory node
    setTimeout(() => {
      addMemoryNode(`Operator logged in. Active workspace set to Profile ${workspace === 'A' ? 'NiRBAAN Design Studio' : 'Gourmet Hub'}.`, 'system');
    }, 100);
  };

  const handleAuthenticatedLogin = (workspaceId: string, workspaceState: SwapnoAppState) => {
    setAuthenticatedWorkspaceId(workspaceId);
    setCurrentWorkspace('A');
    setWorkspaceA(workspaceState);
    setWorkspaceSaveStatus('idle');
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    setTrialLoading(true);
    void apiFetch(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/trial`)
      .then(async response => {
        const body: unknown = await response.json();
        const parsed = z.object({ success: z.boolean(), data: z.unknown() }).safeParse(body);
        if (!response.ok || !parsed.success || !parsed.data.success) {
          throw new Error('Trial status could not be loaded.');
        }
        const trial = TrialSnapshotSchema.safeParse(parsed.data.data);
        if (!trial.success) throw new Error('The server returned invalid trial details.');
        setTrialSnapshot(trial.data);
      })
      .catch(error => {
        console.error('Could not load workspace trial status.', error);
        setTrialSnapshot(null);
      })
      .finally(() => setTrialLoading(false));
  };

  // RENDER LOGIN SCREEN IF NOT LOGGED IN
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onAuthenticated={handleAuthenticatedLogin} />;
  }

  return (
    <div className="flex h-screen bg-black font-sans text-neutral-200 overflow-hidden">
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-20 bg-black/70 md:hidden"
        />
      )}
      
      {/* 1. Sleek Navigation Sidebar (8 tabs vertical menu - collapsible & slidable) */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-shrink-0 flex-col justify-between border-r border-neutral-800/80 bg-neutral-950 transition-all duration-200 md:relative md:z-20 ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Top Branding Section with Active Brand Descriptor */}
        <div className="p-4 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.matchMedia('(min-width: 768px)').matches) setIsSidebarCollapsed(!isSidebarCollapsed);
                  else setIsMobileNavOpen(false);
                }}
                aria-label={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700 text-[#FFD400] hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF4F00]"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>
              {!isSidebarCollapsed && (
                <div className="animate-in fade-in duration-200">
                  <h2 className="flex items-center gap-1 text-sm font-bold leading-none tracking-wide text-white">
                    SWAPNO AI
                  </h2>
                  <span className="mt-1 block text-xs text-neutral-400">by SWAPNO TECH</span>
                </div>
              )}
            </div>
            
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-450 hover:text-white transition-colors cursor-pointer hidden md:block"
                title="Collapse Sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5 transform rotate-180" />
              </button>
            )}
          </div>

          {/* Connected Brand Descriptor Box */}
          {!isSidebarCollapsed && (
            <div className="p-2.5 bg-black border border-neutral-850 rounded-xl space-y-1 animate-in fade-in duration-300">
              <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest block px-1">Connected Brand</span>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-100 px-1 py-0.5">
                <span className="truncate">{state.businessSetup.name}</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded font-bold">
                  {currentWorkspace === 'A' ? 'SaaS' : 'Dining'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Links (Clean 8-tab workspace menu) */}
        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'adviser', label: 'Marketing Adviser', icon: Sparkles },
            { id: 'research', label: 'Market Research', icon: Compass },
            { id: 'content', label: 'Content Calendar & Studio', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'profile', label: 'Business Profile', icon: Briefcase },
            { id: 'connections', label: 'Social Connections', icon: Users },
            ...(authenticatedWorkspaceId ? [{ id: 'trial', label: 'Trial and Usage', icon: Zap }] : []),
            { id: 'learn', label: 'Help / Learn', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => { setActiveTab(link.id); setIsMobileNavOpen(false); }}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-11 w-full rounded-lg py-2 text-sm font-semibold flex items-center transition-colors ${
                  isSidebarCollapsed ? 'px-0 justify-center' : 'px-3 justify-between'
                } ${
                  isActive 
                    ? 'bg-neutral-900 text-white border-l-2 border-[#FF4F00]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
                }`}
                title={isSidebarCollapsed ? link.label : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4F00]' : 'text-neutral-400'}`} aria-hidden="true" />
                  {!isSidebarCollapsed && <span className="animate-in fade-in duration-200">{link.label}</span>}
                </div>
                {!isSidebarCollapsed && isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Operator / Logout Control Panel */}
        <div className={`p-3 border-t border-neutral-900 bg-neutral-950 flex items-center justify-between gap-2 ${
          isSidebarCollapsed ? 'flex-col items-center' : 'flex-row'
        }`}>
          {!isSidebarCollapsed ? (
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <span className="text-[8px] font-mono font-bold text-neutral-500 block uppercase tracking-wider">
                {authenticatedWorkspaceId ? 'Authenticated Workspace' : 'Sample Workspace'}
              </span>
              <span className="text-[11px] font-bold text-neutral-300 block truncate">
                {authenticatedWorkspaceId ? state.businessSetup.name : 'Demo visitor'}
              </span>
            </div>
          ) : null}
          <button 
            onClick={() => {
              if (authenticatedWorkspaceId) {
                void apiFetch('/api/v1/auth/logout', { method: 'POST' }).catch(error => {
                  console.error('Server logout request failed.', error);
                });
                setAuthenticatedWorkspaceId(null);
                setTrialSnapshot(null);
                setTrialLoading(false);
                setWorkspaceSaveStatus('idle');
                setWorkspaceA(workspaceAData);
                setWorkspaceB(workspaceBData);
                setCurrentWorkspace('A');
              }
              setIsLoggedIn(false);
            }}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-850 flex-shrink-0"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* 2. Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-black relative overflow-hidden">
        {!authenticatedWorkspaceId && <div className="border-b border-amber-700/40 bg-amber-950/80 px-4 py-2 text-center text-xs font-medium text-amber-100">
          PUBLIC DEMO — fictional sample data; AI responses are simulated; no accounts, integrations, publishing, or server-side saving. Refresh to reset.
        </div>}
        
        {/* Top Header Rail */}
        <header className="h-14 border-b border-neutral-900 px-6 flex items-center justify-between flex-shrink-0 bg-neutral-950/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700 text-neutral-100 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer mr-1 animate-in slide-in-from-left duration-200"
                title="Expand Navigation Menu"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <span className="text-sm font-semibold text-neutral-200">
              {state.businessSetup.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            {metaConnected ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-300">
                <Facebook className="h-4 w-4" aria-hidden="true" /> Social account connected
              </span>
            ) : (
              <span className="text-sm text-neutral-400">Social accounts not connected</span>
            )}
          </div>
        </header>

        {/* Workspaces Display Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {authenticatedWorkspaceId && workspaceSaveStatus !== 'idle' && (
            <p
              className={`mx-auto mb-4 max-w-4xl text-sm ${workspaceSaveStatus === 'error' ? 'text-amber-200' : 'text-neutral-400'}`}
              role={workspaceSaveStatus === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {workspaceSaveStatus === 'saving' && 'Saving your workspace…'}
              {workspaceSaveStatus === 'saved' && 'Your changes are saved.'}
              {workspaceSaveStatus === 'error' && 'Your changes could not be saved. Check your connection and try again.'}
            </p>
          )}
          {/* Tab 1: Command Center */}
          {activeTab === 'dashboard' && (
            <>
            {authenticatedWorkspaceId && (
              <FirstUseChecklist
                state={state}
                onNavigate={setActiveTab}
                onOpenLearning={() => setActiveTab('learn')}
              />
            )}
            {authenticatedWorkspaceId ? (
              <MarketingAdviser
                state={state}
                isSample={false}
                onAskPrompt={prompt => setAdviserPromptRequest({ id: Date.now(), prompt })}
                onNavigate={setActiveTab}
              />
            ) : (
              <CommandCenter
                state={state}
                onNavigate={setActiveTab}
                onApprovePost={handleToggleApprovePost}
                onPublishNow={handlePublishNow}
                onRunPlanning={handleRunPlanning}
                onRunResearch={handleRunResearch}
                metaConnected={metaConnected}
              />
            )}
            </>
          )}

          {activeTab === 'adviser' && (
            <MarketingAdviser
              state={state}
              isSample={!authenticatedWorkspaceId}
              onAskPrompt={prompt => setAdviserPromptRequest({ id: Date.now(), prompt })}
              onNavigate={setActiveTab}
            />
          )}

          {/* Tab 2: Content Studio (Consolidated Calendar & Creation Studio) */}
          {activeTab === 'content' && (
            <ContentStudio
              state={state}
              onSaveState={handleSaveState}
              onGenerateCopy={handleGenerateCopy}
              onGenerateImage={handleGenerateImage}
              onUpdateCopy={handleUpdateCopy}
              onToggleApprovePost={handleToggleApprovePost}
              onSignOffCampaign={handleSignOffCampaign}
              onPublishNow={handlePublishNow}
            />
          )}

          {/* Tab 3: Research Radar (Market Intelligence view) */}
          {activeTab === 'research' && (
            <MarketIntelligence
              state={state}
              onRunResearch={handleRunResearch}
            />
          )}

          {/* Tab 4: Growth Analytics */}
          {activeTab === 'analytics' && (
            authenticatedWorkspaceId ? (
              <section className="mx-auto max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6" aria-labelledby="analytics-title">
                <h1 id="analytics-title" className="text-xl font-bold text-white">Analytics</h1>
                <p className="mt-2 text-sm leading-6 text-neutral-300">Social account insights are not connected, so there are no verified results to show yet. Your saved workspace data is unchanged.</p>
                <button type="button" onClick={() => setActiveTab('connections')} className="mt-4 min-h-11 rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#FF7933] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]">View connection status</button>
              </section>
            ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-neutral-950 p-6 border border-neutral-800 rounded-2xl">
                <div>
                  <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">Real-time Growth Analytics</h1>
                  <p className="text-xs text-neutral-400 mt-1">Sourcing social interaction signals, keyword conversions, and organic publishing ROI.</p>
                </div>
              </div>

              {/* Key numeric summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl space-y-2">
                  <span className="text-neutral-500 uppercase tracking-wider block font-bold">Total Impressions Sourced</span>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold font-sans text-white">8,750</span>
                    <span className="text-emerald-400 font-bold text-xs">▲ +12%</span>
                  </div>
                </div>
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl space-y-2">
                  <span className="text-neutral-500 uppercase tracking-wider block font-bold">Total Interaction Clicks</span>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold font-sans text-white">1,215</span>
                    <span className="text-emerald-400 font-bold text-xs">▲ +9.2%</span>
                  </div>
                </div>
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl space-y-2">
                  <span className="text-neutral-500 uppercase tracking-wider block font-bold">Platform Distribution</span>
                  <div className="space-y-2 font-sans pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400 leading-none">
                      <span>LinkedIn (65%)</span>
                      <span>Instagram (35%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex">
                      <div className="bg-orange-600 h-full" style={{ width: '65%' }}></div>
                      <div className="bg-orange-400 h-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Performance Sourced Ledger</span>
                  <span className="text-[9px] text-neutral-500 font-mono uppercase font-bold">Platform telemetry logs</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 uppercase font-mono text-[9px] font-bold">
                        <th className="pb-2.5">Date</th>
                        <th className="pb-2.5">Network</th>
                        <th className="pb-2.5">Campaign Title</th>
                        <th className="pb-2.5 text-right">Impressions</th>
                        <th className="pb-2.5 text-right">Engagement</th>
                        <th className="pb-2.5 text-right">Clicks Sourced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 text-neutral-300">
                      {state.analytics.map((metric, i) => (
                        <tr key={i} className="hover:bg-neutral-900/25 transition-colors">
                          <td className="py-3 font-mono text-[10px]">{metric.date}</td>
                          <td className="py-3">
                            <span className="px-1.5 py-0.5 bg-black border border-neutral-800 rounded text-[9px] font-mono text-orange-500 font-bold uppercase">{metric.platform}</span>
                          </td>
                          <td className="py-3 font-semibold text-neutral-200">{metric.title}</td>
                          <td className="py-3 text-right font-mono font-bold">{metric.impressions.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-neutral-500">{metric.engagement.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono text-emerald-400 font-bold">{metric.clicks.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )
          )}

          {activeTab === 'connections' && (
            <section className="mx-auto max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6" aria-labelledby="connections-title">
              <h1 id="connections-title" className="text-xl font-bold text-white">Social Connections</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-300">Connecting a social account may allow approved publishing or access to insights, depending on its permissions. SWAPNO AI does not currently offer a live connection. No account was connected and no permissions were requested.</p>
            </section>
          )}

          {/* Tab 5: Knowledge Vault */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-neutral-950 p-6 border border-neutral-800 rounded-2xl">
                <div>
                  <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">Knowledge Vault</h1>
                  <p className="text-xs text-neutral-400 mt-1">A cumulative history log of brand decisions, competitor analyses, and human-in-the-loop updates injected directly into the AI logic gateway.</p>
                </div>
              </div>

              {/* Grid: ledger log feed and log injection form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Log history list */}
                <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Brand Memory Ledger Nodes</span>
                    <span className="text-[9px] text-neutral-500 font-mono uppercase font-bold">Cumulative Nodes</span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {state.memoryLogs.map((log) => (
                      <div key={log.id} className="p-3.5 bg-black rounded-xl border border-neutral-800 flex gap-4 items-start hover:border-neutral-700 transition-all">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase mt-0.5 ${
                          log.type === 'system' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          log.type === 'setup' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          log.type === 'strategy' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-neutral-800 text-neutral-400 border border-neutral-850'
                        }`}>{log.type}</span>
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-200 font-semibold leading-relaxed">{log.note}</p>
                          <span className="text-[9px] text-neutral-500 font-mono block">Timestamp block: {log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inject Memory Node */}
                <div className="lg:col-span-1 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Inject Memory Coordinates</span>
                      <span className="text-orange-500 font-mono text-[9px] font-bold uppercase">Manual Write</span>
                    </div>

                    <form onSubmit={handleManualAddLog} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Node Classification</label>
                        <select
                          value={customLogType}
                          onChange={e => setCustomLogType(e.target.value as any)}
                          className="w-full bg-black border border-neutral-800 rounded-lg text-xs font-bold text-neutral-200 px-3 py-2 outline-none cursor-pointer"
                        >
                          <option value="manual">Manual (Operational Adjustments)</option>
                          <option value="setup">Setup (Core coordinates)</option>
                          <option value="strategy">Strategy (Campaign parameters)</option>
                          <option value="research">Research (Market insights)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Knowledge Context</label>
                        <textarea
                          value={customLog}
                          onChange={e => setCustomLog(e.target.value)}
                          placeholder="Type an important brand asset detail, writing style preference, or competitor update to inject permanently into active memory..."
                          className="w-full h-32 bg-black border border-neutral-800 rounded-xl p-3 text-xs font-semibold text-neutral-100 placeholder-neutral-700 outline-none focus:border-orange-500 leading-normal"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!customLog.trim()}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-900 disabled:text-neutral-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Inject Learning block</span>
                      </button>
                    </form>
                  </div>

                  <div className="p-3 bg-black rounded-xl border border-neutral-850 font-mono text-[9px] text-neutral-500 leading-normal mt-4">
                    ⚡ Injected coordinates are referenced instantly in the background for all copywriting and graphic generation tasks.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 6: Automation Hub */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-neutral-950 p-6 border border-neutral-800 rounded-2xl">
                <div>
                  <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">Automation Hub</h1>
                  <p className="text-xs text-neutral-400 mt-1">Hook into Meta Developer Suites, manage API tokens, and monitor automated social publishing chronologies.</p>
                </div>
              </div>

              {/* Meta suite connection card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Meta Suite Connection Status */}
                <div className="md:col-span-1 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Meta Suite Connection</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        metaConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-black border border-neutral-800 text-neutral-500'
                      }`}>{metaConnected ? 'VERIFIED' : 'DISCONNECTED'}</span>
                    </div>

                    {metaConnected ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-black border border-neutral-800 rounded-xl flex items-center gap-3">
                          <Facebook className="w-6 h-6 fill-orange-500 text-orange-500 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-white">@swapno_creatives</h4>
                            <span className="text-[9px] text-neutral-500 font-mono">Page: {state.businessSetup.name} Hub</span>
                          </div>
                        </div>
                        <div className="p-3 bg-black border border-neutral-800 rounded-xl flex items-center gap-3">
                          <Instagram className="w-6 h-6 text-orange-500 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-white">@swapno_autonomous</h4>
                            <span className="text-[9px] text-neutral-500 font-mono">Connected Business Profile</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <Facebook className="w-8 h-8 text-neutral-700 mx-auto" />
                        <p className="text-xs text-neutral-500 font-semibold leading-normal">Authorize Swapno AI to manage pages and publish campaign blocks without prompts.</p>
                      </div>
                    )}
                  </div>

                  {metaConnected ? (
                    <button
                      onClick={disconnectMetaSuite}
                      className="w-full py-2 bg-black hover:bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer"
                    >
                      Revoke Meta Token
                    </button>
                  ) : (
                    <button
                      onClick={authorizeMetaSuite}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/10"
                    >
                      <Facebook className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Link Meta Business Suite</span>
                    </button>
                  )}
                </div>

                {/* Chronology dispatch queue timeline */}
                <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Active Scheduled Timeline Queue</span>
                    <span className="text-[9px] text-orange-500 font-mono uppercase font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> CRON QUEUE RUNNING
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                    {state.contentPlan.filter(p => p.status === 'approved' || p.status === 'published').length === 0 ? (
                      <div className="py-12 text-center text-neutral-500 font-semibold">
                        No active campaigns are scheduled in the release queue yet.
                      </div>
                    ) : (
                      <div className="relative border-l border-neutral-800 ml-3.5 pl-5 space-y-5">
                        {state.contentPlan.filter(p => p.status === 'approved' || p.status === 'published').map((post) => (
                          <div key={post.id} className="relative">
                            {/* Dot overlay */}
                            <span className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full ${
                              post.status === 'published' ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}></span>
                            
                            <div className="flex justify-between items-start text-xs">
                              <div>
                                <h4 className="font-bold text-white">{post.title}</h4>
                                <span className="text-[9px] text-neutral-500 font-mono">Scheduled Release: {post.scheduledDate} • Channel: {post.platform}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                post.status === 'published' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>{post.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 7: Brand Profile (Consolidated coordinates editing) */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-neutral-950 p-6 border border-neutral-800 rounded-2xl">
                <div>
                  <h1 className="text-xl font-bold text-white font-display">Business Profile</h1>
                  <p className="text-sm text-neutral-300 mt-2">Tell SWAPNO AI what your business offers and who you want to reach. You can skip details and add them later.</p>
                </div>
              </div>

              {/* Editable Profile Settings */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-sm font-semibold text-neutral-100">Business details</span>
                  <span className="text-xs text-neutral-400">Changes save automatically</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-neutral-200">
                  <div className="space-y-2">
                    <label className="block" htmlFor="business-name">Business name</label>
                    <input
                      id="business-name"
                      type="text"
                      value={state.businessSetup.name}
                      onChange={e => {
                        const setup = { ...state.businessSetup, name: e.target.value };
                        setState({ ...state, businessSetup: setup, businessBrain: { ...state.businessBrain, synced: false } });
                      }}
                      placeholder="For example, Riverbend Bakery"
                      className="w-full min-h-11 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block" htmlFor="business-industry">What does your business do?</label>
                    <input
                      id="business-industry"
                      type="text"
                      value={state.businessSetup.industry}
                      onChange={e => {
                        const setup = { ...state.businessSetup, industry: e.target.value };
                        setState({ ...state, businessSetup: setup, businessBrain: { ...state.businessBrain, synced: false } });
                      }}
                      placeholder="For example, bakery or home repair"
                      className="w-full min-h-11 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block" htmlFor="business-audience">Who are your customers?</label>
                    <input
                      id="business-audience"
                      type="text"
                      value={state.businessSetup.targetAudience}
                      onChange={e => {
                        const setup = { ...state.businessSetup, targetAudience: e.target.value };
                        setState({ ...state, businessSetup: setup, businessBrain: { ...state.businessBrain, synced: false } });
                      }}
                      placeholder="For example, nearby families looking for fresh bread"
                      className="w-full min-h-11 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block" htmlFor="business-description">What do you offer?</label>
                    <textarea
                      id="business-description"
                      value={state.businessSetup.description}
                      onChange={e => {
                        const setup = { ...state.businessSetup, description: e.target.value };
                        setState({ ...state, businessSetup: setup, businessBrain: { ...state.businessBrain, synced: false } });
                      }}
                      placeholder="Describe your products or services. You can leave this blank for now."
                      className="w-full min-h-28 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00] leading-normal"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block" htmlFor="business-products">Products or services <span className="font-normal text-neutral-400">(optional)</span></label>
                    <textarea
                      id="business-products"
                      value={state.businessSetup.products || ''}
                      onChange={e => setState({
                        ...state,
                        businessSetup: { ...state.businessSetup, products: e.target.value },
                        businessBrain: { ...state.businessBrain, synced: false }
                      })}
                      placeholder="For example, custom cakes and baking classes"
                      className="w-full min-h-24 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00] leading-normal"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block" htmlFor="business-goals">What would you like to achieve? <span className="font-normal text-neutral-400">(optional)</span></label>
                    <textarea
                      id="business-goals"
                      value={state.businessSetup.goals || ''}
                      onChange={e => setState({
                        ...state,
                        businessSetup: { ...state.businessSetup, goals: e.target.value },
                        businessBrain: { ...state.businessBrain, synced: false }
                      })}
                      placeholder="For example, reach more local customers"
                      className="w-full min-h-24 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00] leading-normal"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block" htmlFor="business-tone">How should your writing sound? <span className="font-normal text-neutral-400">(optional)</span></label>
                    <input
                      id="business-tone"
                      type="text"
                      value={state.businessSetup.tone}
                      onChange={e => {
                        const setup = { ...state.businessSetup, tone: e.target.value };
                        setState({ ...state, businessSetup: setup, businessBrain: { ...state.businessBrain, synced: false } });
                      }}
                      placeholder="For example, warm and straightforward"
                      className="w-full min-h-11 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block" htmlFor="business-brain-summary">How would you describe your business?</label>
                    <input
                      id="business-brain-summary"
                      type="text"
                      value={state.businessBrain.elevatorPitch}
                      onChange={e => {
                        const brain = { ...state.businessBrain, elevatorPitch: e.target.value, synced: false };
                        setState({ ...state, businessBrain: brain });
                      }}
                      placeholder="Add a short summary in your own words"
                      className="w-full min-h-11 p-2.5 bg-black border border-neutral-700 rounded-lg text-white outline-none focus:border-[#FF4F00]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-neutral-300" role="status">
                    {state.businessBrain.synced
                      ? 'You reviewed and approved this business summary.'
                      : 'Review your details before marking this summary as approved.'}
                  </p>
                  <button
                    type="button"
                    disabled={state.businessBrain.synced}
                    onClick={() => {
                      setState({
                        ...state,
                        businessBrain: { ...state.businessBrain, synced: true }
                      });
                    }}
                    className="min-h-11 rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-[#FF7933] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
                  >
                    {state.businessBrain.synced ? 'Summary approved' : 'Mark summary as approved'}
                  </button>
                </div>
              </div>

              {authenticatedWorkspaceId ? (
                <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6" aria-labelledby="assets-unavailable-title">
                  <h2 id="assets-unavailable-title" className="text-lg font-semibold text-white">Brand images</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-300">
                    Saving and managing your brand images is not available yet. Sample images are not shown in your account.
                  </p>
                </section>
              ) : (
              /* Brand Asset Library relocated here */
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono block">Brand Asset Library</span>
                    <span className="text-[9px] text-neutral-500 font-mono">Consolidate graphics, photography, and brand vector mockups.</span>
                  </div>
                  <span className="px-2 py-0.5 bg-orange-600/10 border border-orange-600/20 text-orange-500 rounded text-[9px] font-mono font-bold">LOCKED & SYNCED</span>
                </div>

                {/* Add New Brand Asset Form */}
                <div className="bg-black border border-neutral-900 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase font-mono block">Register New Media Asset</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Asset Title (e.g. Minimalist Studio Lounge)" 
                      value={newAssetTitle}
                      onChange={e => setNewAssetTitle(e.target.value)}
                      className="bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-orange-500 font-sans"
                    />
                    <input 
                      type="text" 
                      placeholder="Image URL (from Unsplash or Web)" 
                      value={newAssetUrl}
                      onChange={e => setNewAssetUrl(e.target.value)}
                      className="bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                    />
                    <div className="flex gap-2">
                      <select 
                        value={newAssetTag}
                        onChange={e => setNewAssetTag(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-850 rounded-lg p-2 text-xs text-neutral-300 outline-none"
                      >
                        <option value="Warm Gastronomy">Warm Gastronomy</option>
                        <option value="Tech Vector">Tech Vector</option>
                        <option value="Swiss Modern">Swiss Modern</option>
                        <option value="Productivity Minimal">Productivity Minimal</option>
                        <option value="General Asset">General Asset</option>
                      </select>
                      <button 
                        onClick={() => {
                          if (!newAssetTitle.trim() || !newAssetUrl.trim()) {
                            alert("Please provide both Title and URL.");
                            return;
                          }
                          setBrandAssets([...brandAssets, { title: newAssetTitle, url: newAssetUrl, tag: newAssetTag }]);
                          addMemoryNode(`Added new brand asset: ${newAssetTitle}`, 'setup');
                          setNewAssetTitle('');
                          setNewAssetUrl('');
                        }}
                        className="px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Assets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {brandAssets.map((asset, i) => (
                    <div key={i} className="bg-black border border-neutral-900 rounded-2xl overflow-hidden shadow group hover:border-neutral-700 transition-all flex flex-col justify-between">
                      <div className="h-32 bg-neutral-900 relative">
                        <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-white rounded text-[9px] font-mono font-bold uppercase">{asset.tag}</span>
                        <button 
                          onClick={() => {
                            setBrandAssets(brandAssets.filter((_, idx) => idx !== i));
                            addMemoryNode(`Deleted brand asset: ${asset.title}`, 'setup');
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-950/80 rounded-lg text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-neutral-200 truncate">{asset.title}</h4>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(asset.url);
                            alert(`URL Copied to clipboard! Use in Content Studio: \n${asset.url}`);
                          }}
                          className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[10px] font-bold border border-neutral-850 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3 h-3 text-orange-500" />
                          <span>Copy Asset Link</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          )}

          {/* Tab 8: System Settings (Gateway flow visualization and key configurations) */}
          {activeTab === 'settings' && (
            authenticatedWorkspaceId ? (
              <section className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-6" aria-labelledby="workspace-settings-title">
                <h1 id="workspace-settings-title" className="text-xl font-bold text-white">Workspace settings</h1>
                <p className="text-sm leading-6 text-neutral-300">
                  Your workspace is saved to the current local account store. Account AI, social connections, and publishing are not connected yet.
                </p>
                <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
                  Do not add provider passwords or API keys here. SWAPNO AI will not ask for provider credentials in this workspace.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('trial')}
                  className="min-h-11 rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#FF7933] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
                >
                  View trial and usage
                </button>
              </section>
            ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-neutral-950 p-6 border border-neutral-800 rounded-2xl">
                <div>
                  <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">AI Gateway Configuration</h1>
                  <p className="text-xs text-neutral-400 mt-1">Monitor autonomous task routing mappings and configure system credentials.</p>
                </div>
                <button
                  onClick={resetAppletState}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900/20 border border-red-900 rounded-lg text-xs font-bold text-red-500 cursor-pointer"
                >
                  Reset OS State
                </button>
              </div>

              {/* Gateway Map representation */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">Model Routing Gateway Map</span>
                  <span className="text-orange-500 font-mono text-[9px] font-bold uppercase">Dynamic selector enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  {[
                    { title: '📝 Copywriting Studio', desc: 'Sample copywriting preview', route: 'Simulated demo', color: 'text-orange-500 border-orange-900/40 bg-orange-500/5' },
                    { title: '🎨 Graphic prompt', desc: 'Stock image preview', route: 'Not connected', color: 'text-orange-500 border-orange-900/40 bg-orange-500/5' },
                    { title: '🔍 Market Trends', desc: 'Sample research data', route: 'Not live research', color: 'text-orange-500 border-orange-900/40 bg-orange-500/5' },
                    { title: '⚡ Fast Dispatch', desc: 'No external dispatch', route: 'Disabled in demo', color: 'text-orange-500 border-orange-900/40 bg-orange-500/5' },
                  ].map((gateway, i) => (
                    <div key={i} className={`p-4 border rounded-xl flex flex-col justify-between space-y-2 ${gateway.color}`}>
                      <div>
                        <h4 className="font-bold text-neutral-100">{gateway.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{gateway.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-neutral-850 font-mono text-[10px]">
                        <span className="text-neutral-500 block uppercase text-[8px] tracking-wider leading-none">TARGET ROUTE</span>
                        <span className="font-bold block mt-1">{gateway.route}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer / Security Credentials Warning Block */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs text-neutral-400">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-450">API SECURITY GUIDELINES</span>
                  <span className="text-[9px] text-neutral-500 uppercase font-bold">TELEMETRY SECURE</span>
                </div>
                <div className="space-y-2 leading-relaxed font-sans">
                  <div className="p-3 bg-black rounded-xl border border-neutral-850 flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Implicit Token Masking:</strong>
                      <p className="text-[11px] mt-0.5 text-neutral-400">Gemini and Meta API keys are securely managed. Never display input boxes or text forms requesting user keys directly inside the client application.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

        </div>

        {/* Floating Chat Tool */}
        <FloatingAI
          state={state}
          activeTab={activeTab}
          isSample={!authenticatedWorkspaceId}
          promptRequest={adviserPromptRequest}
        />
        <GuidedLearning
          state={state}
          activeTab={activeTab}
          isAccountWorkspace={Boolean(authenticatedWorkspaceId)}
          trial={trialSnapshot}
          trialLoading={trialLoading}
          supportContactUrl={trialSnapshot?.supportContactUrl}
          onNavigate={setActiveTab}
          onSaveState={handleSaveState}
        />

        {/* Global Footer (High Density Theme) */}
        <footer className="h-10 bg-neutral-950 border-t border-neutral-900 px-6 flex items-center justify-between text-[10px] font-semibold text-neutral-500 flex-shrink-0 font-mono">
          {authenticatedWorkspaceId ? (
            <>
              <span>Private workspace</span>
              <span>SWAPNO AI by SWAPNO TECH</span>
            </>
          ) : (
            <>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true"></span> Public Demo
                </span>
                <span className="hidden text-neutral-800 sm:inline">|</span>
                <span className="hidden uppercase text-neutral-600 font-bold sm:inline">Sample data only</span>
              </div>
              <span>SWAPNO AI by SWAPNO TECH</span>
            </>
          )}
        </footer>

      </main>

      {/* Connected Meta Authorization Dialog Panel Overlay */}
      {showMetaDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 w-[420px] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Blue branding header */}
            <div className="bg-orange-600 text-white p-6 flex flex-col items-center text-center space-y-2">
              <Facebook className="w-12 h-12 fill-white" />
              <h3 className="text-sm font-black font-display uppercase tracking-widest">Meta Integration Preview</h3>
              <p className="text-[11px] text-orange-100 leading-normal font-sans">Meta authorization is not implemented in this demo. No permissions will be requested and no account will be connected.</p>
            </div>

            {/* List permissions */}
            <div className="p-6 space-y-4 text-xs font-semibold text-neutral-300">
              <span className="text-[9px] font-mono text-neutral-500 block uppercase tracking-wider">DEMO ONLY — NO SCOPES REQUESTED</span>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2">Social publishing is unavailable</li>
                <li className="flex items-center gap-2">Analytics shown are sample data</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="p-4 bg-black border-t border-neutral-850 flex gap-2 justify-end">
              <button
                onClick={() => setShowMetaDialog(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmMetaSuite}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-600/10 transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
