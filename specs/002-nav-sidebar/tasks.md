# Tasks: Navigation Sidebar & Core Navigation Pages

**Branch**: `002-nav-sidebar`  
**Input**: [plan.md](./plan.md), [spec.md](./spec.md)  
**Total tasks**: 12 | **User stories**: 4 | **Parallel opportunities**: 5

---

## Phase 1: Setup

**Purpose**: Install the shadcn Sidebar package, which is required before any sidebar component can be built.

- [x] T001 Install shadcn Sidebar component by running `pnpm dlx shadcn@latest add sidebar` from `gerensee-frontend/` root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Two low-level primitives that every user story depends on — the store action for switching org context and the query hook for listing all user organizations.

**⚠️ CRITICAL**: Phases 3–6 cannot start until this phase is complete.

- [x] T002 [P] Add `switchOrg(org: OrganizationWithRole): void` action to `src/hooks/useAuthStore.ts` — should set both `currentOrg` and `orgRole` (similar to the existing `setAuth` pattern; import `OrganizationWithRole` from `@/types`)
- [x] T003 [P] Create `src/features/organizations/hooks/useOrganizations.ts` — `useOrganizations()` hook wrapping `listOrganizations()` from `@/api/organizations` with `queryKey: ['organizations']` and no `enabled` guard (always fetch when authenticated)

**Checkpoint**: Store action and org-list hook are in place — user story implementation can begin.

---

## Phase 3: User Story 1 — Persistent Navigation Sidebar (Priority: P1) 🎯 MVP

**Goal**: A fully functional sidebar visible on all protected pages with working navigation links and role-conditional items. This is independently deployable — all other user stories slot into the sidebar without changing its structure.

**Independent Test**: Sign in as any user → verify sidebar renders with Projects link and conditional Org Settings link → click links → confirm navigation works and active item is highlighted.

- [x] T004 [US1] Create `src/components/shared/AppSidebar.tsx` — shadcn `<Sidebar>` with:
  - `<SidebarHeader>` slot (empty for now; OrgSwitcher added in Phase 4)
  - `<SidebarContent>` containing `<SidebarGroup>` with two `<SidebarMenuItem>` entries:
    - **Projects** → `href="/dashboard"`, icon `FolderKanban` from lucide-react
    - **Organization Settings** → `href="/org/settings"`, icon `Settings` from lucide-react, rendered only when `usePermissions().canDo('editOrgSettings')` returns `true`
  - Active item highlight: use `usePathname()` to compare current route with item `href`
  - `<SidebarFooter>` slot with the logged-in user's name and email (from `useAuthStore`)
- [x] T005 [US1] Update `src/app/(protected)/layout.tsx` — wrap the return with `<SidebarProvider>`, add `<AppSidebar />` beside the main content area, and use `<SidebarInset>` (or a flex wrapper) for the `{children}` region so pages render inside the sidebar shell; import `AppSidebar` from `@/components/shared/AppSidebar`

**Checkpoint**: Sidebar renders on all protected pages; Projects and conditional Org Settings links work; active route is highlighted.

---

## Phase 4: User Story 2 — Organization Switcher (Priority: P2)

**Goal**: Users with multiple org memberships can switch active org from the sidebar header, changing the scope of all org-scoped pages without a full reload.

**Independent Test**: Sign in as a user with two orgs → open org switcher → click second org → verify sidebar header shows new org name → navigate to Projects and verify it shows the new org's projects.

- [x] T006 [US2] Create `src/components/shared/OrgSwitcher.tsx` — shadcn `<DropdownMenu>` component that:
  - Calls `useOrganizations()` to get all orgs
  - Displays the current org name + role badge as the trigger (use `<SidebarMenuButton>` for consistent styling)
  - Renders each org as a `<DropdownMenuItem>` showing org name and the user's role in it; marks the active org with a checkmark icon
  - On item click: calls `switchOrg(selectedOrg)` from `useAuthStore`, then `router.push('/dashboard')` to reset page context
  - Shows a loading skeleton while `useOrganizations()` is fetching
- [x] T007 [US2] Integrate `OrgSwitcher` into `src/components/shared/AppSidebar.tsx` — replace the empty `<SidebarHeader>` slot with `<OrgSwitcher />`; confirm org switching resets projects list automatically (React Query re-fetches when `currentOrg?.id` changes in the query key)

**Checkpoint**: Org switcher is live in the sidebar; switching org updates projects list and sidebar state without a full page reload.

---

## Phase 5: User Story 3 — Projects List Page (Priority: P3)

**Goal**: The Projects page renders correctly within the new sidebar shell layout with proper spacing, and the sidebar Projects link is the clear entry point to this view.

**Independent Test**: Sign in as OWNER → click Projects in sidebar → see list of all org projects → click a project card → navigate to board. Sign in as MEMBER assigned to one project → see only that project.

