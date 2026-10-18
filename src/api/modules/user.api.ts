import { mockApi } from '@/mocks/api';
import type { PaginatedResponse, User, UserInput } from '@/types';

export interface UserListParams {
  current?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

/**
 * Filtering and pagination happen client-side against the mock. When a real backend
 * arrives, keep the `PaginatedResponse` contract and forward these params instead.
 */
export async function getUserList(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const allUsers = await mockApi.getUsers();
  const filteredUsers = allUsers.filter(
    (user) =>
      (!params.name || user.name.toLowerCase().includes(params.name.trim().toLowerCase())) &&
      (!params.email || user.email.toLowerCase().includes(params.email.trim().toLowerCase())) &&
      (!params.role || user.role === params.role) &&
      (!params.status || user.status === params.status),
  );
  const page = params.current ?? 1;
  const perPage = params.pageSize ?? 10;

  return {
    result: filteredUsers.slice((page - 1) * perPage, page * perPage),
    total: filteredUsers.length,
    page,
    per_page: perPage,
  };
}

export const saveUser = (input: UserInput) => mockApi.saveUser(input);

export const deleteUser = (id: number) => mockApi.deleteUser(id);
export const getAllUsers = () => mockApi.getUsers();
