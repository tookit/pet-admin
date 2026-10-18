import { API_ORIGIN, apiRequest } from '@/api/client';
import type { PaginatedResponse } from '@/types';
import type {
  ApiMedia,
  EntityMediaGroup,
  MediaQueryParams,
  MediaUploadResponse,
} from '@/types/api';

export const getMediaList = (params: MediaQueryParams = {}) =>
  apiRequest<PaginatedResponse<ApiMedia>>('/media', {
    params: {
      page: params.current ?? 1,
      per_page: params.pageSize ?? 24,
      aggregate_type: params.aggregate_type,
      filename: params.filename,
    },
  });

export const uploadMedia = (file: File, directory?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (directory) formData.append('directory', directory);
  return apiRequest<MediaUploadResponse>('/media/upload', { method: 'POST', formData });
};

export const deleteMedia = (id: number) =>
  apiRequest<{ message: string; success: boolean }>(`/media/${id}`, { method: 'DELETE' });

export const getEntityMedia = (entityType: string, entityId: number) =>
  apiRequest<EntityMediaGroup[]>(`/media/entity/${entityType}/${entityId}`);

export const syncEntityMedia = (
  entityType: string,
  entityId: number,
  mediaIds: number[],
  tag = 'gallery',
) =>
  apiRequest<{ message: string; success: boolean }>(`/media/attach/${entityType}/${entityId}`, {
    method: 'POST',
    body: { media_ids: mediaIds, tag },
  });

export const detachEntityMedia = (
  entityType: string,
  entityId: number,
  mediaId: number,
  tag?: string,
) =>
  apiRequest<{ message: string; success: boolean }>(
    `/media/detach/${entityType}/${entityId}/${mediaId}`,
    { method: 'DELETE', params: tag ? { tag } : undefined },
  );

export const setProductFeaturedImage = (productId: number, mediaId: number) =>
  apiRequest<{ id: number; url: string; featured: boolean }>(
    `/products/${productId}/images/${mediaId}/featured`,
    { method: 'PUT' },
  );

/** pet-api returns root-relative paths (`/local/image/x.png`); point them at the API host. */
export function mediaUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}
