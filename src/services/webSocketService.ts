// Тип для сообщений WebSocket
export interface WebSocketMessage {
  type: string;
  content: any;
  data?: any;
}

// Класс для работы с WebSocket
class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private isConnected = false;
  private url: string;

  constructor(url: string = 'ws://localhost:8000/ws/schema-chat') {
    this.url = url;
  }

  // Подключение к WebSocket
  connect() {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.triggerEvent('connect', { type: 'connect', content: 'Connected' });
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.socket = null;
      this.triggerEvent('disconnect', { type: 'disconnect', content: 'Disconnected' });
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.triggerEvent('error', { type: 'error', content: 'Connection error' });
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

  // Отключение от WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Отправка сообщения
  sendMessage(message: WebSocketMessage) {
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

  // Подписка на тип сообщений
  on(type: string, handler: (message: WebSocketMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  // Отписка от типа сообщений
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

  // Проверка подключения
  isConnected() {
    return this.isConnected;
  }

  // Вызов обработчиков для типа сообщения
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

// Создание экземпляра сервиса
const webSocketService = new WebSocketService();

export default webSocketService; 