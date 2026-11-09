import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Circle, X } from 'lucide-react';
import { LearningProgress, SwapnoAppState, TrialSnapshot } from '../types';

interface GuidedLearningProps {
  state: SwapnoAppState;
  activeTab: string;
  isAccountWorkspace: boolean;
  trial: TrialSnapshot | null;
  trialLoading: boolean;
  supportContactUrl?: string;
  onNavigate: (tab: string) => void;
  onSaveState: (state: SwapnoAppState) => void;
}

interface Lesson {
  id: string;
  title: string;
  tab: string;
  what: string;
  why: string;
  next: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'welcome',
    title: 'Welcome to SWAPNO AI',
    tab: 'dashboard',
    what: 'SWAPNO AI helps you understand your business and plan practical marketing work with one Marketing Adviser.',
    why: 'A clear business profile helps keep advice relevant to your products, customers, and goals.',
    next: 'Add a few details about your business, then review what SWAPNO AI should remember.'
  },
  {
    id: 'business_profile',
    title: 'Set up your Business Profile',
    tab: 'profile',
    what: 'Your profile holds your business name, industry, audience, description, and preferred writing style.',
    why: 'These details give your marketing work a consistent starting point. You can leave optional fields blank and update them later.',
    next: 'Open Business Profile and add the details you know. For example: “family-owned bakery in Dhaka” is enough to get started. Products and goals can be added later.'
  },
  {
    id: 'business_brain',
    title: 'Review your Business Brain',
    tab: 'profile',
    what: 'The Business Brain is the approved summary of your products, services, audience, competitors, and goals.',
    why: 'You stay in control: review and correct business information before it is treated as approved context.',
    next: 'Check the summary in Business Profile. Do not approve details that are guesses or out of date.'
  },
  {
    id: 'marketing_adviser',
    title: 'Work with your Marketing Adviser',
    tab: 'adviser',
    what: 'The Adviser is the single place to ask for help with business questions, research, strategy, and content.',
    why: 'Keeping your work in one conversation makes it easier to follow a recommendation through to a draft.',
    next: 'Try a prompt such as “Help me understand my competitors” or “Give me ideas to reach more customers.” Account AI is not connected yet.'
  },
  {
    id: 'market_research',
    title: 'Research your market',
    tab: 'research',
    what: 'Market research should help you compare competitors, understand customers, and find opportunities.',
    why: 'Separate sourced facts from assumptions and suggestions before making a business decision.',
    next: 'Review your audience and add real observations. Current sample research is illustrative, not verified market data.'
  },
  {
    id: 'brand_strategy',
    title: 'Build a marketing strategy',
    tab: 'profile',
    what: 'A strategy turns your business goals and audience needs into clear positioning and marketing activities.',
    why: 'A small number of focused actions is easier to review and maintain than a long list of generic ideas.',
    next: 'Write down one goal, one audience, and one action you can realistically take this week.'
  },
  {
    id: 'content_calendar',
    title: 'Plan a content calendar',
    tab: 'content',
    what: 'The calendar helps you plan draft posts and review when each piece of content is intended to go out.',
    why: 'Planning ahead gives you time to check accuracy, tone, and platform fit before anything is shared.',
    next: 'Create a draft date and topic. Scheduling and publishing to social accounts are not connected.'
  },
  {
    id: 'content_studio',
    title: 'Create and review a post',
    tab: 'content',
    what: 'Content Studio is where you draft, edit, and review post copy and visual ideas.',
    why: 'You should check every draft for accuracy and brand fit. Nothing should be published without your approval.',
    next: 'Open a draft and revise its wording. Text and image generation for account workspaces are not live yet.'
  },
  {
    id: 'social_connections',
    title: 'Social account connections',
    tab: 'connections',
    what: 'A real social connection can allow approved publishing or access to account insights, depending on platform permissions.',
    why: 'Only connect an account when you understand the permissions and the feature you need.',
    next: 'No social account connection is available yet. You are not asked to connect anything during signup.'
  },
  {
    id: 'trial_usage',
    title: 'Your free trial and usage',
    tab: 'trial',
    what: 'The trial lasts seven days, needs no payment card, and has a shared limit of 25 AI actions for Adviser, research, strategy, and text drafts.',
    why: 'You can see the dates and usage recorded by the server. Expiration does not delete your workspace or charge you.',
    next: 'Open Trial and Usage to check the status. Account AI actions remain unavailable until the real AI services are connected.'
  }
];

const CONTEXT_LESSONS: Record<string, string> = {
  dashboard: 'welcome',
  profile: 'business_profile',
  adviser: 'marketing_adviser',
  research: 'market_research',
  content: 'content_calendar',
  connections: 'social_connections',
  trial: 'trial_usage'
};

const INITIAL_PROGRESS: LearningProgress = {
  dismissed: false,
  completedLessonIds: []
};

function isProfileComplete(state: SwapnoAppState): boolean {
  return Boolean(
    state.businessSetup.name.trim()
    && state.businessSetup.industry.trim()
    && state.businessSetup.targetAudience.trim()
    && state.businessSetup.description.trim()
  );
}

