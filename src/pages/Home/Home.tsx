import { ChatInterface } from '@/components/ChatInterface'
import { JsonSchema } from '@/components/JsonSchema'
import styles from './Home.module.scss'

export const Home = () => {
  return (
    <div className={styles.homePage}>
      <h1 className={styles.title}>Чат с МТС Ассистентом</h1>
      
      <div className={styles.chatContainer}>
        <div className={styles.chatColumn}>
          <h2 className={styles.columnTitle}>Сообщения</h2>
          <ChatInterface chatName="МТС Ассистент" />
        </div>
        
        <div className={styles.chatColumn}>
          <h2 className={styles.columnTitle}>Валидация схемы</h2>
          <JsonSchema />
        </div>
      </div>
    </div>
  )
} 