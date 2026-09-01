import { z } from 'zod';

function optionalText(min = 2, max = 100) {
  return z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().min(min).max(max).optional(),
  );
}

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().email().max(255),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, 'Lozinka mora sadržati bar jedno veliko slovo')
      .regex(/[a-z]/, 'Lozinka mora sadržati bar jedno malo slovo')
      .regex(/[0-9]/, 'Lozinka mora sadržati bar jednu cifru'),
    role: z.enum(['ORGANIZER', 'ARTIST']),
    organizationName: optionalText(),
    city: z.string().trim().min(2).max(100).optional(),
    stageName: optionalText(),
    artistType: z.enum(['SOLO', 'BAND', 'DJ']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'ORGANIZER') {
      if (!data.organizationName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Naziv organizacije je obavezan za organizatora',
          path: ['organizationName'],
        });
      }
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Grad je obavezan za organizatora',
          path: ['city'],
        });
      }
    }

    if (data.role === 'ARTIST') {
      if (!data.stageName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Umetničko ime je obavezno za izvođača',
          path: ['stageName'],
        });
      }
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Grad je obavezan za izvođača',
          path: ['city'],
        });
      }
      if (!data.artistType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tip izvođača je obavezan',
          path: ['artistType'],
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Lozinka mora sadržati bar jedno veliko slovo')
    .regex(/[a-z]/, 'Lozinka mora sadržati bar jedno malo slovo')
    .regex(/[0-9]/, 'Lozinka mora sadržati bar jednu cifru'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
