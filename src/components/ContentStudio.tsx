import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Sparkles, Eye, CheckCircle2, 
  ArrowRight, Edit3, Trash2, Check, RefreshCw, Copy,
  Linkedin, Twitter, Instagram, Facebook, Image as ImageIcon, Plus, X, 
  Clock, Link2, MessageSquare, Heart, Share2, Bookmark, ThumbsUp, Send, User, Award
} from 'lucide-react';
import { SwapnoAppState, ContentItem } from '../types';

interface ContentStudioProps {
  state: SwapnoAppState;
  onSaveState: (state: SwapnoAppState) => void;
  onGenerateCopy: (id: string) => void;
  onGenerateImage: (id: string) => void;
  onUpdateCopy: (id: string, text: string) => void;
  onToggleApprovePost: (id: string) => void;
  onSignOffCampaign: (signature: string) => void;
  onPublishNow: (id: string) => void;
}

type StudioTab = 'calendar' | 'drafts' | 'ideas' | 'approved' | 'scheduled' | 'published';

export function ContentStudio({
  state,
  onSaveState,
  onGenerateCopy,
  onGenerateImage,
  onUpdateCopy,
  onToggleApprovePost,
  onSignOffCampaign,
  onPublishNow
}: ContentStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('calendar');
  
  // Workspace Editing Modal State
  const [editingPost, setEditingPost] = useState<ContentItem | null>(null);
  
  // Temporary inputs inside the Workspace Modal
  const [tempCaption, setTempCaption] = useState('');
  const [tempHashtags, setTempHashtags] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempPillar, setTempPillar] = useState('');
  
  // New Reference Coordinates States
  const [tempRefImage, setTempRefImage] = useState('');
  const [tempRefLink, setTempRefLink] = useState('');
  const [tempSimilar1, setTempSimilar1] = useState('');
  const [tempSimilar2, setTempSimilar2] = useState('');
  const [tempImagePrompt, setTempImagePrompt] = useState('');

  // AI Ideas baseline
  const [aiIdeas, setAiIdeas] = useState([
    { id: 'idea-1', title: "Why traditional SaaS fails lean agencies", desc: "A post explaining how custom zero-effort pipelines maximize ROI over complex playgrounds.", platform: "LinkedIn", pillar: "Empowering Lean Teams" },
    { id: 'idea-2', title: "Behind the craft: Our 100-layer hand-rolled pasta sheets", desc: "A visual masterclass showcasing slow-dining organic focus and culinary patience.", platform: "Instagram", pillar: "Artisanal Craftsmanship" },
    { id: 'idea-3', title: "The 10-hour business: Modern campaign automation strategy", desc: "Actionable operational shifts for business owners to regain hours.", platform: "Twitter", pillar: "ROI & Time Savings" },
    { id: 'idea-4', title: "Stop copy-pasting your brand voice guidelines", desc: "Highlighting how the local AI brain coordinates consistent campaign delivery.", platform: "LinkedIn", pillar: "Unified Brand Strategy" }
  ]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5 text-blue-400" />;
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-neutral-400" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  // Open the modal and populate temporary states
  const openWorkspace = (post: ContentItem) => {
    setEditingPost(post);
    setTempCaption(post.contentCopy || '');
    setTempHashtags(post.hashtags || '');
    setTempNotes(post.notes || '');
    setTempImages(post.multipleImages || (post.imageUrl ? [post.imageUrl] : []));
    setTempTitle(post.title);
    setTempDate(post.scheduledDate);
    setTempPillar(post.pillar);
    setTempImagePrompt(post.imagePrompt || '');
    setTempRefImage(post.referenceImageUrl || '');
    setTempRefLink(post.referenceLinkUrl || '');
    setTempSimilar1(post.similarPostReference1 || '');
    setTempSimilar2(post.similarPostReference2 || '');
    setNewImageUrl('');
  };

  // Close the modal and save changes to active state
  const saveAndCloseWorkspace = () => {
    if (!editingPost) return;
    const updatedPlan = state.contentPlan.map(p => 
      p.id === editingPost.id 
        ? { 
            ...p, 
            title: tempTitle, 
            scheduledDate: tempDate, 
            pillar: tempPillar, 
            contentCopy: tempCaption, 
            hashtags: tempHashtags, 
            notes: tempNotes, 
            multipleImages: tempImages,
            imageUrl: tempImages[0] || undefined,
            imagePrompt: tempImagePrompt,
            referenceImageUrl: tempRefImage,
            referenceLinkUrl: tempRefLink,
            similarPostReference1: tempSimilar1,
            similarPostReference2: tempSimilar2
          } 
        : p
    );
    onSaveState({ ...state, contentPlan: updatedPlan });
    setEditingPost(null);
  };

  // Immediate operations
  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const updatedPlan = state.contentPlan.filter(p => p.id !== id);
      onSaveState({ ...state, contentPlan: updatedPlan });
      setEditingPost(null);
    }
  };

  const handleDuplicatePost = (post: ContentItem) => {
    const duplicated: ContentItem = {
      ...post,
      id: `post-dup-${Date.now()}`,
      title: `${post.title} (Copy)`,
      scheduledDate: post.scheduledDate,
      status: 'planned'
    };
    onSaveState({ ...state, contentPlan: [...state.contentPlan, duplicated] });
    openWorkspace(duplicated);
  };

  const handleAddNewPost = (dateStr?: string) => {
    const newPost: ContentItem = {
      id: `post-custom-${Date.now()}`,
      title: "New Custom Campaign Title",
      platform: "LinkedIn",
      scheduledDate: dateStr || "2026-07-15",
      pillar: state.strategy.pillars[0] || "ROI & Time Savings",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "",
      imagePrompt: "A sleek abstract minimal graphic showing glowing glass shapes, warm orange accents"
    };
    onSaveState({ ...state, contentPlan: [...state.contentPlan, newPost] });
    openWorkspace(newPost);
  };

  const handleConvertIdeaToDraft = (idea: { title: string; desc: string; platform: string; pillar: string }) => {
    const newPost: ContentItem = {
      id: `post-idea-${Date.now()}`,
      title: idea.title,
      platform: idea.platform,
      scheduledDate: "2026-07-18",
      pillar: idea.pillar,
      status: "planned",
      generationStatus: "pending",
      contentCopy: `💡 ${idea.title}\n\n${idea.desc}\n\nDrafted dynamically via Swapno AI.`,
      imagePrompt: `A gorgeous vector artwork showing a minimal representation of ${idea.title}, modern corporate clean look`
    };
    onSaveState({ ...state, contentPlan: [...state.contentPlan, newPost] });
    openWorkspace(newPost);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setTempImages([...tempImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setTempImages(tempImages.filter((_, idx) => idx !== index));
  };

  // Dynamically Suggest Image Prompt based on Brand profile
  const handleSuggestPrompt = () => {
    const isNiRBAAN = state.businessSetup.name.toLowerCase().includes('nirbaan');
    const isGourmet = state.businessSetup.name.toLowerCase().includes('gourmet') || state.businessSetup.industry.toLowerCase().includes('dining');
    
    let suggested = "";
    if (isNiRBAAN) {
      suggested = `Sophisticated modern interior detail, hand-plastered sand texture plaster wall casting soft warm shadow from structural timber slats, low concrete plinth with minimal ceramic plate, architectural digest editorial photography, neutral earthy palette`;
    } else if (isGourmet) {
      suggested = `Artisanal raw preparation close up, 100-layer fresh organic pasta sheets being gently folded, light dusting of golden semolina flour floating in warm afternoon bistro sunlight, rustic marble counter, award winning food photography`;
    } else {
      suggested = `Premium 3D abstract glassmorphism bento grid, glowing data nodes, smooth orange energy flows, floating glass panels, high depth of field, minimalist tech visual asset`;
    }
    setTempImagePrompt(suggested);
  };

  // Helper to generate competitor posts context
  const getSimilarPostsContext = (platform: string) => {
    const isNiRBAAN = state.businessSetup.name.toLowerCase().includes('nirbaan');
    const isGourmet = state.businessSetup.name.toLowerCase().includes('gourmet') || state.businessSetup.industry.toLowerCase().includes('dining');
    
    if (isNiRBAAN) {
      return [
        { author: "Norm Architects", copy: "Embracing natural clay plaster, warm timber and soft shadows. Creating spaces of profound silence.", engagement: "14.2k engagements", tag: "Clay & Wood Design" },
        { author: "Studio MK27", copy: "Sliding oak screens that let daylight interact with brutalist sand-finished concrete walls.", engagement: "9.8k engagements", tag: "Brutalist Warmth" }
      ];
    } else if (isGourmet) {
      return [
        { author: "Osteria Francescana", copy: "The raw art of handmade ravioli: dusting organic flour in the dim morning light. Celebrating slow gastronomy.", engagement: "18.5k engagements", tag: "Artisanal Prep" },
        { author: "Gucci Osteria", copy: "Porcelain handcrafted tabletop layout displaying fresh chemical-free harvest coordinates.", engagement: "11.2k engagements", tag: "Luxury Gastronomy" }
      ];
    } else {
      return [
        { author: "Linear App", copy: "Designing clean borders with dark glass shadows. Small visual decisions compound into product trust.", engagement: "24.1k engagements", tag: "Design Craft" },
        { author: "Vercel Systems", copy: "Bundling backend TypeScript handlers into zero-overhead runtime layers to reduce container cold starts.", engagement: "15.4k engagements", tag: "Engineering Flow" }
      ];
    }
  };

  // Days of July 2026 (July 1st, 2026 starts on a Wednesday)
  const paddingDays = 3;
  const daysInMonth = 31;
  const calendarCells = Array.from({ length: paddingDays + daysInMonth }, (_, idx) => {
    if (idx < paddingDays) return null;
    return idx - paddingDays + 1;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Editorial Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-950 p-6 border border-neutral-900 rounded-2xl gap-4">
        <div>
          <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">Content Studio</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Develop captions, generate graphic concepts, organize multiple assets, and approve campaigns.
          </p>
        </div>
        
        <button
          onClick={() => handleAddNewPost()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/15"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Custom Post</span>
        </button>
      </div>

      {/* Navigation tabs for the Content Studio sections (Consolidated, No Brand Asset Library tab here) */}
      <div className="flex flex-wrap bg-neutral-950 p-1 border border-neutral-900 rounded-xl max-w-fit gap-1">
        {[
          { id: 'calendar', label: 'Monthly Calendar', icon: CalendarIcon },
          { id: 'drafts', label: 'Drafts', icon: Edit3 },
          { id: 'ideas', label: 'AI Ideas', icon: Sparkles },
          { id: 'approved', label: 'Approved', icon: CheckCircle2 },
          { id: 'scheduled', label: 'Scheduled', icon: Clock },
          { id: 'published', label: 'Published', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-orange-600 text-white shadow shadow-orange-600/10' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================== */}
      {/* TAB CONTENTS                       */}
      {/* ================================== */}

      {/* 1. Monthly Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">July 2026 Editorial Grid</span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Interactive Day Scheduler</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase font-bold text-neutral-500 mb-1">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`pad-${idx}`} className="h-20 bg-neutral-900/10 border border-transparent rounded-lg"></div>;
              }

              const formattedDate = `2026-07-${day.toString().padStart(2, '0')}`;
              const matchingPosts = state.contentPlan.filter(p => p.scheduledDate === formattedDate);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleAddNewPost(formattedDate)}
                  className="h-20 p-2 rounded-lg border border-neutral-900 bg-black/60 hover:bg-neutral-900/40 cursor-pointer flex flex-col justify-between transition-all group hover:border-neutral-700"
                >
                  <span className="text-[10px] font-mono font-bold text-neutral-400 leading-none">{day}</span>
                  
                  {matchingPosts.length > 0 ? (
                    <div className="space-y-1 mt-1 max-h-[48px] overflow-hidden">
                      {matchingPosts.map(post => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorkspace(post);
                          }}
                          className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 px-1.5 py-0.5 rounded text-[9px] truncate"
                        >
                          {getPlatformIcon(post.platform)}
                          <span className="text-neutral-200 truncate leading-none font-semibold">{post.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[8px] text-neutral-700 opacity-0 group-hover:opacity-100 transition-all">
                      + Add draft
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Drafts */}
      {activeTab === 'drafts' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-3 block">Campaign Drafts</span>
          
          {state.contentPlan.filter(p => p.status === 'planned').length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">No campaign drafts found. Create one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.contentPlan.filter(p => p.status === 'planned').map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => openWorkspace(post)}
                  className="p-4 bg-black border border-neutral-900 rounded-2xl cursor-pointer hover:border-neutral-700 transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-orange-500 font-bold">
                      {getPlatformIcon(post.platform)}
                      <span>{post.platform} • Scheduled: {post.scheduledDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{post.title}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {post.contentCopy || "No written copy. Click to open copywriting assistant."}
                    </p>
                  </div>
                  <button className="p-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white flex-shrink-0">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. AI Ideas */}
      {activeTab === 'ideas' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-3 block">Bespoke AI Campaign Ideas</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiIdeas.map((idea) => (
              <div 
                key={idea.id} 
                className="p-5 bg-black border border-neutral-900 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-orange-500">
                    <span>{idea.platform}</span>
                    <span className="text-neutral-500">{idea.pillar}</span>
                  </div>
                  <h3 className="text-sm font-black text-white">{idea.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {idea.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleConvertIdeaToDraft(idea)}
                  className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Convert to Campaign Draft</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Approved */}
      {activeTab === 'approved' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-3 block">Approved & Signed Off Content</span>
          
          {state.contentPlan.filter(p => p.status === 'approved').length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">No approved posts found. Approve drafts to sync them to the publishing queue!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.contentPlan.filter(p => p.status === 'approved').map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => openWorkspace(post)}
                  className="p-4 bg-black border border-neutral-900 rounded-2xl cursor-pointer hover:border-neutral-700 transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      {getPlatformIcon(post.platform)}
                      <span>{post.platform} • Scheduled: {post.scheduledDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{post.title}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {post.contentCopy || "No written copy."}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold">APPROVED</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Scheduled */}
      {activeTab === 'scheduled' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-3 block">Active Scheduled Queue</span>
          
          {state.contentPlan.filter(p => p.status === 'approved').length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">No scheduled campaigns in queue. Sign off drafts to deploy scheduled publishing!</p>
          ) : (
            <div className="space-y-3">
              {state.contentPlan.filter(p => p.status === 'approved').map((post) => (
                <div 
                  key={post.id}
                  onClick={() => openWorkspace(post)}
                  className="p-4 bg-black border border-neutral-900 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-neutral-800 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-neutral-400">
                      {getPlatformIcon(post.platform)}
                      <span className="uppercase">{post.platform}</span>
                      <span>•</span>
                      <span>Scheduled Release: {post.scheduledDate}</span>
                    </div>
                    <h4 className="text-sm font-black text-white">{post.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-bold">SCHEDULED</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPublishNow(post.id);
                      }}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-bold"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Published */}
      {activeTab === 'published' && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-3 block">Published Campaign History</span>
          
          {state.contentPlan.filter(p => p.status === 'published').length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">No published posts found. Complete publishing tasks to track history!</p>
          ) : (
            <div className="space-y-3">
              {state.contentPlan.filter(p => p.status === 'published').map((post) => (
                <div 
                  key={post.id}
                  onClick={() => openWorkspace(post)}
                  className="p-4 bg-black border border-neutral-900 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-neutral-800 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-neutral-400">
                      {getPlatformIcon(post.platform)}
                      <span className="uppercase">{post.platform}</span>
                      <span>•</span>
                      <span>Published Date: {post.scheduledDate}</span>
                    </div>
                    <h4 className="text-sm font-black text-white">{post.title}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-[9px] font-mono font-bold uppercase">Published Live</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================== */}
      {/* UNIFIED WORKSPACE DUAL-PANE DRAWER / EDITING MODAL  */}
      {/* =================================================== */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-7xl h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-neutral-900/60 p-5 border-b border-neutral-850 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-xl text-white shadow shadow-orange-600/10">
                  {getPlatformIcon(editingPost.platform)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight font-display">{tempTitle || 'Campaign Workspace'}</h3>
                  <p className="text-[10px] text-neutral-400">Pillar Target: <strong>{tempPillar}</strong> • Release Date: {tempDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-[9px] font-mono font-bold text-neutral-400 rounded-lg">
                  WORKSPACE CONSOLE ID: {editingPost.id.toUpperCase()}
                </span>
                <button 
                  onClick={() => setEditingPost(null)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Contents - Dual Pane Split */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              
              {/* LEFT PANE: Collaborative Editorial controls (60% width) */}
              <div className="w-full lg:w-3/5 overflow-y-auto p-6 space-y-6 border-r border-neutral-900">
                
                {/* 1. Campaign Metadata Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black p-4 rounded-2xl border border-neutral-900">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Campaign Title</label>
                    <input 
                      type="text" 
                      value={tempTitle} 
                      onChange={e => setTempTitle(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Schedule Date</label>
                    <input 
                      type="date" 
                      value={tempDate} 
                      onChange={e => setTempDate(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none font-mono focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-neutral-500 font-bold uppercase font-mono block">Marketing Pillar</label>
                    <select 
                      value={tempPillar} 
                      onChange={e => setTempPillar(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:border-orange-500"
                    >
                      {state.strategy.pillars.map((pil, idx) => (
                        <option key={idx} value={pil}>{pil}</option>
                      ))}
                      <option value="General Brand Focus">General Brand Focus</option>
                    </select>
                  </div>
                </div>

                {/* 2. Textual Copy & Hashtags Block */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide">Edit Caption Copy</label>
                      <span className="text-[10px] text-neutral-500 font-mono">{tempCaption.length} characters</span>
                    </div>
                    <textarea 
                      value={tempCaption}
                      onChange={e => setTempCaption(e.target.value)}
                      placeholder="Write your beautiful post copy here. Or click Regenerate below to let Swapno AI craft it based on your Brand Guidelines."
                      className="w-full h-40 bg-black border border-neutral-850 rounded-2xl p-4 text-xs font-medium text-neutral-200 leading-relaxed outline-none focus:border-orange-500 font-sans resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">Trending Hashtags</label>
                      <input 
                        type="text"
                        value={tempHashtags}
                        onChange={e => setTempHashtags(e.target.value)}
                        placeholder="e.g. #Automation #MarketingOS"
                        className="w-full bg-black border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-neutral-200 outline-none font-mono focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">Internal Strategy Notes</label>
                      <input 
                        type="text"
                        value={tempNotes}
                        onChange={e => setTempNotes(e.target.value)}
                        placeholder="e.g. Focus on driving organic website signups"
                        className="w-full bg-black border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-neutral-200 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. AI Graphic Prompt Synthesis Engine (Suggested Prompt) */}
                <div className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-850 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Imagen 3 Prompt Synthesizer</span>
                    </div>
                    <button 
                      onClick={handleSuggestPrompt}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Suggest AI Prompt</span>
                    </button>
                  </div>

                  <textarea 
                    value={tempImagePrompt}
                    onChange={e => setTempImagePrompt(e.target.value)}
                    placeholder="Enter visual graphic prompt description..."
                    className="w-full h-16 bg-black border border-neutral-850 rounded-xl p-3 text-xs text-neutral-300 outline-none focus:border-orange-500 font-sans resize-none"
                  />
                </div>

                {/* 4. Multiple Images Management */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">Campaign Graphic Media Assets</label>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="Paste asset URL (Copy from Brand Profile Library or web)..."
                      className="flex-1 bg-black border border-neutral-850 rounded-xl px-3 py-2 text-xs text-neutral-250 outline-none font-mono focus:border-orange-500"
                    />
                    <button 
                      onClick={addImageUrl}
                      className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Image Grid Stack */}
                  <div className="flex gap-2.5 flex-wrap pt-1">
                    {tempImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
                        <img src={img} alt={`Asset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => removeImageUrl(i)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-neutral-900 rounded text-red-500 transition-colors"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {tempImages.length === 0 && (
                      <div className="w-full py-6 text-center border border-dashed border-neutral-900 rounded-xl text-[10px] text-neutral-500">
                        No image assets attached. Use AI Regenerate Image or insert from Library.
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Reference Coordinates and Link addition (Requested Option) */}
                <div className="bg-black p-5 border border-neutral-900 rounded-2xl space-y-4">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono block">Reference Guidelines (Optional)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-neutral-500 font-bold uppercase block font-mono">Reference Inspiration Link</label>
                      <div className="flex items-center bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-1.5">
                        <Link2 className="w-3.5 h-3.5 text-neutral-500 mr-2 flex-shrink-0" />
                        <input 
                          type="text" 
                          placeholder="https://example.com/competitor-post"
                          value={tempRefLink}
                          onChange={e => setTempRefLink(e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-neutral-200 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-neutral-500 font-bold uppercase block font-mono">Reference Image URL</label>
                      <div className="flex items-center bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-500 mr-2 flex-shrink-0" />
                        <input 
                          type="text" 
                          placeholder="https://unsplash.com/photos/layout-draft"
                          value={tempRefImage}
                          onChange={e => setTempRefImage(e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-neutral-200 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Similar Competitor Post references (Requested 1-2 refs) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 font-mono block">Market Intelligence: Similar Industry References</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getSimilarPostsContext(editingPost.platform).map((compPost, idx) => (
                      <div key={idx} className="p-4 bg-neutral-950/40 border border-neutral-900 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[9px] text-white">
                              {compPost.author[0]}
                            </div>
                            <span className="text-xs font-bold text-white">{compPost.author}</span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-orange-500/10 text-[8px] text-orange-500 border border-orange-500/20 font-bold font-mono rounded">
                            {compPost.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-medium italic">
                          "{compPost.copy}"
                        </p>
                        <div className="pt-2 border-t border-neutral-900 flex items-center text-[9px] text-neutral-500 font-mono">
                          <ThumbsUp className="w-3 h-3 text-neutral-600 mr-1" />
                          <span>{compPost.engagement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT PANE: Real-time Multi-Platform Mockup Feeds (40% width) */}
              <div className="w-full lg:w-2/5 bg-neutral-950/40 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start border-l border-neutral-950">
                <div className="w-full max-w-sm space-y-6">
                  
                  <div className="text-center space-y-1.5">
                    <span className="text-[9px] font-bold text-orange-500 tracking-widest uppercase font-mono">Real-Time Screen Preview</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">Active Platform Render</h4>
                    <p className="text-[10px] text-neutral-500">Simulating live placement on {editingPost.platform} user feed coordinates.</p>
                  </div>

                  {/* PLATFORM SPECIFIC FEED DECORATOR */}
                  {editingPost.platform.toLowerCase() === 'linkedin' && (
                    <div className="bg-[#1b1f23] border border-[#2d3136] rounded-xl overflow-hidden shadow-xl text-neutral-200 text-xs animate-in slide-in-from-bottom duration-300">
                      {/* LinkedIn Header */}
                      <div className="p-3.5 flex justify-between items-start">
                        <div className="flex gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-orange-500 text-sm">
                            {state.businessSetup.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{state.businessSetup.name}</span>
                              <Award className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div className="text-[10px] text-neutral-400">1st • {state.businessSetup.industry}</div>
                            <div className="text-[9px] text-neutral-500 flex items-center gap-1 font-mono">1h • Edited • <Clock className="w-2.5 h-2.5" /></div>
                          </div>
                        </div>
                        <button className="text-xs text-[#70b5f9] font-black hover:bg-[#202c38] px-2.5 py-1 rounded-lg">
                          + Follow
                        </button>
                      </div>

                      {/* LinkedIn Caption Text */}
                      <div className="px-3.5 pb-3 space-y-2 leading-relaxed text-neutral-200">
                        <p className="whitespace-pre-wrap">{tempCaption || "Type copy or generate copy on the left to see it populate here..."}</p>
                        <p className="text-[#70b5f9] font-semibold font-mono whitespace-pre-wrap">{tempHashtags}</p>
                      </div>

                      {/* LinkedIn Attached Image */}
                      <div className="bg-[#12161a] border-t border-b border-[#2d3136] relative min-h-[220px] flex items-center justify-center overflow-hidden">
                        {tempImages[0] ? (
                          <img 
                            src={tempImages[0]} 
                            alt="Linkedin upload mockup" 
                            className="w-full h-auto object-cover max-h-[300px]" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="p-8 text-center text-neutral-600 space-y-2">
                            <ImageIcon className="w-8 h-8 mx-auto opacity-40 text-orange-500" />
                            <p className="text-[10px] font-bold">Generate campaign graphic or paste URL to preview</p>
                          </div>
                        )}
                      </div>

                      {/* LinkedIn Likes Row */}
                      <div className="px-3.5 py-2.5 border-b border-[#2d3136] flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[8px]">👍</span>
                          <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[8px]">❤️</span>
                          <span>{state.businessSetup.name.length * 12 + 4} likes</span>
                        </span>
                        <span>{state.businessSetup.name.length * 2} comments • {state.businessSetup.name.length} shares</span>
                      </div>

                      {/* LinkedIn Bottom Actions */}
                      <div className="p-2 flex justify-around text-neutral-400 font-bold text-[11px] font-mono">
                        <span className="flex items-center gap-1 py-1 px-2 hover:bg-neutral-800 rounded-md cursor-pointer"><ThumbsUp className="w-3.5 h-3.5" /> Like</span>
                        <span className="flex items-center gap-1 py-1 px-2 hover:bg-neutral-800 rounded-md cursor-pointer"><MessageSquare className="w-3.5 h-3.5" /> Comment</span>
                        <span className="flex items-center gap-1 py-1 px-2 hover:bg-neutral-800 rounded-md cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Share</span>
                      </div>
                    </div>
                  )}

                  {editingPost.platform.toLowerCase() === 'instagram' && (
                    <div className="bg-black border border-neutral-900 rounded-2xl overflow-hidden shadow-xl text-neutral-200 text-xs animate-in slide-in-from-bottom duration-300">
                      {/* Instagram Header */}
                      <div className="p-3.5 flex justify-between items-center border-b border-neutral-900">
                        <div className="flex gap-2.5 items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-orange-500 text-xs">
                              {state.businessSetup.name[0]}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1">
                              <span>{state.businessSetup.name.toLowerCase().replace(/\s+/g, '')}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            </div>
                            <span className="text-[9px] text-neutral-400 block leading-none">Sponsored • {state.businessSetup.industry}</span>
                          </div>
                        </div>
                        <span className="text-sm font-black tracking-tight text-neutral-400 cursor-pointer">•••</span>
                      </div>

                      {/* Instagram Image Post Area */}
                      <div className="bg-neutral-950 aspect-square relative flex items-center justify-center overflow-hidden border-b border-neutral-900">
                        {tempImages[0] ? (
                          <img 
                            src={tempImages[0]} 
                            alt="Instagram post draft preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="p-8 text-center text-neutral-600 space-y-2">
                            <ImageIcon className="w-8 h-8 mx-auto opacity-40 text-orange-500" />
                            <p className="text-[10px] font-bold">Bespoke graphic canvas renders here</p>
                          </div>
                        )}
                      </div>

                      {/* Instagram Action Buttons Row */}
                      <div className="p-3.5 flex justify-between items-center">
                        <div className="flex gap-4">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500 cursor-pointer" />
                          <MessageSquare className="w-5 h-5 hover:text-neutral-400 cursor-pointer" />
                          <Send className="w-5 h-5 hover:text-neutral-400 cursor-pointer" />
                        </div>
                        <Bookmark className="w-5 h-5 hover:text-neutral-400 cursor-pointer" />
                      </div>

                      {/* Instagram Likes Counter */}
                      <div className="px-3.5 font-bold text-white pb-1 font-mono text-[10px]">
                        {state.businessSetup.name.length * 8 + 120} likes
                      </div>

                      {/* Instagram Caption */}
                      <div className="px-3.5 pb-4 space-y-1 text-[11px] leading-relaxed">
                        <span className="font-bold text-white mr-1.5">{state.businessSetup.name.toLowerCase().replace(/\s+/g, '')}</span>
                        <span className="text-neutral-300 whitespace-pre-wrap">{tempCaption || "Enter captions on the left..."}</span>
                        <div className="text-blue-400 font-mono font-medium block whitespace-pre-wrap pt-1">{tempHashtags}</div>
                        <span className="text-[8px] text-neutral-500 font-mono block uppercase pt-2">2 MINUTES AGO</span>
                      </div>
                    </div>
                  )}

                  {editingPost.platform.toLowerCase() === 'twitter' && (
                    <div className="bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden shadow-xl text-neutral-200 text-xs animate-in slide-in-from-bottom duration-300 p-4 space-y-3">
                      {/* Twitter Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-white text-sm">
                            {state.businessSetup.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1">
                              <span>{state.businessSetup.name}</span>
                              <span className="text-sky-400">✓</span>
                            </div>
                            <div className="text-[10px] text-neutral-500">@{state.businessSetup.name.toLowerCase().replace(/\s+/g, '')} • 1m</div>
                          </div>
                        </div>
                        <span className="text-xs font-black text-neutral-500">X</span>
                      </div>

                      {/* Twitter Body text */}
                      <div className="space-y-2 leading-relaxed text-[13px] text-neutral-100">
                        <p className="whitespace-pre-wrap">{tempCaption || "Tweet coordinates will render in real-time here..."}</p>
                        <p className="text-sky-400 font-mono text-xs whitespace-pre-wrap">{tempHashtags}</p>
                      </div>

                      {/* Twitter Attached Image Card */}
                      <div className="bg-black border border-neutral-800 rounded-2xl overflow-hidden relative min-h-[190px] flex items-center justify-center">
                        {tempImages[0] ? (
                          <img 
                            src={tempImages[0]} 
                            alt="X layout design preview" 
                            className="w-full h-auto object-cover max-h-[260px]" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="p-8 text-center text-neutral-600 space-y-2">
                            <ImageIcon className="w-7 h-7 mx-auto opacity-30 text-orange-500" />
                            <p className="text-[10px] font-mono">Bespoke dynamic visual attached here</p>
                          </div>
                        )}
                      </div>

                      {/* Twitter Bottom Stats row */}
                      <div className="pt-2 border-t border-neutral-900 flex justify-between text-neutral-500 font-mono text-[10px] px-1">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> 12</span>
                        <span className="flex items-center gap-1 text-emerald-400"><RefreshCw className="w-3.5 h-3.5" /> {state.businessSetup.name.length}</span>
                        <span className="flex items-center gap-1 text-pink-500"><Heart className="w-3.5 h-3.5" /> {state.businessSetup.name.length * 4}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                  )}

                  {editingPost.platform.toLowerCase() === 'facebook' && (
                    <div className="bg-[#18191a] border border-[#2f3031] rounded-xl overflow-hidden shadow-xl text-neutral-200 text-xs animate-in slide-in-from-bottom duration-300">
                      {/* FB Header */}
                      <div className="p-3.5 flex gap-2.5 items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-base">
                          {state.businessSetup.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <span>{state.businessSetup.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">Just now • 🌎 • Paid Partnership</span>
                        </div>
                      </div>

                      {/* FB Caption */}
                      <div className="px-3.5 pb-3 space-y-2 leading-relaxed">
                        <p className="whitespace-pre-wrap">{tempCaption || "Enter captions to visualize FB placement..."}</p>
                        <p className="text-[#385898] font-semibold whitespace-pre-wrap font-mono text-xs">{tempHashtags}</p>
                      </div>

                      {/* FB Attached Image */}
                      <div className="bg-black relative min-h-[220px] flex items-center justify-center overflow-hidden border-t border-b border-[#2f3031]">
                        {tempImages[0] ? (
                          <img 
                            src={tempImages[0]} 
                            alt="Facebook template preview" 
                            className="w-full h-auto object-cover max-h-[300px]" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="p-8 text-center text-neutral-600 space-y-2">
                            <ImageIcon className="w-8 h-8 mx-auto opacity-30 text-orange-500" />
                            <p className="text-[10px] font-bold">FB Image post view</p>
                          </div>
                        )}
                      </div>

                      {/* FB Likes */}
                      <div className="px-3.5 py-2.5 border-b border-[#2f3031] flex justify-between text-neutral-400 text-[10px] font-mono">
                        <span>👍❤️ {state.businessSetup.name.length * 15 + 8} reactions</span>
                        <span>{state.businessSetup.name.length} comments • {state.businessSetup.name.length + 3} shares</span>
                      </div>

                      {/* FB Actions */}
                      <div className="p-1 flex justify-around text-neutral-400 font-bold font-mono text-[11px]">
                        <span className="flex items-center gap-1 py-1 px-4 hover:bg-neutral-800 rounded-md cursor-pointer"><ThumbsUp className="w-3.5 h-3.5" /> Like</span>
                        <span className="flex items-center gap-1 py-1 px-4 hover:bg-neutral-800 rounded-md cursor-pointer"><MessageSquare className="w-3.5 h-3.5" /> Comment</span>
                        <span className="flex items-center gap-1 py-1 px-4 hover:bg-neutral-800 rounded-md cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Share</span>
                      </div>
                    </div>
                  )}

                  {/* Optional Reference Inspiration Badge Indicator */}
                  {(tempRefLink || tempRefImage) && (
                    <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-xl text-[10px] text-neutral-400 space-y-1.5 font-sans">
                      <span className="font-bold text-orange-400 uppercase tracking-wider font-mono">📌 ACTIVE REFERENCE LINKS</span>
                      {tempRefLink && <div className="truncate"><strong className="text-neutral-300">Inspiration Link:</strong> <a href={tempRefLink} target="_blank" rel="noreferrer" className="text-orange-400 underline">{tempRefLink}</a></div>}
                      {tempRefImage && <div className="truncate"><strong className="text-neutral-300">Inspiration Image:</strong> <a href={tempRefImage} target="_blank" rel="noreferrer" className="text-orange-400 underline">{tempRefImage}</a></div>}
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Modal Bottom Command Controls */}
            <div className="p-5 bg-neutral-900 border-t border-neutral-850 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeletePost(editingPost.id)}
                  className="px-3 py-2 bg-red-950/20 hover:bg-red-900/35 text-red-500 border border-red-900/40 rounded-xl text-xs font-bold transition-all"
                >
                  Delete Post
                </button>
                <button
                  onClick={() => handleDuplicatePost(editingPost)}
                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold border border-neutral-800"
                >
                  Duplicate
                </button>
              </div>

              <div className="flex gap-2.5 flex-wrap">
                {/* AI copywriting triggers */}
                <button
                  onClick={() => {
                    // Update metadata states into state first so AI uses the exact prompt
                    const updatedPost = {
                      ...editingPost,
                      title: tempTitle,
                      scheduledDate: tempDate,
                      pillar: tempPillar,
                      contentCopy: tempCaption,
                      hashtags: tempHashtags,
                      notes: tempNotes,
                      multipleImages: tempImages,
                      imageUrl: tempImages[0] || undefined,
                      imagePrompt: tempImagePrompt,
                      referenceImageUrl: tempRefImage,
                      referenceLinkUrl: tempRefLink,
                      similarPostReference1: tempSimilar1,
                      similarPostReference2: tempSimilar2
                    };
                    const updatedPlan = state.contentPlan.map(p => p.id === editingPost.id ? updatedPost : p);
                    onSaveState({ ...state, contentPlan: updatedPlan });

                    onGenerateCopy(editingPost.id);
                    // Dynamically grab updated copywriting from props
                    setTimeout(() => {
                      const updated = state.contentPlan.find(p => p.id === editingPost.id);
                      if (updated?.contentCopy) {
                        setTempCaption(updated.contentCopy);
                      }
                    }, 1200);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-orange-500 rounded-xl text-xs font-bold border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Copy</span>
                </button>

                <button
                  onClick={() => {
                    // Update metadata states into state first so AI uses the exact prompt
                    const updatedPost = {
                      ...editingPost,
                      title: tempTitle,
                      scheduledDate: tempDate,
                      pillar: tempPillar,
                      contentCopy: tempCaption,
                      hashtags: tempHashtags,
                      notes: tempNotes,
                      multipleImages: tempImages,
                      imageUrl: tempImages[0] || undefined,
                      imagePrompt: tempImagePrompt,
                      referenceImageUrl: tempRefImage,
                      referenceLinkUrl: tempRefLink,
                      similarPostReference1: tempSimilar1,
                      similarPostReference2: tempSimilar2
                    };
                    const updatedPlan = state.contentPlan.map(p => p.id === editingPost.id ? updatedPost : p);
                    onSaveState({ ...state, contentPlan: updatedPlan });

                    onGenerateImage(editingPost.id);
                    setTimeout(() => {
                      const updated = state.contentPlan.find(p => p.id === editingPost.id);
                      if (updated?.imageUrl) {
                        setTempImages([updated.imageUrl]);
                      }
                    }, 1200);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-orange-500 rounded-xl text-xs font-bold border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Regenerate Image</span>
                </button>

                {/* Confirm approvals */}
                <button
                  onClick={() => {
                    const updatedPlan = state.contentPlan.map(p => 
                      p.id === editingPost.id 
                        ? { 
                            ...p, 
                            title: tempTitle, 
                            scheduledDate: tempDate, 
                            pillar: tempPillar, 
                            contentCopy: tempCaption, 
                            hashtags: tempHashtags, 
                            notes: tempNotes, 
                            multipleImages: tempImages,
                            imageUrl: tempImages[0] || undefined,
                            imagePrompt: tempImagePrompt,
                            referenceImageUrl: tempRefImage,
                            referenceLinkUrl: tempRefLink,
                            similarPostReference1: tempSimilar1,
                            similarPostReference2: tempSimilar2,
                            status: 'approved' as const 
                          } 
                        : p
                    );
                    onSaveState({ ...state, contentPlan: updatedPlan });
                    setEditingPost(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
                >
                  Approve & Close
                </button>

                <button
                  onClick={saveAndCloseWorkspace}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Save Draft
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
