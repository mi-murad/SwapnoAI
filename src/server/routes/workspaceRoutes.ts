import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireWorkspace, requireWorkspaceRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../db/database';

export const workspaceRouter = Router();

// Apply auth to all workspace routes
workspaceRouter.use(requireAuth);

const BoundedText = z.string().max(5000);
const WorkspaceDataSchema = z.object({
  businessSetup: z.object({
    name: z.string().max(160),
    industry: z.string().max(160),
    targetAudience: z.string().max(500),
    description: z.string().max(5000),
    tone: z.string().max(500),
    products: z.string().max(5000).optional(),
    goals: z.string().max(2000).optional(),
    colors: z.array(z.string().max(64)).max(32),
    keywords: z.array(z.string().max(160)).max(100)
  }).strict(),
  businessBrain: z.object({
    elevatorPitch: BoundedText,
    valueProposition: BoundedText,
    competitorList: z.array(z.string().max(500)).max(100),
    synced: z.boolean()
  }).strict(),
  research: z.object({
    marketOverview: BoundedText,
    competitorAnalysis: BoundedText,
    trendingHashtags: z.array(z.string().max(160)).max(100),
    personaProfiles: z.array(z.object({
      name: z.string().max(160),
      age: z.string().max(32),
      goals: BoundedText,
      painPoints: BoundedText,
      mediaChannels: z.array(z.string().max(160)).max(100)
    }).strict()).max(100),
    approved: z.boolean(),
    notes: BoundedText.optional()
  }).strict(),
  strategy: z.object({
    channels: z.array(z.object({
      name: z.string().max(160),
      frequency: z.string().max(160),
      focus: BoundedText
    }).strict()).max(100),
    pillars: z.array(z.string().max(300)).max(100),
    campaignThemes: z.array(z.object({
      title: z.string().max(300),
      objective: BoundedText,
      keyMessage: BoundedText
    }).strict()).max(100),
    approved: z.boolean(),
    notes: BoundedText.optional()
  }).strict(),
  contentPlan: z.array(z.object({
    id: z.string().max(160),
    title: z.string().max(500),
    platform: z.string().max(160),
    scheduledDate: z.string().max(80),
    pillar: z.string().max(300),
    status: z.enum(['planned', 'approved', 'published']),
    generationStatus: z.enum(['pending', 'generating', 'generated']),
    contentCopy: BoundedText,
    imagePrompt: BoundedText,
    imageUrl: z.string().max(2048).optional(),
    notes: BoundedText.optional(),
    multipleImages: z.array(z.string().max(2048)).max(20).optional(),
    hashtags: z.string().max(1000).optional(),
    referenceImageUrl: z.string().max(2048).optional(),
    referenceLinkUrl: z.string().max(2048).optional(),
    similarPostReference1: z.string().max(2048).optional(),
    similarPostReference2: z.string().max(2048).optional()
  }).strict()).max(1000),
  analytics: z.array(z.object({
    date: z.string().max(80),
    platform: z.string().max(160),
    title: z.string().max(500),
    impressions: z.number().finite().nonnegative(),
    engagement: z.number().finite().nonnegative(),
    clicks: z.number().finite().nonnegative()
  }).strict()).max(5000),
  memoryLogs: z.array(z.object({
    id: z.string().max(160),
    timestamp: z.string().max(80),
    type: z.string().max(80),
    note: BoundedText
  }).strict()).max(5000),
  currentStep: z.string().max(100),
  learningProgress: z.object({
    dismissed: z.boolean(),
    completedLessonIds: z.array(z.string().max(80)).max(20),
    completedAt: z.string().datetime().optional()
  }).strict().optional()
}).strict();

// 1. List user's workspaces
workspaceRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const workspaces = db.getWorkspacesForUser(req.user!.userId);
  return res.json({ success: true, data: workspaces });
});

// 2. Create new workspace
const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  initialSetup: z.object({
    name: z.string().optional(),
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    description: z.string().optional(),
    tone: z.string().optional(),
    products: z.string().max(5000).optional(),
    goals: z.string().max(2000).optional()
  }).optional()
});

workspaceRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = CreateWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input' }
      });
    }

    const { name, initialSetup } = parsed.data;
    const { workspace, member } = db.createWorkspace(name, req.user!.userId, initialSetup);

    return res.status(201).json({
      success: true,
      data: { workspace, role: member.role }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'WORKSPACE_CREATION_FAILED', message: err.message || 'Failed to create workspace' }
    });
  }
});

// 3. Get single workspace info (Scoped by membership)
workspaceRouter.get('/:workspaceId', requireWorkspace, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    data: {
      workspace: req.workspace,
      membership: req.membership
    }
  });
});

workspaceRouter.get('/:workspaceId/trial', requireWorkspace, (req: AuthenticatedRequest, res: Response) => {
  const trial = db.getTrialSnapshot(req.workspace!.id);
  if (!trial) {
    return res.status(404).json({
      success: false,
      error: { code: 'WORKSPACE_NOT_FOUND', message: 'The requested workspace was not found.' }
    });
  }

  return res.json({ success: true, data: trial });
});

// 4. Get workspace isolated domain state
workspaceRouter.get('/:workspaceId/state', requireWorkspace, (req: AuthenticatedRequest, res: Response) => {
  const state = db.getWorkspaceData(req.workspace!.id);
  if (!state) {
    return res.status(404).json({
      success: false,
      error: { code: 'STATE_NOT_FOUND', message: 'Workspace domain state not found.' }
    });
  }

  return res.json({
    success: true,
    data: state
  });
});

// 5. Update workspace isolated domain state
workspaceRouter.put(
  '/:workspaceId/state',
  requireWorkspace,
  requireWorkspaceRole('owner', 'admin', 'editor'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = WorkspaceDataSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid workspace state.' }
      });
    }

    const previousState = db.getWorkspaceData(req.workspace!.id);
    if (!previousState) {
      return res.status(404).json({
        success: false,
        error: { code: 'STATE_NOT_FOUND', message: 'Workspace domain state not found.' }
      });
    }

    const previousStatuses = new Map(previousState.contentPlan.map(item => [item.id, item.status]));
    const hasUnverifiedPublishedContent = parsed.data.contentPlan.some(
      item => item.status === 'published' && previousStatuses.get(item.id) !== 'published'
    );
    if (hasUnverifiedPublishedContent) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PUBLISHING_NOT_CONFIGURED',
          message: 'Content cannot be marked as published until a connected platform confirms publication.'
        }
      });
    }

    const nextState = db.updateWorkspaceData(req.workspace!.id, parsed.data);
    return res.json({
      success: true,
      data: nextState
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'STATE_UPDATE_FAILED', message: err.message || 'Failed to update workspace state' }
    });
  }
});

// 6. Add memory log node
const MemoryLogSchema = z.object({
  note: z.string().min(1, 'Note text is required'),
  type: z.enum(['setup', 'strategy', 'research', 'manual', 'system']).default('manual')
});

workspaceRouter.post(
  '/:workspaceId/memory-log',
  requireWorkspace,
  requireWorkspaceRole('owner', 'admin', 'editor'),
  (req: AuthenticatedRequest, res: Response) => {
  const parsed = MemoryLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message }
    });
  }

  const { note, type } = parsed.data;
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type,
    note
  };

  const updatedState = db.updateWorkspaceData(req.workspace!.id, prev => ({
    ...prev,
    memoryLogs: [newLog, ...(prev.memoryLogs || [])]
  }));

  return res.status(201).json({
    success: true,
    data: newLog
  });
});
