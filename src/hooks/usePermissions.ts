import { useAuthStore } from '@/hooks/useAuthStore';
import type { MemberRole } from '@/types';

type PermissionAction =
  | 'inviteMember'
  | 'createProject'
  | 'manageProjectMembers'
  | 'manageColumns'
  | 'editOrgSettings';

const ORG_PERMISSIONS: Record<PermissionAction, MemberRole[]> = {
  inviteMember: ['OWNER', 'ADMIN'],
  createProject: ['OWNER', 'ADMIN'],
  manageProjectMembers: ['OWNER', 'ADMIN'],
  manageColumns: ['OWNER', 'ADMIN'],
  editOrgSettings: ['OWNER', 'ADMIN'],
};

export function usePermissions() {
  const orgRole = useAuthStore((s) => s.orgRole);

  function canDo(action: PermissionAction): boolean {
    if (!orgRole) return false;
    return ORG_PERMISSIONS[action].includes(orgRole);
  }

  return { canDo };
}
