# Gerensee Frontend Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-03

## Active Technologies

| Concern              | Technology                        | Version                          |
| -------------------- | --------------------------------- | -------------------------------- |
| Language             | TypeScript                        | 5.x                              |
| UI Framework         | React                             | 19                               |
| Meta-Framework       | Next.js                           | 16.1.6 (App Router)              |
| Routing              | Next.js App Router                | file-based (`src/app/`)          |
| Server State         | TanStack Query                    | v5                               |
| Client State         | Zustand                           | latest                           |
| HTTP Client          | Axios                             | latest                           |
| WebSocket            | socket.io-client                  | latest                           |
| Rich Text Editor     | Tiptap                            | v2                               |
| Drag and Drop        | @dnd-kit/core + @dnd-kit/sortable | latest                           |
| Styling              | Tailwind CSS                      | v4                               |
| Component Library    | shadcn/ui (Radix UI)              | latest                           |
| Forms                | React Hook Form + Zod             | latest                           |
| Unit/Component Tests | Vitest + @testing-library/react   | latest                           |
| E2E Tests            | Playwright                        | latest                           |
| Containerization     | Docker                            | multi-stage (Next.js standalone) |
| Formatting           | Prettier                          | latest                           |
| Git Hooks            | Husky + lint-staged               | latest                           |

## Project Structure

```text
src/
├── app/              # Next.js App Router — all routes
│   ├── (auth)/       # Public: sign-in, register
│   ├── (protected)/  # Auth-required: all other routes
│   │   └── projects/[projectId]/  # Project sub-routes
│   ├── layout.tsx    # Root HTML shell + global providers
│   └── globals.css
├── api/              # Axios singleton + one file per backend resource
├── components/
│   ├── ui/           # shadcn/ui owned components
│   └── shared/       # Feature-agnostic reusable components
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── projects/
│   ├── board/
│   └── documents/
├── hooks/            # Cross-feature hooks (auth store, permissions)
├── lib/              # queryClient, socket factory
├── middleware.ts     # Next.js edge middleware (auth redirect scaffold)
├── test/             # Vitest setup
└── types/            # All entity + UI TypeScript types

e2e/                  # Playwright tests
Dockerfile            # Multi-stage: deps → builder → runner
docker-compose.yml    # Local dev: frontend + backend
```

## Commands

```bash
pnpm dev          # Next.js dev server at http://localhost:3000
pnpm build        # Production build → .next/standalone/
pnpm start        # Start production server
pnpm lint         # ESLint (eslint-config-next + prettier)
pnpm format       # Prettier --write .
pnpm test         # Vitest unit/component tests
pnpm test:e2e     # Playwright E2E tests
docker build -t gerensee-frontend .   # Docker production image
```

## Code Style

- **TypeScript strict mode** — no `any`, explicit return types on exported functions.
- **No inline API calls in components** — all data fetching goes through `src/api/` + TanStack Query hooks in feature `hooks/` directories.
- **Access token never persisted** — stored in Zustand memory store only.
- **Imports use `@/` alias** for `src/` references — e.g. `import { Task } from '@/types'`.
- **shadcn/ui components** are owned code — edit in `src/components/ui/`.
- **`cn()` utility** (from `lib/utils.ts`) for conditional Tailwind class merging.
- **Form validation via Zod schemas** — schemas in the same file as the form component.
- **`'use client'` directive** — required for all components using hooks, event handlers, WebSockets, DnD, or Tiptap. Pages using only static layout and RSC-fetched data omit it.
- **`next/navigation`** — use `useRouter()` (client) or `redirect()` (server) for navigation. Never import from `react-router-dom`.
- **Husky pre-commit** enforces Prettier + ESLint on staged files via lint-staged.

## Recent Changes

### 001-core-frontend (2026-03-02)

Added all foundational technology: React + Next.js 16.1.6 App Router, TanStack Query v5,
Zustand auth store, Axios API client with token interceptors, socket.io-client WebSocket
board updates, Tiptap v2 WYSIWYG editor, @dnd-kit Kanban drag-and-drop, Tailwind v4 +
shadcn/ui component system, Vitest + Playwright test stack, Docker multi-stage build,
Prettier + Husky + lint-staged code quality enforcement.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
