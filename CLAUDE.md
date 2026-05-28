# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Nx monorepo. The original prototype is in [cineai/](cineai/) (preserved for reference); the active codebase lives in:

```
apps/
  web/          Next.js 15 App Router — the UI demo
  api/          NestJS API stub (Phase 3 — not wired yet)
  agents/       Python FastAPI AI agents stub (Phase 4 — not wired yet)
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
nx run agents:dev  # Python uvicorn dev server (once venv created)
```

There is no test runner yet.

## Two top-level surfaces for apps/web (Next.js App Router)

1. **Landing** — [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx) → [src/components/landing/LandingPage.tsx](apps/web/src/components/landing/LandingPage.tsx)
2. **Dashboard** at `/app/*` — [apps/web/src/app/app/](apps/web/src/app/app/). Segments: `dashboard`, `generate`, `videos`, `models`, `storyboard`, `settings`.
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
| `@cineai/mock-data` | [libs/mock-data/](libs/mock-data/) | Static fixture data |
| `@cineai/api-client` | [libs/api-client/](libs/api-client/) | `MockClient` (default) / `HttpClient` (real). Flip via `NEXT_PUBLIC_API_MODE=real` in `.env.local` |

### apps/api (NestJS — stub)

Entry: [apps/api/src/main.ts](apps/api/src/main.ts). Stub has one `GET /api/health` endpoint. Real modules (auth, videos, generations, billing) come in Phase 3. Listens on `:3001`.

### apps/agents (Python FastAPI — stub)

Entry: [apps/agents/src/main.py](apps/agents/src/main.py). Routes: `GET /health`, `POST /generations`, `GET /generations/{id}`. Progress simulation via `asyncio.create_task`. Real model calls replace `_run_generation` in Phase 4. Listens on `:3002`.

## Key conventions

- All `@cineai/*` imports are transpiled by Next.js (`transpilePackages` in [apps/web/next.config.ts](apps/web/next.config.ts)) — no separate build step for libs.
- New dashboard pages → add segment under `apps/web/src/app/app/`, consume `useDashboard()` for toasts/modals.
- [middleware.ts](apps/web/middleware.ts) matches `/app/:path*` — keep auth redirects centralized there.
- Phase gating: `NEXT_PUBLIC_API_MODE=mock` (default) uses `MockClient`; `=real` switches to `HttpClient` pointing at `NEXT_PUBLIC_API_URL`.
