# Implementation Plan: Gerensee Frontend — Core Product UI

**Branch**: `001-core-frontend` | **Date**: 2026-03-02 | **Updated**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-core-frontend/spec.md`

## Summary

Build the Gerensee frontend: a Next.js 16.1.6 App Router application that exposes the
full feature set of the backend core product (organizations, projects, Kanban task board,
rich-text documents) through a role-aware, accessible UI. The frontend authenticates via
JWT (access token in Zustand memory, refresh token in sessionStorage), communicates with
the backend REST API through a typed Axios client in client components, receives real-time
Kanban board updates over Socket.io WebSockets, and renders documents using a headless
Tiptap WYSIWYG editor. Docker multi-stage build produces the production artifact; Prettier

- Husky + lint-staged enforce code quality on commit.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 19, Next.js 16.1.6 (App Router), TanStack Query v5,
Zustand, Axios, socket.io-client, Tiptap v2, @dnd-kit/core + sortable, Tailwind CSS v4,
shadcn/ui, React Hook Form + Zod
**Storage**: N/A (no client-side persistent storage for sensitive data; sessionStorage
for refresh token pending backend HTTP-only cookie support)
**Testing**: Vitest + @testing-library/react (unit/component), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari); desktop-first
**Containerization**: Docker (multi-stage); `next.config.ts` `output: 'standalone'`
**Code Quality**: ESLint (`eslint-config-next` + `eslint-config-prettier`), Prettier,
Husky + lint-staged (`pre-commit` hook)
**Performance Goals**: Initial load ≤ 3s on a 4G connection; board card drag interaction
latency ≤ 100ms local; SC-002 board update reflected ≤ 2s via WebSocket
**Constraints**: Access token MUST NOT be written to localStorage; role-aware UI with
zero control leakage (SC-003); Tiptap JSON format must match backend JSONB format exactly
**Scale/Scope**: ~10 screens, ~50 components, targeting 100 organizations at launch

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I — Product-First, Experience-Driven ✅

- All technology choices serve product needs. React + Vite chosen for simplicity and
  developer experience, not trend. Complexity (WebSockets, Tiptap, @dnd-kit) is justified
  by specific feature requirements (SC-002, FR-015, FR-021).

### Principle II — API Contract as the Source of Truth ✅

- The frontend mirrors backend response shapes exclusively. No client-side business rule
  enforcement. Typed API client (Axios + TypeScript) makes the contract explicit.

### Principle III — Role-Aware UI Without Duplicating Authorization Logic ✅

- Single Zustand auth store holds `orgRole` and `projectRole` as the authoritative source.
  `usePermissions()` hook derives all UI visibility decisions from this single source.
  Server always re-validates; UI hiding is UX-only.

### Principle IV — Component-First, Reuse by Default ✅

- Feature components under `src/features/`; shared UI under `src/components/shared/`.
  Data fetching in hooks / TanStack Query modules. Components receive typed props — zero
  inline API calls in render logic.

### Principle V — Simplicity and Intentional Complexity ✅

- Next.js App Router over a custom Vite SPA (justified: edge middleware, RSCs, Docker
  standalone output). Zustand over Redux (auth-only global state). TanStack Query (not
  custom fetch hooks). Docker + Prettier + Husky added as user requirements. Every
  non-trivial dependency justified in research.md.

**GATE RESULT**: ✅ ALL CHECKS PASSED — Proceed to Phase 1

---

**POST-DESIGN RE-EVALUATION** (2026-03-02):

All principles remain satisfied after Phase 1 design:

- ✅ Route contract reflects product hierarchy: org → project → board/documents
- ✅ Data model mirrors API shapes; no silent transformations
- ✅ Role guards in router layer (UX) backed by server enforcement (security)
- ✅ Tiptap JSON contract explicitly aligned with backend JSONB
- ✅ No circular dependencies in feature → shared → ui component tree

**FINAL GATE RESULT**: ✅ DESIGN APPROVED — Proceed to Phase 2 (Tasks)

## Project Structure

### Documentation (this feature)

```text
specs/001-core-frontend/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── routes.md        ← Phase 1 output (frontend route contracts)
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/                            # Public route group
│   │   ├── sign-in/
│   │   │   └── page.tsx                   # SignInPage
│   │   └── register/
│   │       └── page.tsx                   # RegisterPage
│   │
│   ├── (protected)/                       # Auth-required route group
│   │   ├── layout.tsx                     # Client auth check (Zustand) + QueryClientProvider
│   │   ├── onboarding/
│   │   │   └── page.tsx                   # OnboardingPage
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # DashboardPage
│   │   ├── org/
│   │   │   ├── members/
│   │   │   │   └── page.tsx               # OrgMembersPage
│   │   │   └── settings/
│   │   │       └── page.tsx               # OrgSettingsPage
│   │   └── projects/
│   │       └── [projectId]/
│   │           ├── layout.tsx             # ProjectLayout (sidebar + ProjectGuard)
│   │           ├── board/
│   │           │   └── page.tsx           # BoardPage
│   │           ├── documents/
│   │           │   ├── page.tsx           # DocumentsPage
│   │           │   └── [documentId]/
│   │           │       └── page.tsx       # DocumentPage
│   │           └── settings/
│   │               ├── page.tsx           # ProjectSettingsPage
│   │               └── members/
│   │                   └── page.tsx       # ProjectMembersPage
│   │
│   ├── layout.tsx                         # Root layout (HTML shell, Providers)
│   ├── page.tsx                           # Root redirect → /dashboard or /sign-in
│   └── globals.css                        # @import "tailwindcss"
│
├── api/
│   ├── client.ts             # Axios singleton; auth + refresh interceptors
│   ├── auth.ts               # register, login, logout, refresh, me
│   ├── organizations.ts      # CRUD + members
│   ├── projects.ts           # CRUD + members + statuses
│   ├── tasks.ts              # CRUD + assign + move
│   └── documents.ts          # CRUD + lock + unlock
│
├── components/
│   ├── ui/                   # shadcn/ui owned components (Button, Dialog, …)
│   └── shared/
│       ├── PriorityBadge.tsx
│       ├── DueDateBadge.tsx
│       ├── Avatar.tsx
│       ├── RoleGuard.tsx     # renders children only if role condition met
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── features/
│   ├── auth/
│   │   ├── SignInPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── OnboardingPage.tsx
│   │
│   ├── organizations/
│   │   ├── DashboardPage.tsx
│   │   ├── OrgMembersPage.tsx
│   │   ├── OrgSettingsPage.tsx
│   │   └── hooks/
│   │       ├── useOrganization.ts
│   │       └── useOrgMembers.ts
│   │
│   ├── projects/
│   │   ├── ProjectLayout.tsx  # sidebar + outlet
│   │   ├── ProjectGuard.tsx   # membership check (used inside [projectId]/layout.tsx)
│   │   ├── ProjectSettingsPage.tsx
│   │   ├── ProjectMembersPage.tsx
│   │   └── hooks/
│   │       ├── useProject.ts
│   │       └── useProjectMembers.ts
│   │
│   ├── board/
│   │   ├── BoardPage.tsx
│   │   ├── BoardColumn.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetailDrawer.tsx
│   │   ├── AddColumnDialog.tsx
│   │   └── hooks/
│   │       ├── useBoardTasks.ts   # TanStack Query + WS event handling
│   │       ├── useBoardSocket.ts  # socket.io-client room subscription
│   │       └── useDragBoard.ts    # @dnd-kit drag state
│   │
│   └── documents/
│       ├── DocumentsPage.tsx
│       ├── DocumentPage.tsx
│       ├── TiptapEditor.tsx
│       ├── DocumentLockBanner.tsx
│       └── hooks/
│           ├── useDocument.ts
│           └── useDocumentLock.ts
│
├── hooks/
│   ├── useAuthStore.ts        # Zustand store: user, accessToken, currentOrg, orgRole
│   └── usePermissions.ts      # canDo('inviteMember'), canDo('createProject'), …
│
├── lib/
│   ├── queryClient.ts         # TanStack Query QueryClient config
│   └── socket.ts              # socket.io-client factory (per project board)
│
├── middleware.ts              # Next.js edge middleware (auth redirect scaffold)
│
└── types/
    └── index.ts               # All types from data-model.md

