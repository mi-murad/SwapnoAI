# UX and Navigation — Current State

## Product direction

SWAPNO AI should feel like one clear Marketing Adviser guiding a business owner through business understanding, research, strategy, planning, and content review—not a set of disconnected bots. Use plain language, disclose unavailable features, and keep owners in control.

## Current account navigation and screens

The main app exposes Overview, Marketing Adviser, Market Research, Content Calendar & Studio, Analytics, Business Profile, Social Connections, Trial and Usage (for account workspaces), Help / Learn, and Settings. There is no separate active strategy or publishing navigation item. Some visible capabilities originate in the fictional sample. Account publishing, social OAuth, analytics, and AI generation are not live. Do not imply that sample data is customer data or that a click created an external effect.

The first-use checklist and ten short lessons cover welcome, profile, Business Brain, Adviser, research, strategy, calendar, content, social connections, and trial usage. Progress is stored with workspace JSON in local development. It has not been tested end-to-end across a deployed account lifecycle.

## Brand and visual status

The user-provided palette image is applied in the account UI and new workspace defaults:

| Role | Color |
|---|---|
| Pure Black | `#111111` |
| Crisp White | `#FFFFFF` |
| Safety Orange | `#FF4F00` |
| Cyber Yellow | `#FFD400` |

This is the supplied palette reference, not a verified official SWAPNO TECH identity. Canva access is restricted; official logo and font names remain unconfirmed. Palette values should not be described as official brand assets.

## Interaction/accessibility evidence

Inspected landing/signup/review and public-sample lesson views at 390px, 768px, and 1440px with no horizontal overflow in those views. The lesson dialog Tab/Shift+Tab focus containment and Escape dismissal were checked. Full authenticated dashboard, screen-reader announcements, full keyboard flow, and new/skipped/completed/returning/expired-trial acceptance flows remain untested.

## UX backlog

1. Complete end-to-end authenticated first-run and return journeys.
2. Make unavailable/sample capabilities visually distinct across all screens.
3. Verify all button actions, form errors, save states, and navigation at mobile/tablet/desktop.
4. Add screen-reader and keyboard acceptance tests.
5. Only after reliable AI/context services exist, test Adviser prompt-to-workflow behavior using approved workspace context.

See [UX and onboarding implementation notes](UX-AND-ONBOARDING.md) and [competitive UX review](COMPETITIVE-UX-REVIEW.md).
