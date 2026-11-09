# SWAPNO AI — Project Overview

## Product direction

SWAPNO AI is intended to be a guided marketing partner for small businesses. The target journey is: understand the business, maintain an owner-approved Business Brain, research a market, build a strategy, plan content, review drafts, then (after real integrations and consent) publish and measure results. The current repository is an early prototype, not this complete product.

## Current product surfaces

- Public landing and fictional sample workspace.
- Local custom account signup/login and isolated workspace persistence.
- Business Profile fields, Business Brain summary, a Marketing Adviser prompt surface, onboarding lessons/checklist, and a server-derived trial status view.
- Prototype research/strategy/content/calendar/social/analytics screens; some are sample-only, unavailable, or simulated.

## Technology

React 19, TypeScript, Vite 6, Tailwind CSS 4, Express 4, Node.js 24, Zod, bcryptjs, JWT, and optional `@supabase/supabase-js`. Local account persistence is JSON. Supabase/Auth is a target architecture, not the current source of truth.

The npm package metadata remains the starter-template name `react-example` at version `0.0.0`; it should be renamed as a separate repository hygiene change.

## Product integrity rules

- Identify fictional/sample content as sample.
- No API connection is considered live until a real authenticated request succeeds.
- No action is “published” without a verified external platform result.
- No trial usage value is invented; current account AI usage is not live.
- No price is currently offered. Figures in the older product blueprint are planning examples only, not approved pricing.
- Preserve workspace data after trial expiry; no automatic charge is implemented or allowed by current policy.

## Brand reference

The attached palette image specifies Pure Black `#111111`, Crisp White `#FFFFFF`, Safety Orange `#FF4F00`, and Cyber Yellow `#FFD400`. It is applied to account-facing UI and blank workspace color defaults. This image is not verified as the official brand identity. Canva access, official logo files, and exact brand font names remain unavailable.

Continue with [architecture](ARCHITECTURE.md), [roadmap](PRODUCT-ROADMAP.md), [UX and navigation](UX-AND-NAVIGATION.md), and [project status](../PROJECT-STATUS.md).
