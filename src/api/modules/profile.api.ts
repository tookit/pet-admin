import { apiRequest } from '@/api/client';
import type { ApiUser, UserUpdateParams } from '@/types/api';

export const getProfile = () => apiRequest<ApiUser>('/me');

export const updateProfile = (data: UserUpdateParams) =>
  apiRequest<ApiUser>('/me', { method: 'PATCH', body: data });
