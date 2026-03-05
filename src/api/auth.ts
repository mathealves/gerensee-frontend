// Auth API module — fully implemented in T021
// Stub exists to satisfy TypeScript forward reference in src/api/client.ts

import apiClient from '@/api/client';
import type { User, OrganizationWithRole } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  organization?: OrganizationWithRole;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}
