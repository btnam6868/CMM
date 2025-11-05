import { FastifyInstance } from 'fastify';
import pool from '../config/database.js';

export default async function apiKeysRoutes(fastify: FastifyInstance) {
  // Get all API keys for the authenticated user
  fastify.get('/api/api-keys', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await pool.query(
        `SELECT id, user_id, provider, api_key, name, usage_count, last_used_at, is_active, created_at
         FROM api_keys
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return reply.send({ apiKeys: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Get a specific API key by ID
  fastify.get('/api/api-keys/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const result = await pool.query(
        `SELECT id, user_id, provider, api_key, name, usage_count, last_used_at, is_active, created_at
         FROM api_keys
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'API key not found' });
      }

      return reply.send({ apiKey: result.rows[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Create a new API key
  fastify.post('/api/api-keys', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { provider, api_key, name } = request.body as {
        provider: string;
        api_key: string;
        name?: string;
      };

      // Validate required fields
      if (!provider || !api_key) {
        return reply.status(400).send({ message: 'Provider and API key are required' });
      }

      // Validate provider
      const validProviders = ['gemini', 'gpt-oss', 'qwen', 'glm', 'deepseek', 'minimax', 'llama', 'nemotron', 'gemma'];
      if (!validProviders.includes(provider.toLowerCase())) {
        return reply.status(400).send({
          message: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
        });
      }

      const result = await pool.query(
        `INSERT INTO api_keys (user_id, provider, api_key, name, usage_count, is_active, created_at)
         VALUES ($1, $2, $3, $4, 0, true, NOW())
         RETURNING id, user_id, provider, api_key, name, usage_count, last_used_at, is_active, created_at`,
        [userId, provider.toLowerCase(), api_key, name || null]
      );

      return reply.status(201).send({
        message: 'API key created successfully',
        apiKey: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Update an API key
  fastify.put('/api/api-keys/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;
      const { provider, api_key, name, is_active } = request.body as {
        provider?: string;
        api_key?: string;
        name?: string;
        is_active?: boolean;
      };

      // Validate provider if provided
      if (provider) {
        const validProviders = ['gemini', 'gpt-oss', 'qwen', 'glm', 'deepseek', 'minimax', 'llama', 'nemotron', 'gemma'];
        if (!validProviders.includes(provider.toLowerCase())) {
          return reply.status(400).send({
            message: `Invalid provider. Must be one of: ${validProviders.join(', ')}`
          });
        }
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (provider !== undefined) {
        updates.push(`provider = $${paramCount++}`);
        values.push(provider.toLowerCase());
      }
      if (api_key !== undefined) {
        updates.push(`api_key = $${paramCount++}`);
        values.push(api_key);
      }
      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (updates.length === 0) {
        return reply.status(400).send({ message: 'No fields to update' });
      }

      values.push(id);
      values.push(userId);

      const result = await pool.query(
        `UPDATE api_keys
         SET ${updates.join(', ')}
         WHERE id = $${paramCount++} AND user_id = $${paramCount}
         RETURNING id, user_id, provider, api_key, name, usage_count, last_used_at, is_active, created_at`,
        values
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'API key not found' });
      }

      return reply.send({
        message: 'API key updated successfully',
        apiKey: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Delete an API key
  fastify.delete('/api/api-keys/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id;

      const result = await pool.query(
        'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'API key not found' });
      }

      return reply.send({ message: 'API key deleted successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });
}
