'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { OrgSettingsPage } from '@/features/organizations/OrgSettingsPage';

export default function OrgSettingsRoute() {
  const orgRole = useAuthStore((s) => s.orgRole);
  const router = useRouter();

  useEffect(() => {
    if (orgRole === 'MEMBER') router.push('/dashboard');
  }, [orgRole, router]);

  if (orgRole === 'MEMBER') return null;

  return <OrgSettingsPage />;
}
