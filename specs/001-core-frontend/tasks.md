# Tasks: Gerensee Frontend — Core Product UI

**Input**: Design documents from `/specs/001-core-frontend/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/routes.md ✅ quickstart.md ✅

**Stack**: Next.js 16.1.6 (App Router), React 19, TypeScript 5.x, TanStack Query v5,
Zustand, Axios, socket.io-client, Tiptap v2, @dnd-kit, Tailwind v4, shadcn/ui,
React Hook Form + Zod, Vitest, Playwright, Docker, Prettier, Husky + lint-staged

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US5)
- Paths are relative to `gerensee-frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and scaffold. Must be fully complete
before any feature work begins.

- [x] T001 Create Next.js project scaffold (`pnpm dlx create-next-app@16.1.6 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`) — produces `src/app/` App Router structure with Tailwind v4, ESLint, and `@/` alias pre-configured; no separate Tailwind or alias config needed
- [x] T002 [P] Install all production dependencies: @tanstack/react-query, @tanstack/react-query-devtools, zustand, axios, socket.io-client, @tiptap/react, @tiptap/pm, @tiptap/starter-kit, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, react-hook-form, zod, @hookform/resolvers, class-variance-authority, clsx, tailwind-merge
- [x] T003 [P] Install dev dependencies: prettier, eslint-config-prettier, husky, lint-staged, vitest, @vitejs/plugin-react, @vitest/ui, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, playwright, @playwright/test — then run `pnpm exec playwright install`
- [x] T004 Configure code quality tooling: create `.prettierrc` (singleQuote, trailingComma:all, printWidth:100) + `.prettierignore`; extend `eslint.config.mjs` with `eslint-config-prettier`; run `pnpm exec husky init`; create `.husky/pre-commit` running `lint-staged`; create `lint-staged.config.mjs` (ts/tsx → eslint+prettier; json/md/css → prettier)
- [x] T005 [P] Configure Vitest: create `vitest.config.ts` (separate from `next.config.ts`) using `@vitejs/plugin-react`, jsdom environment, globals: true, setupFiles: `src/test/setup.ts`, `@/` alias resolving to `src/`; create `src/test/setup.ts` importing `@testing-library/jest-dom`
- [x] T006 [P] Configure Next.js + environment: update `next.config.ts` with `output: 'standalone'` for Docker production; create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1` and `NEXT_PUBLIC_WS_URL=http://localhost:3000`
- [x] T007 [P] Create Docker artifacts: `Dockerfile` (3-stage: `deps` → `builder` → `runner` using `.next/standalone` output), `.dockerignore`, and `docker-compose.yml` wiring frontend (port 3001) to gerensee-backend container
- [x] T008 Initialize shadcn/ui (`pnpm dlx shadcn@latest init`) and add base components: button, input, label, dialog, dropdown-menu, avatar, badge, separator, sheet, tabs, form, tooltip, popover into `src/components/ui/`; add `pnpm` scripts to `package.json`: dev, build, start, lint, format, test, test:ui, test:e2e

**Checkpoint**: `pnpm dev` starts at `http://localhost:3000`; `pnpm lint` passes; `pnpm format` runs; `pnpm build` produces `.next/standalone/`; `docker build` succeeds; `pnpm test --run` passes the scaffold test.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be in place before any user story can compile
or run. No user story work may begin until this phase is complete.

**⚠️ CRITICAL**: All user story phases depend on every task in this phase.

