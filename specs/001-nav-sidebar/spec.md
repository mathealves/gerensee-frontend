# Feature Specification: Navigation Sidebar & Core Navigation Pages

**Feature Branch**: `001-nav-sidebar`  
**Created**: 2026-03-04  
**Status**: Draft  
**Input**: User description: "Navigation sidebar with org switcher, projects list, org settings, and profile settings pages"

---

> **⚠ Backend Gaps — Partially Out of Scope**
>
> The following capabilities described in the original request **cannot be implemented** until corresponding backend features are built:
>
> 1. **User profile update** (change name / change password): The backend only has `GET /auth/me`. No endpoint exists to update user name or password. The profile settings page is **out of scope** here.
> 2. **Invitation pending & accept flow**: The backend `inviteMember` route directly adds users as active members — there is no invitation/pending concept in the data model. Listing pending invitations and the "accept invite" button in the org switcher are **out of scope** here.
>
> Everything else described in the request is supported by existing backend routes and is **in scope** for this spec.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Persistent Navigation Sidebar (Priority: P1)

A user who is authenticated lands on any protected page inside the application and immediately sees a sidebar that gives them access to all major sections. The sidebar is always visible (or togglable on smaller screens) and clearly indicates which section is currently active.

**Why this priority**: The sidebar is the structural foundation of the entire application shell. Without it, no navigation to inner pages is possible. Every other story depends on it.

**Independent Test**: Can be fully tested by authenticating as any user, visiting the dashboard, and verifying the sidebar renders with the expected navigation items and highlights the current route.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they visit any protected page, **Then** the sidebar is visible with navigation items: Organization Switcher, Projects, and Organization Settings (conditionally).
2. **Given** the user is on the Projects page, **When** the sidebar renders, **Then** the Projects item appears visually active/selected.
3. **Given** the user is on a small screen, **When** the page loads, **Then** the sidebar is collapsible or hidden behind a toggle without breaking the layout.
4. **Given** an authenticated user, **When** they click any sidebar item, **Then** they are taken to the corresponding page without a full-page reload.

---

### User Story 2 - Organization Switcher (Priority: P2)

A user who belongs to multiple organizations needs a way to switch their active context between organizations. The currently active organization determines which projects and settings are shown throughout the application.

**Why this priority**: Multi-organization membership is a supported business rule. Without an org switcher, users with access to more than one org are stuck and cannot navigate between them.

**Independent Test**: Can be fully tested by logging in as a user who is a member of two or more organizations and verifying the switcher lists all organizations and switches context correctly.

**Acceptance Scenarios**:

1. **Given** a user belonging to two organizations, **When** they open the org switcher in the sidebar, **Then** they see a list of all organizations they belong to, each labeled with its name and the user's role in that org.
2. **Given** the org switcher is open, **When** the user clicks a different organization, **Then** the active organization changes, the switcher closes, and all organization-scoped content updates to reflect the new org.
3. **Given** a user belonging to only one organization, **When** they open the org switcher, **Then** that single organization is shown as the active one with no other options.
4. **Given** the user has just switched organization, **When** they navigate to the Projects page, **Then** only projects belonging to the newly selected organization are shown.

---

### User Story 3 - Projects List Page (Priority: P3)

A user navigates to the Projects section and sees a list of projects for the currently active organization. Owners and admins see all projects; members see only the projects they have been explicitly added to (filtered by the backend — the frontend renders what it receives).

**Why this priority**: Projects are the central unit of work in the application. Users need a clear starting point to navigate into a project.

**Independent Test**: Can be fully tested by logging in as different role types (owner, admin, member) and verifying each sees the correct subset of projects for the active organization.

**Acceptance Scenarios**:

1. **Given** an authenticated user with the OWNER or ADMIN role, **When** they visit the Projects page, **Then** all projects in the active organization are listed.
2. **Given** an authenticated user with the MEMBER role, **When** they visit the Projects page, **Then** only projects they have been assigned to are listed.
3. **Given** there are no visible projects, **When** the user visits the Projects page, **Then** an empty state is displayed with a descriptive message.
4. **Given** projects are available, **When** the user clicks on a project card or row, **Then** they are navigated to that project's detail/board view.
5. **Given** an OWNER or ADMIN, **When** they are on the Projects page, **Then** they see the option to create a new project.

---

### User Story 4 - Organization Settings — General & Members (Priority: P4)

An organization owner or admin navigates to the Organization Settings section via the sidebar. They can update the organization's name, view the full list of current members with their roles, and invite new members by email with an assigned role.

**Why this priority**: Organization management is an admin-level capability important for ongoing operations but does not block general users from using the product.

**Independent Test**: Can be fully tested by logging in as an OWNER or ADMIN, navigating to Organization Settings, updating the org name, viewing the member list, and submitting an invite for an existing user's email.

**Acceptance Scenarios**:

1. **Given** a user with OWNER or ADMIN role, **When** they view the sidebar, **Then** an "Organization Settings" item is visible; for MEMBER role users it is absent.
2. **Given** an authorized user on the Organization Settings page, **When** the page loads, **Then** they see the current organization name in an editable field.
3. **Given** an authorized user, **When** they change the organization name and save, **Then** the updated name is reflected immediately in the sidebar, org switcher, and page headings.
4. **Given** an authorized user, **When** they view the Members section, **Then** a list of all current organization members is displayed, including each member's name, email, and role.
5. **Given** an authorized user, **When** they enter a valid email address and select a role in the Invite Member form and submit, **Then** the invited user is immediately added to the organization and the member list updates.
6. **Given** an authorized user, **When** they enter an email that does not match any registered user, **Then** an error message is shown indicating the user was not found.
7. **Given** an authorized user, **When** they enter an email of someone already in the organization, **Then** an error message is shown indicating the user is already a member.
8. **Given** a MEMBER role user, **When** they attempt to navigate directly to the Organization Settings URL, **Then** they are redirected away and no settings content is ever shown.

