import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type { ApiTag, ListParams, TagCreateParams, TagUpdateParams } from '@/types/api';

export const getTagList = (params: ListParams = {}) =>
  apiRequest<PaginatedResponse<ApiTag>>('/tags', { params });

export const createTag = (data: TagCreateParams) =>
  apiRequest<ApiTag>('/tags', { method: 'POST', body: data });

export const updateTag = (id: number, data: TagUpdateParams) =>
  apiRequest<ApiTag>(`/tags/${id}`, { method: 'PUT', body: data });

export const deleteTag = (id: number) => apiRequest<void>(`/tags/${id}`, { method: 'DELETE' });
