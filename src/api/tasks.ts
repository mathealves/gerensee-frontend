import apiClient from '@/api/client';
import type { Task, TaskPriority, BoardColumn, TaskAssignment } from '@/types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  statusId: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  statusId?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskFilters {
  statusId?: string;
  priority?: TaskPriority;
  assignedToMe?: boolean;
}

export interface BoardResponse {
  project: { id: string; name: string };
  columns: BoardColumn[];
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function listTasks(projectId: string, filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.statusId) params.set('statusId', filters.statusId);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.assignedToMe) params.set('assignedToMe', 'true');

  const query = params.toString();
  const { data } = await apiClient.get<Task[]>(
    `/projects/${projectId}/tasks${query ? `?${query}` : ''}`,
  );
  return data;
}

export async function getBoard(projectId: string): Promise<BoardResponse> {
  const { data } = await apiClient.get<BoardResponse>(`/projects/${projectId}/board`);
  return data;
}

export async function createTask(projectId: string, payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
}

export async function getTask(taskId: string): Promise<Task> {
  const { data } = await apiClient.get<Task>(`/tasks/${taskId}`);
  return data;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
  return data;
}

export async function moveTask(taskId: string, statusId: string): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, { statusId });
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}

// ── Assignments ───────────────────────────────────────────────────────────────

export async function assignTask(taskId: string, userId: string): Promise<TaskAssignment> {
  const { data } = await apiClient.post<TaskAssignment>(`/tasks/${taskId}/assign`, { userId });
  return data;
}

export async function unassignTask(taskId: string, assignmentId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/assignments/${assignmentId}`);
}
