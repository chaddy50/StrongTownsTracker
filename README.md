# Strong Towns Tracker

A weekly agenda tracker for a local Strong Towns group: it pulls Madison's Plan
Commission and Common Council agendas from the city's Legistar API, identifies which
Alder district each item affects, and classifies items against the group's five
priorities (safe streets, financial transparency and solvency, more housing, ending
highway expansion, and eliminating parking minimums), so the group can see what's up
for a hearing each week at a glance.

## Prerequisites

- [Node.js](https://nodejs.org/) (version pinned in `.nvmrc`)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) with Compose

## Quickstart

```sh
cp .env.example .env
docker compose up
```

The API is then available at `http://localhost:3000` (try `GET /health`).

## Monorepo layout

This is a pnpm workspace. `StrongTownsTrackerServer/` is currently the only package —
the Hono API server. A future client package (e.g. an Expo/React Native app) can be
added alongside it without restructuring.
