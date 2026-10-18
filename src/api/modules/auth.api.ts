import { apiRequest } from '@/api/client';
import type { ApiUser, LoginParams, RegisterParams, TokenResponse } from '@/types/api';

export const loginAPI = (params: LoginParams) =>
  apiRequest<TokenResponse>('/login', { method: 'POST', body: params });

export const registerAPI = (params: RegisterParams) =>
  apiRequest<ApiUser>('/register', { method: 'POST', body: params });

export const getMeAPI = () => apiRequest<ApiUser>('/me');
