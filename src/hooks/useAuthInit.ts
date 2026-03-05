'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

/**
 * Runs once on mount to silently restore the user's session from a stored
 * refresh token. This prevents hard refreshes from kicking the user back to
 * the login page as long as a valid refresh token exists in localStorage.
 *
 * Flow:
 *  1. Read refreshToken from localStorage.
 *  2. If absent → authReady immediately (no session to restore).
 *  3. Call POST /auth/refresh → get new { accessToken, refreshToken }.
 *  4. Persist the rotated refreshToken.
 *  5. Set the new accessToken in the store so subsequent API calls are
 *     authenticated.
 *  6. Call GET /auth/me to restore the user object.
 *  7. Restore currentOrg from localStorage.
 *  8. On any failure → clear stale storage, authReady (protected routes
 *     will redirect to /sign-in).
 */
export function useAuthInit(): { authReady: boolean } {
  const [authReady, setAuthReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      const storedRefreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (!storedRefreshToken) {
        setAuthReady(true);
        return;
      }

      try {
        const { refreshAccessToken, getMe } = await import('@/api/auth');

        const { accessToken, refreshToken } = await refreshAccessToken();

        // Persist the rotated refresh token before making further calls
        localStorage.setItem('refreshToken', refreshToken);

        // Temporarily write the access token into the store so the Axios
        // request interceptor can attach it to the upcoming /auth/me call.
        useAuthStore.setState({ accessToken });

        const user = await getMe();

        const currentOrg = (() => {
          try {
            const raw = localStorage.getItem('currentOrg');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        setAuth({ user, accessToken, currentOrg });
      } catch {
        // Refresh token is expired or invalid — clear stale data.
        // Protected routes will detect the missing user and redirect to /sign-in.
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentOrg');
        }
      } finally {
        setAuthReady(true);
      }
    }

    init();
  }, [setAuth]);

  return { authReady };
}
