import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const eventIdParamSchema = z.object({
  eventId: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const userStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED', 'INACTIVE']),
});

export const organizerUpdateSchema = z.object({
  organizationName: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  city: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
});

export const artistUpdateSchema = z.object({
  stageName: z.string().trim().min(2).max(100).optional(),
  biography: z.string().trim().max(3000).optional().nullable(),
  city: z.string().trim().min(2).max(100).optional(),
  artistType: z.enum(['SOLO', 'BAND', 'DJ']).optional(),
  memberCount: z.coerce.number().int().min(1).max(50).optional(),
  minimumFee: z.coerce.number().min(0).optional(),
  maximumFee: z.coerce.number().min(0).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  spotifyUrl: z.string().url().optional().nullable().or(z.literal('')),
  youtubeUrl: z.string().url().optional().nullable().or(z.literal('')),
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  genreIds: z.array(z.coerce.number().int().positive()).optional(),
}).superRefine((data, ctx) => {
  if (data.minimumFee !== undefined && data.maximumFee !== undefined && data.minimumFee > data.maximumFee) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Minimalni honorar ne može biti veći od maksimalnog',
      path: ['minimumFee'],
    });
  }
});

export const artistFilterSchema = paginationSchema.extend({
  city: z.string().optional(),
  genreId: z.coerce.number().int().positive().optional(),
  artistType: z.enum(['SOLO', 'BAND', 'DJ']).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  isAvailable: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const eventBaseSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  eventType: z.enum(['CONCERT', 'FESTIVAL', 'PRIVATE_PARTY', 'WEDDING', 'CORPORATE', 'CLUB_NIGHT', 'OTHER']),
  city: z.string().trim().min(2).max(100),
  venue: z.string().trim().min(2).max(200),
  address: z.string().trim().max(300).optional().nullable(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  expectedAudience: z.coerce.number().int().min(1).max(100000),
  minimumBudget: z.coerce.number().min(0),
  maximumBudget: z.coerce.number().min(0),
  preferredArtistType: z.enum(['SOLO', 'BAND', 'DJ']),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  genreIds: z.array(z.coerce.number().int().positive()).min(1),
});

function validateEventDates<T extends { startDateTime?: Date; endDateTime?: Date; minimumBudget?: number; maximumBudget?: number }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.endDateTime && data.startDateTime && data.endDateTime <= data.startDateTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Kraj događaja mora biti posle početka',
      path: ['endDateTime'],
    });
  }
  if (
    data.minimumBudget !== undefined &&
    data.maximumBudget !== undefined &&
    data.minimumBudget > data.maximumBudget
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Minimalni budžet ne može biti veći od maksimalnog',
      path: ['minimumBudget'],
    });
  }
}

export const eventCreateSchema = eventBaseSchema.superRefine(validateEventDates);

export const eventUpdateSchema = eventBaseSchema
  .partial()
  .extend({
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
    genreIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .superRefine(validateEventDates);

export const eventFilterSchema = paginationSchema.extend({
  city: z.string().optional(),
  eventType: z.enum(['CONCERT', 'FESTIVAL', 'PRIVATE_PARTY', 'WEDDING', 'CORPORATE', 'CLUB_NIGHT', 'OTHER']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  genreId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const reviewCreateSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  artistId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const applicationApplySchema = z.object({
  eventId: z.coerce.number().int().positive(),
  message: z.string().trim().max(1000).optional(),
});

export const applicationInviteSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  artistId: z.coerce.number().int().positive(),
  message: z.string().trim().max(1000).optional(),
});

export const applicationRespondSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CANCELLED']),
});

const performanceBaseSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  artistId: z.coerce.number().int().positive(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  agreedFee: z.coerce.number().min(0),
  status: z.enum(['SCHEDULED', 'CONFIRMED']).default('SCHEDULED'),
});

function validatePerformanceDates<T extends { startDateTime?: Date; endDateTime?: Date }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.endDateTime && data.startDateTime && data.endDateTime <= data.startDateTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Kraj nastupa mora biti posle početka',
      path: ['endDateTime'],
    });
  }
}

export const performanceCreateSchema = performanceBaseSchema.superRefine(validatePerformanceDates);

export const performanceUpdateSchema = performanceBaseSchema
  .omit({ eventId: true, artistId: true })
  .partial()
  .extend({
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  })
  .superRefine(validatePerformanceDates);
