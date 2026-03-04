'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { OnboardingPage } from '@/features/auth/OnboardingPage';

export default function OnboardingRoute() {
  const { currentOrg } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (currentOrg !== null) router.push('/dashboard');
  }, [currentOrg, router]);

  if (currentOrg !== null) return null;

  return <OnboardingPage />;
}
