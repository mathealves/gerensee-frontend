# Feature Specification: Gerensee Frontend — Core Product UI

**Feature Branch**: `001-core-frontend`
**Created**: 2026-03-02
**Status**: Draft
**Input**: Full frontend implementation of core product features as defined in the backend spec (`gerensee-backend/specs/001-core-product-features/spec.md`). The frontend must expose every capability established for the backend through a coherent, role-aware user interface.

## Clarifications

### Session 2026-03-02

- Q: What is the authentication method? → A: Email + password (JWT-based, matching the backend auth implementation).
- Q: Should the Kanban board update in real time for other users? → A: Backend SC-002 requires board moves to be visible to other users within 2 seconds; the frontend must support a polling or push strategy to meet this.
- Q: How is document locking surfaced to the user? → A: The UI must clearly show who holds the lock and prevent edit access until the lock is released or times out.
- Q: What real-time transport mechanism should the frontend use for board updates? → A: WebSockets via Socket.io; the backend implements a NestJS WebSocket Gateway with room-based subscriptions per project board. SSE (one-way) and short polling were explicitly rejected in backend research.
- Q: How should the frontend store authentication tokens to prevent XSS? → A: Access tokens are kept in client memory only (never localStorage); refresh tokens are stored in HTTP-only cookies and exchanged via the POST /auth/refresh endpoint.
- Q: Which WYSIWYG editor library should be used for document editing? → A: Tiptap (ProseMirror-based); the backend stores document content as JSONB in Tiptap's JSON format, so the frontend editor must read and write that same format.
- Q: What are the valid task priority values and how should they be represented on the board? → A: Enum with four values: LOW, MEDIUM, HIGH, URGENT (backend default: MEDIUM). Cards on the Kanban board must display color-coded priority badges; due date badges are also required per backend research.
- Q: Which features are explicitly out of scope for the frontend in this phase? → A: Task assignment notifications, file attachments to tasks or documents, and document version history are all explicitly deferred (confirmed in backend research open questions).

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Authentication (Priority: P0)

A user accesses Gerensee for the first time, creates an account, and signs in to their session.

**Why this priority**: Every other story is gated behind an authenticated session. Without this, no other part of the application is reachable.

**Independent Test**: Navigate to the app, register with a new email, land on the post-login home screen. Sign out and sign back in. Both flows complete without errors.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they open the application, **Then** they are shown the sign-in screen — not the application interior.
2. **Given** the sign-in screen, **When** a user submits valid credentials, **Then** they are taken to their organization home.
3. **Given** the sign-in screen, **When** a user submits invalid credentials, **Then** they see a clear error message and remain on the sign-in screen.
4. **Given** a registration form, **When** a user provides a valid email and password, **Then** their account is created and they enter the onboarding flow.
5. **Given** an authenticated user, **When** they sign out, **Then** they are returned to the sign-in screen and cannot access protected pages without signing in again.

---

### User Story 2 — Organization Setup (Priority: P1)

An organization owner sets up their workspace, names their organization, and invites colleagues.

**Why this priority**: The Organization is the root container for all other entities. It must exist before any project or task can be created.

**Independent Test**: Create an organization "Acme Corp", invite a second test user by email, confirm that user appears in the members list.

**Acceptance Scenarios**:

1. **Given** a new authenticated user with no organization, **When** they complete the onboarding flow, **Then** they can name and create their organization — becoming its Owner.
2. **Given** an organization Owner or Admin, **When** they open the Members page and enter a valid email address, **Then** an invitation is issued and the invited user appears as a pending or active member.
3. **Given** an organization member list, **When** an Owner or Admin views it, **Then** each member's role (Owner / Admin / Member) is displayed alongside their name.
4. **Given** a standard Member, **When** they view the Members page, **Then** they can see the list but cannot invite or remove members.

---

### User Story 3 — Project Management (Priority: P1)

A manager creates a project, configures it, and assigns members to it.

**Why this priority**: Projects are the direct container for tasks and documents. Without them, the core workflow cannot proceed.

**Independent Test**: Create a project "Q1 Roadmap", add one organization member to it, and confirm that member can see the project in their project list.

**Acceptance Scenarios**:

