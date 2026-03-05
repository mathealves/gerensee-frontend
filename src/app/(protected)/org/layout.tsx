'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const orgRole = useAuthStore((s) => s.orgRole);
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (orgRole === 'MEMBER') {
      router.push('/dashboard');
    }
  }, [orgRole, router]);

  if (orgRole === 'MEMBER') return null;

  const activeTab = pathname.startsWith('/org/members') ? 'members' : 'settings';

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        {currentOrg && <p className="mt-1 text-muted-foreground">{currentOrg.name}</p>}
      </div>

      <Tabs value={activeTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="settings" asChild>
            <Link href="/org/settings">General</Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link href="/org/members">Members</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
