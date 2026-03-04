'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleGuard } from '@/components/shared/RoleGuard';
import type { ProjectWithMembers } from '@/types';

interface ProjectLayoutProps {
  project: ProjectWithMembers;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

export function ProjectLayout({ project, children }: ProjectLayoutProps) {
  const pathname = usePathname();
  const base = `/projects/${project.id}`;

  const navItems: NavItem[] = [
    { href: `${base}/board`, label: 'Board', icon: LayoutDashboard },
    { href: `${base}/documents`, label: 'Documents', icon: FileText },
    { href: `${base}/settings`, label: 'Settings', icon: Settings, requiresAdmin: true },
  ];

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:underline">
            ← Dashboard
          </Link>
          <h2 className="mt-1 font-semibold text-sm truncate" title={project.name}>
            {project.name}
          </h2>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const linkEl = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );

            if (item.requiresAdmin) {
              return (
                <RoleGuard key={item.href} action="manageColumns">
                  {linkEl}
                </RoleGuard>
              );
            }

            return linkEl;
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