interface ChecklistItem {
  title: string;
  tab: string;
  complete: boolean;
}

export function FirstUseChecklist({
  state,
  onNavigate,
  onOpenLearning
}: Pick<GuidedLearningProps, 'state' | 'onNavigate'> & { onOpenLearning: () => void }) {
  const items: ChecklistItem[] = [
    { title: 'Complete your business profile', tab: 'profile', complete: isProfileComplete(state) },
    { title: 'Review your Business Brain', tab: 'profile', complete: state.businessBrain.synced },
    { title: 'Understand your audience', tab: 'research', complete: Boolean(state.businessSetup.targetAudience.trim()) },
    { title: 'Create your marketing strategy', tab: 'profile', complete: state.strategy.approved },
    { title: 'Review your content calendar', tab: 'content', complete: state.contentPlan.length > 0 },
    { title: 'Create your first post', tab: 'content', complete: state.contentPlan.some(post => post.contentCopy.trim()) }
  ];
  const completed = items.filter(item => item.complete).length;

  return (
    <section aria-labelledby="first-use-checklist-title" className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-white" id="first-use-checklist-title">Your first steps</p>
          <p className="mt-1 text-sm leading-6 text-neutral-300">
            Your business. Understood. Start by adding your products, audience, and goals.
          </p>
          <p className="mt-2 text-xs text-neutral-400">{completed} of {items.length} steps complete</p>
        </div>
        <button
          type="button"
          onClick={onOpenLearning}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-100 hover:border-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Learn SWAPNO AI
        </button>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => onNavigate(item.tab)}
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              {item.complete
                ? <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Complete" />
                : <Circle className="h-4 w-4 shrink-0 text-neutral-500" aria-label="Not complete" />}
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function TrialStatusPanel({
  trial,
  loading,
  supportContactUrl
}: {
  trial: TrialSnapshot | null;
  loading: boolean;
  supportContactUrl?: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return <p role="status" className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">Loading your trial details…</p>;
  }
  if (!trial) {
    return <p role="alert" className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-4 text-sm text-amber-100">Trial details could not be loaded. Your workspace data is unchanged; refresh or contact support.</p>;
  }

  const remaining = Math.max(0, Date.parse(trial.expiresAt) - now);
  const remainingDays = Math.ceil(remaining / (24 * 60 * 60 * 1000));
  const remainingText = remaining <= 0
    ? 'Trial ended'
    : remainingDays === 1
      ? 'Less than one day remaining'
      : `${remainingDays} days remaining`;
  const featureNames: Record<string, string> = {
    adviser: 'Marketing Adviser',
    research: 'Market research',
    strategy: 'Marketing strategy',
    text_content: 'Text content drafts'
  };

  return (
    <section aria-labelledby="trial-status-title" className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-300" id="trial-status-title">{trial.durationDays}-day free trial</p>
          <h1 className="mt-1 text-xl font-bold text-white">{trial.status === 'active' ? remainingText : 'Your trial has ended'}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
            No card is required. There is no automatic payment. Your workspace and content stay available after the trial.
          </p>
        </div>
        <div className="min-w-52 rounded-xl border border-neutral-800 bg-black p-4">
          <p className="text-sm font-semibold text-white">AI usage</p>
          <p className="mt-1 text-sm text-neutral-300">{trial.actionsUsed} of {trial.actionLimit} actions used</p>
          <p className="text-sm text-neutral-400">{trial.actionsRemaining} remaining</p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800"
            role="progressbar"
            aria-label="Free-trial AI usage"
            aria-valuemin={0}
            aria-valuemax={trial.actionLimit}
            aria-valuenow={trial.actionsUsed}
          >
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.min(100, (trial.actionsUsed / trial.actionLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-neutral-400">Trial started</dt>
          <dd className="mt-1 font-medium text-neutral-100">{formatDate(trial.startedAt)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Trial expires</dt>
          <dd className="mt-1 font-medium text-neutral-100">{formatDate(trial.expiresAt)}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-neutral-800 pt-4">
        <h2 className="text-sm font-semibold text-white">Included in your trial</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {trial.includedActions.map(action => (
            <li key={action} className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200">
              {featureNames[action] || action}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          After the trial, trial-limited AI actions stop. You can still access account and data-management features. Your workspace is not deleted and you are not charged.
        </p>
        {trial.status === 'expired' && (
          <p className="mt-3 text-sm text-amber-100">
            {supportContactUrl
              ? <a className="font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500" href={supportContactUrl}>Contact SWAPNO AI about access options</a>
              : 'Upgrade or contact options have not been configured yet. No price or payment action is available.'}
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-neutral-400">
          Account AI services are not connected yet, so no AI requests have been made or counted.
        </p>
      </div>
    </section>
  );
}

export function GuidedLearning({
  state,
  activeTab,
  isAccountWorkspace,
  trial,
  trialLoading,
  supportContactUrl,
  onNavigate,
  onSaveState
}: GuidedLearningProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const progress = state.learningProgress || INITIAL_PROGRESS;
  const selectedLesson = LESSONS.find(lesson => lesson.id === selectedLessonId) || null;
  const completedIds = useMemo(() => new Set(progress.completedLessonIds), [progress.completedLessonIds]);
  const contextualLessonId = CONTEXT_LESSONS[activeTab];

  useEffect(() => {
    if (
      isAccountWorkspace
      && activeTab !== 'learn'
      && !progress.dismissed
      && progress.completedLessonIds.length === 0
      && selectedLessonId === null
    ) {
      setSelectedLessonId('welcome');
    }
  }, [activeTab, isAccountWorkspace, progress.dismissed, progress.completedLessonIds.length, selectedLessonId]);

  useEffect(() => {
    if (!selectedLessonId) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const getFocusableElements = () => dialog
      ? [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      : [];
    getFocusableElements()[0]?.focus();

    const keepFocusInDialog = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLesson();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', keepFocusInDialog);
    return () => {
      window.removeEventListener('keydown', keepFocusInDialog);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [selectedLessonId]);

  function saveProgress(next: LearningProgress) {
    onSaveState({ ...state, learningProgress: next });
  }

  function closeLesson() {
    setSelectedLessonId(null);
    if (!progress.dismissed) saveProgress({ ...progress, dismissed: true });
  }

  function openLesson(id: string) {
    setSelectedLessonId(id);
  }

  function completeLesson(lesson: Lesson, nextLesson?: Lesson) {
    const lessonIds = [...new Set([...progress.completedLessonIds, lesson.id])];
    const completedAt = lessonIds.length === LESSONS.length ? new Date().toISOString() : progress.completedAt;
    saveProgress({
      ...progress,
      completedLessonIds: lessonIds,
      ...(completedAt ? { completedAt } : {})
    });
    if (nextLesson) setSelectedLessonId(nextLesson.id);
    else setSelectedLessonId(null);
  }

  const currentLessonIndex = selectedLesson ? LESSONS.findIndex(lesson => lesson.id === selectedLesson.id) : -1;
  const previousLesson = currentLessonIndex > 0 ? LESSONS[currentLessonIndex - 1] : undefined;
  const nextLesson = currentLessonIndex >= 0 ? LESSONS[currentLessonIndex + 1] : undefined;

  return (
    <>
      {activeTab === 'trial' && isAccountWorkspace && (
        <TrialStatusPanel trial={trial} loading={trialLoading} supportContactUrl={supportContactUrl} />
      )}

      {activeTab === 'learn' && (
        <section className="mx-auto max-w-5xl space-y-5" aria-labelledby="learn-title">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">Help and learning</p>
            <h1 id="learn-title" className="mt-2 text-2xl font-bold text-white">Learn SWAPNO AI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
              Short lessons explain what each area does, why it helps, and what you can try next. You can skip the guide and return whenever you need it.
            </p>
            <button
              type="button"
              onClick={() => openLesson(LESSONS.find(lesson => !completedIds.has(lesson.id))?.id || 'welcome')}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              {completedIds.size ? 'Continue learning' : 'Start learning'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-3 text-xs text-neutral-400">{completedIds.size} of {LESSONS.length} lessons completed</p>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2">
            {LESSONS.map((lesson, index) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => openLesson(lesson.id)}
                  className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-left hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-orange-300">
                    {completedIds.has(lesson.id) ? <Check className="h-4 w-4" aria-label="Completed" /> : index + 1}
                  </span>
                  <span className="text-sm font-medium text-neutral-100">{lesson.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {activeTab !== 'learn' && activeTab !== 'trial' && contextualLessonId && (
        <aside className="mb-5 flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-300">
            Need help with this page? <span className="font-medium text-white">{LESSONS.find(lesson => lesson.id === contextualLessonId)?.title}</span>
          </p>
          <button
            type="button"
            onClick={() => openLesson(contextualLessonId)}
            className="min-h-10 self-start rounded-lg px-3 py-2 text-sm font-semibold text-orange-200 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:self-auto"
          >
            Open lesson
          </button>
        </aside>
      )}

      {selectedLesson && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-dialog-title"
            aria-describedby="learning-dialog-content"
            ref={dialogRef}
            tabIndex={-1}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-neutral-700 bg-neutral-950 p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-orange-300">Lesson {currentLessonIndex + 1} of {LESSONS.length}</p>
                <h2 id="learning-dialog-title" className="mt-1 text-xl font-bold text-white">{selectedLesson.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Close lesson"
                onClick={closeLesson}
                className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div id="learning-dialog-content" className="mt-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">What is this?</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-300">{selectedLesson.what}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Why is it useful?</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-300">{selectedLesson.why}</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-black p-4">
                <h3 className="text-sm font-semibold text-white">What can I do next?</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-300">{selectedLesson.next}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={closeLesson}
                className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                Skip for now
              </button>
              <div className="flex flex-wrap justify-end gap-2">
                {previousLesson && (
                  <button
                    type="button"
                    onClick={() => setSelectedLessonId(previousLesson.id)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(selectedLesson.tab);
                    completeLesson(selectedLesson, nextLesson);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                >
                  {nextLesson ? 'Next lesson' : 'Finish guide'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
