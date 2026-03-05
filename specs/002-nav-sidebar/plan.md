# Implementation Plan: Navigation Sidebar & Core Navigation Pages

**Branch**: `002-nav-sidebar` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a persistent application sidebar inside the existing protected layout (`src/app/(protected)/layout.tsx`) that provides org switching, project navigation, and conditional org settings access. The API layer, feature page components (`DashboardPage`, `OrgSettingsPage`, `OrgMembersPage`), React Query hooks, and Zustand store scaffolding all already exist. The primary deliverable is the sidebar shell and the org-switcher mechanism, plus wiring the protected layout to use them.

---

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16.1.6 (App Router)  
**Primary Dependencies**: shadcn/ui (Sidebar, DropdownMenu, Separator, Avatar, Badge), Zustand 5, TanStack Query 5, Lucide React, Zod, Sonner  
**Storage**: Client-side only — Zustand in-memory (no localStorage persistence for active org)  
**Testing**: Vitest + Testing Library (existing scaffold)  
**Target Platform**: Web (desktop + responsive mobile)  
**Project Type**: Next.js App Router page/component feature  
**Performance Goals**: Org switch must not cause full page reload; sidebar renders synchronously from Zustand  
**Constraints**: shadcn component primitives MUST be used for all sidebar UI (matches existing UI system); no new state management libraries  
**Scale/Scope**: ~8 new files; modifications to 2 existing files

---

## Key Design Decisions

### 1. Sidebar technology

Use **shadcn `Sidebar`** component (`pnpm dlx shadcn@latest add sidebar`). This provides accessible collapsible sidebar primitives consistent with the existing shadcn setup.

### 2. Org switching mechanism

The Zustand `useAuthStore` already has `currentOrg: OrganizationWithRole | null`. Add a single `switchOrg(org: OrganizationWithRole): void` action that updates `currentOrg` and `orgRole`. All existing React Query hooks (`useProjects`, `useOrganization`, `useOrgMembers`) already key off `currentOrg?.id`, so they will automatically re-fetch when the org changes — no manual cache invalidation needed.

A new `useOrganizations` hook (`GET /organizations`) is needed to populate the org switcher dropdown. This endpoint already exists in `src/api/organizations.ts` (`listOrganizations()`).

### 3. Projects page

The existing `DashboardPage` at `/dashboard` already shows the projects list with the create-project dialog. The sidebar "Projects" item links to `/dashboard` — no separate `/projects` page is created. The component may be internally renamed to `ProjectsPage` as a non-breaking refactor.

### 4. Org settings layout

The current `/org/settings` and `/org/members` routes exist as separate pages, each with their own `page.tsx`. A new **`src/app/(protected)/org/layout.tsx`** will add a shared tab/sub-nav so the user experiences them as a unified "Organization Settings" area. The underlying `OrgSettingsPage` and `OrgMembersPage` feature components are unchanged.

### 5. Active route detection

Next.js `usePathname()` drives the `isActive` styling in the sidebar nav items — no custom routing context is needed.

### 6. Role-conditional sidebar items

`usePermissions().canDo('editOrgSettings')` (already exists) gates the "Organization Settings" sidebar item. This is evaluated from the Zustand store — no extra hook is needed.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-nav-sidebar/
├── plan.md              ← this file
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md             ← to be generated
```

### New Files (source)

```text
src/
├── components/
│   └── shared/
│       ├── AppSidebar.tsx          ← main sidebar component (shadcn Sidebar)
│       └── OrgSwitcher.tsx         ← org switcher dropdown inside sidebar header
├── features/
│   └── organizations/
│       └── hooks/
│           └── useOrganizations.ts ← useQuery wrapper for listOrganizations()
└── app/
    └── (protected)/
        └── org/
            └── layout.tsx          ← org settings tab layout (General / Members)
```

### Modified Files (source)

```text
src/
├── hooks/
│   └── useAuthStore.ts             ← add switchOrg(org) action
└── app/
    └── (protected)/
        └── layout.tsx              ← add AppSidebar + page shell
```

### Unchanged (referenced but untouched)

```text
src/
├── api/organizations.ts            ← listOrganizations(), updateOrganization(), addMember() — all exist
├── api/projects.ts                 ← listProjects() — exists
├── features/organizations/
│   ├── DashboardPage.tsx           ← existing projects list page component
│   ├── OrgSettingsPage.tsx         ← existing org name edit page component
│   └── OrgMembersPage.tsx          ← existing members page component
├── hooks/usePermissions.ts         ← canDo('editOrgSettings') — exists
└── types/index.ts                  ← OrganizationWithRole, MemberRole — all exist
```

---

## Routing Map

| Sidebar Item           | Route           | Page Component    | Role Gate        |
| ---------------------- | --------------- | ----------------- | ---------------- |
| Projects               | `/dashboard`    | `DashboardPage`   | None (all roles) |
| Org Settings → General | `/org/settings` | `OrgSettingsPage` | OWNER, ADMIN     |
| Org Settings → Members | `/org/members`  | `OrgMembersPage`  | OWNER, ADMIN     |

The sidebar `Organization Settings` entry is one item that navigates to `/org/settings`. The tab layout at `/org/layout.tsx` provides navigation to `/org/settings` (General tab) and `/org/members` (Members tab) without full reloads.

---

## Implementation Notes

- shadcn `sidebar` component must be installed before implementing `AppSidebar.tsx`.
- `SidebarProvider` must wrap the layout in `src/app/(protected)/layout.tsx` (shadcn sidebar requirement).
- The `OrgSwitcher` uses shadcn `DropdownMenu` (already available in the UI system).
- The avatar/initials in the org switcher uses the existing `Avatar` shared component.
- On mobile, the sidebar should use the `Sheet`-based collapsible mode provided by shadcn sidebar.
- The org settings tab layout uses shadcn `Tabs` component.
- After calling `switchOrg`, force a `router.push('/dashboard')` to avoid stale page state for role-conditional pages (e.g., if user switches to an org where they're a MEMBER while on `/org/settings`).
