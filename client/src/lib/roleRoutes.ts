import type { UserRole } from '../types';

export const roleDashboardPath: Record<UserRole, string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  ARTIST: '/artist',
};
