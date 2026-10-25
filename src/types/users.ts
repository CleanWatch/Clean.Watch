export type UserRole = 'user' | 'admin';

export interface User {
  uid: string;
  email?: string | null;
  username: string;
  photoUrl: string;
  role: UserRole;
  battletag?: string;
  /** ISO */
  createdAt: string;
}
