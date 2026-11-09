import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireWorkspace, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../db/database';

export const workspaceRouter = Router();

// Apply auth to all workspace routes
workspaceRouter.use(requireAuth);

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
    tone: z.string().optional()
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
workspaceRouter.put('/:workspaceId/state', requireWorkspace, (req: AuthenticatedRequest, res: Response) => {
  try {
    const nextState = db.updateWorkspaceData(req.workspace!.id, req.body);
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

workspaceRouter.post('/:workspaceId/memory-log', requireWorkspace, (req: AuthenticatedRequest, res: Response) => {
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
