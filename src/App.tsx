import { useEffect } from 'react'
import { Home } from './pages'
import styles from './App.module.scss'
import apiService from './services/api'
import webSocketService from './services/webSocketService'
import { API_URL } from './constants/api'

function App() {
  // Проверяем доступность API и WebSocket при загрузке приложения
  useEffect(() => {
    const checkServices = async () => {
      try {
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
    <div className={styles.app}>
      <Home />
    </div>
  )
}

export default App 