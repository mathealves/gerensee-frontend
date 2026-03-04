import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMembers,
  addMember,
  removeMember,
  updateMemberRole,
  type AddMemberPayload,
  type UpdateMemberRolePayload,
} from '@/api/organizations';
import { useAuthStore } from '@/hooks/useAuthStore';

export function useOrgMembers() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => listMembers(orgId!),
    enabled: !!orgId,
  });
}

export function useAddMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => addMember(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
    },
  });
}

export function useRemoveMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(organizationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
    },
  });
}

export function useUpdateMemberRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: UpdateMemberRolePayload }) =>
      updateMemberRole(organizationId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
    },
  });
}
