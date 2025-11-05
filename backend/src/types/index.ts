export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export interface APIKey {
  id: string;
  user_id: string;
  provider: 'gemini' | 'gpt-oss' | 'qwen' | 'glm' | 'deepseek' | 'minimax' | 'llama' | 'nemotron' | 'gemma';
  api_key: string;
  name?: string;
  usage_count: number;
  last_used_at?: Date;
  is_active: boolean;
  created_at: Date;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface GeneratedContent {
  id: string;
  idea_id: string;
  api_key_id?: string;
  content: string;
  model_used?: string;
  tokens_used?: number;
  generation_time_ms?: number;
  created_at: Date;
}
