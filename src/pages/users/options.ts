import type { ApiUserStatus } from '@/types/api';

export const STATUS_OPTIONS = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
  { value: 2, label: 'Frozen' },
];

export const STATUS_META: Record<
  ApiUserStatus,
  { label: string; badge: 'success' | 'default' | 'error' }
> = {
  0: { label: 'Inactive', badge: 'default' },
  1: { label: 'Active', badge: 'success' },
  2: { label: 'Frozen', badge: 'error' },
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];
