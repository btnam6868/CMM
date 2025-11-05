import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/api/auth/register', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return reply.status(400).send({ message: 'Email already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
        [email, password_hash, 'user']
      );

      return reply.status(201).send({
        message: 'User created successfully',
        user: result.rows[0],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    try {
      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return reply.status(401).send({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return reply.status(401).send({ message: 'Invalid credentials' });
      }

      // Check if account is active
      if (user.account_status === 'inactive') {
        return reply.status(403).send({ 
          message: 'User của bạn đang ở trạng thái Inactive, hãy liên hệ với người quản trị' 
        });
      }

      // Check IP and MAC if check_ip_mac is enabled
      if (user.check_ip_mac) {
        const current_ip = request.ip;
        const current_mac = request.headers['x-mac-address'] || null;
        
        if (user.ip_address && current_ip !== user.ip_address) {
          return reply.status(403).send({ 
            message: 'Địa chỉ IP không khớp. Vui lòng liên hệ quản trị viên để cập nhật.' 
          });
        }
        
        if (user.mac_address && current_mac && current_mac !== user.mac_address) {
          return reply.status(403).send({ 
            message: 'Địa chỉ MAC không khớp. Vui lòng liên hệ quản trị viên để cập nhật.' 
          });
        }
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Log login history - UPSERT (only keep latest login per user)
      const ip_address = request.ip;
      const user_agent = request.headers['user-agent'] || '';
      const mac_address = request.headers['x-mac-address'] || null; // Client will send MAC via header
      
      // Set all users to offline first, then set current user to online
      await pool.query('UPDATE users SET status = $1', ['offline']);
      
      // Update user's last IP, MAC and set status to online
      await pool.query(
        'UPDATE users SET ip_address = $1, mac_address = $2, status = $3 WHERE id = $4',
        [ip_address, mac_address, 'online', user.id]
      );
      
      // Upsert login history (replace if exists, insert if not)
      await pool.query(`
        INSERT INTO login_history (user_id, login_time, ip_address, mac_address, user_agent, api_calls_count)
        VALUES ($1, NOW(), $2, $3, $4, 0)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          login_time = NOW(),
          ip_address = $2,
          mac_address = $3,
          user_agent = $4,
          api_calls_count = 0,
          updated_at = NOW()
      `, [user.id, ip_address, mac_address, user_agent]);

      // Remove password_hash from response
      delete user.password_hash;

      return reply.send({
        token,
        user,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Get current user
  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await pool.query(
        'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1',
        [userId]
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
}
