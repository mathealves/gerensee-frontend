import apiClient from '@/api/client';
import type { Organization, OrganizationWithRole, Member, MemberRole } from '@/types';

export interface UpdateOrganizationPayload {
  name: string;
}

export interface AddMemberPayload {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRolePayload {
  role: MemberRole;
}

export async function getOrganization(id: string): Promise<OrganizationWithRole> {
  const { data } = await apiClient.get<OrganizationWithRole>(`/organizations/${id}`);
  return data;
}

export async function listOrganizations(): Promise<OrganizationWithRole[]> {
  const { data } = await apiClient.get<OrganizationWithRole[]>('/organizations');
  return data;
}

export async function createOrganization(
  payload: UpdateOrganizationPayload,
): Promise<OrganizationWithRole> {
  const { data } = await apiClient.post<OrganizationWithRole>('/organizations', payload);
  return data;
}

export async function updateOrganization(
  id: string,
  payload: UpdateOrganizationPayload,
): Promise<Organization> {
  const { data } = await apiClient.patch<Organization>(`/organizations/${id}`, payload);
  return data;
}

export async function listMembers(organizationId: string): Promise<Member[]> {
  const { data } = await apiClient.get<Member[]>(`/organizations/${organizationId}/members`);
  return data;
}

export async function addMember(
  organizationId: string,
  payload: AddMemberPayload,
): Promise<Member> {
  const { data } = await apiClient.post<Member>(
    `/organizations/${organizationId}/members`,
    payload,
  );
  return data;
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  payload: UpdateMemberRolePayload,
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(
    `/organizations/${organizationId}/members/${memberId}`,
    payload,
  );
  return data;
}

export async function removeMember(organizationId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
}
