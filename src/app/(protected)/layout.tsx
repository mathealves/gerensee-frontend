'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Providers } from '@/lib/Providers';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/sign-in');
    }
  }, [user, accessToken, router]);

  // Prevent flash before redirect
  if (!user || !accessToken) return null;

  return <Providers>{children}</Providers>;
}
