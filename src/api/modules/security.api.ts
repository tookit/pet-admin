import { mockApi } from '@/mocks/api';
import type { SecuritySnapshot } from '@/types';

export const getSecurity = () => mockApi.getSecurity();

export type { SecuritySnapshot };
