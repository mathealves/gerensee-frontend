import { create } from 'zustand';
import type { User, OrganizationWithRole, MemberRole } from '@/types';
import { registerAuthProvider } from '@/api/client';

interface AuthStore {
  user: User | null;
  /** Access token stored in memory only — NEVER persisted to storage */
  accessToken: string | null;
  currentOrg: OrganizationWithRole | null;
  orgRole: MemberRole | null;
  setAuth: (payload: {
    user: User;
    accessToken: string;
    currentOrg?: OrganizationWithRole | null;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  currentOrg: null,
  orgRole: null,

  setAuth: ({ user, accessToken, currentOrg = null }) =>
    set({
      user,
      accessToken,
      currentOrg,
      orgRole: currentOrg?.role ?? null,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      currentOrg: null,
      orgRole: null,
    }),
}));

/** Non-hook accessor used by the Axios interceptor. */
export function getAuthToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/** Updates only the access token in the store (used by refresh flow). */
export function setAccessToken(token: string): void {
  const state = useAuthStore.getState();
  if (state.user) {
    useAuthStore.setState({ accessToken: token });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('refreshToken', token);
    }
  }
}

/** Called by Axios interceptor on permanent auth failure. */
export function clearAuthAndRedirect(): void {
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('refreshToken');
    window.location.href = '/sign-in';
  }
}

// Register providers with Axios client (runs once at module init)
registerAuthProvider(getAuthToken, clearAuthAndRedirect, setAccessToken);
