import { useState, FormEvent, useRef, useEffect } from 'react'
import styles from './ChatInterface.module.scss'
import apiService, { ChatMessage as ApiChatMessage, SchemaData } from '@/services/api'

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Функция для прокрутки вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Прокручиваем вниз при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Проверяем статус API при загрузке
  useEffect(() => {
    const checkApiStatus = async () => {
      const isOnline = await apiService.checkStatus();
      
      if (isOnline) {
        setMessages([
          { text: 'API сервер доступен и готов к работе', isUser: false }
        ]);
      } else {
        setMessages([
          { text: 'Ошибка подключения к API серверу. Пожалуйста, убедитесь, что сервер запущен на http://localhost:8000', isUser: false }
        ]);
      }
    };
    
    checkApiStatus();
  }, []);
  
  // Обработчик обновления схемы из API
  const handleSchemaUpdate = (data: SchemaData) => {
    // Ничего не делаем - схема обрабатывается в JsonSchema компоненте
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
      
      try {
        // Создаем список сообщений для API
        const apiMessages: ApiChatMessage[] = messages
          .map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }));
        
        // Добавляем новое сообщение пользователя
        apiMessages.push({
          role: 'user',
          content: userMessage.text
        });
        
        // Отправляем запрос к API
        const response = await apiService.chatCompletion({
          model: 'mws-gpt-alpha',
          messages: apiMessages
        });
        
        if (response.success && response.data) {
          const aiMessageContent = response.data.choices[0]?.message?.content || 'Нет ответа от сервера';
          console.log("Получен ответ от API:", aiMessageContent);
          
          // Извлекаем JSON из ответа, если он есть
          const schemaData = apiService.extractSchemaFromResponse(aiMessageContent);
          
          // Добавляем только текстовое объяснение в чат
          let explanationText = aiMessageContent;
          
          if (schemaData) {
            console.log("Извлечена схема:", schemaData.schema);
            explanationText = schemaData.explanation;
          } else {
            // Если не удалось извлечь JSON, попробуем удалить код из ответа вручную
            explanationText = aiMessageContent.replace(/```json[\s\S]*?```/g, '').trim();
            
            // Попробуем найти JSON без маркеров кода
            const jsonMatch = aiMessageContent.match(/(\{[\s\S]*\})/);
            if (jsonMatch) {
              try {
                const jsonText = jsonMatch[1];
                const schema = JSON.parse(jsonText);
                
                // Создаем и отправляем данные схемы вручную
                apiService.updateSchema({
                  explanation: explanationText,
                  schema: schema
                });
                
                console.log("Извлечена схема без маркеров:", schema);
              } catch (error) {
                console.error("Ошибка при попытке извлечь JSON без маркеров:", error);
              }
            }
          }
          
          // Добавляем ответ системы
          setMessages(prevMessages => [
            ...prevMessages, 
            { text: explanationText, isUser: false }
          ]);
        } else {
          // Если произошла ошибка
          setMessages(prevMessages => [
            ...prevMessages, 
            { text: `Ошибка: ${response.error || 'Неизвестная ошибка'}`, isUser: false }
          ]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Добавляем сообщение об ошибке
        setMessages(prevMessages => [
          ...prevMessages, 
          { text: 'Произошла ошибка при отправке сообщения. Проверьте консоль для деталей.', isUser: false }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
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