import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './lib/db';
import { errorHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validateRequest';
import { jwtAuth } from './middleware/jwtAuth';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import readinessRoutes from './routes/readiness';
import roadmapRoutes from './routes/roadmap';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Auth routes
app.use('/api/auth', authRoutes);
// AI chat endpoint
app.use('/api/chat', chatRoutes);
// Readiness routes
app.use('/api/readiness', readinessRoutes);
// Roadmap routes
app.use('/api/roadmaps', roadmapRoutes);

// MongoDB connection
connectDB();

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Example protected route (commented out)
// app.get('/protected', jwtAuth, (req, res) => {
//   res.json({ message: 'Protected route' });
// });

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on port ${PORT}`);
});
