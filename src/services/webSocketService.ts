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
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.triggerEvent(message.type, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
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
  sendMessage(message: WebSocketMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
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
}

// Создание и экспорт экземпляра сервиса
const webSocketService = new WebSocketService();

export default webSocketService; 