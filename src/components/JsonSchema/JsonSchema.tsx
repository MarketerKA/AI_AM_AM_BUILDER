import { useState } from 'react'
import styles from './JsonSchema.module.scss'

const initialSchema = `{
  "type": "object",
  "properties": {
    "order": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array"
        }
      }
    }
  }
}`

export const JsonSchema = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'visualization' | 'preview'>('code')
  const [schema, setSchema] = useState(initialSchema)
  
  // Проверяем наличие поля customer в объекте order
  const hasCustomerField = schema.includes('"customer"')
  
  // Функция для автоматического добавления поля customer
  const addCustomerField = () => {
    try {
      const schemaObj = JSON.parse(schema)
      if (schemaObj.properties && schemaObj.properties.order && schemaObj.properties.order.properties) {
        schemaObj.properties.order.properties.customer = {
          "type": "string"
        }
        setSchema(JSON.stringify(schemaObj, null, 2))
      }
    } catch (e) {
      console.error('Ошибка при парсинге JSON', e)
    }
  }
  
  // Форматирование строки кода с подсветкой синтаксиса
  const formatCodeLine = (line: string) => {
    return line
      .replace(/"([^"]+)":/g, '<span class="property">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="string">"$1"</span>')
      .replace(/"type": "([^"]+)"/g, '"type": <span class="type">"$1"</span>')
      .replace(/([{}[\]])/g, '<span class="bracket">$1</span>')
  }
  
  return (
    <div className={styles.jsonSchema}>
      <div className={styles.schemaHeader}>
        <h2>JSON Schema</h2>
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'code' ? styles.active : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Код
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'visualization' ? styles.active : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          Визуализация
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Предпросмотр
        </button>
      </div>
      
      <div className={styles.schemaContent}>
        {activeTab === 'code' && (
          <div className={styles.codeTab}>
            <pre className={styles.codeEditor}>
              {schema.split('\n').map((line, index) => (
                <div key={index} className={styles.codeLine}>
                  <span className={styles.lineNumber}>{index + 1}</span>
                  <code dangerouslySetInnerHTML={{ __html: formatCodeLine(line) }} />
                </div>
              ))}
            </pre>
          </div>
        )}
        
        {activeTab === 'visualization' && (
          <div className={styles.visualizationTab}>
            <p>Визуализация схемы будет здесь</p>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div className={styles.previewTab}>
            <p>Предпросмотр данных будет здесь</p>
          </div>
        )}
        
        {!hasCustomerField && (
          <div className={styles.errorMessage}>
            <p>Внимание! Отсутствует обязательное поле: "customer" в объекте "order"</p>
            <button className={styles.addButton} onClick={addCustomerField}>
              <span className={styles.addIcon}>⊕</span> Добавить автоматически
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 