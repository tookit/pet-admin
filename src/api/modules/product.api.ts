import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiProduct,
  ApiProductDetail,
  PriceTier,
  PriceTierCreateParams,
  ProductCreateParams,
  ProductQueryParams,
  ProductStatus,
  ProductUpdateParams,
} from '@/types/api';

export async function getProductList(
  params: ProductQueryParams = {},
): Promise<PaginatedResponse<ApiProduct>> {
  return apiRequest<PaginatedResponse<ApiProduct>>('/products', {
    params: {
      page: params.current ?? 1,
      per_page: params.pageSize ?? 10,
      search: params.search,
      status: params.status,
      type: params.type,
      is_featured: params.is_featured,
      category_id: params.category_id,
    },
  });
}

export const getProduct = (id: number) => apiRequest<ApiProductDetail>(`/products/${id}`);

export const createProduct = (data: ProductCreateParams) =>
  apiRequest<ApiProductDetail>('/products', { method: 'POST', body: data });

export const updateProduct = (id: number, data: ProductUpdateParams) =>
  apiRequest<ApiProductDetail>(`/products/${id}`, { method: 'PUT', body: data });

export const deleteProduct = (id: number) =>
  apiRequest<void>(`/products/${id}`, { method: 'DELETE' });

export const duplicateProduct = (id: number) =>
  apiRequest<ApiProductDetail>(`/products/${id}/duplicate`, { method: 'POST' });

export const getPriceTiers = (productId: number) =>
  apiRequest<PriceTier[]>(`/products/${productId}/tiers`);

export const addPriceTier = (productId: number, data: PriceTierCreateParams) =>
  apiRequest<PriceTier>(`/products/${productId}/tiers`, { method: 'POST', body: data });

export const deletePriceTier = (productId: number, tierId: number) =>
  apiRequest<void>(`/products/${productId}/tiers/${tierId}`, { method: 'DELETE' });

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
}

/** Counts come from `total` on single-item pages, so tiles and table share one source. */
export async function getProductStats(): Promise<ProductStats> {
  const count = async (status?: ProductStatus) => {
    const response = await getProductList({ pageSize: 1, status });
    return response.total;
  };
  const [total, active, draft, archived] = await Promise.all([
    count(),
    count('active'),
    count('draft'),
    count('archived'),
  ]);
  return { total, active, draft, archived };
}
