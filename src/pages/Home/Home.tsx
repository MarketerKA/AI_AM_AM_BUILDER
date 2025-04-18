import { TodoList } from '@/components/TodoList'
import styles from './Home.module.scss'

export const Home = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Todo App</h1>
        <TodoList />
      </div>
    </div>
  )
} 