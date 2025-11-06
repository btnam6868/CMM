import { FastifyInstance } from 'fastify';
import pool from '../config/database.js';

export default async function ideasRoutes(fastify: FastifyInstance) {
  // Save an idea to database
  fastify.post('/api/ideas/save', {
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

      const result = await pool.query(
        `INSERT INTO ideas (user_id, persona, industry, idea, title, description, status, is_used, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', false, NOW(), NOW())
         RETURNING id, user_id, persona, industry, idea, is_used, created_at`,
        [userId, persona, industry, idea, `Idea for ${persona}`, idea]
      );

      return reply.status(201).send({
        message: 'Idea saved successfully',
        idea: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Get all saved ideas for user
  fastify.get('/api/ideas', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await pool.query(
        `SELECT id, persona, industry, idea, is_used, created_at
         FROM ideas
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return reply.send({ ideas: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Delete a saved idea
  fastify.delete('/api/ideas/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };

      const result = await pool.query(
        'DELETE FROM ideas WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'Idea not found' });
      }

      return reply.send({ message: 'Idea deleted successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Internal server error' });
    }
  });

  // Generate ideas using AI
  fastify.post('/api/ideas/generate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { persona, industry } = request.body as {
        persona: string;
        industry: string;
      };

      // Validate required fields
      if (!persona || !industry) {
        return reply.status(400).send({ message: 'Persona and industry are required' });
      }

      // Get an active API key from supported providers
      // Supported providers: openrouter, gemini, gpt-oss, deepseek, qwen, glm
      // Priority: connection_status = 'success' first, then 'untested', exclude 'failed'
      // Use round-robin: get the one with lowest usage_count
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

      // Create prompt for generating ideas
      const prompt = `You are a creative content strategist. Generate exactly 10 unique and specific content ideas.

Persona: ${persona}
Industry: ${industry}

Generate 10 content ideas that would resonate with this persona in this industry. Each idea should be:
- Specific and actionable
- Relevant to the persona and industry
- Engaging and valuable

Format your response as a JSON array of 10 strings, each containing one idea. Example:
["Idea 1 text here", "Idea 2 text here", "Idea 3 text here", ...]

Return ONLY the JSON array, no additional text.`;

      // Call AI API based on provider
      let generatedText = '';
      try {
        if (apiKey.provider === 'openrouter') {
          // OpenRouter API
          // Use model name from DB if available, otherwise default to a free model
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
              temperature: 0.8,
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error('OpenRouter API error:', errorData);
            return reply.status(500).send({
              message: 'Failed to generate ideas from OpenRouter',
              error: errorData
            });
          }

          const data = await response.json();
          generatedText = data.choices[0]?.message?.content || '';

        } else if (apiKey.provider === 'gemini') {
          // Google Gemini API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey.api_key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.8,
                  maxOutputTokens: 2000
                }
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error('Gemini API error:', errorData);
            return reply.status(500).send({
              message: 'Failed to generate ideas from Gemini',
              error: errorData
            });
          }

          const data = await response.json();
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        } else {
          // OpenAI-compatible APIs (gpt-oss, deepseek, qwen, glm)
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
              temperature: 0.8,
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            fastify.log.error(`${apiKey.provider} API error:`, errorData);
            return reply.status(500).send({
              message: `Failed to generate ideas from ${apiKey.provider}`,
              error: errorData
            });
          }

          const data = await response.json();
          generatedText = data.choices[0]?.message?.content || '';
        }

        // Parse the JSON array from the response
        let ideas: string[] = [];
        try {
          // Try to extract JSON array from the response
          const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            ideas = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: split by newlines and clean up
            ideas = generatedText
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'))
              .map((line: string) => line.replace(/^[\d\-\.\)\]]+\s*/, '').replace(/^["']|["']$/g, ''))
              .slice(0, 10);
          }

          // Ensure we have exactly 10 ideas
          if (ideas.length < 10) {
            for (let i = ideas.length; i < 10; i++) {
              ideas.push(`Content idea ${i + 1} for ${persona} in ${industry}`);
            }
          } else if (ideas.length > 10) {
            ideas = ideas.slice(0, 10);
          }
        } catch (parseError) {
          fastify.log.error('Failed to parse ideas:', parseError);
          // Return generic ideas as fallback
          ideas = Array.from({ length: 10 }, (_, i) =>
            `Content idea ${i + 1} for ${persona} in ${industry}`
          );
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
          ideas,
          persona,
          industry,
          apiKeyUsed: {
            id: apiKey.id,
            provider: apiKey.provider,
            usageCount: apiKey.usage_count + 1
          }
        });

      } catch (fetchError: any) {
        fastify.log.error('Error calling OpenRouter:', fetchError);
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
}
