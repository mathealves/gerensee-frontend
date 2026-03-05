import { useQuery } from '@tanstack/react-query';
import { listOrganizations } from '@/api/organizations';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
  });
}
