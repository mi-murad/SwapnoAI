import { WorkspaceRecord } from '../types';

export type TrialAction = 'adviser' | 'research' | 'strategy' | 'text_content';

export interface TrialPolicy {
  durationDays: number;
  actionLimit: number;
  includedActions: TrialAction[];
}

export interface TrialSnapshot {
  status: 'active' | 'expired';
  startedAt: string;
  expiresAt: string;
  serverNow: string;
  remainingMilliseconds: number;
  durationDays: number;
  actionLimit: number;
  actionsUsed: number;
  actionsRemaining: number;
  includedActions: TrialAction[];
  cardRequired: false;
  automaticCharge: false;
  supportContactUrl?: string;
}

const ACTION_LABELS: Record<TrialAction, string> = {
  adviser: 'Marketing Adviser',
  research: 'Market research',
  strategy: 'Marketing strategy',
  text_content: 'Text content drafts'
};

const VALID_ACTIONS = Object.keys(ACTION_LABELS) as TrialAction[];

function readPositiveInteger(name: string, value: string | undefined, defaultValue: number): number {
  if (value === undefined || value.trim() === '') return defaultValue;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 3650) {
    throw new Error(`${name} must be a whole number between 1 and 3650.`);
  }
  return parsed;
}

export function getTrialPolicy(environment: NodeJS.ProcessEnv = process.env): TrialPolicy {
  const durationDays = readPositiveInteger('TRIAL_DURATION_DAYS', environment.TRIAL_DURATION_DAYS, 7);
  const actionLimit = readPositiveInteger('TRIAL_AI_ACTION_LIMIT', environment.TRIAL_AI_ACTION_LIMIT, 25);
  const rawActions = environment.TRIAL_INCLUDED_AI_ACTIONS
    ?? 'adviser,research,strategy,text_content';
  const includedActions = [...new Set(rawActions.split(',').map(action => action.trim()).filter(Boolean))];

  if (includedActions.some(action => !VALID_ACTIONS.includes(action as TrialAction))) {
    throw new Error(`TRIAL_INCLUDED_AI_ACTIONS must contain only: ${VALID_ACTIONS.join(', ')}.`);
  }

  return { durationDays, actionLimit, includedActions: includedActions as TrialAction[] };
}

export function createTrialWindow(
  startedAt: Date,
  policy: TrialPolicy
): { trialStartedAt: string; trialExpiresAt: string } {
  const start = startedAt.getTime();
  if (!Number.isFinite(start)) throw new Error('A valid trial start date is required.');

  return {
    trialStartedAt: new Date(start).toISOString(),
    trialExpiresAt: new Date(start + policy.durationDays * 24 * 60 * 60 * 1000).toISOString()
  };
}

export function getTrialSnapshot(
  workspace: Pick<WorkspaceRecord, 'trialStartedAt' | 'trialExpiresAt' | 'trialUsageCount'>,
  policy: TrialPolicy,
  now: Date = new Date(),
  environment: NodeJS.ProcessEnv = process.env
): TrialSnapshot {
  const expiresAt = Date.parse(workspace.trialExpiresAt);
  const startedAt = Date.parse(workspace.trialStartedAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(expiresAt)) {
    throw new Error('Workspace trial dates are missing or invalid.');
  }
  const actionsUsed = Math.min(policy.actionLimit, Math.max(0, workspace.trialUsageCount));
  const remainingMilliseconds = Math.max(0, expiresAt - now.getTime());

  const supportContactUrl = getSupportContactUrl(environment.SUPPORT_CONTACT_URL);
  return {
    status: remainingMilliseconds > 0 ? 'active' : 'expired',
    startedAt: new Date(startedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    serverNow: now.toISOString(),
    remainingMilliseconds,
    durationDays: policy.durationDays,
    actionLimit: policy.actionLimit,
    actionsUsed,
    actionsRemaining: Math.max(0, policy.actionLimit - actionsUsed),
    includedActions: policy.includedActions,
    cardRequired: false,
    automaticCharge: false,
    ...(supportContactUrl ? { supportContactUrl } : {})
  };
}

function getSupportContactUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'mailto:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function assertTrialActionAllowed(
  action: TrialAction,
  snapshot: TrialSnapshot
): void {
  if (!snapshot.includedActions.includes(action)) {
    throw new TrialRestrictionError('FEATURE_NOT_INCLUDED', `${ACTION_LABELS[action]} is not included in this trial.`);
  }
  if (snapshot.status === 'expired') {
    throw new TrialRestrictionError('TRIAL_EXPIRED', 'Your free trial has ended. Your workspace and data are still available.');
  }
  if (snapshot.actionsRemaining < 1) {
    throw new TrialRestrictionError('TRIAL_USAGE_LIMIT_REACHED', 'Your trial AI usage limit has been reached.');
  }
}

export class TrialRestrictionError extends Error {
  constructor(
    public readonly code: 'FEATURE_NOT_INCLUDED' | 'TRIAL_EXPIRED' | 'TRIAL_USAGE_LIMIT_REACHED',
    message: string
  ) {
    super(message);
    this.name = 'TrialRestrictionError';
  }
}
