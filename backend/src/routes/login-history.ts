import { FastifyInstance } from 'fastify';
import pool from '../config/database.js';

export default async function loginHistoryRoutes(fastify: FastifyInstance) {
  // Get all login history (protected route)
  fastify.get('/api/login-history', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const result = await pool.query(`
        SELECT 
          lh.user_id,
          lh.login_time,
          lh.api_calls_count,
          lh.ip_address,
          lh.mac_address,
          lh.user_agent,
          u.email,
          u.full_name,
          u.role,
          u.department,
          u.position
        FROM login_history lh
        JOIN users u ON lh.user_id = u.id
        ORDER BY lh.login_time DESC
      `);

      return reply.send({ history: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

}
