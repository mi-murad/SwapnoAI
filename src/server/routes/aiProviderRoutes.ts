import { Router, Response } from 'express';
import { z } from 'zod';
import { aiProviderRegistry, ProviderTestError } from '../ai/providerRegistry';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';

export const aiProviderRouter = Router();

aiProviderRouter.use(requireAuth);

aiProviderRouter.get('/', (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    data: { providers: aiProviderRegistry.getHealth() }
  });
});

const ConnectionTestSchema = z.object({
  confirm: z.literal(true)
}).strict();
const ProviderIdSchema = z.enum(['gemini', 'groq', 'openrouter']);

aiProviderRouter.post('/:providerId/test', async (req: AuthenticatedRequest, res: Response) => {
  const providerId = ProviderIdSchema.safeParse(req.params.providerId);
  if (!providerId.success) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROVIDER_NOT_FOUND', message: 'The requested provider is not registered.' }
    });
  }

  const parsed = ConnectionTestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Set confirm to true to explicitly run a Gemini API test.'
      }
    });
  }

  try {
    const result = await aiProviderRegistry.verifyConnection(providerId.data);
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ProviderTestError) {
      const status = error.code === 'LIVE_TEST_DISABLED'
        ? 403
        : error.code === 'PROVIDER_NOT_CONFIGURED'
          ? 503
          : error.code === 'INVALID_MODEL_CONFIGURATION'
            ? 400
            : error.code === 'PROVIDER_RATE_LIMITED' || error.code === 'PROVIDER_COOLDOWN'
              ? 429
              : 502;
      if (error.retryAfterSeconds) {
        res.setHeader('Retry-After', String(error.retryAfterSeconds));
      }
      return res.status(status).json({
        success: false,
        error: { code: error.code, message: error.message }
      });
    }

    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error(JSON.stringify({
      event: 'ai_provider_connection_test_failed',
      provider: providerId.data,
      userId: req.user?.userId,
      errorName
    }));
    return res.status(502).json({
      success: false,
      error: {
        code: 'AI_PROVIDER_REQUEST_FAILED',
        message: `${providerId.data} connection test failed. Check server logs and provider status.`
      }
    });
  }
});
