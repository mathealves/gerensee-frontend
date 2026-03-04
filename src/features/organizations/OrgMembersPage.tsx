'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  useOrgMembers,
  useAddMember,
  useRemoveMember,
} from '@/features/organizations/hooks/useOrgMembers';
import { Avatar } from '@/components/shared/Avatar';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { MemberRole } from '@/types';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER'] as const),
});
type InviteForm = z.infer<typeof inviteSchema>;

const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_VARIANTS: Record<MemberRole, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
};

export function OrgMembersPage() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? '';
  const { data: members = [], isLoading } = useOrgMembers();
  const addMember = useAddMember(orgId);
  const removeMember = useRemoveMember(orgId);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  });

  async function onInvite(values: InviteForm) {
    setInviteError(null);
    try {
      await addMember.mutateAsync(values);
      form.reset();
    } catch {
      setInviteError('Failed to invite member. Check the email and try again.');
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Members</h1>
        <p className="mt-1 text-muted-foreground">Manage your organization members</p>
      </div>

      {/* Invite form — shown only to OWNER/ADMIN */}
      <RoleGuard action="inviteMember">
        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Invite member</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInvite)} className="flex gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input type="email" placeholder="colleague@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? 'Inviting…' : 'Invite'}
              </Button>
            </form>
          </Form>
          {inviteError && <p className="mt-2 text-sm text-destructive">{inviteError}</p>}
        </div>
      </RoleGuard>

      {/* Member list */}
      <div className="space-y-2">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Avatar name={member.user.name} size="md" />
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={ROLE_VARIANTS[member.role]}>{ROLE_LABELS[member.role]}</Badge>
              <RoleGuard action="inviteMember">
                {member.role !== 'OWNER' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember.mutate(member.id)}
                    disabled={removeMember.isPending}
                  >
                    Remove
                  </Button>
                )}
              </RoleGuard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
