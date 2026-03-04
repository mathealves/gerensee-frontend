# Research: Gerensee Frontend — Core Product UI

**Phase**: 0 (Outline & Research)
**Date**: 2026-03-02 | **Updated**: 2026-03-03
**Feature**: [spec.md](spec.md)

## Overview

This document consolidates research and decisions for the frontend technology stack.
All choices prioritize alignment with the backend's established contracts, Constitution
principles (product-first, simplicity, component-reuse), and the specific requirements
of the feature (WebSocket board updates, Tiptap document editing, role-aware UI, secure
token handling). Stack updated 2026-03-03: Vite SPA → Next.js App Router; Docker,
Prettier, and Husky added.

All NEEDS CLARIFICATION items from the Technical Context are resolved here.

---

## 1. Meta-Framework / Build Tooling

### Decision

**Next.js 16.1.6** — App Router (file-based routing in `src/app/`).

### Rationale

- User decision: Next.js is the target framework.
- Even though Gerensee is a behind-auth application, Next.js App Router provides
  meaningful advantages over a plain Vite SPA:
  - **`src/middleware.ts`**: Server-side auth redirect at the edge before any React
    renders — cleaner than a client-side guard that flashes content.
  - **`layout.tsx` hierarchy**: Persistent sidebar layouts without client-side route
    complexity; supports nested layouts per feature (project sidebar wraps board and
    documents pages naturally).
  - **React Server Components for data-light pages**: Dashboard, member lists, and
    document lists can be RSCs that fetch on the server, reducing client JS bundle.
  - **Docker-first deployment**: Next.js `output: 'standalone'` produces a minimal
    Node.js server bundle ideal for a lean Docker image.
- Interactive features (Kanban DnD, WebSockets, Tiptap) use `'use client'` where
  needed — this does not eliminate the benefits above, it constrains them to the
  components that actually require interactivity.
- Aligns with Constitution Principle V: complexity is justified by real product and
  deployment benefits.

### Alternatives Considered

- **React + Vite (previous choice)**: No edge middleware, no RSCs, harder Dockerized
  deployment. Rejected after user decision to adopt Next.js.
- **Remix / React Router v7 (framework mode)**: Viable but lower ecosystem adoption
  than Next.js App Router.

---

## 2. Routing

### Decision

**Next.js App Router** (built-in, file-based). No separate routing library.

### Rationale

- App Router routing is filesystem-based: `src/app/(protected)/dashboard/page.tsx`
  defines the `/dashboard` route automatically.
- **Route groups** (`(auth)`, `(protected)`) share layouts without affecting the URL.
- **`src/middleware.ts`** handles the server-side auth redirect layer: inspects request
  cookies/headers and redirects to `/sign-in` before the page renders.
- Navigation via `useRouter()` from `next/navigation` (client components) and
  `redirect()` from `next/navigation` (server components).
- `<Link>` for all declarative navigation.

### Note on Auth Guard

Since the access token lives in Zustand memory (not cookies), `middleware.ts` alone
cannot verify login state on first load. The protected layout
(`src/app/(protected)/layout.tsx`) retains a lightweight `'use client'` auth check
that reads Zustand and calls `router.push('/sign-in')` if no token is present. This
does not flash content because Next.js renders a loading skeleton before hydration.

### Alternatives Considered

- **React Router v6**: Replaced by the framework's built-in routing.
- **TanStack Router**: Not applicable in a Next.js project.

---

## 3. Server State & Data Fetching

### Decision

**TanStack Query v5** (`@tanstack/react-query`).

### Rationale

- Handles all server-state concerns: loading, error, stale-while-revalidate, cache
  invalidation. These are first-class UI states per FR-005's implications.
- Eliminates the need for custom loading/error state boilerplate in every component,
  keeping components focused on rendering (Constitution IV — components don't fetch).
- Cache invalidation on mutation is the correct pattern for reflecting task/board
  mutations back to the local view.
- Pairs naturally with a typed API client layer (Axios).

### Alternatives Considered

- **SWR**: Smaller, but weaker mutation + invalidation story for complex multi-entity
  interactions like board moves.
- **Redux Toolkit Query**: Rejected — RTK overhead unjustified when global client state
  is minimal (only auth context is truly global).

---

## 4. Client-Side Global State

### Decision

**Zustand** — minimal, for authenticated user context and role/org context only.

### Rationale

- Authentication state (current user, access token in memory, org + role) is the only
  truly global client state. All other state is server state owned by TanStack Query.
- Zustand is the lightest store that satisfies this: no boilerplate, no provider tree,
  supports middleware (persist is NOT used for token — memory only per FR-003).
- Single authoritative source for role context, satisfying Constitution III.

### Alternatives Considered

- **React Context**: Viable for auth context, but causes re-render cascades if used
  to distribute server data. Not worth the subtlety trap.
- **Redux Toolkit**: Rejected — overkill for a single auth slice.
- **Jotai**: Similar footprint to Zustand; Zustand is more familiar to more developers
  and has the better devtools integration.

---

## 5. Styling + Component Library

### Decision

**Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives).

