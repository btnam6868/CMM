import { FastifyInstance } from 'fastify';
import pool from '../config/database.js';

export default async function briefsRoutes(fastify: FastifyInstance) {
  // Generate a brief from an idea using AI
  fastify.post('/api/briefs/generate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { persona, industry, idea } = request.body as {
        persona: string;
        industry: string;
        idea: string;
      };

      // Validate required fields
      if (!persona || !industry || !idea) {
        return reply.status(400).send({ message: 'Persona, industry, and idea are required' });
      }

      // Get an active API key from supported providers
      const supportedProviders = ['openrouter', 'gemini', 'gpt-oss', 'deepseek', 'qwen', 'glm'];
      const apiKeyResult = await pool.query(
        `SELECT id, api_key, provider, usage_count, connection_status, name
         FROM api_keys
         WHERE user_id = $1
           AND is_active = true
           AND provider = ANY($2)
           AND (connection_status IS NULL OR connection_status != 'failed')
         ORDER BY
           CASE
             WHEN connection_status = 'success' THEN 1
             WHEN connection_status = 'untested' OR connection_status IS NULL THEN 2
             ELSE 3
           END,
           usage_count ASC
         LIMIT 1`,
        [userId, supportedProviders]
      );

      if (apiKeyResult.rows.length === 0) {
        return reply.status(404).send({
          message: `No active API key found. Please add an API key from supported providers: ${supportedProviders.join(', ')}`
        });
      }

      const apiKey = apiKeyResult.rows[0];

      // Create prompt for generating brief
      const prompt = `You are a professional content strategist. Create a detailed content brief based on the following:

Persona: ${persona}
Industry: ${industry}
Content Idea: ${idea}

Generate a comprehensive content brief that includes:
1. Title/Headline
2. Target Audience
3. Key Message
4. Content Structure (outline with main points)
5. Tone and Style
6. Call to Action
7. SEO Keywords (3-5 keywords)
8. Estimated Word Count

Format your response as a well-structured brief document. Be specific and actionable.`;

      // Call AI API based on provider
      let generatedBrief = '';
      try {
        if (apiKey.provider === 'openrouter') {
          const modelName = apiKey.name || 'google/gemini-2.0-flash-exp:free';
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey.api_key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://content-multiplier.com',
              'X-Title': 'Content Multiplier'
            },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 2500
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error('OpenRouter API error:', errorData);
            return reply.status(500).send({
              message: 'Failed to generate brief from OpenRouter',
              error: errorData
            });
          }

          const data = await response.json();
          generatedBrief = data.choices[0]?.message?.content || '';

        } else if (apiKey.provider === 'gemini') {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey.api_key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2500
                }
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error('Gemini API error:', errorData);
            return reply.status(500).send({
              message: 'Failed to generate brief from Gemini',
              error: errorData
            });
          }

          const data = await response.json();
          generatedBrief = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        } else {
          // OpenAI-compatible APIs
          const apiEndpoints: Record<string, string> = {
            'gpt-oss': 'https://api.openai.com/v1/chat/completions',
            'deepseek': 'https://api.deepseek.com/v1/chat/completions',
            'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            'glm': 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
          };

          const endpoint = apiEndpoints[apiKey.provider];
          if (!endpoint) {
            return reply.status(400).send({
              message: `Unsupported provider: ${apiKey.provider}`
            });
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey.api_key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: apiKey.provider === 'gpt-oss' ? 'gpt-4' :
                     apiKey.provider === 'deepseek' ? 'deepseek-chat' :
                     apiKey.provider === 'qwen' ? 'qwen-max' : 'glm-4',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 2500
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error(`${apiKey.provider} API error:`, errorData);
            return reply.status(500).send({
              message: `Failed to generate brief from ${apiKey.provider}`,
              error: errorData
            });
          }

          const data = await response.json();
          generatedBrief = data.choices[0]?.message?.content || '';
        }

        if (!generatedBrief) {
          return reply.status(500).send({
            message: 'Failed to generate brief - empty response from AI'
          });
        }

        // Update usage count for the API key
        await pool.query(
          `UPDATE api_keys
           SET usage_count = usage_count + 1,
               last_used_at = NOW()
           WHERE id = $1`,
          [apiKey.id]
        );

        return reply.send({
          brief: generatedBrief,
          persona,
          industry,
          idea,
          apiKeyUsed: {
            id: apiKey.id,
            provider: apiKey.provider,
            usageCount: apiKey.usage_count + 1
          }
        });

      } catch (fetchError: any) {
        fastify.log.error('Error calling AI provider:', fetchError);
        return reply.status(500).send({
          message: 'Network error while connecting to AI provider',
          error: fetchError.message
        });
      }

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Save a generated brief to database
  fastify.post('/api/briefs', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { persona, industry, idea, brief, ideaId } = request.body as {
        persona: string;
        industry: string;
        idea: string;
        brief: string;
        ideaId?: string;
      };

      // Validate required fields
      if (!persona || !industry || !idea || !brief) {
        return reply.status(400).send({
          message: 'Persona, industry, idea, and brief are required'
        });
      }

      const result = await pool.query(
        `INSERT INTO briefs (user_id, idea_id, persona, industry, idea, brief, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, user_id, idea_id, persona, industry, idea, brief, created_at`,
        [userId, ideaId || null, persona, industry, idea, brief]
      );

      // If ideaId provided, mark the idea as used
      if (ideaId) {
        await pool.query(
          'UPDATE ideas SET is_used = true WHERE id = $1 AND user_id = $2',
          [ideaId, userId]
        );
      }

      return reply.status(201).send({
        message: 'Brief saved successfully',
        brief: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Get all briefs for user
  fastify.get('/api/briefs', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await pool.query(
        `SELECT id, idea_id, persona, industry, idea, brief, created_at
         FROM briefs
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return reply.send({ briefs: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });
}
