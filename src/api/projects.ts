import apiClient from '@/api/client';
import type { Project, ProjectWithMembers, ProjectMember, TaskStatus, MemberRole } from '@/types';

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export interface AddProjectMemberPayload {
  userId: string;
}

export interface CreateTaskStatusPayload {
  name: string;
  color?: string;
}

export interface UpdateTaskStatusPayload {
  name?: string;
  color?: string;
}

export interface ReorderTaskStatusesPayload {
  orderedIds: string[];
}

// ── Project CRUD ──────────────────────────────────────────────────────────────

export async function listProjects(organizationId: string): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>(`/organizations/${organizationId}/projects`);
  return data;
}

export async function createProject(
  organizationId: string,
  payload: CreateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.post<Project>(
    `/organizations/${organizationId}/projects`,
    payload,
  );
  return data;
}

export async function getProject(projectId: string): Promise<ProjectWithMembers> {
  const { data } = await apiClient.get<ProjectWithMembers>(`/projects/${projectId}`);
  return data;
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${projectId}`, payload);
  return data;
}

// ── Project Members ───────────────────────────────────────────────────────────

export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return data;
}

export async function addProjectMember(
  projectId: string,
  payload: AddProjectMemberPayload,
): Promise<ProjectMember> {
  const { data } = await apiClient.post<ProjectMember>(`/projects/${projectId}/members`, payload);
  return data;
}

export async function updateProjectMember(
  projectId: string,
  memberId: string,
  payload: { role: MemberRole },
): Promise<ProjectMember> {
  const { data } = await apiClient.patch<ProjectMember>(
    `/projects/${projectId}/members/${memberId}`,
    payload,
  );
  return data;
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
}

// ── Task Statuses ─────────────────────────────────────────────────────────────

export async function listTaskStatuses(projectId: string): Promise<TaskStatus[]> {
  const { data } = await apiClient.get<TaskStatus[]>(`/projects/${projectId}/statuses`);
  return data;
}

export async function createTaskStatus(
  projectId: string,
  payload: CreateTaskStatusPayload,
): Promise<TaskStatus> {
  const body: CreateTaskStatusPayload = {
    name: payload.name,
    ...(payload.color ? { color: payload.color } : {}),
  };
  const { data } = await apiClient.post<TaskStatus>(`/projects/${projectId}/statuses`, body);
  return data;
}

export async function updateTaskStatus(
  projectId: string,
  statusId: string,
  payload: UpdateTaskStatusPayload,
): Promise<TaskStatus> {
  const { data } = await apiClient.patch<TaskStatus>(
    `/projects/${projectId}/statuses/${statusId}`,
    payload,
  );
  return data;
}

export async function deleteTaskStatus(projectId: string, statusId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/statuses/${statusId}`);
}

export async function reorderTaskStatuses(
  projectId: string,
  payload: ReorderTaskStatusesPayload,
): Promise<TaskStatus[]> {
  const { data } = await apiClient.patch<TaskStatus[]>(
    `/projects/${projectId}/statuses/reorder`,
    payload,
  );
  return data;
}
