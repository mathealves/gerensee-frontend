'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useProjectContext } from '@/features/projects/ProjectContext';
import {
  useTaskStatuses,
  useCreateTaskStatus,
  useUpdateTaskStatus,
  useDeleteTaskStatus,
  useReorderTaskStatuses,
} from '@/features/projects/hooks/useTaskStatuses';
import type { TaskStatus } from '@/types';

const statusSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().optional(),
});
type StatusForm = z.infer<typeof statusSchema>;

export function ProjectSettingsPage() {
  const { project } = useProjectContext();
  const { data: statuses = [], isLoading } = useTaskStatuses(project.id);
  const createStatus = useCreateTaskStatus(project.id);
  const updateStatus = useUpdateTaskStatus(project.id);
  const deleteStatus = useDeleteTaskStatus(project.id);
  const reorderStatuses = useReorderTaskStatuses(project.id);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState<TaskStatus | null>(null);

  const addForm = useForm<StatusForm>({ resolver: zodResolver(statusSchema) });
  const editForm = useForm<StatusForm>({ resolver: zodResolver(statusSchema) });

  const handleAdd = addForm.handleSubmit(async (values) => {
    try {
      await createStatus.mutateAsync(values);
      toast.success('Status created');
      addForm.reset();
      setShowAddDialog(false);
    } catch {
      toast.error('Failed to create status');
    }
  });

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editingStatus) return;
    try {
      await updateStatus.mutateAsync({ statusId: editingStatus.id, payload: values });
      toast.success('Status updated');
      setEditingStatus(null);
    } catch {
      toast.error('Failed to update status');
    }
  });

  const handleDelete = async (status: TaskStatus) => {
    if (!confirm(`Delete status "${status.name}"? Tasks in this column will be unassigned.`))
      return;
    try {
      await deleteStatus.mutateAsync(status.id);
      toast.success('Status deleted');
    } catch {
      toast.error('Failed to delete status');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...statuses];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderStatuses.mutate({ orderedIds: newOrder.map((s) => s.id) });
  };

  const handleMoveDown = (index: number) => {
    if (index === statuses.length - 1) return;
    const newOrder = [...statuses];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderStatuses.mutate({ orderedIds: newOrder.map((s) => s.id) });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Project Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">{project.name}</p>
      </div>

      {/* Task Statuses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Task Statuses</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Status
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : statuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No statuses yet. Add one to start using the board.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {statuses.map((status, index) => (
              <li key={status.id} className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                {status.color && (
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                )}
                <span className="flex-1 text-sm font-medium">{status.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === statuses.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingStatus(status);
                      editForm.reset({ name: status.name, color: status.color ?? '' });
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(status)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Status Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Name</Label>
              <Input id="add-name" placeholder="e.g. In Review" {...addForm.register('name')} />
              {addForm.formState.errors.name && (
                <p className="text-xs text-destructive">{addForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-color">Color (hex)</Label>
              <Input id="add-color" placeholder="#6366f1" {...addForm.register('color')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createStatus.isPending}>
                {createStatus.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={!!editingStatus} onOpenChange={() => setEditingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-color">Color (hex)</Label>
              <Input id="edit-color" placeholder="#6366f1" {...editForm.register('color')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingStatus(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStatus.isPending}>
                {updateStatus.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
