import { ChatInterface } from '@/components/ChatInterface'
import { JsonSchema } from '@/components/JsonSchema'
import { ResizablePanels } from '@/components/ResizablePanels'
import styles from './Home.module.scss'

export const Home = () => {
  return (
    <div className={styles.homePage}>
      <ResizablePanels 
        leftPanel={<ChatInterface chatName="МТС Ассистент" />}
        rightPanel={<JsonSchema />}
        leftButtonLabel="Чат"
        rightButtonLabel="Схема"
        storageKeyPrefix="home_"
        initialLeftSize={50}
        initialRightSize={50}
      />
    </div>
  )
} 