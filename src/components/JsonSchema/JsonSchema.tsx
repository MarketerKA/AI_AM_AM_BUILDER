import { useState } from 'react'
import styles from './JsonSchema.module.scss'
import JsonFormatter from 'react-json-formatter'

const initialSchema = `{
  "name": "zadacha-158",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-json-formatter": "^0.4.0",
    "react-resizable-panels": "^2.1.7"
  },
  "devDependencies": {
    "@types/node": "^22.14.1",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "gh-pages": "^6.3.0",
    "sass": "^1.69.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  },
  "devDependencies2": {
    "@types/node": "^22.14.1",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "gh-pages": "^6.3.0",
    "sass": "^1.69.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.4"
  },
  "devDependencies3": {
    "@types/node": "^22.14.1",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "gh-pages": "^6.3.0",
    "sass": "^1.69.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.1"
  }
    
}
`

export const JsonSchema = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'visualization' | 'preview'>('code')
  const [schema] = useState(initialSchema)
  // Стили для форматтера JSON
  const jsonStyle = {
    propertyStyle: { color: '#E30613', fontWeight: 'bold' },
    stringStyle: { color: '#28a745' },
    numberStyle: { color: '#0066cc', fontWeight: 'bold' },
    booleanStyle: { color: '#ff8c00', fontWeight: 'bold' },
    colonStyle: { color: '#333' },
    commaStyle: { color: '#333' },
    braceStyle: { color: '#444', lineHeight: 1.8 }
  }
  
  return (
    <div className={styles.jsonSchema}>
      <div className={styles.schemaHeader}>
        <h2>JSON Schema Editor</h2>
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
              <JsonFormatter 
                json={schema}
                tabWith={4}
                jsonStyle={jsonStyle}
              />
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
      </div>
    </div>
  )
} 