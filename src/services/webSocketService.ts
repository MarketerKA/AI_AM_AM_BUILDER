import { WebSocketMessage } from '@/types/api';
import { API_ENDPOINTS, EVENTS } from '@/constants/api';

/**
 * Класс для работы с WebSocket-соединениями
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private isConnectedState = false;
  private url: string;

  /**
   * Создает экземпляр сервиса WebSocket
   * @param url URL WebSocket сервера
   */
  constructor(url: string = API_ENDPOINTS.WEBSOCKET) {
    this.url = url;
  }

  /**
   * Устанавливает соединение с WebSocket сервером
   */
  connect() {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnectedState = true;
      this.triggerEvent(EVENTS.CONNECT, { type: EVENTS.CONNECT, content: 'Connected' });
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnectedState = false;
      this.socket = null;
      this.triggerEvent(EVENTS.DISCONNECT, { type: EVENTS.DISCONNECT, content: 'Disconnected' });
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.triggerEvent(EVENTS.ERROR, { type: EVENTS.ERROR, content: 'Connection error' });
    };

    this.socket.onmessage = (event) => {
      try {
        // Расширенное логирование полученных сообщений
        console.log('========== ПОЛУЧЕНО СООБЩЕНИЕ ОТ БЭКЕНДА ==========');
        console.log('Сырые данные:', event.data);
        
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('Разобранное сообщение:', message);
        console.log('Тип сообщения:', message.type);
        
        if (message.data) {
          console.log('Данные сообщения:', message.data);
        }
        
        if (message.content) {
          console.log('Содержимое сообщения:', message.content);
        }
        
        console.log('==================================================');
        
        // Проверяем на наличие важных типов сообщений
        // и гарантируем, что они будут обработаны даже если формат немного отличается
        this.handleSpecialMessageTypes(message);
        
        // Обычная обработка сообщения
        this.triggerEvent(message.type, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.error('Raw message data:', event.data);
      }
    };
  }

  /**
   * Закрывает соединение с WebSocket сервером
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnectedState = false;
    }
  }

  /**
   * Отправляет сообщение на сервер
   * @param message Сообщение для отправки
   * @returns Успешность отправки
   */
  sendMessage(message: WebSocketMessage | any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      // Форматируем сообщение для совместимости с бэкендом
      const messageToSend = { ...message };
      
      // Логируем отправляемое сообщение
      console.log('Отправка WebSocket сообщения:', messageToSend);
      
      this.socket.send(JSON.stringify(messageToSend));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Подписывается на событие
   * @param type Тип события
   * @param handler Обработчик события
   */
  on(type: string, handler: (message: WebSocketMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  /**
   * Отписывается от события
   * @param type Тип события
   * @param handler Обработчик события
   */
  off(type: string, handler: (message: WebSocketMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      return;
    }
    
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Проверяет, установлено ли соединение
   * @returns Статус соединения
   */
  isConnected(): boolean {
    return this.isConnectedState;
  }

  /**
   * Вызывает обработчики для указанного типа события
   * @param type Тип события
   * @param message Сообщение события
   * @private
   */
  private triggerEvent(type: string, message: WebSocketMessage) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type)?.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in ${type} event handler:`, error);
        }
      });
    }
  }

  /**
   * Специальная обработка для важных типов сообщений, гарантирующая их обработку
   * @param message Полученное сообщение
   */
  private handleSpecialMessageTypes(message: WebSocketMessage): void {
    try {
      // Распознавание типа сообщения
      const messageType = message.type || 'unknown';
      
      // Сохраняем все сообщения в localStorage для отладки
      try {
        // Ограничиваем хранение последних 5 сообщений
        const logKey = `ws_message_log_${Date.now()}`;
        
        // Создаем массив из последних логов
        let logKeys = JSON.parse(localStorage.getItem('ws_message_log_keys') || '[]');
        logKeys.push(logKey);
        
        // Оставляем только последние 5 записей
        if (logKeys.length > 5) {
          logKeys = logKeys.slice(-5);
        }
        
        // Сохраняем обновленный список ключей и само сообщение
        localStorage.setItem('ws_message_log_keys', JSON.stringify(logKeys));
        localStorage.setItem(logKey, JSON.stringify(message));
      } catch (e) {
        console.error('Error saving message to localStorage:', e);
      }
      
      // Обработка json_generated и json_updated
      if (messageType === 'json_generated' || messageType === 'json_updated') {
        console.log(`Обработка специального сообщения типа ${messageType}`);
        
        // Дополнительно проверяем, содержит ли сообщение данные
        if (message.data) {
          console.log(`Сообщение ${messageType} содержит данные, отправляем событие`);
          this.triggerEvent(messageType, message);
        } else if (typeof message.content === 'object') {
          // Если данные находятся в поле content, создаем новое сообщение
          console.log(`Сообщение ${messageType} содержит данные в поле content, преобразуем`);
          const transformedMessage = {
            type: messageType,
            data: message.content,
            originalMessage: message
          };
          
          this.triggerEvent(messageType, transformedMessage);
        }
      }
      
      // Обработка ошибок с поддержкой различных форматов
      if (
        messageType === 'error' || 
        (message.data && message.data.error) ||
        (message.content && (
          typeof message.content === 'string' && 
          message.content.toLowerCase().includes('ошибка')
        ))
      ) {
        console.error('WebSocket error message detected:', message);
        
        // Отправляем событие об ошибке
        this.triggerEvent('error', {
          type: 'error',
          content: this.extractErrorMessage(message),
          data: message.data || {}
        });
      }
      
      // Обработка статусных сообщений
      if (
        messageType === 'status' || 
        messageType === 'system' ||
        (message.content && (
          typeof message.content === 'string' && (
            message.content.includes('выполняется') ||
            message.content.includes('обработка') ||
            message.content.includes('ожидание')
          )
        ))
      ) {
        this.triggerEvent('status', message);
      }
    } catch (error) {
      console.error('Error in handleSpecialMessageTypes:', error);
    }
  }
  
  /**
   * Извлекает текст ошибки из различных форматов сообщений об ошибке
   * @param message Сообщение об ошибке
   * @returns Текст ошибки
   */
  private extractErrorMessage(message: any): string {
    try {
      if (typeof message.content === 'string') {
        return message.content;
      }
      
      if (message.data && message.data.error) {
        return message.data.error;
      }
      
      if (message.data && message.data.content) {
        return message.data.content;
      }
      
      if (message.error) {
        return message.error;
      }
      
      return 'Неизвестная ошибка';
    } catch (e) {
      return 'Ошибка при обработке сообщения';
    }
  }
}

// Создание и экспорт экземпляра сервиса
const webSocketService = new WebSocketService();

export default webSocketService; 