# CineAI — AI Video Studio

> **CineAI** is an AI-powered video generation platform built as an Nx monorepo. It unifies 7 world-class AI video models — Kling, Veo, Sora, Runway, Luma, Pika, and Hailuo — behind one dashboard, one subscription, and one credit system.

**Try the live demo:** [app.cineai.studio](https://app.cineai.studio)

---

## Key Features

- **7 AI Models in One Studio** — Switch between Kling 2.6, Veo 3.1, Sora 2 Pro, Runway Gen-4.5, Luma Ray, Pika 3.0, and Hailuo 2 without juggling accounts or subscriptions
- **4K Ultra Output** — Up to 8K resolution on Studio plan, 60fps export
- **Storyboard Builder** — Plan multi-scene films, assign models per shot, generate in batch
- **Prompt Enhancer AI** — Our AI rewrites your prompt to maximize output quality for each model
- **Team Workspaces** — Shared credit pools, per-member history, role-based access (Studio)
- **Full REST API** — Trigger generations, poll status, retrieve URLs programmatically (Studio)
- **Credit-based Billing** — Pay only for what you generate. Top-up packs available a la carte

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web (UI Demo) | Next.js 15 · App Router · Framer Motion · Tailwind CSS |
| Shared UI | `@cineai/ui` — component library published in `libs/ui/` |
| API (stub → Phase 3) | NestJS · Prisma · Postgres · Redis/BullMQ |
| AI Agents (stub → Phase 4) | Python · FastAPI · LangGraph · OpenTelemetry |
| Monorepo | Nx 22 · TypeScript · ESLint |
| Deployment | Vercel (web) · Fly.io (api) · Modal (agents) |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the Next.js UI demo (mock-backed)
npm run dev

# Build all apps and libs
npm run build

# Lint entire monorepo
npm run lint
```

The UI runs at **http://localhost:3000**. All generation flows are backed by `MockClient` — no backend required for the demo.

### Connecting Real Backends

Set environment variables in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

This flips `@cineai/api-client` from `MockClient` to the `HttpClient` pointing at the NestJS API.

---

## Repository Structure

```
apps/
  web/           Next.js 15 App Router — landing + dashboard
  api/           NestJS API (Phase 3, stub)
  agents/        Python FastAPI AI agents (Phase 4, stub)
libs/
  ui/            Shared React component library
  domain-types/  TypeScript types shared across all apps
  mock-data/     Fixture data and MSW handlers
  api-client/    Swappable: MockClient (default) / HttpClient (real)
```

---

## Roadmap

| Phase | Scope |
|---|---|
| Phase 0 | Nx monorepo bootstrap — done |
| Phase 1 | Design system + UI kit with Storybook |
| Phase 2 | **UI-first demo** — every page interactable, all states (loading/error/empty) |
| Phase 3 | NestJS API — real auth, videos, generations, billing |
| Phase 4 | Python AI agents — real model calls, GPU workers |
| Phase 5 | Production infra, feature flags, analytics, public launch |

See [`PLAN.md`](PLAN.md) for the full phased plan with exit criteria.

---

## License

All generated videos are owned by the creator. Full commercial license on Pro and Studio tiers. See [Terms of Service](https://cineai.studio/terms).
