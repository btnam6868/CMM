import { FastifyInstance } from 'fastify';
import pool from '../config/database.js';

export default async function usersRoutes(fastify: FastifyInstance) {
  // Get all users (protected route)
  fastify.get('/api/users', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT id, email, role, full_name, department, position, ip_address, mac_address, status, account_status, check_ip_mac, created_at, updated_at FROM users ORDER BY created_at DESC'
      );

      return reply.send({ users: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Get user by ID (protected route)
  fastify.get('/api/users/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const result = await pool.query(
        'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ user: result.rows[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Update user (protected route, admin only)
  fastify.put('/api/users/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { role, full_name, department, position, account_status, ip_address, mac_address, check_ip_mac } = request.body as { 
        role?: string; 
        full_name?: string; 
        department?: string; 
        position?: string;
        account_status?: string;
        ip_address?: string;
        mac_address?: string;
        check_ip_mac?: boolean;
      };

      // Validate role if provided
      if (role && !['user', 'admin', 'clerk', 'controller'].includes(role)) {
        return reply.status(400).send({ message: 'Invalid role. Must be: user, admin, clerk, or controller' });
      }

      // Validate account_status if provided
      if (account_status && !['active', 'inactive'].includes(account_status)) {
        return reply.status(400).send({ message: 'Invalid account_status. Must be: active or inactive' });
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
      }
      if (full_name !== undefined) {
        updates.push(`full_name = $${paramCount++}`);
        values.push(full_name);
      }
      if (department !== undefined) {
        updates.push(`department = $${paramCount++}`);
        values.push(department);
      }
      if (position !== undefined) {
        updates.push(`position = $${paramCount++}`);
        values.push(position);
      }
      if (account_status !== undefined) {
        updates.push(`account_status = $${paramCount++}`);
        values.push(account_status);
      }
      if (ip_address !== undefined) {
        updates.push(`ip_address = $${paramCount++}`);
        values.push(ip_address);
      }
      if (mac_address !== undefined) {
        updates.push(`mac_address = $${paramCount++}`);
        values.push(mac_address);
      }
      if (check_ip_mac !== undefined) {
        updates.push(`check_ip_mac = $${paramCount++}`);
        values.push(check_ip_mac);
      }

      if (updates.length === 0) {
        return reply.status(400).send({ message: 'No fields to update' });
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, role, full_name, department, position, ip_address, mac_address, status, account_status, check_ip_mac, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ 
        message: 'User updated successfully',
        user: result.rows[0] 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Delete user (protected route, admin only)
  fastify.delete('/api/users/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const currentUserId = (request.user as any).id;

      // Prevent self-deletion
      if (id === currentUserId) {
        return reply.status(400).send({ message: 'Cannot delete your own account' });
      }

      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ message: 'User deleted successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });
}
