/**
 * Типы сообщений чата
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Параметры запроса на генерацию ответа в чате
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * Формат ответа API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Тип для передачи JSON схемы и объяснения
 */
export interface SchemaData {
  explanation: string;
  schema: any;
}

/**
 * Сообщение WebSocket
 */
export interface WebSocketMessage {
  type: string;
  content: any;
  data?: any;
}

/**
 * Параметры запроса на обычную генерацию текста
 */
export interface CompletionRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

/**
 * Параметры запроса на генерацию эмбеддингов
 */
export interface EmbeddingRequest {
  model: string;
  input: string | string[];
} 