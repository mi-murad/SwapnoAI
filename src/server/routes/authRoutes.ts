import { Router } from 'express';
import type { CookieOptions, Response } from 'express';
import { z } from 'zod';
import { authService } from '../auth/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../db/database';

export const authRouter = Router();

function authCookieOptions(): CookieOptions {
  const configuredSameSite = process.env.AUTH_COOKIE_SAME_SITE;
  const sameSite: CookieOptions['sameSite'] = configuredSameSite === 'none' || configuredSameSite === 'strict'
    ? configuredSameSite
    : 'lax';
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' && sameSite === 'none' ? 'none' : sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

const RegisterSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  businessName: z.string().trim().min(1, 'Business name is required').max(160),
  initialSetup: z.object({
    name: z.string().max(160).optional(),
    industry: z.string().max(160).optional(),
    targetAudience: z.string().max(500).optional(),
    description: z.string().max(5000).optional(),
    tone: z.string().max(500).optional(),
    products: z.string().max(5000).optional(),
    goals: z.string().max(2000).optional()
  }).strict().optional()
}).strict();

const LoginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1, 'Password is required').max(128)
}).strict();

authRouter.post('/register', async (req, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input' }
      });
    }

    const { email, password, fullName, businessName, initialSetup } = parsed.data;
    const result = await authService.register(email, password, fullName, businessName, initialSetup);

    res.cookie('auth_token', result.token, authCookieOptions());

    return res.status(201).json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
        workspace: result.workspace
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: err instanceof Error ? err.message : 'Registration failed' }
    });
  }
});

authRouter.post('/login', async (req, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input' }
      });
    }

    const { email, password } = parsed.data;
    const result = await authService.login(email, password);

    res.cookie('auth_token', result.token, authCookieOptions());

    return res.json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
        workspaces: result.workspaces
      }
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: err instanceof Error ? err.message : 'Invalid email or password' }
    });
  }
});

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
  }

  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User record not found.' } });
  }

  const workspaces = db.getWorkspacesForUser(user.id);

  return res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      workspaces
    }
  });
});

authRouter.post('/logout', (req, res: Response) => {
  const { maxAge: _maxAge, ...clearOptions } = authCookieOptions();
  res.clearCookie('auth_token', clearOptions);
  return res.json({ success: true, message: 'Logged out successfully.' });
});
