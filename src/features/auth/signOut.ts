'use client';

import { useAuthStore } from '@/hooks/useAuthStore';
import { logout } from '@/api/auth';

/**
 * Sign out the current user:
 * 1. Call backend logout endpoint
 * 2. Clear Zustand auth state
 * 3. Remove refresh token from sessionStorage
 * 4. Navigate to /sign-in
 */
export async function signOut(): Promise<void> {
  try {
    await logout();
  } catch {
    // Ignore errors — we clear local state regardless
  }
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken');
    window.location.href = '/sign-in';
  }
}
