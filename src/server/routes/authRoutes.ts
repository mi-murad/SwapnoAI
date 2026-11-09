import { Router, Response } from 'express';
import { z } from 'zod';
import { authService } from '../auth/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../db/database';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  initialSetup: z.object({
    name: z.string().optional(),
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    description: z.string().optional(),
    tone: z.string().optional()
  }).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

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

    // Set secure HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
        workspace: result.workspace,
        token: result.token
      }
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: err.message || 'Registration failed' }
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

    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
        workspaces: result.workspaces,
        token: result.token
      }
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: err.message || 'Invalid email or password' }
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
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});
