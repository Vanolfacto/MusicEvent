import type { User } from '@prisma/client';

type UserWithHash = User & {
  passwordHash?: string;
  artistProfile?: { id: number } | null;
  organizerProfile?: { id: number } | null;
};

export type SafeUser = Omit<User, 'passwordHash'> & {
  artistProfile?: { id: number } | null;
  organizerProfile?: { id: number } | null;
};

export function toSafeUser(user: UserWithHash): SafeUser {
  const {
    id,
    firstName,
    lastName,
    email,
    role,
    status,
    createdAt,
    updatedAt,
    artistProfile,
    organizerProfile,
  } = user;

  return {
    id,
    firstName,
    lastName,
    email,
    role,
    status,
    createdAt,
    updatedAt,
    artistProfile,
    organizerProfile,
  };
}

export function toSafeUsers(users: UserWithHash[]): SafeUser[] {
  return users.map(toSafeUser);
}
