'use client';

import { usePermissions } from '@/hooks/usePermissions';

type PermissionAction =
  | 'inviteMember'
  | 'createProject'
  | 'manageProjectMembers'
  | 'manageColumns'
  | 'editOrgSettings';

interface RoleGuardProps {
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ action, children, fallback = null }: RoleGuardProps) {
  const { canDo } = usePermissions();
  if (!canDo(action)) return <>{fallback}</>;
  return <>{children}</>;
}
