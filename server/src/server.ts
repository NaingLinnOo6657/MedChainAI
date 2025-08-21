import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { RATE_LIMIT_CONFIG, HTTP_STATUS } from './utils/constants';
import { authRoutes } from './routes/auth';
import { patientRoutes } from './routes/patient';
import { doctorRoutes } from './routes/doctor';
import { researcherRoutes } from './routes/researcher';
import { adminRoutes } from './routes/admin';
import { blockchainRoutes } from './routes/blockchain';
import { aiRoutes } from './routes/ai';
import { healthRoutes } from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/researcher', researcherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`MedChain AI Backend server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

export default app;