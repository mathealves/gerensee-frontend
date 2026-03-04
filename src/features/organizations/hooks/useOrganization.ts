import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '@/api/organizations';
import { useAuthStore } from '@/hooks/useAuthStore';

export function useOrganization() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => getOrganization(orgId!),
    enabled: !!orgId,
  });
}
