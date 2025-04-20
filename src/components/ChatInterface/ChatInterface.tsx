import { useState, FormEvent, useRef, useEffect } from 'react'
import styles from './ChatInterface.module.scss'
import apiService from '@/services/api'
import { SchemaData, WebSocketMessage } from '@/types/api'
import { API_URL, EVENTS } from '@/constants/api'
// import { extractSchemaFromResponse as extractSchema } from '@/utils/jsonExtractor'
import webSocketService from '@/services/webSocketService'

interface ChatInterfaceProps {
  chatName?: string;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export const ChatInterface = ({ chatName = 'МТС Ассистент' }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Флаг, указывающий, что мы ожидаем ответ от WebSocket
  const [_waitingForWsResponse, setWaitingForWsResponse] = useState(false);
  // Храним последнюю схему, если нам нужно её обновить
  const lastSchemaRef = useRef<any>(null);
  // Добавим переменную для отслеживания, был ли последний запрос пользователя о Kafka
  const [lastUserMessageWasKafka, setLastUserMessageWasKafka] = useState(false);

  // Функция для прокрутки вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Прокручиваем вниз при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Проверяем статус API при загрузке и подключаемся к WebSocket
  useEffect(() => {
    const checkApiStatus = async () => {
      const isOnline = await apiService.checkStatus();
      
      if (isOnline) {
        setMessages([
          { text: `API сервер доступен и готов к работе (${API_URL})`, isUser: false }
        ]);
        
        // Подключаемся к WebSocket после успешной проверки API
        webSocketService.connect();
      } else {
        setMessages([
          { text: `Ошибка подключения к API серверу. Пожалуйста, убедитесь, что сервер запущен на ${API_URL}`, isUser: false }
        ]);
      }
    };
    
    checkApiStatus();
    
    // Отключаемся от WebSocket при размонтировании компонента
    return () => {
      webSocketService.disconnect();
    };
  }, []);
  
  // Подключаемся к событиям WebSocket
  useEffect(() => {
    // Обработчик для установки соединения
    const handleConnect = () => {
      console.log('WebSocket соединение установлено');
      setIsWsConnected(true);
      setMessages(prev => [...prev, { text: 'WebSocket соединение установлено', isUser: false }]);
    };

    // Обработчик для разрыва соединения
    const handleDisconnect = () => {
      console.log('WebSocket соединение разорвано');
      setIsWsConnected(false);
      setMessages(prev => [...prev, { text: 'WebSocket соединение разорвано', isUser: false }]);
    };

    // Обработчик ошибок
    const handleError = (message: WebSocketMessage) => {
      console.log('Получена ошибка WebSocket:', message);
      const errorContent = message.content || (message as any).data?.content || 'Неизвестная ошибка';
      setMessages(prev => [...prev, { text: `Ошибка WebSocket: ${errorContent}`, isUser: false }]);
      setIsLoading(false);
      setWaitingForWsResponse(false);
    };

    // Обработчик для системных сообщений
    const handleSystem = (message: WebSocketMessage) => {
      console.log('Получено системное сообщение WebSocket:', message);
      const systemContent = message.content || (message as any).data?.content || 'Системное сообщение';
      setMessages(prev => [...prev, { text: systemContent, isUser: false }]);
    };

    // Обработчик для сгенерированной JSON схемы
    const handleJsonGenerated = (message: WebSocketMessage) => {
      console.log('============ ПОЛУЧЕНА СГЕНЕРИРОВАННАЯ JSON СХЕМА ============');
      console.log('Полное сообщение:', message);
      console.log('Тип сообщения:', message.type);
      console.log('Данные схемы:', message.data);
      console.log('===========================================================');
      
      const schemaData = message.data;
      if (schemaData) {
        // Прямое обновление данных из WebSocket, минуя экстрактор JSON
        lastSchemaRef.current = schemaData;
        
        // Сохраним схему в localStorage для отладки
        try {
          localStorage.setItem('lastGeneratedSchema', JSON.stringify(schemaData));
          console.log('Схема сохранена в localStorage как lastGeneratedSchema');
        } catch (e) {
          console.error('Ошибка при сохранении схемы в localStorage:', e);
        }
        
        // Проверяем, есть ли информация о Kafka в ответе
        const isKafkaResponse = 
          typeof schemaData === 'object' && 
          (
            JSON.stringify(schemaData).toLowerCase().includes('kafka') ||
            (message.type === 'json_generated' && lastUserMessageWasKafka)
          );
        
        if (isKafkaResponse) {
          setMessages(prev => [...prev, { 
            text: 'Получен ответ от Kafka. Схема доступна на вкладке "Схема"', 
            isUser: false 
          }]);
        } else {
          // Уведомляем пользователя об успешной генерации схемы
          setMessages(prev => [...prev, { 
            text: 'JSON схема успешно сгенерирована и доступна во вкладке "Схема"', 
            isUser: false 
          }]);
        }
        
        // Передаем схему в JsonSchema компонент через сервис
        apiService.updateSchema({
          explanation: 'JSON схема успешно сгенерирована',
          schema: schemaData
        });
        
        setIsLoading(false);
        setWaitingForWsResponse(false);
      }
    };

    // Обработчик для обновленной JSON схемы
    const handleJsonUpdated = (message: WebSocketMessage) => {
      console.log('============ ПОЛУЧЕНА ОБНОВЛЕННАЯ JSON СХЕМА ============');
      console.log('Полное сообщение:', message);
      console.log('Тип сообщения:', message.type);
      console.log('Данные схемы:', message.data);
      console.log('==========================================================');
      
      const schemaData = message.data;
      if (schemaData) {
        lastSchemaRef.current = schemaData;
        
        // Сохраним схему в localStorage для отладки
        try {
          localStorage.setItem('lastUpdatedSchema', JSON.stringify(schemaData));
          console.log('Обновленная схема сохранена в localStorage как lastUpdatedSchema');
        } catch (e) {
          console.error('Ошибка при сохранении обновленной схемы в localStorage:', e);
        }
        
        // Уведомляем пользователя об успешном обновлении схемы
        setMessages(prev => [...prev, { 
          text: 'JSON схема успешно обновлена и доступна во вкладке "Схема"', 
          isUser: false 
        }]);
        
        // Передаем схему в JsonSchema компонент через сервис
        apiService.updateSchema({
          explanation: 'JSON схема успешно обновлена',
          schema: schemaData
        });
        
        setIsLoading(false);
        setWaitingForWsResponse(false);
      }
    };

    // Обработчик для статуса операции
    const handleStatus = (message: WebSocketMessage) => {
      console.log('Получено сообщение о статусе операции:', message);
      const statusContent = message.content || (message as any).data?.content || 'Статус операции';
      setMessages(prev => [...prev, { text: statusContent, isUser: false }]);
    };

    // Подписываемся на события WebSocket
    webSocketService.on(EVENTS.CONNECT, handleConnect);
    webSocketService.on(EVENTS.DISCONNECT, handleDisconnect);
    webSocketService.on(EVENTS.ERROR, handleError);
    webSocketService.on(EVENTS.SYSTEM, handleSystem);
    webSocketService.on(EVENTS.JSON_GENERATED, handleJsonGenerated);
    webSocketService.on(EVENTS.JSON_UPDATED, handleJsonUpdated);
    webSocketService.on(EVENTS.STATUS, handleStatus);
    webSocketService.on(EVENTS.PING, handleStatus);

    // Отписываемся от событий при размонтировании компонента
    return () => {
      webSocketService.off(EVENTS.CONNECT, handleConnect);
      webSocketService.off(EVENTS.DISCONNECT, handleDisconnect);
      webSocketService.off(EVENTS.ERROR, handleError);
      webSocketService.off(EVENTS.SYSTEM, handleSystem);
      webSocketService.off(EVENTS.JSON_GENERATED, handleJsonGenerated);
      webSocketService.off(EVENTS.JSON_UPDATED, handleJsonUpdated);
      webSocketService.off(EVENTS.STATUS, handleStatus);
      webSocketService.off(EVENTS.PING, handleStatus);
    };
  }, []);

  // Обработчик обновления схемы из API
  const handleSchemaUpdate = (_data: SchemaData) => {
    // Обработка оповещений от JsonSchema компонента, если необходимо
  };
  
  // Подписываемся на обновления схемы
  useEffect(() => {
    apiService.onSchemaUpdate(handleSchemaUpdate);
    
    return () => {
      apiService.offSchemaUpdate(handleSchemaUpdate);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isLoading) {
      // Добавляем сообщение пользователя
      const userMessage = { text: inputValue, isUser: true };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputValue('');
      setIsLoading(true);
      
      // Анализируем текст сообщения 
      const messageText = userMessage.text.toLowerCase();
      
      // Определяем типы запросов для логирования и выбора правильного формата сообщения
      const isKafkaRequest = 
        messageText.includes('kafka') || 
        messageText.includes('топик') || 
        messageText.includes('topic') ||
        messageText.includes('получить сообщения');
      
      // Обновляем состояние последнего запроса о Kafka  
      setLastUserMessageWasKafka(isKafkaRequest);
      
      const isSchemaCreationRequest = 
        messageText.includes('создай') || 
        messageText.includes('сгенерируй') || 
        messageText.includes('создать json') ||
        messageText.includes('создать схему') ||
        messageText.includes('генерация json');
        
      const isSchemaUpdateRequest = 
        messageText.includes('обнови') || 
        messageText.includes('измени') || 
        messageText.includes('добавь в json') ||
        messageText.includes('обновить схему') ||
        messageText.includes('изменить json') ||
        (lastSchemaRef.current && (messageText.includes('добавь') || messageText.includes('удали')));
      
      // Используем WebSocket для всех запросов, если соединение активно
      if (isWsConnected) {
        setWaitingForWsResponse(true);
        
        // Определяем тип сообщения для WebSocket
        let message;
        
        if (isSchemaUpdateRequest && lastSchemaRef.current) {
          // Запрос на обновление схемы
          message = {
            type: EVENTS.UPDATE_SCHEMA,
            data: {
              update_text: userMessage.text
            }
          };
          
          console.log('=========== ОТПРАВКА ЗАПРОСА НА ОБНОВЛЕНИЕ СХЕМЫ ===========');
          console.log('Сообщение:', message);
          console.log('JSON:', JSON.stringify(message));
          console.log('Существующая схема:', lastSchemaRef.current);
          console.log('===========================================================');
          
          setMessages(prev => [...prev, { 
            text: 'Выполняется обновление JSON схемы...', 
            isUser: false 
          }]);
        } else {
          // Запрос на создание схемы или обычный запрос
          message = {
            type: EVENTS.CREATE_SCHEMA,
            data: {
              description: userMessage.text,
              integration_type: isKafkaRequest ? "kafka_consumer" : "rest"
            }
          };
          
          // Логируем отправляемое сообщение
          console.log('============ ОТПРАВКА WEBSOCKET ЗАПРОСА ============');
          console.log('Сообщение:', message);
          console.log('JSON:', JSON.stringify(message));
          console.log('Тип запроса:', 
            isKafkaRequest ? 'Kafka' : 
            isSchemaCreationRequest ? 'Создание JSON схемы' : 
            'Обычный запрос'
          );
          console.log('===================================================');
          
          // Устанавливаем статус для пользователя в зависимости от типа запроса
          const statusText = isKafkaRequest 
            ? 'Обрабатываю запрос к Kafka...' 
            : isSchemaCreationRequest 
              ? 'Выполняется генерация JSON схемы...' 
              : 'Обрабатываю ваш запрос...';
              
          setMessages(prev => [...prev, { 
            text: statusText, 
            isUser: false 
          }]);
        }
        
        // Отправляем сообщение через WebSocket
        webSocketService.sendMessage(message);
      } else {
        // Если WebSocket не доступен, сообщаем пользователю
        setMessages(prev => [...prev, { 
          text: 'WebSocket соединение не установлено. Попытка переподключения...', 
          isUser: false 
        }]);
        
        // Пробуем восстановить соединение
        webSocketService.connect();
        
        // Освобождаем интерфейс 
        setIsLoading(false);
      }
    }
  };
  
  // Импортируем функцию извлечения JSON
  // const extractSchemaFromResponse = (text: string): SchemaData | null => {
  //   try {
  //     // Используем импортированную функцию
  //     return extractSchema(text);
  //   } catch (error) {
  //     console.error('Error extracting schema:', error);
  //     return null;
  //   }
  // };
  
  // Функция для форматирования markdown-текста
  const formatMessage = (text: string) => {
    // Заменяем заголовки
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
      .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
      // Заменяем списки
      .replace(/\n\* (.*?)(\n|$)/g, '\n<li>$1</li>')
      // Заменяем переносы строк на <br>
      .replace(/\n/g, '<br>');
    
    return formatted;
  };

  return (
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <h2>{chatName}</h2>
        {isWsConnected && <span className={styles.wsIndicator} title="WebSocket подключен"></span>}
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Отправьте сообщение, чтобы начать диалог</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${message.isUser ? styles.userMessage : styles.assistantMessage}`}
              >
                <div className={styles.messageContent}>
                  <span className={styles.messageAuthor}>
                    {message.isUser ? 'Вы' : 'Ассистент'}
                  </span>
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                    className={styles.messageText}
                  />
                </div>
              </div>
            ))}
            {/* Индикатор загрузки */}
            {isLoading && (
              <div className={styles.loadingIndicator}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            )}
            {/* Невидимый элемент для прокрутки */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите сообщение..."
          className={styles.messageInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
} 