'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/shared/Avatar';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjectContext } from '@/features/projects/ProjectContext';
import {
  useProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
} from '@/features/projects/hooks/useProject';
import { useOrgMembers } from '@/features/organizations/hooks/useOrgMembers';
import type { MemberRole } from '@/types';

const addMemberSchema = z.object({
  userId: z.string().min(1, 'Please select a member'),
});
type AddMemberForm = z.infer<typeof addMemberSchema>;

const ROLE_COLORS: Record<MemberRole, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
};

export function ProjectMembersPage() {
  const { project } = useProjectContext();

  const { data: projectMembers = [], isLoading } = useProjectMembers(project.id);
  const { data: orgMembers = [] } = useOrgMembers();
  const addMember = useAddProjectMember(project.id);
  const removeMember = useRemoveProjectMember(project.id);

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberForm>({ resolver: zodResolver(addMemberSchema) });

  // Org members not already in the project
  const projectMemberUserIds = new Set(projectMembers.map((pm) => pm.member.userId));
  const availableOrgMembers = orgMembers.filter((om) => !projectMemberUserIds.has(om.userId));

  const handleAdd = handleSubmit(async (values) => {
    try {
      await addMember.mutateAsync(values);
      toast.success('Member added');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Failed to add member');
    }
  });

  const handleRemove = async (memberId: string, name: string) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    try {
      await removeMember.mutateAsync(memberId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Project Members</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.name}</p>
        </div>
        <RoleGuard action="manageProjectMembers">
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </RoleGuard>
      </div>

      {/* Add member form */}
      {showForm && (
        <RoleGuard action="manageProjectMembers">
          <form onSubmit={handleAdd} className="rounded-lg border p-4 space-y-4 bg-muted/30">
            <h3 className="font-medium text-sm">Add from Organization</h3>
            <div className="space-y-1.5">
              <Label htmlFor="userId">Member</Label>
              <select
                id="userId"
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                {...register('userId')}
              >
                <option value="">Select a member…</option>
                {availableOrgMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
              </select>
              {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addMember.isPending}>
                {addMember.isPending ? 'Adding…' : 'Add'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  reset();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </RoleGuard>
      )}

      <Separator />

      {/* Members list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : projectMembers.length === 0 ? (
        <EmptyState
          heading="No members yet"
          description="Add organization members to collaborate on this project."
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {projectMembers.map((pm) => (
            <li key={pm.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={pm.member.user.name} className="h-8 w-8 text-xs shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pm.member.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{pm.member.user.email}</p>
              </div>
              <Badge variant={ROLE_COLORS[pm.member.role as MemberRole]}>{pm.member.role}</Badge>
              <RoleGuard action="manageProjectMembers">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRemove(pm.id, pm.member.user.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </RoleGuard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
