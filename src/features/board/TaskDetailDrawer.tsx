'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/shared/Avatar';
import { createTask, updateTask, deleteTask } from '@/api/tasks';
import { useProjectMembers } from '@/features/projects/hooks/useProject';
import { useTaskStatuses } from '@/features/projects/hooks/useTaskStatuses';
import type { Task, TaskPriority } from '@/types';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional().nullable(),
  statusId: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional().nullable(),
  assigneeUserIds: z.array(z.string()).optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

interface TaskDetailDrawerProps {
  projectId: string;
  task: Task | null;
  defaultStatusId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardQueryKey: unknown[];
}

export function TaskDetailDrawer({
  projectId,
  task,
  defaultStatusId,
  open,
  onOpenChange,
  boardQueryKey,
}: TaskDetailDrawerProps) {
  const queryClient = useQueryClient();
  const { data: projectMembers = [] } = useProjectMembers(projectId);
  const { data: statuses = [] } = useTaskStatuses(projectId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      statusId: defaultStatusId ?? '',
      priority: 'LOW',
      dueDate: '',
      assigneeUserIds: [],
    },
  });

  // Populate form when editing an existing task
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        statusId: task.statusId,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        assigneeUserIds: task.assignments.map((a) => a.projectMember.member.userId),
      });
    } else {
      reset({
        title: '',
        description: '',
        statusId: defaultStatusId ?? statuses[0]?.id ?? '',
        priority: 'LOW',
        dueDate: '',
        assigneeUserIds: [],
      });
    }
  }, [task, defaultStatusId, statuses, reset]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardQueryKey });
      toast.success('Task deleted');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (task) {
        await updateTask(task.id, {
          title: values.title,
          description: values.description ?? null,
          statusId: values.statusId,
          priority: values.priority,
          dueDate: values.dueDate || null,
        });
      } else {
        await createTask(projectId, {
          title: values.title,
          description: values.description ?? undefined,
          statusId: values.statusId,
          priority: values.priority,
          dueDate: values.dueDate || undefined,
          assigneeIds: values.assigneeUserIds,
        });
      }
      queryClient.invalidateQueries({ queryKey: boardQueryKey });
      toast.success(task ? 'Task updated' : 'Task created');
      onOpenChange(false);
    } catch {
      toast.error(task ? 'Failed to update task' : 'Failed to create task');
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-5">
        <SheetHeader className="mb-4">
          <SheetTitle>{task ? 'Edit Task' : 'New Task'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Task title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <textarea
              id="desc"
              rows={3}
              placeholder="Optional description…"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('description')}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              {...register('statusId')}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              {...register('priority')}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          {/* Assignees */}
          <div className="space-y-1.5">
            <Label>Assignees</Label>
            <Controller
              name="assigneeUserIds"
              control={control}
              render={({ field }) => (
                <div className="space-y-1 max-h-40 overflow-y-auto rounded-md border p-2">
                  {projectMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-1">No project members</p>
                  ) : (
                    projectMembers.map((pm) => {
                      const userId = pm.member.userId;
                      const checked = field.value?.includes(userId) ?? false;
                      return (
                        <label
                          key={pm.id}
                          className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value ?? []), userId]);
                              } else {
                                field.onChange((field.value ?? []).filter((id) => id !== userId));
                              }
                            }}
                            className="rounded"
                          />
                          <Avatar
                            name={pm.member.user.name}
                            className="h-5 w-5 text-[8px] shrink-0"
                          />
                          <span className="text-sm">{pm.member.user.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {task && (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
