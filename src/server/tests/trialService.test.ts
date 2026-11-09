import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertTrialActionAllowed,
  createTrialWindow,
  getTrialPolicy,
  getTrialSnapshot,
  TrialRestrictionError
} from '../trial/trialService';

const policy = getTrialPolicy({
  TRIAL_DURATION_DAYS: '7',
  TRIAL_AI_ACTION_LIMIT: '25',
  TRIAL_INCLUDED_AI_ACTIONS: 'adviser,research,strategy,text_content'
} as NodeJS.ProcessEnv);

test('new trial window uses the configured seven-day duration', () => {
  const start = new Date('2026-11-09T00:00:00.000Z');
  const window = createTrialWindow(start, policy);

  assert.equal(window.trialStartedAt, start.toISOString());
  assert.equal(window.trialExpiresAt, '2026-11-16T00:00:00.000Z');
});

test('trial usage reports server-owned limits without fabricating consumption', () => {
  const snapshot = getTrialSnapshot({
    trialStartedAt: '2026-11-09T00:00:00.000Z',
    trialExpiresAt: '2026-11-16T00:00:00.000Z',
    trialUsageCount: 0
  }, policy, new Date('2026-11-10T00:00:00.000Z'));

  assert.equal(snapshot.status, 'active');
  assert.equal(snapshot.actionLimit, 25);
  assert.equal(snapshot.actionsUsed, 0);
  assert.equal(snapshot.actionsRemaining, 25);
  assert.equal(snapshot.cardRequired, false);
  assert.equal(snapshot.automaticCharge, false);
});

test('trial rejects restricted actions after expiry and preserves zero charge behavior', () => {
  const snapshot = getTrialSnapshot({
    trialStartedAt: '2026-11-01T00:00:00.000Z',
    trialExpiresAt: '2026-11-08T00:00:00.000Z',
    trialUsageCount: 3
  }, policy, new Date('2026-11-09T00:00:00.000Z'));

  assert.equal(snapshot.status, 'expired');
  assert.equal(snapshot.actionsUsed, 3);
  assert.equal(snapshot.automaticCharge, false);
  assert.throws(() => assertTrialActionAllowed('research', snapshot), (error: unknown) =>
    error instanceof TrialRestrictionError && error.code === 'TRIAL_EXPIRED'
  );
});

test('trial rejects actions that are not configured for the workspace trial', () => {
  const restrictedPolicy = { ...policy, includedActions: ['adviser'] as typeof policy.includedActions };
  const snapshot = getTrialSnapshot({
    trialStartedAt: '2026-11-09T00:00:00.000Z',
    trialExpiresAt: '2026-11-16T00:00:00.000Z',
    trialUsageCount: 0
  }, restrictedPolicy, new Date('2026-11-10T00:00:00.000Z'));

  assert.throws(() => assertTrialActionAllowed('text_content', snapshot), (error: unknown) =>
    error instanceof TrialRestrictionError && error.code === 'FEATURE_NOT_INCLUDED'
  );
});

test('trial rejects actions after the configured request allowance is used', () => {
  const snapshot = getTrialSnapshot({
    trialStartedAt: '2026-11-09T00:00:00.000Z',
    trialExpiresAt: '2026-11-16T00:00:00.000Z',
    trialUsageCount: 25
  }, policy, new Date('2026-11-10T00:00:00.000Z'));

  assert.equal(snapshot.actionsRemaining, 0);
  assert.throws(() => assertTrialActionAllowed('adviser', snapshot), (error: unknown) =>
    error instanceof TrialRestrictionError && error.code === 'TRIAL_USAGE_LIMIT_REACHED'
  );
});

test('invalid owner policy values fail explicitly', () => {
  assert.throws(() => getTrialPolicy({ TRIAL_DURATION_DAYS: '0' } as NodeJS.ProcessEnv));
  assert.throws(() => getTrialPolicy({ TRIAL_INCLUDED_AI_ACTIONS: 'publishing' } as NodeJS.ProcessEnv));
});
