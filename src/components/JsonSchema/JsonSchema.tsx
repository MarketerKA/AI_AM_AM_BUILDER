import { useState, useCallback, useEffect, useRef } from 'react'
import styles from './JsonSchema.module.scss'
import ReactJson from 'react-json-view'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import webSocketService from '@/services/webSocketService'
import apiService from '@/services/api'
import { SchemaData, WebSocketMessage } from '@/types/api'
import { EVENTS } from '@/constants/api'

// Обновляю интерфейс типов для схемы, чтобы избежать ошибок TypeScript
interface SchemaType {
  [key: string]: any;
}

const initialSchema = {
  "id": "uuid",
  "name": "JSON Schema",
  "description": "Здесь будет отображаться JSON схема из чата",
  "version": "1.0.0",
  "note": "Отправьте запрос в чате, чтобы получить схему"
}

export const JsonSchema = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'editor'>('code')
  const [schema, setSchema] = useState<SchemaType>(initialSchema)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const schemaUpdated = useRef(false)

  // Обработчик обновления схемы из API
  const handleSchemaUpdate = useCallback((data: SchemaData) => {
    if (data && data.schema) {
      console.log('JsonSchema компонент получил обновление схемы:', data.schema);
      setSchema(data.schema);
      schemaUpdated.current = true;
      setStatusMessage('Получена новая JSON схема');
      
      // Автоматически переключаемся на вкладку "Код"
      setActiveTab('code');
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }
  }, []);
  
  // Подписываемся на обновления схемы
  useEffect(() => {
    console.log('Подписываемся на обновления схемы');
    apiService.onSchemaUpdate(handleSchemaUpdate);
    
    return () => {
      console.log('Отписываемся от обновлений схемы');
      apiService.offSchemaUpdate(handleSchemaUpdate);
    };
  }, [handleSchemaUpdate]);

  // Подключение к WebSocket при загрузке компонента
  useEffect(() => {
    // Обработчик для установки соединения
    const handleConnect = () => {
      setIsConnected(true);
      setStatusMessage('WebSocket подключен');
    };

    // Обработчик для разрыва соединения
    const handleDisconnect = () => {
      setIsConnected(false);
      setStatusMessage('WebSocket отключен');
    };

    // Обработчик ошибок
    const handleError = (message: WebSocketMessage) => {
      setStatusMessage(`Ошибка: ${message.content}`);
    };

    // Обработчик для системных сообщений
    const handleSystem = (message: WebSocketMessage) => {
      setStatusMessage(message.content);
    };

    // Обработчик для схем
    const handleSchema = (message: WebSocketMessage) => {
      if (message.data && message.data.schema) {
        console.log('Получена схема через WebSocket:', message.data.schema);
        setSchema(message.data.schema);
        schemaUpdated.current = true;
      }
    };

    // Подписка на события WebSocket
    webSocketService.on(EVENTS.CONNECT, handleConnect);
    webSocketService.on(EVENTS.DISCONNECT, handleDisconnect);
    webSocketService.on(EVENTS.ERROR, handleError);
    webSocketService.on(EVENTS.SYSTEM, handleSystem);
    webSocketService.on(EVENTS.SCHEMA_UPDATE, handleSchema);

    // Установка соединения
    webSocketService.connect();

    // Отписка от событий при размонтировании компонента
    return () => {
      webSocketService.off(EVENTS.CONNECT, handleConnect);
      webSocketService.off(EVENTS.DISCONNECT, handleDisconnect);
      webSocketService.off(EVENTS.ERROR, handleError);
      webSocketService.off(EVENTS.SYSTEM, handleSystem);
      webSocketService.off(EVENTS.SCHEMA_UPDATE, handleSchema);
      webSocketService.disconnect();
    };
  }, []);

  // Обработчик изменения JSON в редакторе
  const handleEditorChange = useCallback((value: string) => {
    try {
      const parsedValue = JSON.parse(value)
      setSchema(parsedValue)
      setEditorError(null)

      // Отправка обновленной схемы через WebSocket, если подключено
      if (isConnected) {
        webSocketService.sendMessage({
          type: EVENTS.SCHEMA_UPDATE,
          content: 'Schema update',
          data: { schema: parsedValue }
        });
      }
    } catch (e) {
      setEditorError('Invalid JSON format')
    }
  }, [isConnected]);

  // Функция копирования JSON в буфер обмена
  const copyJsonToClipboard = () => {
    try {
      const jsonString = JSON.stringify(schema, null, 2);
      navigator.clipboard.writeText(jsonString);
      setStatusMessage('JSON скопирован в буфер обмена');
      setTimeout(() => {
        setStatusMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setStatusMessage('Ошибка при копировании JSON');
    }
  };

  // Функция загрузки тестового примера JSON
  const loadTestExample = () => {
    const testSchema = {
      "id": "uuid",
      "name": "Аренда самокатов",
      "description": "Сервис для аренды самокатов в различных локациях",
      "status": "active",
      "users": [
        {
          "id": "uuid",
          "name": "Иван Иванов",
          "email": "ivan.ivanov@example.com",
          "phone": "+7 901 234 56 78",
          "address": {
            "id": "uuid",
            "street": "Улица Дзержинского",
            "house": "12",
            "apartment": "1",
            "city": "Москва",
            "country": "Россия"
          }
        }
      ],
      "samokaty": [
        {
          "id": "uuid",
          "name": "Самокат 1",
          "description": "Самокат для аренды",
          "status": "available",
          "location": {
            "id": "uuid",
            "street": "Улица Дзержинского",
            "house": "12",
            "apartment": "1",
            "city": "Москва",
            "country": "Россия"
          }
        },
        {
          "id": "uuid",
          "name": "Самокат 2",
          "description": "Самокат для аренды",
          "status": "available",
          "location": {
            "id": "uuid",
            "street": "Улица Дзержинского",
            "house": "12",
            "apartment": "2",
            "city": "Москва",
            "country": "Россия"
          }
        }
      ],
      "orders": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "samokat_id": "uuid",
          "start_date": "2023-03-01",
          "end_date": "2023-03-31",
          "status": "active"
        }
      ],
      "payments": [
        {
          "id": "uuid",
          "order_id": "uuid",
          "amount": "100.00",
          "payment_method": "credit_card",
          "status": "paid"
        }
      ]
    };
    
    setSchema(testSchema);
    schemaUpdated.current = true;
    setStatusMessage('Загружен тестовый пример JSON');
    
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  return (
    <div className={styles.jsonSchema}>
      <div className={styles.schemaHeader}>
        <h2>JSON Schema</h2>
        <div className={styles.statusIndicator} title={statusMessage || ''}>
          {statusMessage && <span className={styles.statusMessage}>{statusMessage}</span>}
          {schemaUpdated.current && !statusMessage && (
            <span className={styles.updatedBadge}>Обновлено</span>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'code' ? styles.active : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Код
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'editor' ? styles.active : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Редактировать
        </button>
      </div>

      <div className={styles.schemaContent}>
        {activeTab === 'code' && (
          <div className={styles.codeTab}>
            <div className={styles.actionsBar}>
              <div className={styles.actions}>
                <button 
                  className={styles.actionButton}
                  onClick={copyJsonToClipboard}
                >
                  Копировать JSON
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={loadTestExample}
                >
                  Тестовый пример
                </button>
              </div>
              <span className={styles.schemaInfo}>
                {Object.keys(schema).length > 0 && (
                  `Поля: ${Object.keys(schema).length}`
                )}
              </span>
            </div>
            <div className={styles.codeEditor}>
              <ReactJson
                src={schema}
                style={{ backgroundColor: 'transparent' }}
                displayDataTypes={false}
                enableClipboard={true}
                name={false}
                collapsed={false}
                displayObjectSize={false}
                indentWidth={2}
                theme="rjv-default"
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
              extensions={[
                json(),
                EditorView.lineWrapping
              ]}
              onChange={handleEditorChange}
              className={styles.codeMirrorEditor}
            />
          </div>
        )}
      </div>
    </div>
  )
}