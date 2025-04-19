import { useState, useCallback } from 'react'
import styles from './JsonSchema.module.scss'
import ReactJson from 'react-json-view'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { JsonVisualizer } from './JsonVisualizer/JsonVisualizer'

const initialSchema = {
    "id": 1,
    "name": "Аренда квартир посуточно",
    "description": "Мы предлагаем вам аренду квартир посуточно в центре города",
    "services": [
      {
        "id": 1,
        "name": "Аренда квартиры",
        "description": "Аренда квартиры посуточно",
        "price": 1000,
        "currency": "RUB"
      },
      {
        "id": 2,
        "name": "Услуги хостесс",
        "description": "Услуги хостесс: прием и выдача ключей, обеспечение чистотой и безопасностью",
        "price": 500,
        "currency": "RUB"
      },
      {
        "id": 3,
        "name": "Парковка",
        "description": "Парковка автомобиля на месте",
        "price": 200,
        "currency": "RUB"
      },
      {
        "id": 4,
        "name": "Доставка еды",
        "description": "Доставка еды из nearby ресторанов",
        "price": 300,
        "currency": "RUB"
      }
    ],
    "payment_methods": [
      {
        "id": 1,
        "name": "Наличные",
        "description": "Наличные"
      },
      {
        "id": 2,
        "name": "Кредитная карта",
        "description": "Кредитная карта"
      },
      {
        "id": 3,
        "name": "Банковский перевод",
        "description": "Банковский перевод"
      }
    ],
    "address": {
      "street": "Ленина",
      "house": 12,
      "apartment": 5
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
            <div className={`${styles.codeEditor}`}>
              <ReactJson
                src={schema}
                style={{ backgroundColor: 'transparent' }}
                displayDataTypes={false}
                enableClipboard={true}
              />
            </div>
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
                extensions={[json()]}
                onChange={handleEditorChange}
                className={styles.codeMirrorEditor}
              />
          </div>
        )}

        {activeTab === 'visualization' && (
          <div className={styles.visualizationTab}>
            <JsonVisualizer data={schema} />
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