1. **Given** an organization Owner or Admin, **When** they create a project with a name, **Then** the project appears in the organization's project list.
2. **Given** a project, **When** an Owner or Admin opens its Members settings and selects an organization member, **Then** that member is added to the project.
3. **Given** a standard Member, **When** they view the organization-level project list, **Then** they see only projects they have been explicitly added to.
4. **Given** an Owner or Admin, **When** they view the project list, **Then** they see all projects in the organization.
5. **Given** a standard Member, **When** they attempt to navigate to a project they are not assigned to, **Then** they are denied access and shown an appropriate message.

---

### User Story 4 — Task Management & Kanban Board (Priority: P1)

A team member creates tasks, assigns them, and moves them through the workflow on a visual board.

**Why this priority**: The Kanban board is the primary daily-use interface — the core value proposition of the product.

**Independent Test**: Open a project's board, create a task "Fix login bug" with priority High and a due date, assign it to a project member, drag it to the next column, and verify it reflects the new status.

**Acceptance Scenarios**:

1. **Given** a project's board view, **When** a user with edit access creates a task, **Then** the task appears in the default (first) column of the board.
2. **Given** a task card on the board, **When** a user opens the task detail, **Then** they can set or edit title, description, priority, due date, and assignee(s).
3. **Given** a task card, **When** a user moves it to a different column, **Then** the card visually transitions and its status is updated.
4. **Given** a project, **When** an Owner or Admin adds or renames a board column (status), **Then** the column appears on the board without a full page reload.
5. **Given** a task with an assignee, **When** any project member views the board, **Then** the assignee's identifier (name or avatar) is visible on the card.
6. **Given** a standard Member, **When** they view the board, **Then** they can create and edit tasks but cannot add new members or modify column configuration.
7. **Given** the board is open in two browser sessions, **When** one session moves a card, **Then** the other session reflects the change within 2 seconds.

---

### User Story 5 — Document Editing (Priority: P2)

A team member creates and edits rich-text documents within a project.

**Why this priority**: Documents enhance project context and are a defined P2 feature in the backend spec. They are secondary to the operational task-management flow.

**Independent Test**: Open a project, create a document "Meeting Notes", acquire the edit lock, type content, save, and verify the content persists after refreshing the page.

**Acceptance Scenarios**:

1. **Given** a project's documents list, **When** a user creates a document "Architecture Overview", **Then** it appears in the list and can be opened.
2. **Given** an unlocked document, **When** a user clicks "Edit", **Then** they acquire the lock, the WYSIWYG editor becomes active, and other users see the document as locked.
3. **Given** a locked document belonging to another user, **When** a second user attempts to edit it, **Then** they see a clear message indicating who holds the lock and that editing is unavailable.
4. **Given** a user actively editing a document, **When** they save or explicitly release the lock, **Then** the lock is released and the updated content is visible to all users.
5. **Given** a user viewing a document they cannot edit (locked or no permission), **When** they open it, **Then** they see the document content in read-only mode without the editing toolbar.

---

### Edge Cases

- User with an expired or invalidated session attempts to load a protected page → they are redirected to the sign-in screen.
- A user is removed from a project while viewing its board → they are redirected to the organization home with an appropriate notification.
- A user attempts to assign a task to someone not in the project → the assignee picker only shows project members; the backend rejects out-of-scope selections.
- A document lock times out while the user is still in the editor → the user is notified, their unsaved changes are preserved locally, and they must re-acquire the lock to save.
- A board column is deleted while a task with that status is open → the task's status is surfaced as "Unknown" until the user reassigns it.

---

## Requirements _(mandatory)_

### Functional Requirements

**Authentication**

- **FR-001**: The application MUST display a sign-in screen as the entry point for unauthenticated users.
- **FR-002**: The application MUST provide a registration flow for new users.
- **FR-003**: The application MUST persist the authenticated session across page refreshes and silently renew it without forcing the user to re-login mid-session. Access tokens MUST be stored in client memory only (never in localStorage or sessionStorage). Refresh tokens are exchanged via the POST /auth/refresh endpoint and stored in HTTP-only cookies.
- **FR-004**: The application MUST redirect unauthenticated users to the sign-in screen when they navigate to any protected route.

**Organization**

- **FR-005**: The application MUST provide an onboarding flow for a newly registered user who does not yet belong to an organization, guiding them to create one.
- **FR-006**: The application MUST show a Members page listing all members of the current organization with their roles.
- **FR-007**: The application MUST allow Owners and Admins to invite new members by email from the Members page.
- **FR-008**: The application MUST hide or disable invitation controls for standard Members.

