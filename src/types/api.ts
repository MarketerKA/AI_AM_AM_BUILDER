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
  content?: any;
  data?: any;
}

/**
 * Сообщение WebSocket в формате test.py
 */
export interface TestPyWebSocketMessage {
  type: string;
  data: any;
}

/**
 * Ответ WebSocket с JSON схемой
 */
export interface JsonSchemaResponse extends WebSocketMessage {
  type: 'json_generated' | 'json_updated';
  content: string;
  data: any; // JSON схема
}

/**
 * Запрос на создание схемы
 */
export interface CreateSchemaRequest extends WebSocketMessage {
  type: 'create_schema';
  content: string;
  data: {
    description: string;
    integration_type: string;
    additional_info?: any;
  };
}

/**
 * Запрос на обновление схемы
 */
export interface UpdateSchemaRequest extends WebSocketMessage {
  type: 'update_schema';
  content: string;
  data: {
    update_text: string;
  };
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