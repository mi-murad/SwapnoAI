export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planTier: 'starter' | 'growth' | 'pro' | 'agency';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMemberRecord {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
}

export interface WorkspaceDataPayload {
  businessSetup: {
    name: string;
    industry: string;
    targetAudience: string;
    description: string;
    tone: string;
    colors: string[];
    keywords: string[];
  };
  businessBrain: {
    elevatorPitch: string;
    valueProposition: string;
    competitorList: string[];
    synced: boolean;
  };
  research: {
    marketOverview: string;
    competitorAnalysis: string;
    trendingHashtags: string[];
    personaProfiles: Array<{
      name: string;
      age: string;
      goals: string;
      painPoints: string;
      mediaChannels: string[];
    }>;
    approved: boolean;
    notes?: string;
  };
  strategy: {
    channels: Array<{
      name: string;
      frequency: string;
      focus: string;
    }>;
    pillars: string[];
    campaignThemes: Array<{
      title: string;
      objective: string;
      keyMessage: string;
    }>;
    approved: boolean;
    notes?: string;
  };
  contentPlan: Array<{
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
  }>;
  analytics: Array<{
    date: string;
    platform: string;
    title: string;
    impressions: number;
    engagement: number;
    clicks: number;
  }>;
  memoryLogs: Array<{
    id: string;
    timestamp: string;
    type: string;
    note: string;
  }>;
  currentStep: string;
}

export interface DatabaseState {
  users: Record<string, UserRecord>;
  workspaces: Record<string, WorkspaceRecord>;
  memberships: Record<string, WorkspaceMemberRecord>;
  workspaceData: Record<string, WorkspaceDataPayload>;
}
