import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { organizersRouter } from './routes/organizers.routes.js';
import { artistsRouter } from './routes/artists.routes.js';
import { eventsRouter } from './routes/events.routes.js';
import { applicationsRouter } from './routes/applications.routes.js';
import { performancesRouter } from './routes/performances.routes.js';
import { recommendationsRouter } from './routes/recommendations.routes.js';
import { modelRouter } from './routes/model.routes.js';
import { reviewsRouter } from './routes/reviews.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';

const app = express();

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/organizers', organizersRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/performances', performancesRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/model', modelRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
