import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Типы для запросов и ответов
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// Для синхронизации между чатом и JSON Schema
export interface SchemaData {
  explanation: string;
  schema: any;
}

// События для обмена данными между компонентами
const eventBus = {
  listeners: new Map<string, Function[]>(),
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  },
  
  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event) || [];
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  },
  
  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }
};

// Сервис для работы с API
export const apiService = {
  // Получение списка доступных моделей
  async getModels(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/api/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to fetch models'
      };
    }
  },

  // Отправка запроса на генерацию текста
  async chatCompletion(request: ChatCompletionRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/chat/completions', request);
      
      // Пытаемся извлечь JSON из ответа
      const responseText = response.data.data?.choices[0]?.message?.content || '';
      const schemaData = this.extractSchemaFromResponse(responseText);
      
      // Если нашли JSON в ответе, отправляем его в JSON Schema
      if (schemaData) {
        eventBus.emit('schema-update', schemaData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to complete chat request'
      };
    }
  },

  // Проверка статуса сервера
  async checkStatus(): Promise<boolean> {
    try {
      const response = await api.get('/');
      return response.data.status === 'online';
    } catch (error) {
      console.error('Error checking API status:', error);
      return false;
    }
  },
  
  // Функция для извлечения JSON схемы из текстового ответа
  extractSchemaFromResponse(text: string): SchemaData | null {
    console.log('Extracting schema from:', text.substring(0, 100) + '...');
    
    // Проверяем, что текст не пустой
    if (!text || typeof text !== 'string') {
      console.error('Invalid text input:', text);
      return null;
    }
    
    // Если в тексте есть ```json, то используем это для разделения
    if (text.includes('```json')) {
      // Ищем JSON в ответе (между ```json и ```)
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
      const jsonMatches = [...text.matchAll(jsonRegex)];
      
      if (jsonMatches.length > 0) {
        try {
          // Получаем текст JSON из первого совпадения
          const jsonText = jsonMatches[0][1];
          console.log('Found JSON text with markers:', jsonText.substring(0, 100) + '...');
          
          // Парсим JSON
          const schema = JSON.parse(jsonText);
          console.log('Parsed schema with markers:', schema);
          
          // Удаляем JSON из текста
          const explanation = text.replace(/```json[\s\S]*?```/g, '')
            .trim();
          
          // Отправляем событие об обновлении схемы
          eventBus.emit('schema-update', { explanation, schema });
          
          return { explanation, schema };
        } catch (error) {
          console.error('Error parsing JSON from response with markers:', error);
        }
      }
    }
    
    // Если не нашли JSON с маркерами, пробуем найти JSON без маркеров
    // Стратегия 1: Ищем текст, который похож на большой JSON-объект
    try {
      // Ищем что-то, что выглядит как JSON объект
      const jsonPattern = /\{(?:[^{}]|(\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
      const matches = [...text.matchAll(jsonPattern)];
      
      // Берем самое длинное совпадение (предположительно самый большой JSON-объект)
      if (matches.length > 0) {
        const jsonTexts = matches.map(m => m[0]);
        const longestJsonText = jsonTexts.reduce((prev, current) => 
          (current.length > prev.length) ? current : prev
        );
        
        if (longestJsonText.length > 50) { // Минимальная длина для "настоящего" JSON
          console.log('Found longest JSON text without markers:', longestJsonText.substring(0, 100) + '...');
          const schema = JSON.parse(longestJsonText);
          
          // Удаляем этот JSON из текста
          const explanation = text.replace(longestJsonText, '').trim();
          
          // Отправляем событие об обновлении схемы
          eventBus.emit('schema-update', { explanation, schema });
          
          return { explanation, schema };
        }
      }
    } catch (error) {
      console.error('Error finding JSON without markers strategy 1:', error);
    }
    
    // Стратегия 2: Ищем от первой { до последней } в тексте
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        const jsonText = text.substring(firstBrace, lastBrace + 1);
        if (jsonText.length > 50) { // Минимальная длина для "настоящего" JSON
          console.log('Found JSON text using strategy 2:', jsonText.substring(0, 100) + '...');
          const schema = JSON.parse(jsonText);
          
          // Создаем текст объяснения, удалив JSON
          const beforeJson = text.substring(0, firstBrace).trim();
          const afterJson = text.substring(lastBrace + 1).trim();
          const explanation = (beforeJson + ' ' + afterJson).trim();
          
          // Отправляем событие об обновлении схемы
          eventBus.emit('schema-update', { explanation, schema });
          
          return { explanation, schema };
        }
      }
    } catch (error) {
      console.error('Error finding JSON without markers strategy 2:', error);
    }
    
    console.log('No valid JSON found in response');
    return null;
  },
  
  // Установка обработчика обновления схемы
  onSchemaUpdate(callback: (data: SchemaData) => void) {
    eventBus.on('schema-update', callback);
  },
  
  // Удаление обработчика
  offSchemaUpdate(callback: (data: SchemaData) => void) {
    eventBus.off('schema-update', callback);
  },
  
  // Отправка схемы в другие компоненты
  updateSchema(data: SchemaData) {
    eventBus.emit('schema-update', data);
  }
};

export default apiService; 