- [x] T009 [P] Create all TypeScript entity and UI types from data-model.md in src/types/index.ts (`User`, `Organization`, `OrganizationWithRole`, `Member`, `MemberRole`, `Project`, `ProjectWithMembers`, `ProjectMember`, `TaskStatus`, `Task`, `TaskPriority`, `TaskAssignee`, `Document`, `DocumentLock`, `TiptapDocument`, `TiptapNode`, `AuthState`, `BoardColumn`, `PriorityConfig`, `PRIORITY_CONFIG`)
- [x] T010 Create Axios API client singleton with `Authorization: Bearer` request interceptor and 401 response interceptor skeleton (refresh + retry logic wired in T027) in src/api/client.ts
- [x] T011 Create Zustand auth store (`user`, `accessToken`, `currentOrg`, `orgRole`, `setAuth`, `clearAuth`) in src/hooks/useAuthStore.ts — access token stored in memory only, never persisted (depends on T009)
- [x] T012 [P] Create TanStack QueryClient with global `retry: 1` and `staleTime: 30_000` config and export `QueryClientProvider` wrapper in src/lib/queryClient.ts
- [x] T013 [P] Create socket.io-client factory function `createBoardSocket(projectId)` that returns a connected socket joining room `board:${projectId}` in src/lib/socket.ts
- [x] T014 Create `usePermissions()` hook exposing `canDo(action)` helper derived from `orgRole` and optional `projectRole` in Zustand store; actions: `'inviteMember'`, `'createProject'`, `'manageProjectMembers'`, `'manageColumns'`, `'editOrgSettings'` in src/hooks/usePermissions.ts (depends on T011)
- [x] T015 [P] Create `PriorityBadge` component using `PRIORITY_CONFIG` color map for LOW/MEDIUM/HIGH/URGENT in src/components/shared/PriorityBadge.tsx (depends on T009)
- [x] T016 [P] Create `DueDateBadge` component that shows formatted due date and applies red color when past due in src/components/shared/DueDateBadge.tsx
- [x] T017 [P] Create `Avatar` component showing user initials fallback with consistent color derived from name in src/components/shared/Avatar.tsx
- [x] T018 [P] Create `RoleGuard` component that renders `children` only when `canDo(action)` is true, otherwise renders `fallback` (null by default) in src/components/shared/RoleGuard.tsx (depends on T014)
- [x] T019 [P] Create `EmptyState` component (icon + heading + description + optional CTA button) and `ErrorBoundary` class component with fallback UI in src/components/shared/
- [x] T020 Create Next.js App Router directory scaffold: `src/app/(auth)/`, `src/app/(protected)/`, root `src/app/layout.tsx` (HTML shell + `QueryClientProvider`), root `src/app/page.tsx` (redirect to `/dashboard`), and `src/app/globals.css` (`@import "tailwindcss"`); create `src/middleware.ts` stub (no-op initially) (depends on T011, T012)

**Checkpoint**: `pnpm build` compiles without errors. All types resolve. Route tree renders a blank authenticated shell.

---

## Phase 3: User Story 1 — Authentication (Priority: P0) 🎯 MVP Entry Point

**Goal**: A user can register, sign in, and maintain their session. All protected routes redirect unauthenticated users to `/sign-in`.

**Independent Test**: Register a new account → land on `/onboarding` → sign out → sign back in → land on `/dashboard`. No other features required.

- [x] T021 [P] [US1] Implement auth API module: `login()`, `register()`, `logout()`, `refresh()`, `getMe()` calling the backend auth contract endpoints in src/api/auth.ts (depends on T010)
- [x] T022 [US1] Implement `src/app/(protected)/layout.tsx` (client AuthGuard): reads Zustand `user` + `accessToken`; calls `router.push('/sign-in')` in `useEffect` if unauthenticated; returns `null` before redirect to prevent flash; wraps children with `QueryClientProvider` (depends on T011, T012)
- [x] T023 [US1] Implement `SignInPage` component in `src/features/auth/SignInPage.tsx`: React Hook Form + Zod schema (email, password); calls `login()`; stores tokens via `setAuth()`; redirects to `/dashboard` via `router.push()`; shows API error message on 401; create `src/app/(auth)/sign-in/page.tsx` exporting it (depends on T021, T011)
- [x] T024 [US1] Implement `RegisterPage` component in `src/features/auth/RegisterPage.tsx`: React Hook Form + Zod schema (name, email, password, organizationName); calls `register()`; redirects to `/sign-in` on success; create `src/app/(auth)/register/page.tsx` exporting it (depends on T021)
- [x] T025 [US1] Implement `OnboardingPage` component in `src/features/auth/OnboardingPage.tsx`: shown when authenticated but `currentOrg === null`; form to create organization; calls `POST /organizations`; stores org in Zustand and calls `router.push('/dashboard')`; create `src/app/(protected)/onboarding/page.tsx` exporting it (depends on T021, T011)
- [x] T026 [US1] Implement silent token refresh in Axios 401 response interceptor: call `refresh()`, retry original request with new token, call `clearAuth()` and `router.push('/sign-in')` on second 401 in `src/api/client.ts`; use `next/navigation`'s `redirect()` for server-safe navigation (depends on T021, T011)
- [x] T027 [US1] Create all auth page files in App Router: `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/register/page.tsx` (redirect `useEffect` to `/dashboard` if already authenticated); `src/app/(protected)/onboarding/page.tsx` (redirect to `/dashboard` if `currentOrg !== null`); sign-out action (clear Zustand + sessionStorage + `router.push('/sign-in')`) exported from `src/features/auth/` (depends on T022–T025)

