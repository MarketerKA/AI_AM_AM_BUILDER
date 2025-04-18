import { ChatInterface } from '@/components/ChatInterface'
import { JsonSchema } from '@/components/JsonSchema'
import styles from './Home.module.scss'

export const Home = () => {
  return (
    <div className={styles.homePage}>
      {/* <h1 className={styles.title}>by: Инно ТИПУЛИ</h1> */}
      
      <div className={styles.chatContainer}>
        <div className={styles.chatColumn}>
          <ChatInterface chatName="МТС Ассистент" />
        </div>
        
        <div className={styles.chatColumn}>
          <JsonSchema />
        </div>
      </div>
    </div>
  )
} 