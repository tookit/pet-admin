import type { ApiUser } from '@/types/api';

/** `firstname lastname`, falling back to username. */
export function displayName(user: ApiUser | null): string {
  if (!user) return '';
  return [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username;
}
