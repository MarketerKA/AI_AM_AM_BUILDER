import { ChatInterface } from '@/components/ChatInterface'
import styles from './Home.module.scss'

export const Home = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Чат с МТС Ассистентом</h1>
        <ChatInterface />
      </div>
    </div>
  )
} 