**Checkpoint**: User Story 1 fully functional. Registration, sign-in, sign-out, session persistence across refresh, and protected route redirect all work independently.

---

## Phase 4: User Story 2 — Organization Setup (Priority: P1)

**Goal**: An Owner can view their organization, see all members with roles, and invite new members. A Member sees the list but no invite controls.

**Independent Test**: Sign in as Owner → open `/org/members` → invite a second user by email → confirm they appear in the list. Sign in as the second user → confirm invite controls are absent.

- [x] T028 [P] [US2] Implement organizations API module: `getOrganization()`, `listOrganizations()`, `updateOrganization()`, `listMembers()`, `addMember()`, `updateMemberRole()`, `removeMember()` in src/api/organizations.ts (depends on T010)
- [x] T029 [P] [US2] Implement `useOrganization()` and `useOrgMembers()` TanStack Query hooks in src/features/organizations/hooks/ (depends on T028)
- [x] T030 [US2] Implement `DashboardPage`: fetches and displays current org name, member count, and project list summary; renders `EmptyState` when no projects exist in src/features/organizations/DashboardPage.tsx (depends on T028, T029, T019)
- [x] T031 [US2] Implement `OrgMembersPage`: member list with `Avatar`, name, email, `MemberRole` badge per row; invite form (email + role select) wrapped in `RoleGuard` for `'inviteMember'`; remove member action also gated by `RoleGuard` in src/features/organizations/OrgMembersPage.tsx (depends on T028, T029, T017, T018)
- [x] T032 [US2] Implement `OrgSettingsPage`: org name edit form; OWNER/ADMIN only (route guarded); calls `PATCH /organizations/:id` on submit in src/features/organizations/OrgSettingsPage.tsx (depends on T028, T014)
- [x] T033 [US2] Create Next.js page files for org routes: `src/app/(protected)/dashboard/page.tsx`, `src/app/(protected)/org/members/page.tsx`, `src/app/(protected)/org/settings/page.tsx` (inline `orgRole` check → `router.push('/dashboard')` for MEMBER); each page file imports and renders the corresponding feature component (depends on T030–T032)

**Checkpoint**: User Story 2 fully functional. Org members page shows roles, invite form visible to OWNER/ADMIN and hidden from MEMBER.

---

## Phase 5: User Story 3 — Project Management (Priority: P1)

**Goal**: Owners/Admins can create projects and manage their members. Standard Members see only their assigned projects. Accessing an unassigned project returns a denied screen.

**Independent Test**: Create project "Q1 Roadmap" → add an org member to it → sign in as that member → confirm project appears in their list and board loads.

