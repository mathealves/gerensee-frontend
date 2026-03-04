# Data Model: Gerensee Frontend — Core Product UI

**Phase**: 1 (Design)
**Date**: 2026-03-02
**Source**: Backend API contracts in `gerensee-backend/specs/001-core-product-features/contracts/`

This document defines the frontend's client-side data model — the TypeScript types that
mirror API response shapes. These are consumer types, not database schemas.
No business logic lives here; these types drive UI rendering and API client call signatures.

---

## Core Entities

### User

```ts
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}
```

Source: `GET /auth/me`, `POST /auth/login` response.

---

### Organization

```ts
interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationWithRole extends Organization {
  role: MemberRole; // current user's role in this org
}
```

Source: `GET /organizations`, `GET /organizations/:id`.

---

### Member (Organization-level)

```ts
type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  user: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
}
```

Source: `GET /organizations/:id/members`.

---

### Project

```ts
interface Project {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectWithMembers extends Project {
  members: ProjectMember[];
}
```

Source: `GET /organizations/:id/projects`, `GET /projects/:id`.

---

### ProjectMember

```ts
interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
}
```

Source: `GET /projects/:id/members`.

---

### TaskStatus (Kanban Column)

```ts
interface TaskStatus {
  id: string;
  name: string;
  position: number; // determines column order left-to-right
  color: string | null; // optional hex color for column header
  projectId: string;
}
```

Source: included in `GET /projects/:id` response (embedded statuses array).

---

### Task

```ts
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null; // ISO 8601 date string
  statusId: string;
  projectId: string;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

interface TaskAssignee {
  id: string; // ProjectMember id
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}
```

Source: `GET /projects/:id/tasks`.

---

### Document

```ts
interface Document {
  id: string;
  title: string;
  content: TiptapDocument | null; // Tiptap JSON format
  projectId: string;
  lock: DocumentLock | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentLock {
  userId: string;
  userName: string;
  lockedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601 (15 min ahead of lockedAt)
}

// Tiptap document root node shape (abbreviated)
interface TiptapDocument {
  type: 'doc';
  content: TiptapNode[];
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}
```

Source: `GET /projects/:id/documents`, `GET /documents/:id`.

---

## Auth State (Client-Only)

These types are not returned by the API but live in the Zustand auth store.

```ts
interface AuthState {
  // Current authenticated user (null = unauthenticated)
  user: User | null;

  // JWT access token held in memory — NEVER persisted to storage
  accessToken: string | null;

  // Current org context fetched after login
  currentOrg: OrganizationWithRole | null;

  // Derived: current user's role in the current org
  orgRole: MemberRole | null;
}
```

---

## UI-Only Types

Types that exist only to drive component rendering and have no API counterpart.

```ts
// Kanban board: columns mapped to their task arrays
type BoardColumn = {
  status: TaskStatus;
  tasks: Task[];
};

// Priority visual config (used by badge component)
type PriorityConfig = {
  label: string;
  color: string; // Tailwind bg class, e.g. 'bg-red-500'
  textColor: string; // Tailwind text class
};

const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  LOW: { label: 'Low', color: 'bg-slate-200', textColor: 'text-slate-700' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100', textColor: 'text-blue-700' },
  HIGH: { label: 'High', color: 'bg-amber-100', textColor: 'text-amber-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100', textColor: 'text-red-700' },
};
```

---

## Entity Relationships (Frontend View)

```
User
 └── belongs to → Organization (via Member.role)
                     └── has many → Projects
                                       ├── has many → Tasks
                                       │              └── belongs to → TaskStatus
                                       ├── has many → TaskStatuses (columns)
                                       ├── has many → Documents
                                       └── has many → ProjectMembers → Users
```

---

## State Ownership Map

| Entity         | Owner                                          | Notes                         |
| -------------- | ---------------------------------------------- | ----------------------------- |
| AuthState      | Zustand store                                  | Access token in memory only   |
| User           | TanStack Query (`/auth/me`)                    | Cached; invalidated on logout |
| Organization   | TanStack Query (`/organizations`)              |                               |
| Members        | TanStack Query (`/organizations/:id/members`)  |                               |
| Projects       | TanStack Query (`/organizations/:id/projects`) |                               |
| ProjectMembers | TanStack Query (`/projects/:id/members`)       |                               |
| Tasks          | TanStack Query (`/projects/:id/tasks`)         | Also updated via WS events    |
| TaskStatuses   | TanStack Query (embedded in project)           |                               |
| Documents      | TanStack Query (`/projects/:id/documents`)     |                               |
| BoardColumns   | Derived (computed from Tasks + TaskStatuses)   | No separate fetch             |
