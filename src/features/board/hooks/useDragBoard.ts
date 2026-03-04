'use client';

import { useState, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { moveTask } from '@/api/tasks';
import { reorderTaskStatuses } from '@/api/projects';
import type { BoardColumn, Task } from '@/types';

interface UseDragBoardOptions {
  projectId: string;
  columns: BoardColumn[];
  boardQueryKey: unknown[];
}

export function useDragBoard({ projectId, columns, boardQueryKey }: UseDragBoardOptions) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task as Task);
      setActiveColumnId(null);
    } else if (active.data.current?.type === 'column') {
      setActiveColumnId(active.id as string);
      setActiveTask(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setActiveColumnId(null);

      if (!over || active.id === over.id) return;

      // ── Task drag ──────────────────────────────────────────────────────────
      if (active.data.current?.type === 'task') {
        const task = active.data.current.task as Task;
        const targetColumnId = over.data.current?.columnId ?? (over.id as string);

        if (task.statusId === targetColumnId) return;

        // Optimistic update
        queryClient.setQueryData(boardQueryKey, (prev: { columns: BoardColumn[] } | undefined) => {
          if (!prev) return prev;
          const colsWithout = prev.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== task.id),
          }));
          return {
            ...prev,
            columns: colsWithout.map((col) =>
              col.id === targetColumnId
                ? { ...col, tasks: [...col.tasks, { ...task, statusId: targetColumnId }] }
                : col,
            ),
          };
        });

        // Server update
        try {
          await moveTask(task.id, targetColumnId);
        } catch {
          // Revert on error
          queryClient.invalidateQueries({ queryKey: boardQueryKey });
        }
        return;
      }

      // ── Column drag ────────────────────────────────────────────────────────
      if (active.data.current?.type === 'column') {
        const activeIdx = columns.findIndex((c) => c.id === active.id);
        const overIdx = columns.findIndex((c) => c.id === over.id);
        if (activeIdx === -1 || overIdx === -1) return;

        const newOrder = [...columns];
        const [moved] = newOrder.splice(activeIdx, 1);
        newOrder.splice(overIdx, 0, moved);

        // Optimistic update
        queryClient.setQueryData(boardQueryKey, (prev: { columns: BoardColumn[] } | undefined) => {
          if (!prev) return prev;
          return { ...prev, columns: newOrder };
        });

        try {
          await reorderTaskStatuses(projectId, { orderedIds: newOrder.map((c) => c.id) });
        } catch {
          queryClient.invalidateQueries({ queryKey: boardQueryKey });
        }
      }
    },
    [columns, projectId, queryClient, boardQueryKey],
  );

  return { activeTask, activeColumnId, handleDragStart, handleDragEnd };
}
