import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiAttribute,
  AttributeCreateParams,
  AttributeQueryParams,
  AttributeUpdateParams,
  AttributeValue,
  AttributeValueCreateParams,
} from '@/types/api';

export const getAttributeList = (params: AttributeQueryParams = {}) =>
  apiRequest<PaginatedResponse<ApiAttribute>>('/attributes', { params });

export const getAttribute = (id: number) => apiRequest<ApiAttribute>(`/attributes/${id}`);

export const createAttribute = (data: AttributeCreateParams) =>
  apiRequest<ApiAttribute>('/attributes', { method: 'POST', body: data });

export const updateAttribute = (id: number, data: AttributeUpdateParams) =>
  apiRequest<ApiAttribute>(`/attributes/${id}`, { method: 'PUT', body: data });

export const deleteAttribute = (id: number) =>
  apiRequest<void>(`/attributes/${id}`, { method: 'DELETE' });

export const addAttributeValue = (attributeId: number, data: AttributeValueCreateParams) =>
  apiRequest<AttributeValue>(`/attributes/${attributeId}/values`, {
    method: 'POST',
    body: data,
  });

export const deleteAttributeValue = (attributeId: number, valueId: number) =>
  apiRequest<void>(`/attributes/${attributeId}/values/${valueId}`, { method: 'DELETE' });
