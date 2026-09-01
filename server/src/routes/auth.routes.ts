import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const authRouter = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Previše pokušaja. Pokušajte ponovo kasnije.',
  },
});

authRouter.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  authController.register,
);

authRouter.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login,
);

authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
authRouter.patch(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword,
);
