import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIProviderRegistry,
  GeminiClient,
  GeminiProvider,
  ProviderTestError
} from '../ai/providerRegistry';

test('provider health reports missing credentials without exposing secrets', () => {
  const provider = new GeminiProvider({});
  const health = provider.getHealth();

  assert.equal(health.state, 'not_configured');
  assert.equal(health.id, 'gemini');
  assert.equal(JSON.stringify(health).includes('API_KEY'), false);
});

test('live provider calls are disabled unless explicitly enabled', async () => {
  let clientCreated = false;
  const provider = new GeminiProvider(
    { GEMINI_API_KEY: 'test-key', GEMINI_LIVE_TEST_ENABLED: 'false' },
    () => {
      clientCreated = true;
      throw new Error('Client must not be created.');
    }
  );

  await assert.rejects(
    provider.verifyConnection(),
    (error: unknown) => error instanceof ProviderTestError && error.code === 'LIVE_TEST_DISABLED'
  );
  assert.equal(clientCreated, false);
});

test('explicit connection test calls the configured Gemini adapter once', async () => {
  let callCount = 0;
  let receivedModel = '';
  let receivedApiKey = '';
  const client: GeminiClient = {
    models: {
      async generateContent(parameters) {
        callCount++;
        receivedModel = parameters.model;
        return { text: 'READY' };
      }
    }
  };
  const registry = new AIProviderRegistry(new GeminiProvider(
    {
      GEMINI_API_KEY: 'test-key',
      GEMINI_MODEL_ID: 'test-model',
      GEMINI_LIVE_TEST_ENABLED: 'true'
    },
    (apiKey) => {
      receivedApiKey = apiKey;
      return client;
    }
  ));

  const result = await registry.verifyGeminiConnection();
  assert.deepEqual(result, {
    provider: 'gemini',
    model: 'test-model',
    verified: true,
    usage: { inputTokens: null, outputTokens: null }
  });
  assert.equal(callCount, 1);
  assert.equal(receivedModel, 'test-model');
  assert.equal(receivedApiKey, 'test-key');
});

test('provider failures are surfaced and never converted into generated fallback content', async () => {
  const provider = new GeminiProvider(
    { GEMINI_API_KEY: 'test-key', GEMINI_LIVE_TEST_ENABLED: 'true' },
    () => ({
      models: {
        async generateContent() {
          throw new Error('provider unavailable');
        }
      }
    })
  );

  await assert.rejects(provider.verifyConnection(), error =>
    error instanceof ProviderTestError
    && error.code === 'PROVIDER_REQUEST_FAILED'
    && !error.message.includes('provider unavailable')
  );
});

test('placeholder credentials are never treated as configured', () => {
  const provider = new GeminiProvider({
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
    GEMINI_LIVE_TEST_ENABLED: 'true'
  });

  assert.equal(provider.getHealth().state, 'not_configured');
});
