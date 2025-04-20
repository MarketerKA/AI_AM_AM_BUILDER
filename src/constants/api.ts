// API URL для разных окружений
export const API_URL = 'http://45.12.228.158:8000';

// Эндпоинты API
export const API_ENDPOINTS = {
  ROOT: '/',
  MODELS: '/api/models',
  CHAT_COMPLETIONS: '/api/chat/completions',
  COMPLETIONS: '/api/completions',
  EMBEDDINGS: '/api/embeddings',
  WEBSOCKET: 'ws://45.12.228.158:8000/ws/json-schema-generator'
};

// Настройки запросов по умолчанию
export const DEFAULT_REQUEST_CONFIG = {
  TEMPERATURE: 0.6,
  MAX_TOKENS: 2000,
  MODEL: 'mws-gpt-alpha'
};

// События для обмена данными между компонентами
export const EVENTS = {
  SCHEMA_UPDATE: 'schema-update',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  SYSTEM: 'system',
  JSON_GENERATED: 'json_generated',
  JSON_UPDATED: 'json_updated',
  STATUS: 'status',
  PING: 'ping',
  CREATE_SCHEMA: 'create_schema',
  UPDATE_SCHEMA: 'update_schema'
}; 