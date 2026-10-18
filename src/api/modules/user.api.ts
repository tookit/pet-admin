import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiUser,
  ApiUserStatus,
  RegisterParams,
  UserListParams,
  UserUpdateParams,
} from '@/types/api';

/** ProTable passes `current`/`pageSize`; the API expects `page`/`per_page`. */
export interface UserQueryParams {
  current?: number;
  pageSize?: number;
  search?: string;
  status?: ApiUserStatus;
}

export async function getUserList(
  params: UserQueryParams = {},
): Promise<PaginatedResponse<ApiUser>> {
  const query: UserListParams = {
    page: params.current ?? 1,
    per_page: params.pageSize ?? 10,
    search: params.search,
    status: params.status,
  };
  return apiRequest<PaginatedResponse<ApiUser>>('/users', { params: query });
}

export const createUser = (data: RegisterParams) =>
  apiRequest<ApiUser>('/users', { method: 'POST', body: data });

export const updateUser = (id: number, data: UserUpdateParams) =>
  apiRequest<ApiUser>(`/users/${id}`, { method: 'PUT', body: data });

export const deleteUser = (id: number) => apiRequest<void>(`/users/${id}`, { method: 'DELETE' });

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  frozen: number;
}

/** Counts come from `total` on single-item pages, so tiles and table share one source. */
export async function getUserStats(): Promise<UserStats> {
  const count = async (status?: ApiUserStatus) => {
    const response = await getUserList({ pageSize: 1, status });
    return response.total;
  };
  const [total, active, inactive, frozen] = await Promise.all([
    count(),
    count(1),
    count(0),
    count(2),
  ]);
  return { total, active, inactive, frozen };
}
