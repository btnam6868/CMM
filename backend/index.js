require('dotenv').config();
const Fastify = require('fastify');
const { Pool } = require('pg');

const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;

const fastify = Fastify({ logger: true });

let pool = null;
if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL });
}

fastify.get('/health', async () => {
  try {
    if (pool) {
      const res = await pool.query('SELECT 1 as ok');
      return { status: 'ok', db: res.rows[0].ok === 1 };
    }
    return { status: 'ok', db: false };
  } catch (e) {
    fastify.log.error(e);
    return { status: 'error', message: e.message };
  }
});

fastify.get('/api/hello', async () => ({ message: 'Hello from Fastify API' }));

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Backend running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
