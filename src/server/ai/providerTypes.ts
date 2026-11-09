export type ProviderId = 'gemini' | 'groq' | 'openrouter';

export type ProviderTestErrorCode =
  | 'PROVIDER_NOT_CONFIGURED'
  | 'LIVE_TEST_DISABLED'
  | 'EMPTY_PROVIDER_RESPONSE'
  | 'INVALID_MODEL_CONFIGURATION'
  | 'PROVIDER_COOLDOWN'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_REQUEST_FAILED';

export class ProviderTestError extends Error {
  constructor(
    public readonly code: ProviderTestErrorCode,
    message: string,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'ProviderTestError';
  }
}

export interface ProviderTestResult {
  provider: ProviderId;
  model: string;
  verified: true;
  usage?: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
}

export interface ProviderHealth {
  id: ProviderId;
  state:
    | 'not_configured'
    | 'test_disabled'
    | 'ready_for_explicit_test'
    | 'invalid_model_configuration'
    | 'cooling_down';
  model: string;
  capabilities: string[];
  freeTierStatus: 'account_dependent' | 'model_marker_required';
  automaticFallbackEligible: false;
  liveTestEnabled: boolean;
  cooldownUntil?: string;
  freeOnlyModel?: boolean;
}

export interface ProviderAdapter {
  getHealth(): ProviderHealth;
  verifyConnection(): Promise<ProviderTestResult>;
}
