import { TodoList } from './components/TodoList'
import styles from './App.module.scss'


function App() {
  return (
    <div className={styles.app}>
      <h1>Todo App</h1>
      <TodoList />
    </div>
  )
}

export default App 