### Rationale

- Tailwind eliminates the context-switching between CSS files and JSX; keeps styling
  co-located with components, which is the natural unit of work with Constitution IV.
- shadcn/ui is not a traditional library — components are owned code inside the repo
  (`src/components/ui/`). This satisfies Constitution IV (reuse by default) and keeps
  the UI accessible via Radix without locking to an external release cycle.
- Accessible out of the box (Radix): dialogs, dropdowns, comboboxes for task forms,
  lock state indicators — all need ARIA handling that Radix provides.

### Alternatives Considered

- **Mantine / Chakra UI**: Traditional component libraries; owned-component model is
  preferable to minimize external API surface.
- **MUI (Material UI)**: Opinionated visual style conflicts with a clean PM tool
  aesthetic; heavier bundle than Radix.

---

## 6. Drag-and-Drop (Kanban Board)

### Decision

**@dnd-kit/core** + **@dnd-kit/sortable**.

### Rationale

- FR-015 requires drag-and-drop for moving tasks between columns.
- `@dnd-kit` is the current actively-maintained standard. Accessible (keyboard DnD
  supported), performant (no DOM re-renders during drag), modular.
- Supports both column reordering (FR-016) and card reordering within a column using
  the same `@dnd-kit/sortable` preset.

### Alternatives Considered

- **react-beautiful-dnd**: Deprecated by Atlassian; no longer maintained.
- **react-dnd**: Older, more complex setup; lower-level than necessary.

---

## 7. WebSocket Client

### Decision

**socket.io-client** (matching backend).

### Rationale

- The backend uses Socket.io (NestJS WebSocket Gateway). The client MUST use
  `socket.io-client` — not a raw WebSocket — because Socket.io's protocol includes
  custom framing incompatible with the browser's native `WebSocket`.
- FR-017 mandates room-based subscription per project. Socket.io's `socket.join(room)`
  model maps directly.

### Alternatives Considered

- **Native WebSocket**: Incompatible with Socket.io server protocol.
- **@tanstack/query with polling**: Explicitly rejected in backend research; WebSockets
  were adopted for that project precisely to avoid polling latency.

---

## 8. HTTP API Client

### Decision

**Axios** with two interceptors:

1. Request interceptor: attach `Authorization: Bearer <accessToken>` from Zustand store.
2. Response interceptor: on 401, attempt silent token refresh via
   `POST /auth/refresh`, retry original request; on second 401 → logout.

### Rationale

- Axios interceptors are the cleanest way to implement transparent token renewal (FR-003)
  without leaking auth logic into components or TanStack Query hooks.
- Single API client instance (singleton module) as the sole HTTP entry point —
  satisfying Constitution II (typed API client layer) and the Implementation Standard
  (API calls never inline in components).

### Alternatives Considered

- **Fetch API (native)**: Possible, but interceptor equivalent requires manual wrapper
  that reimplements what Axios provides out of the box.
- **ky**: Smaller, cleaner API than Axios, but less widespread knowledge and slightly
  less mature interceptor story for the concurrent-request refresh race condition.

---

## 9. Forms & Validation

### Decision

**React Hook Form** + **Zod** (schema validation).

### Rationale

- React Hook Form keeps form state uncontrolled (fast) and avoids re-renders per
  keystroke — important for the task creation drawer which may have many fields.
- Zod provides runtime-safe schema validation that mirrors the backend's validation
  rules (min/max lengths from OpenAPI contracts) without duplicating them as
  ad-hoc conditions.
- `@hookform/resolvers/zod` provides the integration.

### Alternatives Considered

- **Formik**: Older, controlled-input model, heavier.
- **Yup**: Viable alternative to Zod but less TypeScript-idiomatic.

---

## 10. Rich Text Editor (Documents)

### Decision

**Tiptap v2** (ProseMirror-based).

### Rationale

- Already resolved in spec clarifications: the backend stores content as Tiptap's
  JSON format in a JSONB column. Using any other editor would require non-trivial
  format conversion.
- Tiptap is headless — it provides no default styles, which keeps the document editor
  on-brand (styled via Tailwind).
- Modular extensions: Bold, Italic, Heading, Lists, Code, HardBreak — include only
  what's needed per YAGNI (Constitution V).

---

## 11. Testing

### Decision

- **Vitest** — unit/component test runner (configured independently via `vitest.config.ts`).
- **@testing-library/react** — component testing idiom.
- **Playwright** — E2E testing for acceptance scenarios from spec.md.

### Rationale

- Vitest with `@vitejs/plugin-react` is the preferred unit/component runner even for
  Next.js projects — simpler to configure than Jest with Next.js-specific transforms.
- `vitest.config.ts` is a separate file from `next.config.ts`; the Next.js build
  pipeline is unaffected.
- Testing Library's "render and interact like a user" approach maps directly to the
  Given/When/Then acceptance scenarios in spec.md.
- Playwright covers the multi-tab SC-002 board test and role-aware UI (SC-003).

