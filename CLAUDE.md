# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Nx monorepo. The original prototype is in [cineai/](cineai/) (preserved for reference); the active codebase lives in:

```
apps/
  web/          Next.js 15 App Router — the UI demo
  api/          NestJS API stub (Phase 3 — not wired yet)
  agents/       Python FastAPI — brand agents, model router, Brand Guardian (providers stubbed)
libs/
  ui/           Shared React components (Icons, Toast, GenerateModal, VideoCard, Thumb)
  domain-types/ Shared TypeScript types (Video, Model, NavGroup, etc.)
  mock-data/    Fixture data + exports (VIDEOS, MODELS, NAV, PAGE_TITLES…)
  api-client/   Swappable client — MockClient (default) or HttpClient
```

## Commands (run from repo root)

```bash
npm run dev        # nx run web:dev  → Next.js on :3000
npm run build      # nx run-many -t build
npm run lint       # nx run-many -t lint
nx run api:dev     # NestJS dev server (once Phase 3 deps installed)
nx run agents:dev  # Python uvicorn dev server on :3002 (pip install -e "apps/agents[dev]")
nx run agents:test # pytest — the only test suite today
nx run agents:lint # ruff

# after changing the catalog, seed brands, or any agent logic:
cd apps/agents && python -m scripts.export_fixtures
```

There is no JS test runner yet.

## Two top-level surfaces for apps/web (Next.js App Router)

1. **Landing** — [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx) → [src/components/landing/LandingPage.tsx](apps/web/src/components/landing/LandingPage.tsx)
2. **Dashboard** at `/app/*` — [apps/web/src/app/app/](apps/web/src/app/app/). Segments: `dashboard`, `generate`, `videos`, `models`, `storyboard`, `brands`, `campaigns`, `settings`.
3. **Auth** at `(auth)/login` and `(auth)/signup` — split layout in [apps/web/src/app/(auth)/layout.tsx](apps/web/src/app/(auth)/layout.tsx).

**Redirect rule:** `/app` (no segment) redirects to `/app/dashboard` via [apps/web/src/app/app/page.tsx](apps/web/src/app/app/page.tsx). `middleware.ts` only matches `/app/:path*` — the bare `/app` route falls through to the catch-all and hits that redirect, so all dashboard sub-pages are gated but the root is not.

Dashboard shell pattern:
- [src/app/app/layout.tsx](apps/web/src/app/app/layout.tsx) — server component, wraps in `DashboardLayoutClient`
- [DashboardLayoutClient.tsx](apps/web/src/app/app/DashboardLayoutClient.tsx) — client component: sidebar, topbar, `DashboardProvider`
- [DashboardContext.tsx](apps/web/src/app/app/DashboardContext.tsx) — `useDashboard()` hook: `showToast`, `showModal`, global `GenerateModal` state. Dashboard pages use this for all global UI — never duplicate local state.

### Lib packages

| Package | Path | Purpose |
|---|---|---|
| `@cineai/ui` | [libs/ui/](libs/ui/) | Shared React primitives; `transpilePackages` in `next.config.ts` |
| `@cineai/domain-types` | [libs/domain-types/](libs/domain-types/) | TS types shared across web, api, agents |
| `@cineai/mock-data` | [libs/mock-data/](libs/mock-data/) | Static fixture data. `brand-os.json` is **generated** from the Python pipeline — never edit it by hand |
| `@cineai/api-client` | [libs/api-client/](libs/api-client/) | `MockClient` (default) / `HttpClient` (real). Flip via `NEXT_PUBLIC_API_MODE=real` in `.env.local`. Brand OS paths match `apps/agents`, so `NEXT_PUBLIC_API_URL=http://localhost:3002` works for brands/campaigns/models. `mock-guardian.ts` is a deliberate subset of `guardian.py` for demo mode |

### apps/api (NestJS — stub)

Entry: [apps/api/src/main.ts](apps/api/src/main.ts). Stub has one `GET /api/health` endpoint. Real modules (auth, videos, generations, billing) come in Phase 3. Listens on `:3001`.

### apps/agents (Python FastAPI)

Entry: [apps/agents/src/main.py](apps/agents/src/main.py), listens on `:3002`. JSON is **camelCase** on the wire (`WireModel` in `common.py`) so it matches `libs/domain-types`.

- `GET /health`, `POST /generations`, `GET /generations/{id}` — the original single-video stub (snake_case, simulated progress).
- **Brand OS** — the brand-agent pipeline:
  - `catalog/` — `CATALOG` of models across video / image / voice / music / sfx / copy, and `route()` (hard filters on required capabilities + budget; prefers models built for the use case; min-max scores quality/speed/cost by priority). Credit numbers are placeholders.
  - `brands/` — brand kit schemas, the **Brand Guardian** (`guardian.py`: deterministic checks + auto-revision for copy and visual prompts) and the in-memory brand store seeded with two *sample* brands (`vedpragya`, `lumen-skin`).
  - `campaigns/` — `Orchestrator`: brief → scene plan (`planner.py`) → Guardian-cleaned script → model routing + budget fallback → assets via a `GenerationProvider` (`StubProvider` default; real providers plug in here) → channel ad cuts (`ads.py`) → dated follow-ups (`followups.py`). Mutates the `Campaign` in place so pollers see progress.
  - Routes: `/models/catalog`, `/models/route`, `/brands[/{id}[/check]]`, `/campaigns[?wait=true]`, `PATCH /campaigns/{id}/follow-ups/{fid}`. `POST /campaigns` returns 202 and runs in the background; `?wait=true` blocks.
  - Guardian invariants worth keeping: required disclaimers are never trimmed by a length limit (revision is idempotent), and any banned word that gets *deleted* raises an `auto_removed` warning + a human proofreading follow-up, because deletion can break a sentence.
- State is in-memory (Postgres/Redis in Phase 3-4), and the service has no auth — it is meant to sit behind the NestJS API.

## Key conventions

- **Brand OS contract** lives in three places that must move together: Pydantic models in `apps/agents`, `libs/domain-types/src/brand-os.ts`, and the generated `libs/mock-data/src/brand-os.json`. `apps/agents/tests/test_fixtures.py` fails when the JSON is stale; run `python -m scripts.export_fixtures` to refresh it.

- All `@cineai/*` imports are transpiled by Next.js (`transpilePackages` in [apps/web/next.config.ts](apps/web/next.config.ts)) — no separate build step for libs.
- New dashboard pages → add segment under `apps/web/src/app/app/`, consume `useDashboard()` for toasts/modals.
- [middleware.ts](apps/web/middleware.ts) matches `/app/:path*` — keep auth redirects centralized there.
- Phase gating: `NEXT_PUBLIC_API_MODE=mock` (default) uses `MockClient`; `=real` switches to `HttpClient` pointing at `NEXT_PUBLIC_API_URL`.