- [x] T034 [P] [US3] Implement projects API module: `listProjects()`, `createProject()`, `getProject()`, `updateProject()`, `listProjectMembers()`, `addProjectMember()`, `removeProjectMember()`, `listTaskStatuses()`, `createTaskStatus()`, `updateTaskStatus()`, `deleteTaskStatus()`, `reorderTaskStatuses()` in src/api/projects.ts (depends on T010)
- [x] T035 [P] [US3] Implement `useProject()` and `useProjectMembers()` TanStack Query hooks in src/features/projects/hooks/ (depends on T034)
- [x] T036 [US3] Implement `ProjectGuard` as `src/app/(protected)/projects/[projectId]/layout.tsx`: client component calling `useProject(params.projectId)`; renders `AccessDeniedPage` (not redirect) on 403/404; renders `<ProjectLayout>` wrapping children on success; exposes project to children via React Context (depends on T034, T019)
- [x] T037 [US3] Implement `ProjectLayout` component in `src/features/projects/ProjectLayout.tsx`: sidebar with project name, Board link, Documents link, Settings link (hidden via `RoleGuard` for MEMBER); renders `children` from Next.js layout slot (depends on T036, T018)
- [x] T038 [US3] Implement `ProjectSettingsPage`: task status list with add/rename/reorder controls; calls status API endpoints; OWNER/ADMIN only in src/features/projects/ProjectSettingsPage.tsx (depends on T034, T014)
- [x] T039 [US3] Implement `ProjectMembersPage`: list of project members with `Avatar` + name; add-member combobox pre-populated from org members not already in project; remove action; OWNER/ADMIN only in src/features/projects/ProjectMembersPage.tsx (depends on T034, T035, T028, T017)
- [x] T040 [US3] Create all project page files: `src/app/(protected)/projects/[projectId]/board/page.tsx`, `documents/page.tsx`, `settings/page.tsx` (OWNER/ADMIN guard inline), `settings/members/page.tsx`; add Projects list + create-project dialog to `DashboardPage`; each page imports and renders the corresponding feature component (depends on T036–T039)

**Checkpoint**: User Story 3 fully functional. Project creation, member assignment, role-scoped project list, and access-denied screen all work independently.

---

## Phase 6: User Story 4 — Task Management & Kanban Board (Priority: P1) ⭐ Core Value

**Goal**: Team members create tasks with all fields, view them on a Kanban board, drag cards between columns, and see changes from other sessions within 2 seconds via WebSocket.

**Independent Test**: Open board → create task "Fix login bug" (HIGH, due tomorrow, assigned to a member) → drag to next column → open same board in second tab → move a card in tab 1 → confirm tab 2 updates within 2 seconds.

- [x] T041 [P] [US4] Implement tasks API module: `listTasks()`, `createTask()`, `getTask()`, `updateTask()`, `deleteTask()`, `moveTask()` (PATCH status), `assignTask()`, `unassignTask()` in src/api/tasks.ts (depends on T010)
- [x] T042 [US4] Implement `useBoardSocket` hook: create socket via `createBoardSocket(projectId)` on mount; subscribe to `taskCreated`, `taskUpdated`, `taskDeleted`, `taskMoved` events; expose event stream as callback props; disconnect on unmount in src/features/board/hooks/useBoardSocket.ts (depends on T013)
- [x] T043 [US4] Implement `useBoardTasks` hook: TanStack Query fetch for tasks + statuses; apply WS events from `useBoardSocket` as `queryClient.setQueryData` cache mutations; derive `BoardColumn[]` sorted by `status.position` in src/features/board/hooks/useBoardTasks.ts (depends on T041, T042, T035)
- [x] T044 [US4] Implement `useDragBoard` hook: `@dnd-kit` drag state; on card drop call `moveTask()` and emit optimistic cache update; on column drop call `reorderTaskStatuses()` in src/features/board/hooks/useDragBoard.ts (depends on T041, T034, T043)
- [x] T045 [P] [US4] Implement `TaskCard` component: displays title, `PriorityBadge`, `DueDateBadge` (if set), `Avatar` for each assignee, drag handle; click opens `TaskDetailDrawer` in src/features/board/TaskCard.tsx (depends on T015, T016, T017)
- [x] T046 [US4] Implement `BoardColumn` component: `SortableContext` for cards; column header with name + task count; "Add task" quick-create input at bottom; drag-over highlight in src/features/board/BoardColumn.tsx (depends on T045, T044)
- [x] T047 [US4] Implement `TaskDetailDrawer` (shadcn Sheet): full task form with React Hook Form + Zod; fields: title, description, priority select, due date picker, multi-select assignees from project members; calls `createTask` or `updateTask` on save; `deleteTask` button in src/features/board/TaskDetailDrawer.tsx (depends on T041, T035, T009)
- [x] T048 [P] [US4] Implement `AddColumnDialog` (shadcn Dialog): form to create new `TaskStatus` with name; calls `createTaskStatus()`; OWNER/ADMIN only in src/features/board/AddColumnDialog.tsx (depends on T034)
- [x] T049 [US4] Implement `BoardPage`: `DndContext` root wrapping horizontal scroll of `BoardColumn` components; "Add Column" button in `RoleGuard`; loading skeleton; empty state for no statuses in src/features/board/BoardPage.tsx (depends on T043, T044, T046, T047, T048, T018, T019)

