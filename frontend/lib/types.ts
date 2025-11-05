export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface APIKey {
  id: string;
  user_id: string;
  provider: 'gemini' | 'gpt-oss' | 'qwen' | 'glm' | 'deepseek' | 'minimax' | 'llama' | 'nemotron' | 'gemma';
  api_key: string;
  name?: string;
  usage_count: number;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  id: string;
  idea_id: string;
  api_key_id?: string;
  content: string;
  model_used?: string;
  tokens_used?: number;
  generation_time_ms?: number;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalIdeas: number;
  totalContents: number;
  activeApiKeys: number;
  totalApiCalls: number;
}
