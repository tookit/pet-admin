import { apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type { ApiQuote, QuoteQueryParams } from '@/types/api';

export async function getQuoteList(
  params: QuoteQueryParams = {},
): Promise<PaginatedResponse<ApiQuote>> {
  return apiRequest<PaginatedResponse<ApiQuote>>('/quotes', {
    params: {
      page: params.current ?? 1,
      per_page: params.pageSize ?? 10,
      name: params.name,
      email: params.email,
      phone: params.phone,
      company: params.company,
    },
  });
}

export const getQuote = (id: number) => apiRequest<ApiQuote>(`/quotes/${id}`);

export const deleteQuote = (id: number) => apiRequest<void>(`/quotes/${id}`, { method: 'DELETE' });
