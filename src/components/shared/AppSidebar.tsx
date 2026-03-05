'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/hooks/useAuthStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Avatar } from '@/components/shared/Avatar';
import { OrgSwitcher } from '@/components/shared/OrgSwitcher';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/features/auth/signOut';

const NAV_ITEMS = [{ label: 'Projects', href: '/dashboard', icon: FolderKanban }] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { canDo } = usePermissions();

  return (
    <Sidebar collapsible="icon">
      {/* Header — OrgSwitcher */}
      <SidebarHeader className="border-b">
        <OrgSwitcher />
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href || pathname.startsWith(href + '/')}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {canDo('editOrgSettings') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/org')}
                    tooltip="Organization Settings"
                  >
                    <Link href="/org/settings">
                      <Settings />
                      <span>Organization Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user info */}
      {user && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" className="hover:bg-transparent">
                      <Avatar name={user.name} className="size-8 shrink-0" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-44">
                    <DropdownMenuItem onSelect={() => void signOut()}>
                      <LogOut className="mr-2 size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
