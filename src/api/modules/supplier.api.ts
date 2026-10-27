import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiSupplier,
  ApiSupplierProduct,
  SupplierCreateParams,
  SupplierProductList,
  SupplierQueryParams,
  SupplierUpdateParams,
} from '@/types/api';

export async function getSupplierList(
  params: SupplierQueryParams = {},
): Promise<PaginatedResponse<ApiSupplier>> {
  return apiRequest<PaginatedResponse<ApiSupplier>>('/suppliers', {
    params: {
      page: params.current ?? 1,
      per_page: params.pageSize ?? 10,
      name: params.name,
      platform: params.platform,
      status: params.status,
      province: params.province,
      main_category: params.main_category,
    },
  });
}

export const getSupplier = (id: number) => apiRequest<ApiSupplier>(`/suppliers/${id}`);

export const createSupplier = (data: SupplierCreateParams) =>
  apiRequest<ApiSupplier>('/suppliers', { method: 'POST', body: data });

export const updateSupplier = (id: number, data: SupplierUpdateParams) =>
  apiRequest<ApiSupplier>(`/suppliers/${id}`, { method: 'PUT', body: data });

export const deleteSupplier = (id: number) =>
  apiRequest<void>(`/suppliers/${id}`, { method: 'DELETE' });

/** Products sourced from a supplier — the purchase-order worklist. */
export const getSupplierProducts = (id: number) =>
  apiRequest<SupplierProductList>(`/suppliers/${id}/products`, {
    params: { per_page: 200 },
  });

export const linkSupplierProduct = (
  supplierId: number,
  productId: number,
  data: Partial<ApiSupplierProduct> = {},
) =>
  apiRequest<void>(`/suppliers/${supplierId}/products/${productId}`, {
    method: 'POST',
    body: data,
  });

export const unlinkSupplierProduct = (supplierId: number, productId: number) =>
  apiRequest<void>(`/suppliers/${supplierId}/products/${productId}`, {
    method: 'DELETE',
  });
