import { useState } from 'react'
import styles from './TodoList.module.scss'

export const TodoList = () => {
  const [todos, setTodos] = useState<string[]>([
    'Learn React', 
    'Master TypeScript', 
    'Build a project'
  ])

  return (
    <div className={styles.todoList}>
      <h2>My Todo List</h2>
      <ul>
        {todos.map((todo, index) => (
          <li key={index} className={styles.todoItem}>
            {todo}
          </li>
        ))}
      </ul>
    </div>
  )
}
