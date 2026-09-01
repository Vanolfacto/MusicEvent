import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { User } from '@prisma/client';

export async function requireOrganizerProfile(user: User) {
  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    throw new AppError(404, 'Profil organizatora nije pronađen');
  }
  return profile;
}

export async function requireArtistProfile(user: User) {
  const profile = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    throw new AppError(404, 'Profil izvođača nije pronađen');
  }
  return profile;
}

export async function requireEventOwnership(organizerProfileId: number, eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new AppError(404, 'Događaj nije pronađen');
  }
  if (event.organizerId !== organizerProfileId) {
    throw new AppError(403, 'Nemate dozvolu za ovaj događaj');
  }
  return event;
}

export async function requireEventOwnershipOrAdmin(user: User, eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new AppError(404, 'Događaj nije pronađen');
  }
  if (user.role === 'ADMIN') {
    return event;
  }
  const organizer = await requireOrganizerProfile(user);
  if (event.organizerId !== organizer.id) {
    throw new AppError(403, 'Nemate dozvolu za ovaj događaj');
  }
  return event;
}