**Checkpoint**: User Story 4 fully functional. Board renders, task CRUD works, drag-and-drop updates status, WS events update a second open tab within 2 seconds.

---

## Phase 7: User Story 5 — Document Editing (Priority: P2)

**Goal**: Users create documents, acquire an edit lock to use the WYSIWYG editor, and other users see the document as locked with the holder's name.

**Independent Test**: Create document "Meeting Notes" → click Edit → acquire lock → type content → save → refresh page → confirm content persists. Open same doc in second tab → confirm "Locked by [name]" message and no editor.

- [ ] T050 [P] [US5] Implement documents API module: `listDocuments()`, `createDocument()`, `getDocument()`, `updateDocument()`, `lockDocument()`, `unlockDocument()` in src/api/documents.ts (depends on T010)
- [ ] T051 [P] [US5] Implement `useDocument()` and `useDocumentLock()` TanStack Query + mutation hooks; `useDocumentLock` exposes `acquire()` and `release()` mutations in src/features/documents/hooks/ (depends on T050)
- [x] T052 [US5] Implement `DocumentLockBanner` component: shows "Editing locked by [userName]" with lock expiry time; if current user owns lock shows "Save & Unlock" and "Release Lock" buttons in src/features/documents/DocumentLockBanner.tsx (depends on T017, T011)
- [x] T053 [US5] Implement `TiptapEditor` component: Tiptap `useEditor` with `StarterKit`; toolbar with Bold, Italic, H1, H2, BulletList, OrderedList, CodeBlock; `editable` prop controls read-only mode; `value` / `onChange` in Tiptap JSON format in src/features/documents/TiptapEditor.tsx
- [x] T054 [US5] Implement `DocumentPage`: fetches document + lock state; "Edit" button calls `acquire()`; renders `TiptapEditor` in editable mode when current user owns lock, read-only mode otherwise; `DocumentLockBanner` always visible when lock exists; "Save" calls `updateDocument()` then `release()`; refetches lock state on a 10s interval to detect external lock changes in src/features/documents/DocumentPage.tsx (depends on T051, T052, T053, T011)
- [x] T055 [US5] Implement `DocumentsPage`: list of project documents with title, last-updated date, lock indicator badge; "New Document" button creates document via `createDocument()` and navigates to `DocumentPage`; `EmptyState` when no documents in src/features/documents/DocumentsPage.tsx (depends on T050, T051, T019)
- [x] T056 [US5] Create document page files: `src/app/(protected)/projects/[projectId]/documents/page.tsx` exporting `DocumentsPage`; `src/app/(protected)/projects/[projectId]/documents/[documentId]/page.tsx` exporting `DocumentPage` (depends on T054, T055)

**Checkpoint**: User Story 5 fully functional. Document creation, lock acquisition, WYSIWYG editing, save + unlock, and locked state visible to other users all work independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize reliability, error handling, DX scripts, and validate the full quickstart.

