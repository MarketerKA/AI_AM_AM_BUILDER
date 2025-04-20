import axios from 'axios';
import { API_URL } from '@/constants/api';
import { eventBus } from '@/utils/eventBus';
import { extractSchemaFromResponse } from '@/utils/jsonExtractor';
import { 
  ChatCompletionRequest, 
  ApiResponse, 
  SchemaData 
} from '@/types/api';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
      const schemaData = extractSchemaFromResponse(responseText);
      
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