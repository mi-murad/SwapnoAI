import { GoogleGenAI } from '@google/genai';
import {
  createOpenAICompatibleProvider,
  OpenAICompatibleEnvironment,
  OpenAICompatibleProvider
} from './openAICompatibleProvider';
import { ProviderAdapter, ProviderHealth, ProviderId, ProviderTestError, ProviderTestResult } from './providerTypes';

export { ProviderTestError } from './providerTypes';
export type { ProviderTestResult } from './providerTypes';

export type ProviderHealthState = ProviderHealth['state'];

export interface GeminiGenerateParameters {
  model: string;
  contents: string;
  config: {
    maxOutputTokens: number;
    temperature: number;
  };
}

export interface GeminiClient {
  models: {
    generateContent(parameters: GeminiGenerateParameters): Promise<{
      text?: string;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    }>;
  };
}

export interface GeminiEnvironment {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL_ID?: string;
  GEMINI_LIVE_TEST_ENABLED?: string;
}

type GeminiClientFactory = (apiKey: string) => GeminiClient;

const PLACEHOLDER_KEY_PATTERN = /^(YOUR_|REPLACE_|CHANGE_ME|CHANGEME|<|\$\{)/i;
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const CONNECTION_TEST_PROMPT = 'Reply with the single word READY.';
const PROVIDER_TEST_TIMEOUT_MS = 8000;

function createGeminiClient(apiKey: string): GeminiClient {
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: PROVIDER_TEST_TIMEOUT_MS }
  });

  return {
    models: {
      async generateContent(parameters) {
        const response = await client.models.generateContent(parameters);
        return {
          text: response.text,
          usageMetadata: {
            promptTokenCount: response.usageMetadata?.promptTokenCount,
            candidatesTokenCount: response.usageMetadata?.candidatesTokenCount
          }
        };
      }
    }
  };
}

export class GeminiProvider implements ProviderAdapter {
  private cooldownUntil = 0;

  constructor(
    private readonly environment: GeminiEnvironment = process.env,
    private readonly clientFactory: GeminiClientFactory = createGeminiClient
  ) {}

  public getHealth(): ProviderHealth {
    const apiKey = this.getApiKey();
    const liveTestEnabled = this.environment.GEMINI_LIVE_TEST_ENABLED === 'true';
    const state: ProviderHealthState = !apiKey
      ? 'not_configured'
      : this.cooldownUntil > Date.now()
        ? 'cooling_down'
      : liveTestEnabled
        ? 'ready_for_explicit_test'
        : 'test_disabled';

    return {
      id: 'gemini',
      state,
      model: this.getModel(),
      liveTestEnabled,
      capabilities: ['text_generation'],
      freeTierStatus: 'account_dependent',
      automaticFallbackEligible: false,
      ...(this.cooldownUntil > Date.now()
        ? { cooldownUntil: new Date(this.cooldownUntil).toISOString() }
        : {})
    };
  }

  public async verifyConnection(): Promise<ProviderTestResult> {
    if (this.environment.GEMINI_LIVE_TEST_ENABLED !== 'true') {
      throw new ProviderTestError(
        'LIVE_TEST_DISABLED',
        'Live Gemini tests are disabled. Enable GEMINI_LIVE_TEST_ENABLED to run one explicit test.'
      );
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ProviderTestError(
        'PROVIDER_NOT_CONFIGURED',
        'Gemini is not configured on the server.'
      );
    }
    if (this.cooldownUntil > Date.now()) {
      throw new ProviderTestError(
        'PROVIDER_COOLDOWN',
        'Gemini is cooling down after a provider rate limit.',
        Math.ceil((this.cooldownUntil - Date.now()) / 1000)
      );
    }

    const model = this.getModel();
    let response: Awaited<ReturnType<GeminiClient['models']['generateContent']>>;
    try {
      response = await this.clientFactory(apiKey).models.generateContent({
        model,
        contents: CONNECTION_TEST_PROMPT,
        config: {
          maxOutputTokens: 8,
          temperature: 0
        }
      });
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 0;
      if (status === 429) {
        this.cooldownUntil = Date.now() + 30_000;
        throw new ProviderTestError('PROVIDER_RATE_LIMITED', 'Gemini rate limit reached.', 30);
      }
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ProviderTestError('PROVIDER_TIMEOUT', 'Gemini request timed out.');
      }
      throw new ProviderTestError('PROVIDER_REQUEST_FAILED', 'Gemini rejected or failed the test request.');
    }

    if (!response.text?.trim()) {
      throw new ProviderTestError(
        'EMPTY_PROVIDER_RESPONSE',
        'Gemini returned an empty response to the connection test.'
      );
    }

    return {
      provider: 'gemini',
      model,
      verified: true,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? null,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? null
      }
    };
  }

  private getApiKey(): string | undefined {
    const value = this.environment.GEMINI_API_KEY?.trim();
    if (!value || PLACEHOLDER_KEY_PATTERN.test(value)) {
      return undefined;
    }
    return value;
  }

  private getModel(): string {
    const value = this.environment.GEMINI_MODEL_ID?.trim();
    return value || DEFAULT_GEMINI_MODEL;
  }
}

export class AIProviderRegistry {
  private readonly providers: Map<ProviderId, ProviderAdapter>;

  constructor(
    gemini: GeminiProvider = new GeminiProvider(),
    groq: OpenAICompatibleProvider = createOpenAICompatibleProvider('groq'),
    openrouter: OpenAICompatibleProvider = createOpenAICompatibleProvider('openrouter')
  ) {
    this.providers = new Map<ProviderId, ProviderAdapter>([
      ['gemini', gemini],
      ['groq', groq],
      ['openrouter', openrouter]
    ]);
  }

  public getHealth(): ProviderHealth[] {
    return Array.from(this.providers.values(), provider => provider.getHealth());
  }

  public verifyConnection(providerId: ProviderId): Promise<ProviderTestResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new ProviderTestError('PROVIDER_NOT_CONFIGURED', `Provider ${providerId} is not registered.`);
    }
    return provider.verifyConnection();
  }

  public verifyGeminiConnection(): Promise<ProviderTestResult> {
    return this.verifyConnection('gemini');
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
