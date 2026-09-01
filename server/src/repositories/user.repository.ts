import type { User, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const userRepository = {
  findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  updateStatus(id: number, status: User['status']): Promise<User> {
    return prisma.user.update({ where: { id }, data: { status } });
  },
};
