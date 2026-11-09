import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../auth/authService';
import { db } from '../db/database';
import { WorkspaceRecord, WorkspaceMemberRecord, WorkspaceRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  workspace?: WorkspaceRecord;
  membership?: WorkspaceMemberRecord;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization Header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Fallback to cookie
  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' }
    });
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Session expired or invalid. Please log in again.' }
    });
  }

  req.user = payload;
  next();
}

export function requireWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
    });
  }

  const workspaceId = (req.params.workspaceId || req.headers['x-workspace-id'] || req.query.workspaceId) as string;

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_WORKSPACE_ID', message: 'Workspace ID must be provided in URL parameters or X-Workspace-ID header.' }
    });
  }

  const workspace = db.getWorkspaceById(workspaceId);
  if (!workspace) {
    return res.status(404).json({
      success: false,
      error: { code: 'WORKSPACE_NOT_FOUND', message: 'The requested workspace was not found.' }
    });
  }

  const membership = db.getUserMembership(workspaceId, req.user.userId);
  if (!membership) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN_WORKSPACE', message: 'Access denied: You are not a member of this workspace.' }
    });
  }

  req.workspace = workspace;
  req.membership = membership;
  next();
}

export function requireWorkspaceRole(...allowedRoles: WorkspaceRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.membership || !allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_WORKSPACE_ROLE', message: 'Your workspace role cannot perform this action.' }
      });
    }

    next();
  };
}
