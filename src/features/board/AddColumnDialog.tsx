'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { useCreateTaskStatus } from '@/features/projects/hooks/useTaskStatuses';

const addColumnSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().optional(),
});
type AddColumnForm = z.infer<typeof addColumnSchema>;

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AddColumnDialog({ open, onOpenChange, projectId }: AddColumnDialogProps) {
  const createStatus = useCreateTaskStatus(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddColumnForm>({ resolver: zodResolver(addColumnSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createStatus.mutateAsync(values);
      toast.success('Column added');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add column');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="col-name">Name</Label>
            <Input id="col-name" placeholder="e.g. In Review" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="col-color">Color (hex, optional)</Label>
            <Input id="col-color" placeholder="#6366f1" {...register('color')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStatus.isPending}>
              {createStatus.isPending ? 'Creating…' : 'Add Column'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
