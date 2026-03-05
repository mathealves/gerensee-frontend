'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, FolderKanban } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOrganization } from '@/features/organizations/hooks/useOrganization';
import { useProjects, useCreateProject } from '@/features/organizations/hooks/useProjects';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});
type CreateProjectForm = z.infer<typeof createProjectSchema>;

export function DashboardPage() {
  const router = useRouter();
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const { data: org } = useOrganization();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();

  const orgName = org?.name ?? currentOrg?.name ?? '';

  const [showDialog, setShowDialog] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectForm>({ resolver: zodResolver(createProjectSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const project = await createProject.mutateAsync(values);
      toast.success('Project created');
      reset();
      setShowDialog(false);
      router.push(`/projects/${project.id}/board`);
    } catch {
      toast.error('Failed to create project');
    }
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            {orgName ? `Projects in ${orgName}` : 'Your projects'}
          </p>
        </div>
        {org && (
          <Badge variant="secondary" className="text-xs mt-1">
            {org.role}
          </Badge>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <RoleGuard action="createProject">
            <Button size="sm" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </RoleGuard>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <EmptyState
            heading="No projects yet"
            description="Create a project to get started with task management."
            ctaLabel="Create Project"
            onCta={() => setShowDialog(true)}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}/board`}
                  className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <FolderKanban className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create Project Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name</Label>
              <Input id="proj-name" placeholder="e.g. Q1 Roadmap" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description (optional)</Label>
              <Input
                id="proj-desc"
                placeholder="Short project description"
                {...register('description')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? 'Creating…' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
