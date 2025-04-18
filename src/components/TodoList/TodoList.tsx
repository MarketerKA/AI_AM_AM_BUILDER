import { useState } from 'react'
import styles from './TodoList.module.scss'

export const TodoList = () => {
  const [todos, setTodos] = useState<string[]>([
    'Изучить React', 
    'Освоить TypeScript', 
    'Создать проект с нуля'
  ])

  return (
    <div className={styles.todoList}>
      <h2>Список задач</h2>
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
