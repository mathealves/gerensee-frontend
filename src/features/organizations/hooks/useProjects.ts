import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProjects, createProject } from '@/api/projects';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { CreateProjectPayload } from '@/api/projects';

export function useProjects() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: ['projects', orgId],
    queryFn: () => listProjects(orgId!),
    enabled: !!orgId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const orgId = currentOrg?.id;

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(orgId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
    },
  });
}
