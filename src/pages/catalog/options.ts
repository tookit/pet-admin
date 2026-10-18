import type { ProductStatus, ProductType } from '@/types/api';

export const PRODUCT_STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'archived', label: 'Archived' },
];

// Status colours follow design.md §8: mint = on sale, gold = needs attention,
// neutral = lifecycle states. Rendered as light pill + dot, never a solid Tag.
export type StatusTone = 'active' | 'warning' | 'muted' | 'danger' | 'info';

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'muted' },
  active: { label: 'Active', tone: 'active' },
  discontinued: { label: 'Discontinued', tone: 'warning' },
  archived: { label: 'Archived', tone: 'muted' },
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
