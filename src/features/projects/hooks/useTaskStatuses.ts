import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTaskStatuses,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
  reorderTaskStatuses,
} from '@/api/projects';
import type {
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
  ReorderTaskStatusesPayload,
} from '@/api/projects';

export function useTaskStatuses(projectId: string) {
  return useQuery({
    queryKey: ['task-statuses', projectId],
    queryFn: () => listTaskStatuses(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskStatusPayload) => createTaskStatus(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-statuses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    },
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ statusId, payload }: { statusId: string; payload: UpdateTaskStatusPayload }) =>
      updateTaskStatus(projectId, statusId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-statuses', projectId] });
    },
  });
}

export function useDeleteTaskStatus(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statusId: string) => deleteTaskStatus(projectId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-statuses', projectId] });
    },
  });
}

export function useReorderTaskStatuses(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderTaskStatusesPayload) => reorderTaskStatuses(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-statuses', projectId] });
    },
  });
}
