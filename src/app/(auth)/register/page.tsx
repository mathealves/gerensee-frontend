'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { RegisterPage } from '@/features/auth/RegisterPage';

export default function RegisterRoute() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && accessToken) router.push('/dashboard');
  }, [user, accessToken, router]);

  if (user && accessToken) return null;

  return <RegisterPage />;
}
