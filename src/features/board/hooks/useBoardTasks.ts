'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoard } from '@/api/tasks';
import { useTaskStatuses } from '@/features/projects/hooks/useTaskStatuses';
import { useBoardSocket } from './useBoardSocket';
import type { BoardColumn } from '@/types';

export function useBoardTasks(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['board', projectId];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getBoard(projectId),
    enabled: !!projectId,
    select: (res) => res.columns,
  });

  const { data: statuses = [] } = useTaskStatuses(projectId);

  useBoardSocket(projectId, {
    onTaskCreated: (task) => {
      queryClient.setQueryData(queryKey, (prev: { columns: BoardColumn[] } | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === task.statusId ? { ...col, tasks: [...col.tasks, task] } : col,
          ),
        };
      });
    },
    onTaskUpdated: (task) => {
      queryClient.setQueryData(queryKey, (prev: { columns: BoardColumn[] } | undefined) => {
        if (!prev) return prev;
        // Remove from all columns, add to correct one
        const colsWithoutTask = prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== task.id),
        }));
        return {
          ...prev,
          columns: colsWithoutTask.map((col) =>
            col.id === task.statusId ? { ...col, tasks: [...col.tasks, task] } : col,
          ),
        };
      });
    },
    onTaskDeleted: (taskId) => {
      queryClient.setQueryData(queryKey, (prev: { columns: BoardColumn[] } | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          })),
        };
      });
    },
  });

  // If board data not yet loaded, build columns from statuses (empty)
  const columns: BoardColumn[] = useMemo(() => {
    if (data) return data;
    return statuses.map((s) => ({ ...s, tasks: [] }));
  }, [data, statuses]);

  return { columns, isLoading, isError, queryKey };
}
