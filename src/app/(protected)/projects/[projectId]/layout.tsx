'use client';

import { use } from 'react';
import { useProject } from '@/features/projects/hooks/useProject';
import { AccessDeniedPage } from '@/features/projects/AccessDeniedPage';
import { ProjectLayout } from '@/features/projects/ProjectLayout';
import { ProjectContext } from '@/features/projects/ProjectContext';

interface ProjectGuardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default function ProjectGuardLayout({ children, params }: ProjectGuardLayoutProps) {
  const { projectId } = use(params);
  const { data: project, isError, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !project) {
    return <AccessDeniedPage />;
  }

  return (
    <ProjectContext.Provider value={{ project }}>
      <ProjectLayout project={project}>{children}</ProjectLayout>
    </ProjectContext.Provider>
  );
}
