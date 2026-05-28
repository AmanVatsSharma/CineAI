# CineAI — Nx Monorepo & UI-First Demo Plan

## Vision

CineAI is an AI video studio SaaS. This plan migrates the existing [cineai/](cineai/) Next.js prototype into an **Nx monorepo** that will eventually host a Next.js web app, a NestJS API, and Python AI agents — **but the first milestone is a pixel-perfect, end-to-end clickable UI demo** that looks and feels like a shipped product, backed entirely by mocks. Real backends come online only after the UI is "launch-ready."

Guiding rule: **nothing ships to real infra until the demo is indistinguishable from the real thing.**

---

## Phase 0 — Nx workspace bootstrap

Goal: one monorepo, zero regressions from current prototype.

- Create Nx workspace at repo root (`create-nx-workspace@latest --preset=ts`).
- Target layout:
  ```
  apps/
    web/                 # Next.js 15 (migrated from cineai/)
    api/                 # NestJS (stub, not wired yet)
    agents/              # Python agents (stub, not wired yet)
    web-e2e/             # Playwright
  libs/
    ui/                  # shared React components (framer-motion, lucide)
    ui-icons/            # Icons re-exports
    domain-types/        # TS types shared web↔api
    mock-data/           # fixtures + MSW handlers
    api-client/          # typed client, swappable real/mock
    config/              # tailwind preset, eslint, tsconfig base
  tools/
    generators/          # custom Nx generators for page/feature scaffolding
  ```
- Move [cineai/](cineai/) into `apps/web/`, preserving App Router structure from [CLAUDE.md](CLAUDE.md).
- Extract [src/components/ui/](cineai/src/components/ui/) → `libs/ui`, [src/types/](cineai/src/types/) → `libs/domain-types`, [src/lib/data.ts](cineai/src/lib/data.ts) → `libs/mock-data`.
- Delete stray [cineai/page.jsx](cineai/page.jsx), legacy [src/pages/](cineai/src/pages/), and v2/v3 prototype routes (keep screenshots if needed for design reference).
- CI: single `nx affected -t lint,build,test,e2e` pipeline.

**Exit criteria:** `nx run web:dev` renders the current landing + `/app/*` dashboard with no visual regression.

---

## Phase 1 — Design system & UI kit

Goal: a real design system, not one-off components.

- Define tokens in `libs/ui/tokens` (colors, spacing, radii, motion curves, shadows) — surface both as CSS vars in [globals.css](cineai/src/app/globals.css) and as a Tailwind preset in `libs/config/tailwind-preset.ts`.
- Promote existing primitives (`Icons`, `Toast`, `GenerateModal`, `Thumb`, `VideoCard`) into polished variants: `Button`, `Input`, `Select`, `Dialog`, `Drawer`, `Tabs`, `Tooltip`, `Dropdown`, `Command`, `Skeleton`, `Card`, `Badge`, `Avatar`, `EmptyState`, `ProgressRing`, `Spinner`, `Kbd`.
- Add Storybook (`nx g @nx/storybook:configuration ui`) with a story per primitive + per composed section.
- Motion: standardize framer-motion presets (`fadeUp`, `scaleIn`, `stagger`) in `libs/ui/motion.ts`.
- Accessibility: every primitive keyboard-navigable + ARIA-correct; add `@axe-core/playwright` checks to e2e.

**Exit criteria:** Storybook deployed as a static site; all dashboard pages rebuilt using only `libs/ui` primitives.

---

## Phase 2 — UI-first demo (the core of this plan)

Goal: the app **feels shipped**. Every click does something believable.

### 2a. Marketing surface

- Rebuild landing from [LandingPage.tsx](cineai/src/components/landing/LandingPage.tsx): hero with autoplaying reel, feature grid, pricing, testimonials, FAQ, footer.
- Add `/pricing`, `/changelog`, `/blog` (MDX), `/docs` (Nextra-style), `/login`, `/signup`.
- Auth pages are UI-only; "Sign in" drops a fake JWT into a cookie and redirects to `/app/dashboard`.

### 2b. Dashboard shell

- Persistent sidebar + topbar built once in [DashboardLayoutClient.tsx](cineai/src/app/app/DashboardLayoutClient.tsx).
- Global command palette (`⌘K`) — fuzzy-jumps to any page, project, or video.
- Extend [DashboardContext](cineai/src/app/app/DashboardContext.tsx) with: current workspace, current user, notifications, active generation jobs, theme.

### 2c. Feature surfaces (all mock-backed)

Each below gets: empty state → loading skeleton → populated state → error state → optimistic mutations.

