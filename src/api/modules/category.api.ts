import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiCategory,
  CategoryCreateParams,
  CategoryTree,
  CategoryUpdateParams,
  ListParams,
} from '@/types/api';

export const getCategoryList = (params: ListParams = {}) =>
  apiRequest<PaginatedResponse<ApiCategory>>('/categories', { params });

export const getCategoryTree = (includeInactive = true) =>
  apiRequest<CategoryTree[]>('/categories/tree', { params: { include_inactive: includeInactive } });

export const createCategory = (data: CategoryCreateParams) =>
  apiRequest<ApiCategory>('/categories', { method: 'POST', body: data });

export const updateCategory = (id: number, data: CategoryUpdateParams) =>
  apiRequest<ApiCategory>(`/categories/${id}`, { method: 'PUT', body: data });

export const deleteCategory = (id: number) =>
  apiRequest<void>(`/categories/${id}`, { method: 'DELETE' });

/** `parent_id` is a query parameter on this endpoint, not a body field. */
export const moveCategory = (id: number, parentId: number | null) =>
  apiRequest<ApiCategory>(`/categories/${id}/move`, {
    method: 'POST',
    params: parentId === null ? {} : { new_parent_id: parentId },
  });

/** Flatten a tree into select options, keeping the depth in the label. */
export function flattenCategories(
  nodes: CategoryTree[],
  depth = 0,
): Array<{ value: number; label: string }> {
  return nodes.flatMap((node) => [
    { value: node.id, label: `${'— '.repeat(depth)}${node.name}` },
    ...flattenCategories(node.children, depth + 1),
  ]);
}
