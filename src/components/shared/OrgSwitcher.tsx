'use client';

import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Check, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import type { OrganizationWithRole } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

export function OrgSwitcher() {
  const router = useRouter();
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const switchOrg = useAuthStore((s) => s.switchOrg);
  const { data: organizations, isLoading } = useOrganizations();

  function handleSelect(org: OrganizationWithRole) {
    if (org.id === currentOrg?.id) return;
    switchOrg(org);
    router.push('/dashboard');
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Building2 className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold leading-tight">
                  {currentOrg?.name ?? 'Select organization'}
                </span>
                {currentOrg && (
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[currentOrg.role] ?? currentOrg.role}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onSelect={() => handleSelect(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm bg-muted shrink-0">
                  <Building2 className="size-3.5" />
                </div>
                <div className="flex flex-1 min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ROLE_LABELS[org.role] ?? org.role}
                  </span>
                </div>
                {org.id === currentOrg?.id && <Check className="ml-auto size-4 shrink-0" />}
              </DropdownMenuItem>
            ))}

            {!organizations?.length && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No organizations found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
