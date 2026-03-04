# Frontend Route Contracts: Gerensee Frontend

**Phase**: 1 (Design)
**Date**: 2026-03-02 | **Updated**: 2026-03-03

This document defines every application route — the frontend's "contract" with
the browser. Routes map to user stories and encode access rules. Routing is
implemented via **Next.js App Router** (file-based); route groups `(auth)` and
`(protected)` organize layouts without affecting URLs.

---

## Route Tree

```
/                              → redirect to /dashboard (if auth) or /sign-in
/sign-in                       → US1 – Authentication (public)
/register                      → US1 – Registration (public)
/onboarding                    → US2 – Create organization (auth required, no-org required)

/dashboard                     → US2/US3 – Organization home + Projects list (auth required)

/projects/:projectId           → project shell (auth + project member required)
  /board                       → US4 – Kanban board (default)
  /documents                   → US5 – Documents list
  /documents/:documentId       → US5 – Document view / edit
  /settings                    → US3 – Project settings (Owners/Admins only)
  /settings/members            → US3 – Project member management

/org/members                   → US2 – Organization members page (auth required)
/org/settings                  → US2 – Organization settings (Owners/Admins only)
```

---

## Route Definitions

### Public Routes (no auth required)

| Route       | Component      | Behavior                                                      |
| ----------- | -------------- | ------------------------------------------------------------- |
| `/sign-in`  | `SignInPage`   | Email + password form → POST /auth/login                      |
| `/register` | `RegisterPage` | Name + email + password + org name form → POST /auth/register |

**Redirect rule**: If an authenticated user lands on `/sign-in` or `/register`,
they are immediately redirected to `/dashboard`.

---

### Auth-Required Routes (redirect to `/sign-in` if unauthenticated)

| Route           | Component         | Notes                                                                     |
| --------------- | ----------------- | ------------------------------------------------------------------------- |
| `/`             | `RootRedirect`    | Redirects → `/dashboard`                                                  |
| `/onboarding`   | `OnboardingPage`  | Shown only if `currentOrg === null`; redirects → `/dashboard` otherwise   |
| `/dashboard`    | `DashboardPage`   | Projects list + org summary                                               |
| `/org/members`  | `OrgMembersPage`  | Role check: all roles may view; invite controls shown only to OWNER/ADMIN |
| `/org/settings` | `OrgSettingsPage` | Role check: OWNER/ADMIN only; MEMBER is redirected to `/dashboard`        |

---

### Project Routes (auth + project membership required)

Wrapped in a `<ProjectGuard>` layout route that:

1. Verifies the user is a member of `:projectId`.
2. Exposes `useProjectRole()` hook with the user's role in this project.
3. Shows 403 screen (not a redirect) for authenticated non-members per spec edge case.

| Route                                        | Component             | Notes                                                    |
| -------------------------------------------- | --------------------- | -------------------------------------------------------- |
| `/projects/:projectId`                       | `ProjectLayout`       | Renders sidebar + `<Outlet>`; auto-redirects to `/board` |
| `/projects/:projectId/board`                 | `BoardPage`           | Kanban board — default project view (FR-013)             |
| `/projects/:projectId/documents`             | `DocumentsPage`       | Documents list (FR-019)                                  |
| `/projects/:projectId/documents/:documentId` | `DocumentPage`        | View/edit document (FR-021–024)                          |
| `/projects/:projectId/settings`              | `ProjectSettingsPage` | OWNER/ADMIN only; MEMBER → redirect to `/board`          |
| `/projects/:projectId/settings/members`      | `ProjectMembersPage`  | Manage project membership (FR-012)                       |

---

## Protected Route Implementation Pattern

### File-System Layout (Next.js App Router)

```
src/app/
├── (auth)/                            # Public — no auth required
│   ├── sign-in/page.tsx
│   └── register/page.tsx
├── (protected)/                       # All auth-required routes
│   ├── layout.tsx                     ← client AuthGuard + QueryClientProvider
│   ├── onboarding/page.tsx
│   ├── dashboard/page.tsx
│   ├── org/members/page.tsx
│   ├── org/settings/page.tsx
│   └── projects/[projectId]/
│       ├── layout.tsx                 ← client ProjectGuard + ProjectLayout
│       ├── board/page.tsx
│       ├── documents/page.tsx
│       ├── documents/[documentId]/page.tsx
│       ├── settings/page.tsx
│       └── settings/members/page.tsx
├── layout.tsx                         # Root layout (HTML shell, global providers)
└── page.tsx                           # Root redirect → /dashboard or /sign-in
```

### Auth Guard — `src/app/(protected)/layout.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !accessToken) router.push('/sign-in');
  }, [user, accessToken, router]);

  if (!user || !accessToken) return null; // prevent flash before redirect

  return <>{children}</>;
}
```

### Org Admin Guard — inline in page

```tsx
// src/app/(protected)/org/settings/page.tsx
'use client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrgSettingsPage() {
  const { orgRole } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (orgRole === 'MEMBER') router.push('/dashboard');
  }, [orgRole, router]);
  if (orgRole === 'MEMBER') return null;
  // ...
}
```

### Project Guard — `src/app/(protected)/projects/[projectId]/layout.tsx`

```tsx
'use client';
import { useProject } from '@/features/projects/hooks/useProject';
import { AccessDeniedPage } from '@/features/projects/AccessDeniedPage';
import { ProjectLayout } from '@/features/projects/ProjectLayout';

export default function ProjectGuardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { data: project, isError, isLoading } = useProject(params.projectId);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AccessDeniedPage />;
  return <ProjectLayout project={project!}>{children}</ProjectLayout>;
}
```

---

## Navigation Hierarchy (Sidebar)

```
Sidebar (always visible when authenticated + in org)
├── [Org Name] logo / home → /dashboard
├── Projects (list)
│   └── [Project Name] → /projects/:id/board
│       ├── Board
│       ├── Documents
│       └── Settings (OWNER/ADMIN only)
├── Members → /org/members
└── Org Settings → /org/settings (OWNER/ADMIN only)
```

---

## URL Parameters

| Parameter     | Type            | Constraint                                |
| ------------- | --------------- | ----------------------------------------- |
| `:projectId`  | `string` (cuid) | Must be a project the user is a member of |
| `:documentId` | `string` (cuid) | Must belong to the given `:projectId`     |
