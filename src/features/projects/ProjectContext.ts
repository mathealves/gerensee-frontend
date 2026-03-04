import type { ProjectWithMembers } from '@/types';
import { createContext, useContext } from 'react';

interface ProjectContextValue {
  project: ProjectWithMembers;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used inside ProjectGuard');
  return ctx;
}
