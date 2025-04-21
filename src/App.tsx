import { useEffect, useState } from 'react'
import { Home } from './pages'
import styles from './App.module.scss'
import apiService from './services/api'
import webSocketService from './services/webSocketService'
import { API_URL } from './constants/api'
import { ThemeProvider } from '@/contexts/ThemeContext';
import 'react18-json-view/src/style.css'

function App() {
  const [error, setError] = useState<string | null>(null);
  
  // Проверяем доступность API и WebSocket при загрузке приложения
  useEffect(() => {
    const checkServices = async () => {
      try {
        // Проверим протоколы
        const isHttps = window.location.protocol === 'https:';
        const apiUrlProtocol = API_URL.startsWith('https') ? 'https:' : 'http:';
        
        // Если загружаемся по HTTPS, но API работает по HTTP - предупредим
        if (isHttps && apiUrlProtocol === 'http:') {
          setError(
            'Ваш сайт загружен по HTTPS, но API использует незащищенное соединение HTTP. ' +
            'Браузер может блокировать такое подключение. Для корректной работы, ' +
            'либо используйте HTTP для локальной разработки, либо настройте HTTPS на бэкенде.'
          );
        }
        
        // Проверяем статус API
        const isApiOnline = await apiService.checkStatus();
        console.log(`API status (${API_URL}): ${isApiOnline ? 'online' : 'offline'}`);
        
        // Устанавливаем WebSocket соединение
        webSocketService.connect();
      } catch (error) {
        console.error('Error checking services:', error);
      }
    };
    
    checkServices();
    
    // Отключаем WebSocket при размонтировании
    return () => {
      webSocketService.disconnect();
    };
  }, []);
  
  return (
    <ThemeProvider>
      <div className={styles.app}>
        {error && (
          <div className={styles.errorBanner}>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Закрыть</button>
          </div>
        )}
        <Home />
      </div>
    </ThemeProvider>
  )
}

export default App