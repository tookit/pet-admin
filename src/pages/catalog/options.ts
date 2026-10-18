import type { ProductStatus, ProductType } from '@/types/api';

export const PRODUCT_STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'archived', label: 'Archived' },
];

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'default' },
  active: { label: 'Active', color: 'green' },
  discontinued: { label: 'Discontinued', color: 'orange' },
  archived: { label: 'Archived', color: 'red' },
};

export const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital' },
  { value: 'service', label: 'Service' },
];

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  physical: 'Physical',
  digital: 'Digital',
  service: 'Service',
};

export const FEATURED_OPTIONS = [
  { value: true, label: 'Featured' },
  { value: false, label: 'Not featured' },
];