**Projects**

- **FR-009**: The application MUST display an organization-level Projects list.
- **FR-010**: The application MUST allow Owners and Admins to create new projects from the Projects list.
- **FR-011**: The application MUST restrict the Projects list for standard Members to only projects they are assigned to.
- **FR-012**: The application MUST provide a project Settings page where Owners and Admins can add or remove project members.

**Tasks & Kanban Board**

- **FR-013**: The application MUST render a Kanban board as the primary view inside a project, with tasks displayed as cards grouped by status column.
- **FR-014**: The application MUST allow users to create tasks from the board view, capturing at minimum: title, description, priority (LOW / MEDIUM / HIGH / URGENT, default MEDIUM), due date, and assignee(s).
- **FR-015**: The application MUST allow users to move tasks between columns via drag-and-drop or an explicit status selector.
- **FR-016**: The application MUST allow Owners and Admins to add, rename, and reorder board columns (statuses) within a project.
- **FR-017**: The application MUST reflect board changes made by other users within 2 seconds without requiring a manual page refresh. This MUST be implemented via a WebSocket (Socket.io) connection; the client joins a room scoped to the current project board on page load and leaves it on navigation away.
- **FR-018**: The application MUST show assignee information (name or avatar) and a color-coded priority badge on each task card. Tasks with a due date MUST also display a due date badge on the card.

**Documents**

- **FR-019**: The application MUST display a Documents list within each project.
- **FR-020**: The application MUST allow users to create new documents from the Documents list.
- **FR-021**: The application MUST open a Tiptap WYSIWYG rich-text editor when a user acquires the edit lock on a document. The editor MUST read and write Tiptap's JSON document format, which is the format the backend persists in its JSONB column.
- **FR-022**: The application MUST show a clear locked state on a document that is being edited by another user, displaying the name of the lock holder.
- **FR-023**: The application MUST display documents in read-only mode for users who do not hold the lock.
- **FR-024**: The application MUST release the document lock upon explicit save or user-initiated unlock.

**Role-Aware UI**

- **FR-025**: The application MUST hide or disable any UI control whose corresponding action the current user is not permitted to perform, based on their role in the current organization or project.

### Key Entities

- **User**: Authenticated person with a name and email; interacts with all features.
- **Organization**: Top-level workspace; has a name, an Owner, and a list of Members with roles.
- **Project**: Named container within an Organization; has a member list and configurable board columns.
- **Task**: Unit of work within a Project; has title, description, priority, due date, status (column), and assignee(s).
- **Document**: Rich-text content resource within a Project; has a title, body content, and an optional lock holder.
- **Member**: A User's association to an Organization or Project, carrying a role (Owner / Admin / Member).

---

## Success Criteria _(mandatory)_

- **SC-001**: The complete flow — sign in → open organization → create project → create task — takes fewer than 10 user interactions in total.
- **SC-002**: Moving a task card on the Kanban board is reflected in other open sessions within 2 seconds.
- **SC-003**: All screens correctly reflect the user's role: controls the user cannot use are never presented to them (zero role leakage in the UI).
- **SC-004**: Document lock state is visible without ambiguity — a user always knows whether a document is editable and, if not, who holds the lock.
- **SC-005**: The application remains navigable and shows a meaningful error state when the backend is unreachable, without crashing or displaying a blank screen.

---

## Explicit Out of Scope

The following capabilities are confirmed out of scope for this frontend phase, consistent with backend research open questions:

- **Task assignment notifications** — no in-app or email notification UI; deferred to a future iteration.
- **File attachments** — no file upload to tasks or documents; deferred to a future feature.
- **Document version history** — no revision timeline or diff view; deferred to a future iteration.
- **Multi-organization switching** — a user belongs to exactly one organization in this phase; org-switcher UI is not required.

---

## Assumptions

- The backend REST API is the sole data source; no client-side offline capability is required in this phase.
- Authentication uses short-lived access tokens and long-lived refresh tokens as implemented by the backend; the frontend manages token renewal transparently.
- A single user belongs to exactly one organization in the current scope (multi-org switching is out of scope).
- Custom board column ordering is persisted by the backend; the frontend only needs to render columns and send reorder commands.
- Email invitation delivery is handled entirely by the backend; the frontend only submits the email address and displays a confirmation.
