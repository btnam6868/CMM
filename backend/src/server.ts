import 'dotenv/config';
import app from './app.js';
import pool from './config/database.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0'; // Important for Docker

const start = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    app.log.info('✅ Database connection established');

    // Start server
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Server listening on http://${HOST}:${PORT}`);
    
  } catch (err) {
    app.log.error(err as any);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  app.log.info('🛑 Shutting down gracefully...');
  try {
    await app.close();
    await pool.end();
    app.log.info('✅ Server closed successfully');
    process.exit(0);
  } catch (err) {
    app.log.error('Error during shutdown:', err as any);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

start();
