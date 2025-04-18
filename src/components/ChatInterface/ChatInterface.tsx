import { useState, FormEvent, useRef, useEffect } from 'react'
import styles from './ChatInterface.module.scss'

interface ChatInterfaceProps {
  chatName?: string;
}

export const ChatInterface = ({ chatName = 'МТС Ассистент' }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Функция для прокрутки вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Прокручиваем вниз при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      // Добавляем сообщение пользователя
      setMessages([...messages, { text: inputValue, isUser: true }]);
      
      // Добавляем ответ системы
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Иди нахуй!', isUser: false }]);
      }, 500);
      
      setInputValue('');
    }
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
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
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
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!inputValue.trim()}
        >
          Отправить
        </button>
      </form>
    </div>
  );
} 