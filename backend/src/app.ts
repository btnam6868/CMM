import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authenticate } from './utils/auth.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import loginHistoryRoutes from './routes/login-history.js';
import apiKeysRoutes from './routes/api-keys.js';
import ideasRoutes from './routes/ideas.js';
import briefsRoutes from './routes/briefs.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }
    } : undefined
  }
});

// CORS setup
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://your-production-domain.com']
    : ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true
});

// JWT setup
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production'
});

// Add authenticate decorator
app.decorate('authenticate', authenticate);

// Register routes
await app.register(authRoutes);
await app.register(usersRoutes);
await app.register(loginHistoryRoutes);
await app.register(apiKeysRoutes);
await app.register(ideasRoutes);
await app.register(briefsRoutes);

// Health check route
app.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'content-multiplier-backend'
  };
});

// Root route
app.get('/', async (request, reply) => {
  return { 
    message: 'Content Multiplier API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  };
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  reply.status(statusCode).send({
    error: {
      message,
      statusCode
    }
  });
});

// 404 handler
app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: request.url
    }
  });
});

export default app;
