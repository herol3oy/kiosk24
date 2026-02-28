# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim

WORKDIR /app

RUN npm i -g corepack@latest --force && \
    corepack enable pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/agent/package.json ./apps/agent/

RUN pnpm i --filter agent --frozen-lockfile

RUN npx -y playwright@1.58.2 install --with-deps chromium && \
    rm -rf /var/lib/apt/lists/*

COPY apps/agent ./apps/agent
RUN pnpm --filter agent run build

WORKDIR /app/apps/agent

CMD ["node", "dist/index.js"]