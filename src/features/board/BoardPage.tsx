'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { EmptyState } from '@/components/shared/EmptyState';
import { BoardColumn } from '@/features/board/BoardColumn';
import { TaskCard } from '@/features/board/TaskCard';
import { TaskDetailDrawer } from '@/features/board/TaskDetailDrawer';
import { AddColumnDialog } from '@/features/board/AddColumnDialog';
import { useBoardTasks } from '@/features/board/hooks/useBoardTasks';
import { useDragBoard } from '@/features/board/hooks/useDragBoard';
import { useProjectContext } from '@/features/projects/ProjectContext';
import { createTask } from '@/api/tasks';
import { useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/types';

export function BoardPage() {
  const { project } = useProjectContext();
  const queryClient = useQueryClient();

  const { columns, isLoading, isError, queryKey } = useBoardTasks(project.id);

  const { activeTask, handleDragStart, handleDragEnd } = useDragBoard({
    projectId: project.id,
    columns,
    boardQueryKey: queryKey,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatusId, setDefaultStatusId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const openNewTask = (statusId: string) => {
    setSelectedTask(null);
    setDefaultStatusId(statusId);
    setDrawerOpen(true);
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setDefaultStatusId(task.statusId);
    setDrawerOpen(true);
  };

  const handleQuickCreate = async (statusId: string, title: string) => {
    try {
      await createTask(project.id, { title, statusId });
      queryClient.invalidateQueries({ queryKey });
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <p className="text-destructive text-sm">Failed to load board. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <h1 className="font-semibold text-lg">{project.name}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => openNewTask(columns[0]?.id ?? '')}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
          <RoleGuard action="manageColumns">
            <Button size="sm" variant="outline" onClick={() => setAddColumnOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Board content */}
      {columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            heading="No columns yet"
            description="Add a column to start organizing tasks on the board."
            ctaLabel="Add Column"
            onCta={() => setAddColumnOpen(true)}
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 p-6 h-full min-w-max">
              <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    onTaskClick={openTask}
                    onQuickCreate={handleQuickCreate}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} columnId={activeTask.statusId} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task drawer */}
      <TaskDetailDrawer
        projectId={project.id}
        task={selectedTask}
        defaultStatusId={defaultStatusId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        boardQueryKey={queryKey}
      />

      {/* Add column dialog */}
      <AddColumnDialog
        open={addColumnOpen}
        onOpenChange={setAddColumnOpen}
        projectId={project.id}
      />
    </div>
  );
}