- **Dashboard** ([app/dashboard](cineai/src/app/app/dashboard/page.tsx)) — KPI cards, recent renders, credit usage chart, activity feed.
- **Generate** ([app/generate](cineai/src/app/app/generate/page.tsx)) — prompt editor, model picker, aspect/duration/style controls, reference image upload (drag-drop), live cost estimate, "Generate" → fake job in progress tray with streaming status updates via a mock EventSource.
- **Videos library** ([app/videos](cineai/src/app/app/videos/page.tsx)) — grid + list toggle, filters, bulk select, detail drawer with timeline scrubber, download/share menus.
- **Storyboard** ([app/storyboard](cineai/src/app/app/storyboard/page.tsx)) — drag-drop shot sequencer, per-shot prompt, duration, transition picker; render "full storyboard" as a sequence of mock jobs.
- **Models** ([app/models](cineai/src/app/app/models/page.tsx)) — browse base models, upload LoRA (fake), training progress.
- **Settings** ([app/settings](cineai/src/app/app/settings/page.tsx)) — profile, team, billing (Stripe-style fake portal), API keys, webhooks, preferences.
- **Notifications center**, **activity log**, **help/keyboard-shortcuts overlay**.

### 2d. Mock backend layer

- `libs/mock-data` exposes MSW handlers for every endpoint the future NestJS API will own. Handlers simulate latency, progress, and occasional failures so the UI exercises all states.
- Long-running jobs simulated with a tiny `MockJobRunner` that emits SSE-shaped events — same contract the real NestJS will implement later.
- `libs/api-client` has two implementations behind one interface: `MockClient` (default) and `HttpClient` (real). Flip with `NEXT_PUBLIC_API_MODE`.

### 2e. Polish pass

- Page transitions, shared-layout animations on thumbnails, skeleton shimmer, optimistic toasts.
- Dark mode default, light mode parity.
- Responsive down to 375px.
- Preload critical routes, image `next/image` everywhere, LCP < 1.5s on cached dev.

**Exit criteria:** a stakeholder can click through the entire SaaS — signup → generate → watch progress → library → share → billing → settings — and nothing feels fake. **This is the "ultimate demo."**

---

## Phase 3 — NestJS API (the real backend)

Goal: replace `MockClient` one resource at a time without breaking the demo.

- `apps/api` scaffolded with `@nx/nest`. Modules: `auth`, `users`, `workspaces`, `projects`, `videos`, `generations`, `models`, `billing`, `webhooks`, `notifications`.
- Contracts live in `libs/domain-types` — used by both Next.js and Nest (single source of truth).
- Postgres + Prisma (or Drizzle) in `libs/db`. Redis for queues + SSE fan-out. BullMQ for job orchestration.
- Auth: Clerk or Auth.js, chosen after Phase 2 demos land.
- Each resource cut over individually: flip `NEXT_PUBLIC_API_MODE=real` for that module's endpoints while others stay mocked. Playwright e2e runs against both modes.

---

## Phase 4 — Python AI agents

Goal: the actual video generation brain.

- `apps/agents` — Python (uv + ruff), FastAPI worker that consumes jobs from the Nest queue.
- Agents: `prompt_enhancer`, `storyboard_planner`, `shot_generator` (wraps video model providers), `compositor`, `qc_reviewer`. Orchestrated via LangGraph or a thin custom supervisor.
- Shared contract with Nest via JSON schemas generated from `libs/domain-types` (Pydantic models generated at build time).
- GPU workers run out-of-cluster initially (Modal / RunPod / Replicate); Nest just dispatches and polls.
- Observability: OpenTelemetry from day one, traces span Next → Nest → Python.

---

## Phase 5 — Infra, launch, growth

- Dockerfiles per app, single `docker-compose.yml` for local (`web`, `api`, `agents`, `postgres`, `redis`, `minio`).
- Deploy: Vercel for `web`, Fly/Railway for `api`, Modal for `agents`, Neon for Postgres, Upstash for Redis.
- Feature flags (GrowthBook or Unleash) so the real backend can be toggled per-user during soft launch.
- Analytics (PostHog), error tracking (Sentry), billing (Stripe).
- Marketing site + waitlist goes live the day Phase 2 finishes, months before Phase 4 ships — the demo **is** the marketing.

---

## Milestones & rough sequencing

| Milestone | Scope | Exit signal |
|---|---|---|
| M0 | Phase 0 | `nx run web:dev` green, CI green |
| M1 | Phase 1 | Storybook published, every dashboard page uses `libs/ui` only |
| M2 | Phase 2a+2b | Landing + shell + command palette feel shipped |
| M3 | Phase 2c | All 6 dashboard surfaces demo-complete |
| M4 | Phase 2d+2e | **Ultimate demo** — recorded walkthrough, shareable link |
| M5 | Phase 3 | `auth` + `videos` + `generations` cut over to real Nest |
| M6 | Phase 4 | First real end-to-end generation through Python agents |
| M7 | Phase 5 | Public launch |

---

## Immediate next step

Bootstrap the Nx workspace (Phase 0) in a fresh branch and migrate [cineai/](cineai/) into `apps/web/` with zero visual regressions. Everything else depends on that foundation.
