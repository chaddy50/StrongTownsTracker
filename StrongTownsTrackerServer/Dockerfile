FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY StrongTownsTrackerServer/package.json StrongTownsTrackerServer/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY StrongTownsTrackerServer/src StrongTownsTrackerServer/src
COPY StrongTownsTrackerServer/tsconfig.json StrongTownsTrackerServer/tsconfig.json

RUN pnpm --filter strong-towns-tracker-server run build

WORKDIR /app/StrongTownsTrackerServer

CMD ["pnpm", "start"]
