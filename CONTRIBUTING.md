# Contributing to CineAI

Thank you for your interest in contributing. Here's how to work with this codebase.

## Development Setup

```bash
git clone git@github.com:AmanVatsSharma/CineAI.git
cd CineAI
npm install
npm run dev
```

The Next.js app starts at `http://localhost:3000`. Dashboard routes are under `/app/*`.

## Repository Architecture

This is an **Nx monorepo**. Each app and lib has its own `project.json` and can be built, linted, or tested independently:

```bash
nx run web:dev        # Next.js dev server
nx run api:dev        # NestJS dev server (Phase 3+)
nx run agents:dev     # Python FastAPI dev server (Phase 4+)
nx run-many -t build # Build all projects
```

## Project Conventions

### Adding a new dashboard page
1. Create a new route segment under `apps/web/src/app/app/<page>/page.tsx`
2. Import `useDashboard()` from `../DashboardContext` for toasts and modal state
3. Do not create local state for toasts or the generate modal — use the shared context

### Adding a shared component
1. Build the component in `libs/ui/src/`
2. Export it from `libs/ui/src/index.ts`
3. Import it in `apps/web/` via `@cineai/ui` (already transpiled via `next.config.ts`)

### API mode (Phase 3+)
- `NEXT_PUBLIC_API_MODE=mock` (default) → uses `MockClient` in `libs/api-client`
- `NEXT_PUBLIC_API_MODE=real` → uses `HttpClient` pointing at `NEXT_PUBLIC_API_URL`
- Never import directly from `mock-client` or `http-client` — always use `apiClient` from `libs/api-client/src/index.ts`

### Type safety
- All shared types live in `libs/domain-types/src/index.ts`
- Do not duplicate type definitions across apps — import from `@cineai/domain-types`

## Pull Request Guidelines

- Branch from `main`
- Run `npm run lint` and `npm run build` before opening a PR
- Keep PRs scoped — one feature or fix per PR
- Update `CLAUDE.md` if you add a new convention or architectural pattern

## Commit Style

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## Phase Status

- **Phase 0 (Nx bootstrap)** — ✅ Complete
- **Phase 1 (Design system)** — In progress
- **Phase 2 (UI-first demo)** — In progress
- **Phase 3 (NestJS API)** — Not started
- **Phase 4 (Python agents)** — Not started

External contributions are most welcome for Phase 2 (demo polish, new dashboard pages) and Phase 1 (Storybook, component coverage).
