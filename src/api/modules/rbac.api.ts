import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type { ApiPermission, ApiRole, ListParams } from '@/types/api';

export const getRoleList = (params: ListParams = {}) =>
  apiRequest<PaginatedResponse<ApiRole>>('/rbac/roles', { params });

export interface RoleCreateParams {
  name: string;
  slug: string;
  description?: string | null;
}

export const createRole = (data: RoleCreateParams) =>
  apiRequest<ApiRole>('/rbac/roles', { method: 'POST', body: data });

export const getPermissionList = (params: ListParams = {}) =>
  apiRequest<PaginatedResponse<ApiPermission>>('/rbac/permissions', { params });

export interface PermissionCreateParams {
  name: string;
  slug: string;
  description?: string | null;
}

export const createPermission = (data: PermissionCreateParams) =>
  apiRequest<ApiPermission>('/rbac/permissions', { method: 'POST', body: data });

export const assignPermissionToRole = (roleId: number, permissionId: number) =>
  apiRequest<ApiRole>(`/rbac/roles/${roleId}/permissions/${permissionId}`, { method: 'POST' });

export const removePermissionFromRole = (roleId: number, permissionId: number) =>
  apiRequest<ApiRole>(`/rbac/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' });

export const assignRoleToUser = (userId: number, roleId: number) =>
  apiRequest<ApiRole>(`/rbac/users/${userId}/roles/${roleId}`, { method: 'POST' });

export const removeRoleFromUser = (userId: number, roleId: number) =>
  apiRequest<ApiRole>(`/rbac/users/${userId}/roles/${roleId}`, { method: 'DELETE' });
