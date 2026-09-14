# AGENTS.md

Strong Towns Tracker: a weekly agenda tracker for a local Strong Towns group. Pulls
Madison Plan Commission / Common Council agendas from the city's Legistar API,
identifies the Alder district each item affects, and classifies items against the
group's five priorities (safe streets, financial transparency and solvency, more
housing, ending highway expansion, eliminating parking minimums) via a Claude API
call, confidence-gated for human review.

## Stack

- pnpm monorepo; `StrongTownsTrackerServer/` is currently the only package (a future
  Expo/React Native client can be added alongside it later)
- Hono API server (`@hono/node-server`), TypeScript throughout
- ESLint (flat config) + Prettier
- Docker + Compose for local dev (Postgres + API)
- Drizzle ORM + PostgreSQL (schema/sync job land in a later phase)

## Layout

- `StrongTownsTrackerServer/src/` — `app.ts` (route wiring via `createApp()`),
  `index.ts` (process entrypoint), `config.ts` (fail-fast env config loader).
- Legistar (the Granicus vendor behind Madison's system) integration should stay
  isolated in its own module rather than scattered through the sync job and UI, and
  the app's own schema should describe domain concepts ("a proposal," "its status")
  rather than mirroring Legistar's field names — this keeps the app portable to a
  second Legistar city later.

## Commands

- `cp .env.example .env && docker compose up` — run the full stack locally.
- `pnpm --filter strong-towns-tracker-server run dev` — run the API alone (needs a
  local Postgres or the Compose `postgres` service running).
- `pnpm --filter strong-towns-tracker-server run lint` / `typecheck` / `build` —
  mirrors CI's `verify-build` job in `.github/workflows/ci.yml`.

## Conventions

- New domain concepts belong in the app's own schema/vocabulary, not Legistar's
  (`Matter`, `EventItem`, etc.) — translate at the boundary in the Legistar client
  module.
- `loadConfig()` in `config.ts` is the only place that reads `process.env`; other
  code takes a `Config` value.

## Git & Commits

- **Never include Claude (or any AI assistant) as a commit co-author or contributor.** No `Co-Authored-By: Claude` trailer, no "Generated with Claude Code" line, no assistant mention in commit messages, PR titles, or PR descriptions. Write commits as the author, describing the change and why.
- Create commits only when explicitly asked.
