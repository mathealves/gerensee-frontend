<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Added sections:
  - Core Principles (I–V)
  - Architectural Constraints
  - Implementation Standards (API Integration, Commit Granularity)
  - Development and Change Process
  - Governance
Removed sections: N/A (initial document)
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is a dynamic placeholder; no update required
  ✅ .specify/templates/spec-template.md — generic structure; no update required
  ✅ .specify/templates/tasks-template.md — generic structure; no update required
Deferred TODOs: None
-->

# Gerensee Frontend Constitution

## Core Principles

### I. Product-First, Experience-Driven

The frontend exists to serve product goals, not to demonstrate technical sophistication.

Every UI/UX decision must map to a concrete user need derived from the product specification.
Visual and interaction patterns must reduce friction, not add it.
Technology choices must be justified by product requirements or developer experience — not by trend.
The product domain is project management; the UI must make Organization → Project → Task → Document
flows feel effortless.

---

### II. API Contract as the Source of Truth

The frontend is a consumer of the backend API — not an authority on business rules.

Business rules and validations MUST be enforced by the backend; the frontend may reflect them
but must not be the sole enforcement point.
API contracts defined in the backend specifications are authoritative; any deviation in the UI
must not silently reinterpret them.
Frontend data models mirror the API response shapes — no silent transformations that obscure
domain meaning.

---

### III. Role-Aware UI Without Duplicating Authorization Logic

User roles (Owner, Admin, Member) MUST be visually reflected in the UI.

UI elements that a user does not have permission to use MUST be hidden or disabled — not merely
blocked at invocation time.
The frontend MUST NOT implement authorization logic as a security control — only as a UX aid.
Privileged operations must always be validated server-side; the UI state is not a trust boundary.
Role context must be available globally and consumed from a single authoritative source.

---

### IV. Component-First, Reuse by Default

The UI is built from composable, self-contained components.

Every UI element that appears in more than one context MUST be extracted into a shared component.
Components must be independent of a specific route or page — only composed by page or layout
components.
Shared state must flow explicitly (props, context, or store) — no implicit coupling via global
mutations.
Components must not fetch data directly; data concerns belong in dedicated hooks or query modules.

---

### V. Simplicity and Intentional Complexity

Simplicity is a first-order goal for the user and for the developer.

Start with the simplest implementation that satisfies the acceptance scenarios from the spec.
Complexity (custom hooks, global state, caching layers, optimistic updates) must be justified
by observed or anticipated real constraints.
YAGNI applies unless violating it would create structural regressions that are expensive to undo.

---

## Architectural Constraints

- The application is organized around product domains (Organizations, Projects, Tasks, Documents),
  not technical layers.
- Routing reflects the product hierarchy: organization → project → task / document.
- Side effects (API calls, authentication token management) must be isolated from pure rendering
  logic.
- Authentication state is global; all other state is scoped to the smallest viable context
  (component → feature → global).
- The Kanban board is a first-class UI concern; its rendering and interaction model must be
  treated as a core capability, not a third-party drop-in.

---

## Implementation Standards

### API Integration

All communication with the backend MUST go through a typed API client layer.

- API calls must never be made inline in components or pages; they belong in dedicated
  service or query modules.
- Responses must be typed against the backend contract schemas.
- Error states from the API must always be handled explicitly — no silent failures.
- Loading and error states are UI states and must be rendered, not ignored.

Rationale: Ensures a clean boundary between UI logic and network concerns, and makes the
API contract explicit and traceable throughout the codebase.

---

### Commit Granularity

Commits are organized by **feature slice**, not by implementation layer.

- A commit represents a complete, functional slice of work (e.g., all components + hooks +
  API calls + routing for a single user story).
- Do NOT split a feature across multiple commits by layer (e.g., "components commit" then
  "hooks commit" then "styles commit").
- A commit is ready when the feature satisfies its independent test from the frontend spec.
- Cross-cutting infrastructure (auth guard, global layout, router bootstrap) may be committed
  independently when they carry no feature-specific dependencies.

Rationale: Keeps git history meaningful and ensures each commit is a shippable, demonstrable
unit of functionality.

---

## Development and Change Process

- Every meaningful change to product scope or user interaction patterns must be accompanied
  by a written specification.
- Specifications represent intent and rationale; code represents execution.
- Past decisions are preserved for historical context and traceability.
- New decisions must not silently contradict established principles.

---

## Governance

This constitution supersedes all other frontend development guidelines and tooling-specific
instructions.

Any change to the constitution must:

- Be explicit and intentional.
- Include clear rationale.
- Describe migration or impact when applicable.

All specifications, plans, tasks, and implementations must comply with this document.
Operational guidance and tooling preferences belong in auxiliary documents, not here.

**Version**: 1.0.0 | **Ratified**: 2026-03-02 | **Last Amended**: 2026-03-02
