import { useState, useCallback } from 'react'
import styles from './JsonSchema.module.scss'
import ReactJson from 'react-json-view'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'


const initialSchema = {
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

export const JsonSchema = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'visualization' | 'preview' | 'editor'>('code')
  const [schema, setSchema] = useState(initialSchema)
  const [editorError, setEditorError] = useState<string | null>(null)

  const handleEditorChange = useCallback((value: string) => {
    try {
      const parsedValue = JSON.parse(value)
      setSchema(parsedValue)
      setEditorError(null)
    } catch (e) {
      setEditorError('Invalid JSON format')
    }
  }, [])

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
          className={`${styles.tabButton} ${activeTab === 'editor' ? styles.active : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Редактировать
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
              <ReactJson
                src={schema}
                style={{ backgroundColor: 'transparent' }}
                displayDataTypes={false}
                enableClipboard={true}
              />
            </pre>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className={styles.editorTab}>
            {editorError && (
              <div className={styles.errorMessage}>
                <p>{editorError}</p>
              </div>
            )}
            <CodeMirror
              value={JSON.stringify(schema, null, 2)}
              height="100%"
              extensions={[
                json(),
                EditorView.lineWrapping
              ]}
              onChange={handleEditorChange}
              className={styles.codeMirrorEditor}
            />
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