e2e/                           # Playwright tests
├── auth.spec.ts
├── board.spec.ts
└── documents.spec.ts

Dockerfile                     # Multi-stage: deps → builder → runner
docker-compose.yml             # Local dev: frontend + backend wired together
.prettierrc                    # Prettier config
.husky/
│   └── pre-commit             # lint-staged
└── lint-staged.config.mjs
```

**Structure Decision**: Next.js App Router with `src/app/` for routes and `src/features/`
for feature components. Route groups `(auth)` and `(protected)` share layouts without
affecting URLs. All feature components are co-located under `src/features/`; each feature
owns its pages, local components, and data hooks. The API layer (`src/api/`) is the sole
place HTTP calls are made, satisfying Constitution II (API contract as source of truth).
Docker and code-quality config files live at the project root.

## Complexity Tracking

| Addition           | Why Needed                                                                               | Simpler Alternative Rejected Because                             |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Next.js App Router | User decision; middleware auth, nested layouts, RSC, Docker standalone                   | Vite SPA has no edge middleware or RSC                           |
| socket.io-client   | FR-017 requires ≤2s board updates; backend uses Socket.io protocol                       | Polling rejected in backend research (latency + inefficiency)    |
| @dnd-kit           | FR-015 drag-and-drop; FR-016 column reorder — both needed from day 1                     | react-beautiful-dnd is deprecated; no viable simpler alternative |
| Tiptap v2          | FR-021 WYSIWYG; backend stores Tiptap JSON — switching editors requires format migration | Format lock-in with backend schema makes this non-negotiable     |
| Zustand            | Single global auth store needed to satisfy Principle III                                 | Context would cause re-render cascades across the whole tree     |
| Docker             | User requirement; production deployment artifact                                         | n/a — explicit requirement                                       |
| Prettier + Husky   | User requirement; automated pre-commit code quality enforcement                          | n/a — explicit requirement                                       |
