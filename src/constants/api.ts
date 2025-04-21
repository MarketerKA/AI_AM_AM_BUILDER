// Определяем, какие протоколы использовать
const isProduction = window.location.protocol === 'https:';
const httpProtocol = isProduction ? 'https' : 'http';
const wsProtocol = isProduction ? 'wss' : 'ws';
const API_HOST = '45.12.228.158:8000';

// API URL для разных окружений
export const API_URL = `http://${API_HOST}`;

// Эндпоинты API
export const API_ENDPOINTS = {
  ROOT: '/',
  MODELS: '/api/models',
  CHAT_COMPLETIONS: '/api/chat/completions',
  COMPLETIONS: '/api/completions',
  EMBEDDINGS: '/api/embeddings',
  WEBSOCKET: `${wsProtocol}://${API_HOST}/ws/json-schema-generator`
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