# SWAPNO AI — OPEN QUESTIONS AND DECISIONS
**Document ID:** `13-OPEN-QUESTIONS-AND-DECISIONS`  
**Phase:** Foundation Sprint (Phases 1 & 2)  
**Date:** November 2026  
**Auditor / Product Architect:** Senior SaaS Product Architect  
**Status:** Awaiting Founder / User Review and Decisions  

---

## 1. Overview

During the Phase 1 + Phase 2 Foundation Sprint, all existing source code, configuration files, and founder strategy documents were audited without altering application files or adding unnecessary dependencies.

The following **5 critical architectural and business decisions** require the founder's review and explicit selection before commencing **Phase 3 (SaaS Backend & Multi-Tenant Infrastructure)**.

---

## 2. Decision Matrix & Architectural Options

### Decision 1: Backend Infrastructure & Database Platform
- **Context:** The existing prototype runs Express 4 with synchronous file I/O to a single `db.json`. A multi-tenant SaaS requires a relational database with Row-Level Security, authentication, and object storage.
- **Option A (Recommended): Node.js/TypeScript + Supabase (PostgreSQL, Auth, Storage)**
  - *Pros:* Generous free tier (500MB DB, 50k MAU, 1GB storage); built-in Auth, instant Row-Level Security, automated daily backups; fastest path to a reliable MVP with zero server maintenance.
  - *Cons:* Vendor coupling to Supabase ecosystem (though easily exportable to standard PostgreSQL).
  - *Estimated Cost:* \$0/mo initially; \$25/mo when active users scale.
- **Option B: Node.js/TypeScript + Standalone Self-Hosted PostgreSQL & Redis on a VPS**
  - *Pros:* 100% independent infrastructure; no third-party quotas.
  - *Cons:* Requires significant DevOps overhead (manual Linux security patches, database connection pooling, SSL certificates, backup script maintenance).
  - *Estimated Cost:* \$12 – \$24/mo on Hetzner or DigitalOcean.
- **Architect Recommendation:** **Option A (Supabase)** for Phases 3–11 to focus engineering effort on product quality and customer acquisition rather than Linux server maintenance.

---

### Decision 2: AI Provider Strategy & Routing Gateway
- **Context:** The prototype currently uses `@google/genai` calling `"gemini-3.5-flash"` with local fallback mocks. The production app requires a reliable model strategy that balances cost, speed, and quality.
- **Option A (Recommended): Google Gemini Direct (Gemini 2.0 Flash + Gemini 1.5 Pro)**
  - *Pros:* Gemini 2.0 Flash provides industry-leading latency and cost efficiency (~$0.10/1M tokens); Gemini 1.5 Pro offers 2M context window and Google Search Grounding for live market research; free developer quotas available during building.
  - *Cons:* Dependent on Google AI Studio API availability and quotas.
- **Option B: Multi-Provider Gateway (OpenRouter with Gemini Primary, Claude/OpenAI Fallback)**
  - *Pros:* Single unified API key; automatic failover to Anthropic Claude 3.5 Sonnet or OpenAI GPT-4o-mini if Google experiences outages; prevents single-vendor lock-in.
  - *Cons:* Slightly higher per-token latency (~100-200ms gateway routing overhead); requires funding an OpenRouter credit balance.
- **Architect Recommendation:** **Option A** for core development, wrapped in a provider adapter interface so **Option B** can be enabled via a single environment flag without code changes.

---

### Decision 3: Image Generation & Canva Workflow Strategy
- **Context:** The founder documents express interest in bespoke graphics and Canva integration. Canva's official Connect APIs have strict partner access requirements, user OAuth login restrictions, and do not permit unrestricted headless automated image rendering.
- **Option A (Recommended): Dedicated AI Image Synthesis (Google Imagen 3 / FLUX.1) + Brand Asset Framing**
  - *Pros:* Full programmatic control; outputs high-resolution, on-brand graphics directly into the publishing queue without third-party design tool logins; fully supports original product photo preservation.
  - *Cons:* ~$0.02 – $0.04 per generated image.
- **Option B: Deep Canva Connect Integration**
  - *Pros:* Familiar design canvas for non-technical business owners.
  - *Cons:* Requires users to leave Swapno AI or open Canva authentication frames; Canva API approval takes weeks; users must manually export and re-import files.
- **Architect Recommendation:** Launch v1 with **Option A (Imagen 3 / FLUX)** for seamless zero-click generation. Add Canva "Export to Canva" link buttons as a Phase 8 enhancement.

---

### Decision 4: Payment Gateway for Bangladesh Launch Market
- **Context:** Target launch pricing is set in BDT (৳999/mo Starter, ৳1,999/mo Growth, ৳3,999/mo Pro). SME business owners in Bangladesh predominantly pay via Mobile Financial Services (MFS) rather than international credit cards.
- **Option A (Recommended): Dual Payment Pipeline (bKash Merchant / SSLCommerz for BDT + Stripe for International)**
  - *Pros:* Allows local Bangladeshi businesses to subscribe instantly via bKash, Nagad, Rocket, or local Visa/Mastercard; enables international subscribers to pay via Stripe.
  - *Cons:* Requires managing two merchant accounts and webhook handlers.
- **Option B: Stripe Only**
  - *Pros:* Easiest technical implementation; built-in customer portal.
  - *Cons:* Excludes up to 75% of local Bangladeshi SME owners who lack dual-currency international credit cards.
- **Architect Recommendation:** Implement **Option A** (SSLCommerz / bKash first, Stripe in parallel).

---

### Decision 5: UI/UX Theme Direction
- **Context:** The existing prototype features a high-density, terminal-style all-black dark interface. The founder noted: *"I would move away from the current heavily terminal-style dark interface. Support Light / Dark / System. Default should probably be light/premium."*
- **Option A (Recommended): Executive Warm Modern (Light Default + Dark Toggle)**
  - *Pros:* Approachable, professional SaaS look; high daylight readability; premium aesthetic inspired by modern operating systems (Linear, Notion, Apple); reduces cognitive fatigue for SME owners.
  - *Cons:* Requires styling both light and dark CSS tokens.
- **Option B: Retain Terminal Dark Theme Exclusively**
  - *Pros:* Zero redesign work on color tokens.
  - *Cons:* Remains intimidating to non-technical business owners; conflicts with founder's explicit UX feedback.
- **Architect Recommendation:** Adopt **Option A**.

---

## 3. Summary of Decisions Awaiting Founder Input

| Decision ID | Topic | Recommended Option | Founder Approval Status |
|---|---|---|---|
| **ADR-01** | Backend Infrastructure & DB | **Option A: Supabase (PostgreSQL + Auth + Storage)** | Awaiting Decision |
| **ADR-02** | Primary AI Provider Strategy | **Option A: Google Gemini 2.0 Flash / 1.5 Pro via Adapter** | Awaiting Decision |
| **ADR-03** | Image Synthesis & Creative Tool | **Option A: Imagen 3 / FLUX with Asset Preservation** | Awaiting Decision |
| **ADR-04** | Payment Gateway | **Option A: bKash / SSLCommerz + Stripe** | Awaiting Decision |
| **ADR-05** | UI Theme Default | **Option A: Executive Light by Default with Dark Toggle** | Awaiting Decision |
| **ADR-06** | Phase 3 Kickoff Approval | **Approve Phase 3 Backend Engineering** | Awaiting Decision |
