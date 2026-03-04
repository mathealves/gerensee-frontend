// ─────────────────────────────────────────────
// Core API Entity Types
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface OrganizationWithRole extends Organization {
  role: MemberRole;
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  user: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  memberId: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    role: MemberRole;
    userId: string;
    user: Pick<User, 'id' | 'name' | 'email'>;
  };
}

export interface ProjectWithMembers extends Project {
  members: ProjectMember[];
}

export interface TaskStatus {
  id: string;
  name: string;
  position: number;
  color: string | null;
  projectId: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskAssignment {
  id: string;
  taskId: string;
  projectMemberId: string;
  assignedById: string;
  projectMember: {
    id: string;
    memberId: string;
    projectId: string;
    member: {
      id: string;
      role: MemberRole;
      userId: string;
      user: Pick<User, 'id' | 'name' | 'email'>;
    };
  };
}

// Legacy alias used by shared components
export interface TaskAssignee {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  statusId: string;
  projectId: string;
  organizationId: string;
  createdById: string;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  status: TaskStatus;
  assignments: TaskAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface TiptapDocument {
  type: 'doc';
  content: TiptapNode[];
}

export interface DocumentLock {
  id: string;
  documentId: string;
  projectMemberId: string;
  expiresAt: string;
  projectMember: {
    id: string;
    memberId: string;
    projectId: string;
    member: {
      id: string;
      userId: string;
      user: Pick<User, 'id' | 'name' | 'email'>;
    };
  };
}

export interface DocumentSummary {
  id: string;
  title: string;
  projectId: string;
  organizationId: string;
  createdById: string;
  createdBy: { id: string; name: string };
  isLocked: boolean;
  lockedBy: Pick<User, 'id' | 'name' | 'email'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: TiptapDocument | null;
  projectId: string;
  organizationId: string;
  createdById: string;
  createdBy: { id: string; name: string };
  lock: DocumentLock | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Auth State (Client-Only — Zustand)
// ─────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  currentOrg: OrganizationWithRole | null;
  orgRole: MemberRole | null;
}

// ─────────────────────────────────────────────
// UI-Only Types
// ─────────────────────────────────────────────

export type BoardColumn = {
  id: string;
  name: string;
  position: number;
  color: string | null;
  projectId: string;
  tasks: Task[];
};

export type PriorityConfig = {
  label: string;
  color: string;
  textColor: string;
};

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  LOW: { label: 'Low', color: 'bg-slate-200', textColor: 'text-slate-700' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100', textColor: 'text-blue-700' },
  HIGH: { label: 'High', color: 'bg-amber-100', textColor: 'text-amber-700' },
  URGENT: { label: 'Urgent', color: 'bg-red-100', textColor: 'text-red-700' },
};