- [x] T008 [US3] Review and adjust `src/features/organizations/DashboardPage.tsx` inner layout — the component currently has `<div className="p-8">` at its root; if shadcn `<SidebarInset>` already provides padding, replace `p-8` with `p-6` or use `px-6 py-8` to align with the sidebar inset spacing; ensure the project grid/list does not overflow or clip inside the shell content area. **Also verify**: the create-project button and dialog are visible and functional for OWNER/ADMIN roles inside the new `<SidebarInset>` shell (satisfies FR-008)

**Checkpoint**: Projects page renders cleanly inside sidebar shell; correct project list shown per role.

---

## Phase 6: User Story 4 — Organization Settings — General & Members (Priority: P4)

**Goal**: A cohesive org settings section with tabbed sub-navigation (General / Members) accessible from the sidebar, with role guard at the layout level.

**Independent Test**: Sign in as OWNER → click Organization Settings in sidebar → see General tab with editable org name → click Members tab → see member list with invite form. Sign in as MEMBER → attempt direct URL `/org/settings` → get redirected to `/dashboard`.

- [x] T009 [US4] Create `src/app/(protected)/org/layout.tsx` — shared layout for all `/org/*` pages containing:
  - Role guard: `useEffect` that redirects to `/dashboard` if `orgRole === 'MEMBER'`; return null guard before rendering
  - Heading: "Organization Settings" with current org name as sub-title (via `useAuthStore`)
  - Tab sub-navigation using shadcn `<Tabs>` with two `<TabsTrigger>` items: "General" (links to `/org/settings`) and "Members" (links to `/org/members`); use `usePathname()` to determine which tab is active
  - `{children}` rendered below the tab bar

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Clean up redundant guards and align visual details across all new and modified files.

- [x] T010 [P] Update `src/app/(protected)/org/settings/page.tsx` — remove the inline `useEffect` role guard (now handled by `org/layout.tsx`); simplify the component to just render `<OrgSettingsPage />` directly. **Also update** `src/features/organizations/OrgSettingsPage.tsx`: after a successful `updateOrganization()` response, call `useAuthStore.setState(s => ({ currentOrg: s.currentOrg ? { ...s.currentOrg, name: values.name } : null }))` so the sidebar and org switcher reflect the new name immediately without a reload (satisfies SC-005)
- [x] T011 [P] Update `src/app/(protected)/org/members/page.tsx` — same cleanup: remove inline role guard, render `<OrgMembersPage />` directly
- [x] T012 Smoke-test all four user stories manually: (1) sidebar visible on dashboard, (2) org switch works with two orgs, (3) member sees correct project subset, (4) admin reaches org settings + invite form; MEMBER is blocked from org settings via direct URL

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─▶ Phase 2 (Foundational) — T002, T003 can run in parallel
        └─▶ Phase 3 (US1) — T004 then T005 (sequential: component before layout)
              ├─▶ Phase 4 (US2) — T006 then T007 (sequential)
              ├─▶ Phase 5 (US3) — T008 (independent, can run after Phase 3)
              └─▶ Phase 6 (US4) — T009 (independent, can run after Phase 3)
                    └─▶ Phase 7 (Polish) — T010, T011 parallel; T012 last
```

### User Story Dependencies

| Story               | Depends On    | Can Start After |
| ------------------- | ------------- | --------------- |
| US1 — Sidebar       | Phase 2       | T003 complete   |
| US2 — Org Switcher  | Phase 2 + US1 | T005 complete   |
| US3 — Projects Page | Phase 3       | T005 complete   |
| US4 — Org Settings  | Phase 3       | T005 complete   |

US3, US4, and Phase 7's T010/T011 can all be worked in parallel once US1 (Phase 3) is done.

### Parallel Execution Example (US1 complete, one developer)

```
After T005 completes:
  ┌─ T006 (OrgSwitcher component)
  ├─ T008 (dashboard layout adjustment)
  └─ T009 (org layout + tabs)

Then:
  ├─ T007 (wire OrgSwitcher into AppSidebar)
  ├─ T010 (remove redundant org/settings guard)
  └─ T011 (remove redundant org/members guard)

Finally:
  └─ T012 (smoke test)
```

---

## Implementation Strategy

- **MVP scope**: Ship Phase 1 → 2 → 3 first (`T001–T005`). This gives every user a working sidebar with navigation and role-conditional items — independently valuable without the org switcher or tabbed settings.
- **Increment 2**: Add Phase 4 (org switcher, `T006–T007`) for multi-org users.
- **Increment 3**: Phase 5 + 6 + 7 in parallel (`T008–T012`).
- All new components must use shadcn primitives and Tailwind for styling — no inline styles, no custom CSS files.
- Do not introduce new state management beyond the single `switchOrg` action added to the existing Zustand store.
