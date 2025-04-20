import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './JsonNode.module.scss';

interface NodeData {
  label: string;
  properties: { key: string; value: any }[];
  onPropertyChange: (oldKey: string, newKey: string, newValue: any) => void;
}

export const JsonNode = memo(({ data }: { data: NodeData }) => {
  const [editingState, setEditingState] = useState<{
    index: number | null;
    type: 'key' | 'value' | null;
    value: string;
  }>({ index: null, type: null, value: '' });

  const handleDoubleClick = (index: number, key: string, value: any, type: 'key' | 'value') => {
    setEditingState({
      index,
      type,
      value: type === 'key' ? key : String(value)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, _: number, key: string, value: any) => {
    if (e.key === 'Enter') {
      const { type, value: newValue } = editingState;
      if (type === 'key') {
        data.onPropertyChange(key, newValue, value);
      } else {
        data.onPropertyChange(key, key, parseValue(newValue));
      }
      setEditingState({ index: null, type: null, value: '' });
    } else if (e.key === 'Escape') {
      setEditingState({ index: null, type: null, value: '' });
    }
  };

  const parseValue = (value: string) => {
    try {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      const num = Number(value);
      return isNaN(num) ? value : num;
    } catch {
      return value;
    }
  };

  return (
    <div className={styles.node}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ background: '#dc3545', width: '8px', height: '8px' }}
      />
      <div className={styles.header}>{data.label}</div>
      <div className={styles.content}>
        {data.properties.map(({ key, value }, index) => (
          <div key={key} className={styles.property}>
            {editingState.index === index && editingState.type === 'key' ? (
              <textarea
                value={editingState.value}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setEditingState(prev => ({ ...prev, value: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleKeyDown(e, index, key, value);
                  }
                }}
                onBlur={() => setEditingState({ index: null, type: null, value: '' })}
                autoFocus
                className={styles.editTextarea}
                onClick={(e) => e.stopPropagation()}
                rows={1}
              />
            ) : (
              <span 
                className={styles.propertyKey}
                onDoubleClick={() => handleDoubleClick(index, key, value, 'key')}
              >
                {key}:
              </span>
            )}
            {editingState.index === index && editingState.type === 'value' ? (
              <textarea
                value={editingState.value}
                onChange={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setEditingState(prev => ({ ...prev, value: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleKeyDown(e, index, key, value);
                  }
                }}
                onBlur={() => setEditingState({ index: null, type: null, value: '' })}
                autoFocus
                className={styles.editTextarea}
                rows={1}
              />
            ) : (
              <span 
                className={styles.propertyValue}
                onDoubleClick={() => handleDoubleClick(index, key, value, 'value')}
              >
                {String(value)}
              </span>
            )}
          </div>
        ))}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ background: '#dc3545', width: '8px', height: '8px' }}
      />
    </div>
  );
});

JsonNode.displayName = 'JsonNode';
