import assert from 'node:assert/strict';
import test from 'node:test';
import { createOpenAICompatibleProvider } from '../ai/openAICompatibleProvider';
import { ProviderTestError } from '../ai/providerTypes';

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

test('Groq test is disabled by default and does not issue a request', async () => {
  let fetchCount = 0;
  const provider = createOpenAICompatibleProvider(
    'groq',
    { GROQ_API_KEY: 'test-key', GROQ_MODEL_ID: 'test-model' },
    async () => {
      fetchCount++;
      return jsonResponse({});
    }
  );

  assert.equal(provider.getHealth().state, 'test_disabled');
  await assert.rejects(
    provider.verifyConnection(),
    (error: unknown) => error instanceof ProviderTestError && error.code === 'LIVE_TEST_DISABLED'
  );
  assert.equal(fetchCount, 0);
});

test('OpenRouter rejects non-free model IDs before network access', async () => {
  let fetchCount = 0;
  const provider = createOpenAICompatibleProvider(
    'openrouter',
    {
      OPENROUTER_API_KEY: 'test-key',
      OPENROUTER_MODEL_ID: 'provider/model',
      OPENROUTER_LIVE_TEST_ENABLED: 'true'
    },
    async () => {
      fetchCount++;
      return jsonResponse({});
    }
  );

  assert.equal(provider.getHealth().state, 'invalid_model_configuration');
  await assert.rejects(
    provider.verifyConnection(),
    (error: unknown) => error instanceof ProviderTestError && error.code === 'INVALID_MODEL_CONFIGURATION'
  );
  assert.equal(fetchCount, 0);
});

test('OpenRouter free model test returns usage without exposing the API key', async () => {
  let requestUrl = '';
  let authorization = '';
  const provider = createOpenAICompatibleProvider(
    'openrouter',
    {
      OPENROUTER_API_KEY: 'private-test-key',
      OPENROUTER_MODEL_ID: 'liquid/lfm-3-1.7b:free',
      OPENROUTER_LIVE_TEST_ENABLED: 'true'
    },
    async (input, init) => {
      requestUrl = String(input);
      authorization = new Headers(init?.headers).get('authorization') ?? '';
      return jsonResponse({
        choices: [{ message: { content: 'READY' } }],
        usage: { prompt_tokens: 4, completion_tokens: 1 }
      });
    }
  );

  const result = await provider.verifyConnection();
  assert.equal(requestUrl, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(authorization, 'Bearer private-test-key');
  assert.equal(result.verified, true);
  assert.deepEqual(result.usage, { inputTokens: 4, outputTokens: 1 });
  assert.equal(JSON.stringify(result).includes('private-test-key'), false);
  assert.equal(provider.getHealth().automaticFallbackEligible, false);
});

test('HTTP 429 records a bounded provider cooldown and retry delay', async () => {
  let now = 1000;
  const provider = createOpenAICompatibleProvider(
    'groq',
    {
      GROQ_API_KEY: 'test-key',
      GROQ_MODEL_ID: 'test-model',
      GROQ_LIVE_TEST_ENABLED: 'true'
    },
    async () => new Response('', { status: 429, headers: { 'retry-after': '7' } }),
    () => now
  );

  await assert.rejects(
    provider.verifyConnection(),
    (error: unknown) => error instanceof ProviderTestError
      && error.code === 'PROVIDER_RATE_LIMITED'
      && error.retryAfterSeconds === 7
  );
  assert.equal(provider.getHealth().state, 'cooling_down');
  now += 8000;
  assert.equal(provider.getHealth().state, 'ready_for_explicit_test');
});

test('provider timeout is surfaced explicitly', async () => {
  const provider = createOpenAICompatibleProvider(
    'groq',
    {
      GROQ_API_KEY: 'test-key',
      GROQ_MODEL_ID: 'test-model',
      GROQ_LIVE_TEST_ENABLED: 'true'
    },
    async () => {
      throw new DOMException('Timed out', 'TimeoutError');
    }
  );

  await assert.rejects(
    provider.verifyConnection(),
    (error: unknown) => error instanceof ProviderTestError && error.code === 'PROVIDER_TIMEOUT'
  );
});
