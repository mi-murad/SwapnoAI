import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseState, UserRecord, WorkspaceRecord, WorkspaceMemberRecord, WorkspaceDataPayload, WorkspaceRole } from '../types';
import { workspaceAData } from '../../data/workspaceData';
import { assertTrialActionAllowed, createTrialWindow, getTrialPolicy, getTrialSnapshot, TrialAction } from '../trial/trialService';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'swapno_multi_tenant_db.json');

export class DatabaseService {
  private state: DatabaseState;
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.ensureDbDirectory();
    this.state = this.loadState();
    this.initSupabaseIfConfigured();
  }

  private ensureDbDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private initSupabaseIfConfigured() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[DatabaseService] Supabase PostgreSQL client initialized successfully.');
      } catch (err) {
        console.warn('[DatabaseService] Failed to initialize Supabase client:', err);
      }
    } else {
      console.log('[DatabaseService] Running with local persistent multi-tenant relational store.');
    }
  }

  private loadState(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const state = JSON.parse(raw) as DatabaseState;
        const policy = getTrialPolicy();
        for (const workspace of Object.values(state.workspaces || {})) {
          if (!workspace.trialStartedAt || !workspace.trialExpiresAt) {
            const start = new Date(workspace.createdAt);
            const trialWindow = createTrialWindow(Number.isNaN(start.getTime()) ? new Date(0) : start, policy);
            workspace.trialStartedAt = workspace.trialStartedAt || trialWindow.trialStartedAt;
            workspace.trialExpiresAt = workspace.trialExpiresAt || trialWindow.trialExpiresAt;
          }
          if (!Number.isSafeInteger(workspace.trialUsageCount) || workspace.trialUsageCount < 0) {
            workspace.trialUsageCount = 0;
          }
        }
        state.users ||= {};
        state.workspaces ||= {};
        state.memberships ||= {};
        state.workspaceData ||= {};
        return state;
      }
    } catch {
      console.error('[DatabaseService] Failed to read the local database; the existing file was left unchanged.');
      throw new Error('The local database could not be loaded. Its existing file was not overwritten.');
    }

    const defaultState: DatabaseState = {
      users: {},
      workspaces: {},
      memberships: {},
      workspaceData: {}
    };

    this.persistState(defaultState);
    return defaultState;
  }

  private persistState(stateToSave: DatabaseState = this.state) {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(stateToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- User Operations ---

  public getUserByEmail(email: string): UserRecord | null {
    const normalized = email.trim().toLowerCase();
    const user = Object.values(this.state.users).find(u => u.email.toLowerCase() === normalized);
    return user || null;
  }

  public getUserById(id: string): UserRecord | null {
    return this.state.users[id] || null;
  }

  public createUser(email: string, passwordHash: string, fullName: string): UserRecord {
    const id = `usr_${crypto.randomUUID()}`;
    const user: UserRecord = {
      id,
      email: email.trim().toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      createdAt: new Date().toISOString()
    };

    this.state.users[id] = user;
    this.persistState();
    return user;
  }

  // --- Workspace Operations ---

  public createWorkspace(
    name: string,
    ownerId: string,
    initialSetup?: Partial<WorkspaceDataPayload['businessSetup']>
  ): { workspace: WorkspaceRecord; member: WorkspaceMemberRecord } {
    const workspaceId = `ws_${crypto.randomUUID()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `workspace-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const workspace: WorkspaceRecord = {
      id: workspaceId,
      name: name.trim(),
      slug: `${slug}-${workspaceId.slice(3, 7)}`,
      ownerId,
      planTier: 'starter',
      ...createTrialWindow(new Date(createdAt), getTrialPolicy()),
      trialUsageCount: 0,
      createdAt,
      updatedAt: createdAt
    };

    const membershipId = `mem_${crypto.randomUUID()}`;
    const membership: WorkspaceMemberRecord = {
      id: membershipId,
      workspaceId,
      userId: ownerId,
      role: 'owner',
      createdAt: new Date().toISOString()
    };

    this.state.workspaces[workspaceId] = workspace;
    this.state.memberships[membershipId] = membership;

    // Initialize clean workspace domain state
    const cleanState: WorkspaceDataPayload = {
      businessSetup: {
        name: initialSetup?.name || name,
        industry: initialSetup?.industry || '',
        targetAudience: initialSetup?.targetAudience || '',
        description: initialSetup?.description || '',
        tone: initialSetup?.tone || '',
        products: initialSetup?.products || '',
        goals: initialSetup?.goals || '',
        colors: initialSetup?.colors || ['#111111', '#FFFFFF', '#FF4F00', '#FFD400'],
        keywords: initialSetup?.keywords || []
      },
      businessBrain: {
        elevatorPitch: '',
        valueProposition: '',
        competitorList: [],
        synced: false
      },
      research: {
        marketOverview: '',
        competitorAnalysis: '',
        trendingHashtags: [],
        personaProfiles: [],
        approved: false
      },
      strategy: {
        channels: [],
        pillars: [],
        campaignThemes: [],
        approved: false
      },
      contentPlan: [],
      analytics: [],
      memoryLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'system',
          note: `Workspace ${name} initialized for owner.`
        }
      ],
      currentStep: 'dashboard',
      learningProgress: {
        dismissed: false,
        completedLessonIds: []
      }
    };

    this.state.workspaceData[workspaceId] = cleanState;
    this.persistState();

    return { workspace, member: membership };
  }

  public getWorkspacesForUser(userId: string): Array<{ workspace: WorkspaceRecord; role: WorkspaceRole }> {
    const userMemberships = Object.values(this.state.memberships).filter(m => m.userId === userId);
    return userMemberships
      .map(m => {
        const ws = this.state.workspaces[m.workspaceId];
        return ws ? { workspace: ws, role: m.role } : null;
      })
      .filter((item): item is { workspace: WorkspaceRecord; role: WorkspaceRole } => item !== null);
  }

  public getWorkspaceById(workspaceId: string): WorkspaceRecord | null {
    return this.state.workspaces[workspaceId] || null;
  }

  public getTrialSnapshot(workspaceId: string) {
    const workspace = this.getWorkspaceById(workspaceId);
    if (!workspace) return null;
    return getTrialSnapshot(workspace, getTrialPolicy());
  }

  public recordSuccessfulTrialAction(workspaceId: string, action: TrialAction) {
    const workspace = this.getWorkspaceById(workspaceId);
    if (!workspace) throw new Error('Workspace not found.');

    const currentSnapshot = getTrialSnapshot(workspace, getTrialPolicy());
    assertTrialActionAllowed(action, currentSnapshot);
    workspace.trialUsageCount += 1;
    workspace.updatedAt = new Date().toISOString();
    this.persistState();
    return getTrialSnapshot(workspace, getTrialPolicy());
  }

  public getUserMembership(workspaceId: string, userId: string): WorkspaceMemberRecord | null {
    const member = Object.values(this.state.memberships).find(
      m => m.workspaceId === workspaceId && m.userId === userId
    );
    return member || null;
  }

  // --- Workspace Data Isolation Operations ---

  public getWorkspaceData(workspaceId: string): WorkspaceDataPayload | null {
    return this.state.workspaceData[workspaceId] || null;
  }

  public updateWorkspaceData(
    workspaceId: string,
    update: Partial<WorkspaceDataPayload> | ((prev: WorkspaceDataPayload) => WorkspaceDataPayload)
  ): WorkspaceDataPayload {
    const existing = this.state.workspaceData[workspaceId] || {
      businessSetup: { name: '', industry: '', targetAudience: '', description: '', tone: '', products: '', goals: '', colors: ['#111111', '#FFFFFF', '#FF4F00', '#FFD400'], keywords: [] },
      businessBrain: { elevatorPitch: '', valueProposition: '', competitorList: [], synced: false },
      research: { marketOverview: '', competitorAnalysis: '', trendingHashtags: [], personaProfiles: [], approved: false },
      strategy: { channels: [], pillars: [], campaignThemes: [], approved: false },
      contentPlan: [],
      analytics: [],
      memoryLogs: [],
      currentStep: 'dashboard',
      learningProgress: {
        dismissed: false,
        completedLessonIds: []
      }
    };

    const next = typeof update === 'function' ? update(existing) : { ...existing, ...update };
    this.state.workspaceData[workspaceId] = next;
    
    // Also update workspace name if businessSetup name changed
    if (next.businessSetup?.name && this.state.workspaces[workspaceId]) {
      this.state.workspaces[workspaceId].name = next.businessSetup.name;
      this.state.workspaces[workspaceId].updatedAt = new Date().toISOString();
    }

    this.persistState();
    return next;
  }

  public getSupabase(): SupabaseClient | null {
    return this.supabase;
  }
}

// Global Singleton Instance
export const db = new DatabaseService();
