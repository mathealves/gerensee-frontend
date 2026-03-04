# Quickstart: Gerensee Frontend — Development Setup

**Feature**: `001-core-frontend`
**Date**: 2026-03-02 | **Updated**: 2026-03-03

## Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+
- Docker 25+ (for containerized local dev)
- A running instance of `gerensee-backend` (see its quickstart.md)

---

## 1. Create the Next.js project

```bash
cd /home/matheus/dev/gerensee-frontend

pnpm dlx create-next-app@16.1.6 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

> This scaffolds a `src/app/` App Router project with Tailwind v4, ESLint, and the
> `@/` path alias pre-configured.

---

## 2. Install production dependencies

```bash
# Server state
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Client state
pnpm add zustand

# HTTP client
pnpm add axios

# Forms + validation
pnpm add react-hook-form zod @hookform/resolvers

# WebSocket
pnpm add socket.io-client

# Rich text editor
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit

# Drag and drop
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Tailwind utilities
pnpm add class-variance-authority clsx tailwind-merge
```

---

## 3. Install dev dependencies

```bash
# Prettier
pnpm add -D prettier eslint-config-prettier

# Husky + lint-staged
pnpm add -D husky lint-staged

# Vitest + Testing Library
pnpm add -D vitest @vitejs/plugin-react @vitest/ui jsdom
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Playwright
pnpm add -D playwright @playwright/test
pnpm exec playwright install
```

---

## 4. Configure Prettier

Create `.prettierrc` at the project root:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true
}
```

Create `.prettierignore`:

```
.next
node_modules
pnpm-lock.yaml
```

Extend ESLint config in `eslint.config.mjs` to disable Prettier-conflicting rules:

```js
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];

export default eslintConfig;
```

---

## 5. Configure Husky + lint-staged

```bash
pnpm exec husky init
```

Edit `.husky/pre-commit` to contain:

```sh
pnpm exec lint-staged
```

Create `lint-staged.config.mjs`:

```js
export default {
  '**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,css}': ['prettier --write'],
};
```

---

## 6. Configure Vitest

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

---

## 7. Configure Next.js

Update `next.config.ts` for standalone Docker output:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

---

## 8. Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

> `NEXT_PUBLIC_` prefix exposes variables to client components. These values are
> inlined at build time — do not put secrets here.

---

## 9. Docker setup

Create `Dockerfile` at the project root:

```dockerfile
# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && pnpm build

# Stage 3: production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
```

Create `.dockerignore`:

```
node_modules
.next
.git
*.md
```

Create `docker-compose.yml` at the project root (or workspace root):

```yaml
services:
  frontend:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:3000/api/v1
      - NEXT_PUBLIC_WS_URL=http://backend:3000
    depends_on:
      - backend

  backend:
    build: ../gerensee-backend
    ports:
      - '3000:3000'
    env_file:
      - ../gerensee-backend/.env
```

---

## 10. Initialize shadcn/ui

```bash
pnpm dlx shadcn@latest init
# Select: Tailwind v4, src/components/ui, @/ aliases
```

Add the base component set:

```bash
pnpm dlx shadcn@latest add button input label dialog dropdown-menu
pnpm dlx shadcn@latest add avatar badge separator sheet tabs
pnpm dlx shadcn@latest add form tooltip popover
```

---

## 11. Directory structure (after setup)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── org/members/page.tsx
│   │   ├── org/settings/page.tsx
│   │   └── projects/[projectId]/
│   │       ├── layout.tsx
│   │       ├── board/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── documents/[documentId]/page.tsx
│   │       └── settings/{page.tsx,members/page.tsx}
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── api/            # Axios singleton + per-resource modules
├── components/
│   ├── ui/         # shadcn/ui owned components
│   └── shared/     # PriorityBadge, Avatar, RoleGuard, EmptyState…
├── features/       # auth, organizations, projects, board, documents
├── hooks/          # useAuthStore, usePermissions
├── lib/            # queryClient, socket factory
├── middleware.ts
├── test/setup.ts
└── types/index.ts

e2e/                # Playwright tests
Dockerfile
docker-compose.yml
.prettierrc
.husky/pre-commit
lint-staged.config.mjs
vitest.config.ts
```

---

## 12. package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## 13. Verify stack

```bash
pnpm dev
# → http://localhost:3000 should load the Next.js scaffold page without errors

pnpm lint
# → No ESLint errors

pnpm format
# → Files formatted (no diffs on a clean scaffold)

pnpm test --run
# → Vitest passes (no tests yet → 0 failures)

pnpm build
# → .next/standalone/ produced without TypeScript errors

docker build -t gerensee-frontend .
# → Image builds successfully in ~3 stages
```

---
