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
  /** Switch active organization context without affecting user or token */
  switchOrg: (org: OrganizationWithRole) => void;
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

  switchOrg: (org: OrganizationWithRole) =>
    set({
      currentOrg: org,
      orgRole: org.role,
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
  if (useAuthStore.getState().user) {
    useAuthStore.setState({ accessToken: token });
  }
}

/** Called by Axios interceptor on permanent auth failure. */
export function clearAuthAndRedirect(): void {
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentOrg');
    window.location.href = '/sign-in';
  }
}

// Register providers with Axios client (runs once at module init)
registerAuthProvider(getAuthToken, clearAuthAndRedirect, setAccessToken);
