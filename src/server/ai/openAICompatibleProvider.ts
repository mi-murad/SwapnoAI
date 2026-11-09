import { ProviderAdapter, ProviderHealth, ProviderTestError, ProviderTestResult } from './providerTypes';

export type OpenAICompatibleProviderId = 'groq' | 'openrouter';

export interface OpenAICompatibleEnvironment {
  GROQ_API_KEY?: string;
  GROQ_MODEL_ID?: string;
  GROQ_LIVE_TEST_ENABLED?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL_ID?: string;
  OPENROUTER_LIVE_TEST_ENABLED?: string;
}

interface ProviderConfiguration {
  id: OpenAICompatibleProviderId;
  baseUrl: string;
  keyName: 'GROQ_API_KEY' | 'OPENROUTER_API_KEY';
  modelName: 'GROQ_MODEL_ID' | 'OPENROUTER_MODEL_ID';
  enabledName: 'GROQ_LIVE_TEST_ENABLED' | 'OPENROUTER_LIVE_TEST_ENABLED';
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string | Array<{ type?: string; text?: string }> };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

const TEST_PROMPT = 'Reply with the single word READY.';
const MAX_COOLDOWN_MS = 5 * 60 * 1000;

const CONFIGURATIONS: Record<OpenAICompatibleProviderId, ProviderConfiguration> = {
  groq: {
    id: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyName: 'GROQ_API_KEY',
    modelName: 'GROQ_MODEL_ID',
    enabledName: 'GROQ_LIVE_TEST_ENABLED'
  },
  openrouter: {
    id: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyName: 'OPENROUTER_API_KEY',
    modelName: 'OPENROUTER_MODEL_ID',
    enabledName: 'OPENROUTER_LIVE_TEST_ENABLED'
  }
};

function parseRetryAfter(response: Response): number {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return 30_000;

  const seconds = Number(retryAfter);
  const delay = Number.isFinite(seconds)
    ? seconds * 1000
    : Date.parse(retryAfter) - Date.now();
  return Math.min(MAX_COOLDOWN_MS, Math.max(1000, delay));
}

export class OpenAICompatibleProvider implements ProviderAdapter {
  private cooldownUntil = 0;

  constructor(
    private readonly configuration: ProviderConfiguration,
    private readonly environment: OpenAICompatibleEnvironment = process.env,
    private readonly fetcher: typeof fetch = fetch,
    private readonly now: () => number = Date.now
  ) {}

  public getHealth(): ProviderHealth {
    const apiKey = this.environment[this.configuration.keyName]?.trim();
    const model = this.environment[this.configuration.modelName]?.trim() ?? '';
    const liveTestEnabled = this.environment[this.configuration.enabledName] === 'true';
    const freeOnlyModel = this.configuration.id === 'openrouter' && model.endsWith(':free');

    let state: ProviderHealth['state'];
    if (!apiKey || !model) {
      state = 'not_configured';
    } else if (this.configuration.id === 'openrouter' && !freeOnlyModel) {
      state = 'invalid_model_configuration';
    } else if (this.cooldownUntil > this.now()) {
      state = 'cooling_down';
    } else if (liveTestEnabled) {
      state = 'ready_for_explicit_test';
    } else {
      state = 'test_disabled';
    }

    return {
      id: this.configuration.id,
      state,
      model,
      capabilities: ['text_generation'],
      freeTierStatus: freeOnlyModel ? 'model_marker_required' : 'account_dependent',
      automaticFallbackEligible: false,
      liveTestEnabled,
      freeOnlyModel,
      ...(this.cooldownUntil > this.now()
        ? { cooldownUntil: new Date(this.cooldownUntil).toISOString() }
        : {})
    };
  }

  public async verifyConnection(): Promise<ProviderTestResult> {
    if (this.environment[this.configuration.enabledName] !== 'true') {
      throw new ProviderTestError(
        'LIVE_TEST_DISABLED',
        `Live ${this.configuration.id} tests are disabled. Enable ${this.configuration.enabledName} to run one explicit test.`
      );
    }

    const apiKey = this.environment[this.configuration.keyName]?.trim();
    const model = this.environment[this.configuration.modelName]?.trim();
    if (!apiKey || !model) {
      throw new ProviderTestError(
        'PROVIDER_NOT_CONFIGURED',
        `${this.configuration.id} requires a server-side API key and model ID.`
      );
    }
    if (this.configuration.id === 'openrouter' && !model.endsWith(':free')) {
      throw new ProviderTestError(
        'INVALID_MODEL_CONFIGURATION',
        'OpenRouter live tests require a model ID ending in :free.'
      );
    }
    if (this.cooldownUntil > this.now()) {
      throw new ProviderTestError(
        'PROVIDER_COOLDOWN',
        `${this.configuration.id} is cooling down after a rate limit. Retry later.`,
        Math.ceil((this.cooldownUntil - this.now()) / 1000)
      );
    }

    let response: Response;
    try {
      response = await this.fetcher(`${this.configuration.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(this.configuration.id === 'openrouter'
            ? { 'X-OpenRouter-Title': 'SWAPNO AI' }
            : {})
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: TEST_PROMPT }],
          max_tokens: 8,
          temperature: 0
        }),
        signal: AbortSignal.timeout(8000)
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ProviderTestError('PROVIDER_TIMEOUT', `${this.configuration.id} request timed out.`);
      }
      throw new ProviderTestError(
        'PROVIDER_REQUEST_FAILED',
        `${this.configuration.id} could not be reached. Check the server connection and provider status.`
      );
    }

    if (response.status === 429) {
      this.cooldownUntil = this.now() + parseRetryAfter(response);
      throw new ProviderTestError(
        'PROVIDER_RATE_LIMITED',
        `${this.configuration.id} rate limit reached; the provider is cooling down.`,
        Math.ceil((this.cooldownUntil - this.now()) / 1000)
      );
    }
    if (!response.ok) {
      throw new ProviderTestError(
        'PROVIDER_REQUEST_FAILED',
        `${this.configuration.id} rejected the test request with HTTP ${response.status}.`
      );
    }

    let data: ChatCompletionResponse;
    try {
      data = await response.json() as ChatCompletionResponse;
    } catch {
      throw new ProviderTestError(
        'EMPTY_PROVIDER_RESPONSE',
        `${this.configuration.id} returned an invalid response.`
      );
    }

    const content = data.choices?.[0]?.message?.content;
    const hasText = typeof content === 'string'
      ? content.trim().length > 0
      : Array.isArray(content) && content.some(part => part.text?.trim());
    if (!hasText) {
      throw new ProviderTestError(
        'EMPTY_PROVIDER_RESPONSE',
        `${this.configuration.id} returned an empty response to the connection test.`
      );
    }

    return {
      provider: this.configuration.id,
      model,
      verified: true,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? null,
        outputTokens: data.usage?.completion_tokens ?? null
      }
    };
  }
}

export function createOpenAICompatibleProvider(
  id: OpenAICompatibleProviderId,
  environment: OpenAICompatibleEnvironment = process.env,
  fetcher: typeof fetch = fetch,
  now: () => number = Date.now
): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider(CONFIGURATIONS[id], environment, fetcher, now);
}