- [x] T057 [P] Verify Docker end-to-end locally: `docker build -t gerensee-frontend .`; confirm image build succeeds in `runner` stage; run `docker compose up` with the backend container; confirm app is reachable at `http://localhost:3001`
- [x] T058 Wrap root `src/app/layout.tsx` with `ErrorBoundary` (T019) catching unhandled render errors; add `SC-005` global network error toast in Axios response interceptor for non-401, non-404 errors (500, network failure) displayed via a shadcn Toast component in `src/api/client.ts`
- [x] T059 Run quickstart.md validation end-to-end: `pnpm dev` (no console errors at `http://localhost:3000`), `pnpm lint` (no lint errors), `pnpm test --run` (all pass), `pnpm build` (no TS errors, `.next/standalone/` produced), critical flow sign-in → create project → create task completes in under 10 interactions (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **BLOCKS all user story phases**
- **Phase 3 (US1 Auth)**: Depends on Phase 2 — first story to implement (everything gates on auth)
- **Phase 4 (US2 Org)**: Depends on Phase 2 + Phase 3 (auth store must be populated)
- **Phase 5 (US3 Projects)**: Depends on Phase 2 + Phase 3; uses org context from Phase 4
- **Phase 6 (US4 Board)**: Depends on Phase 2 + Phase 3 + Phase 5 (project context required)
- **Phase 7 (US5 Documents)**: Depends on Phase 2 + Phase 3 + Phase 5 (project context required); independent of Phase 6
- **Phase 8 (Polish)**: Depends on all prior phases

### User Story Inter-Dependencies

- **US1 (Auth)** → no user story dependencies
- **US2 (Org)** → depends on US1 (auth state provides currentOrg)
- **US3 (Projects)** → depends on US1; uses US2 org context
- **US4 (Board)** → depends on US1 + US3 (project + status context)
- **US5 (Documents)** → depends on US1 + US3 (project context); **independent of US4**

### Parallel Opportunities Per Phase

```
Phase 1:  T002, T003, T005, T006, T007         — all parallel after T001
Phase 2:  T009, T012, T013, T015, T016,
          T017, T018, T019                      — all parallel (different files)
          T010 → T011 → T014                    — sequential chain
Phase 3:  T021                                  — parallel with T022
          T023, T024, T025                      — parallel after T021 + T022
          T026 → T027                           — sequential after T023

Phase 4:  T028, T029                            — parallel
          T030, T031, T032                      — parallel after T028 + T029
          T033                                  — after T030–T032

Phase 5:  T034, T035                            — parallel
          T036 → T037 → T038, T039             — T038 and T039 parallel after T037
          T040                                  — after T038 + T039

Phase 6:  T041, T045, T048                      — parallel
          T042 → T043 → T044                    — sequential
          T046 → T049                           — after T043 + T044 + T045
          T047                                  — parallel with T046

Phase 7:  T050, T051                            — parallel
          T052, T053                            — parallel
          T054 → T055 → T056                    — sequential
```

---

## Implementation Strategy

### MVP Scope (Stories P0 + P1 only)

Complete Phases 1–6. This delivers:

- Authentication and session management
- Organization and member management
- Project creation and member assignment
- Full Kanban board with real-time updates

US5 (Documents, P2) is independent and can be skipped for the initial release.

### Incremental Delivery Order

1. **Phase 1 + 2** → foundation ready; deploy blank shell
2. **+ Phase 3** → auth works; users can register and sign in
3. **+ Phase 4** → org home and members visible; invite flow works
4. **+ Phase 5** → projects visible and manageable; ✅ demo-able milestone
5. **+ Phase 6** → Kanban board live → **full MVP**
6. **+ Phase 7** → documents feature complete → **full P2 scope**

### Single-Developer Sequence

```
T001 → T002–T008 (parallel) →
T009–T019 (parallel batch) → T010 → T011 → T014 → T020 →
T021–T022 → T023–T025 (parallel) → T026 → T027 →
T028–T029 (parallel) → T030–T032 (parallel) → T033 →
T034–T035 (parallel) → T036 → T037 → T038–T039 (parallel) → T040 →
T041–T042–T045–T048 (parallel) → T043 → T044 → T046–T047 (parallel) → T049 →
T050–T051 (parallel) → T052–T053 (parallel) → T054 → T055 → T056 →
T057–T058 (parallel) → T059
```

---

## Task Count Summary

| Phase              | Story    | Tasks  | Parallel                     |
| ------------------ | -------- | ------ | ---------------------------- |
| 1 — Setup          | —        | 8      | T002, T003, T005, T006, T007 |
| 2 — Foundational   | —        | 12     | T009, T012, T013, T015–T019  |
| 3 — Authentication | US1 (P0) | 7      | T021, T022, T023–T025        |
| 4 — Org Setup      | US2 (P1) | 6      | T028, T029, T030–T032        |
| 5 — Projects       | US3 (P1) | 7      | T034, T035, T038–T039        |
| 6 — Kanban Board   | US4 (P1) | 9      | T041, T045, T048             |
| 7 — Documents      | US5 (P2) | 7      | T050, T051, T052–T053        |
| 8 — Polish         | —        | 3      | T057                         |
| **Total**          |          | **59** |                              |