---

### Edge Cases

- What happens when the user's session expires mid-navigation? The sidebar should detect this and redirect to the sign-in page.
- What happens if the active organization is deleted externally while the user has it selected? The org switcher should update and the user should be redirected to the dashboard.
- What happens if the user belongs to 0 organizations? The org switcher is empty and the user should be directed to create or join one.
- What happens when the user is an OWNER of org A and ADMIN of org B — does the Organization Settings item appear correctly for each? Yes, visibility should recalculate based on the role in the currently active org.
- What if a network error occurs when loading the member list? An error state with a retry option must be shown.
- What if the user changes the org name to one that is already taken? The backend returns a conflict error that the UI must surface clearly within the settings form.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST display a persistent sidebar on all authenticated/protected pages containing navigation links to all major sections.
- **FR-002**: The sidebar MUST include an Organization Switcher component that displays all organizations the logged-in user belongs to along with their role in each.
- **FR-003**: The sidebar MUST include a Projects navigation item that navigates to the Projects List page scoped to the currently active organization.
- **FR-004**: The sidebar MUST include an Organization Settings navigation item that is visible and accessible only to users with OWNER or ADMIN role in the currently active organization.
- **FR-005**: The Organization Switcher MUST update the active organization context application-wide when the user selects a different organization.
- **FR-006**: The Projects List page MUST display the list of projects returned by the backend for the current user and active organization without any client-side role filtering.
- **FR-007**: The Projects List page MUST show an empty state when no projects are available to the user.
- **FR-008**: An OWNER or ADMIN on the Projects page MUST have access to a create new project action.
- **FR-009**: The Organization Settings page MUST allow authorized users to view and update the organization's name, with immediate visual feedback on success.
- **FR-010**: The Organization Settings page MUST display the full list of current organization members including their name, email, and role.
- **FR-011**: The Organization Settings page MUST provide a form to invite a new member by email address and role assignment.
- **FR-012**: The invite form MUST display clear, actionable error messages when the target user is not found or is already a member.
- **FR-013**: The sidebar MUST clearly indicate the currently active navigation section via visual styling.
- **FR-014**: Accessing Organization Settings as a MEMBER role user via direct URL MUST redirect the user away — settings content must never be rendered.
- **FR-015**: Switching the active organization MUST NOT require a full page reload of the application.

### Key Entities

- **Active Organization**: The organization currently selected by the user. Determines scope of all org-scoped pages (projects, settings). Persisted client-side across navigation and derived from the user's memberships list.
- **Membership**: Represents a user's belonging to an organization with a specific role (OWNER, ADMIN, MEMBER). Drives conditional visibility of sidebar items and access control for pages.
- **Project**: A unit of work within an organization. Listed on the Projects page; the backend returns only what the user is permitted to see.
- **Organization Member**: A user within an organization with a name, email, and role, as displayed in the member list on the Organization Settings page.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user belonging to three organizations can switch between all three and see the correct project list for each within 3 seconds of switching, without a full page reload.
- **SC-002**: An OWNER or ADMIN can invite a new member from the Organization Settings page in under 60 seconds from opening the settings page.
- **SC-003**: A MEMBER role user attempting to access the Organization Settings page via direct URL is redirected within 1 second, with no settings content ever rendered.
- **SC-004**: 100% of sidebar navigation items correctly highlight the current active section on all in-scope pages.
- **SC-005**: The organization name update is reflected in the sidebar, org switcher, and page headings immediately upon save, with no manual refresh required.
- **SC-006**: The Projects page loads and renders the full project list in under 2 seconds on a standard connection.
- **SC-007**: An invitation error (user not found or already a member) is surfaced within the invite form with a clear message — no silent failures.

---

## Assumptions

- The backend `GET /organizations` endpoint returns all organizations the user belongs to, each with their role (confirmed: returns `Array<Organization & { role: string }>`).
- The backend `GET /organizations/:organizationId/projects` returns a role-filtered list already — the frontend renders whatever is returned without applying its own filters.
- The currently active organization is managed client-side. The backend is stateless with regard to "active org."
- On first login, the active organization defaults to the first organization in the returned list. If a stored preference exists from a previous session, it is used.
- Inviting a member with a valid email immediately adds them as an active member. There is no pending/accept state in the current backend.
- The OWNER role provides a superset of ADMIN capabilities for the purposes of this feature's conditional visibility rules.
- The "Organization Settings" sidebar item is a single entry point to a page that contains both general settings (name) and member management (list + invite).
- Role changes for existing members (e.g., promoting/demoting) are not in scope for this feature — the member list is read-only for role display.

---

## Out of Scope (Backend Dependencies)

The following capabilities were requested but are **explicitly excluded** because the backend does not yet support them:

1. **Profile Settings page** (update name, change password): Requires a user profile update endpoint (e.g., `PATCH /auth/me`). Not implemented in the backend.
2. **Pending invitation list in Organization Settings**: Requires an `Invitation` model with a pending/accepted state. Not present in the current data model.
3. **Accept invitation flow in Organization Switcher**: Requires an invitation model and an accept endpoint. Not present in the current backend.

These items should be specified and built as backend features before a corresponding frontend spec is created.