### Next.js Vitest Configuration Note

- Use `@vitejs/plugin-react` (not the Next.js transform) in `vitest.config.ts`.
- Mock `next/navigation` (`useRouter`, `usePathname`, `redirect`) for component tests.
- Playwright E2E tests run against `next dev` or `next start`.

### Alternatives Considered

- **Jest**: Requires `jest-environment-jsdom` plus Next.js mocks; more setup than Vitest.
- **Cypress**: Viable; Playwright preferred for multi-tab testing (SC-002).

---

## 12. Token Storage & Auth Security

### Decision

- **Access token**: Zustand memory store only (never written to localStorage /
  sessionStorage / cookies).
- **Refresh token**: Sent in HTTP-only cookie OR in the response body and re-sent
  in the request body to `POST /auth/refresh`.

### Rationale

**Important note**: The backend auth contract returns `refreshToken` in the response
body (not as a Set-Cookie header). Until the backend adds HTTP-only cookie support,
the frontend will store the refresh token in `sessionStorage` (tab-scoped, clears
on tab close) as the least-bad alternative to memory only.
`localStorage` is NOT used — it is persistent across tabs and survives browser close.

This is documented as a known security trade-off pending backend HTTP-only cookie
support.

---

## 13. Containerization

### Decision

**Docker** with a multi-stage `Dockerfile` and `docker-compose.yml` for local dev.

### Rationale

- User requirement.
- Next.js supports `output: 'standalone'` in `next.config.ts`, which produces a
  minimal Node.js server bundle — ideal for a lean (~200MB) Docker image.
- Multi-stage build: `deps` stage (install), `builder` stage (`next build`),
  `runner` stage (production image with standalone output only).
- `docker-compose.yml` wires the frontend container to `gerensee-backend` for a
  single `docker compose up` local workflow.

---

## 14. Code Quality Tooling

### Decision

**Prettier** + **Husky** + **lint-staged** + **ESLint** (`eslint-config-next`).

### Rationale

- User requirement.
- **Prettier**: Zero-config formatter; `.prettierrc` at project root (singleQuote,
  trailingComma: 'all', printWidth: 100). Eliminates style debates.
- **ESLint**: `eslint-config-next` ships with Next.js. Extended with
  `eslint-config-prettier` to disable rules that conflict with Prettier.
- **Husky**: Git hooks manager. The `pre-commit` hook runs lint-staged.
- **lint-staged**: Runs ESLint + Prettier on staged files only — fast, not whole project.
  Prevents committing unformatted or lint-failing code.

---

## Summary of Technology Choices

| Concern              | Technology                      | Key Decision Driver                                     |
| -------------------- | ------------------------------- | ------------------------------------------------------- |
| Meta-framework       | Next.js 16.1.6 (App Router)     | User decision; middleware auth, RSCs, Docker standalone |
| Routing              | Next.js App Router (file-based) | Built into framework; no separate routing library       |
| Server state         | TanStack Query v5               | Loading/error/cache; components don't fetch             |
| Client state         | Zustand                         | Auth/role context only; minimal footprint               |
| Styling              | Tailwind CSS v4 + shadcn/ui     | Owned components; accessible; co-located styles         |
| Drag-and-drop        | @dnd-kit/core + sortable        | Active maintenance; accessible; keyboard DnD            |
| WebSockets           | socket.io-client                | Required by Socket.io server protocol                   |
| HTTP client          | Axios + interceptors            | Transparent token refresh; singleton API layer          |
| Forms                | React Hook Form + Zod           | Fast; schema-validated; TS-idiomatic                    |
| Rich text editor     | Tiptap v2                       | Backend JSONB format; headless; extensible              |
| Unit/component tests | Vitest + Testing Library        | Simpler Next.js config than Jest                        |
| E2E tests            | Playwright                      | Multi-tab SC-002 coverage; fast                         |
| Containerization     | Docker (multi-stage)            | User requirement; Next.js standalone output             |
| Code quality         | Prettier + Husky + lint-staged  | User requirement; automated pre-commit enforcement      |
| Language             | TypeScript                      | Type safety across API contracts                        |

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context are now resolved:

1. **Live update transport** → WebSocket (socket.io-client). ✅
2. **Token storage security** → access token in memory (Zustand); refresh token in
   sessionStorage pending HTTP-only cookie backend support. ✅
3. **WYSIWYG library** → Tiptap v2. ✅
4. **Priority enum representation** → LOW / MEDIUM / HIGH / URGENT, color-coded
   badges in Tailwind. ✅
5. **Out-of-scope features** → notifications, file attachments, doc history explicitly
   deferred. ✅
6. **Client-side auth guard** → `'use client'` layout in `(protected)/layout.tsx` reads
   Zustand; `middleware.ts` can be upgraded to cookie-based redirect when backend adds
   HTTP-only cookies. ✅
7. **Docker + code quality** → Docker multi-stage with `output: 'standalone'`; Prettier +
   Husky + lint-staged added as user requirement. ✅
