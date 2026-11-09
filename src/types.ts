export interface BusinessSetup {
  name: string;
  industry: string;
  targetAudience: string;
  description: string;
  tone: string;
  colors: string[];
  keywords: string[];
}

export interface BusinessBrain {
  elevatorPitch: string;
  valueProposition: string;
  competitorList: string[];
  synced: boolean;
}

export interface PersonaProfile {
  name: string;
  age: string;
  goals: string;
  painPoints: string;
  mediaChannels: string[];
}

export interface MarketResearch {
  marketOverview: string;
  competitorAnalysis: string;
  trendingHashtags: string[];
  personaProfiles: PersonaProfile[];
  approved: boolean;
  notes?: string;
}

export interface MarketingChannel {
  name: string;
  frequency: string;
  focus: string;
}

export interface CampaignTheme {
  title: string;
  objective: string;
  keyMessage: string;
}

export interface Strategy {
  channels: MarketingChannel[];
  pillars: string[];
  campaignThemes: CampaignTheme[];
  approved: boolean;
  notes?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  scheduledDate: string;
  pillar: string;
  status: 'planned' | 'approved' | 'published';
  generationStatus: 'pending' | 'generating' | 'generated';
  contentCopy: string;
  imagePrompt: string;
  imageUrl?: string;
  notes?: string;
  multipleImages?: string[];
  hashtags?: string;
  referenceImageUrl?: string;
  referenceLinkUrl?: string;
  similarPostReference1?: string;
  similarPostReference2?: string;
}

export interface AnalyticsMetric {
  date: string;
  platform: string;
  title: string;
  impressions: number;
  engagement: number;
  clicks: number;
}

export interface MemoryLog {
  id: string;
  timestamp: string;
  type: string;
  note: string;
}

export interface SwapnoAppState {
  businessSetup: BusinessSetup;
  businessBrain: BusinessBrain;
  research: MarketResearch;
  strategy: Strategy;
  contentPlan: ContentItem[];
  analytics: AnalyticsMetric[];
  memoryLogs: MemoryLog[];
  currentStep: string;
}
