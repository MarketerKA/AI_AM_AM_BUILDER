import { useMemo } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge,
  ConnectionMode,
  Background,
  Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './JsonVisualizer.module.scss';

interface JsonVisualizerProps {
  data: any;
}

const createNodesAndEdges = (obj: any, parentId?: string, x = 0, y = 0, level = 0): { nodes: Node[], edges: Edge[], width: number } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const baseSpacing = 50; // Базовый отступ между узлами
    const ySpacing = 250; // Вертикальный отступ между уровнями
  
    if (typeof obj === 'object' && obj !== null) {
      // Создаем массив объектных свойств
      const objectProps = Object.entries(obj).filter(([_, value]) => typeof value === 'object' && value !== null);
      
      // Сначала получаем ширину всех дочерних элементов
      const childrenLayouts = objectProps.map(([key, value]) => 
        createNodesAndEdges(value, key, 0, 0, level + 1)
      );
      
      // Вычисляем необходимую ширину для текущего уровня
      const totalChildrenWidth = childrenLayouts.reduce((sum, layout) => sum + layout.width, 0);
      const spacingMultiplier = Math.max(1, Math.min(3, Math.floor(totalChildrenWidth / 1000)));
      const adjustedSpacing = baseSpacing * spacingMultiplier;
      const currentLevelWidth = Math.max(
        200, // Минимальная ширина узла
        totalChildrenWidth + (childrenLayouts.length - 1) * adjustedSpacing
      );
  
      // Создаем текущий узел
      const primitiveProps = Object.entries(obj)
        .filter(([_, value]) => typeof value !== 'object' || value === null)
        .map(([key, value]) => ({key, value}));
  
      const currentId = parentId ? `${parentId}-${Object.keys(obj).length}` : '1';
  
      nodes.push({
        id: currentId,
        position: { x, y },
        data: { 
          label: (
            <div style={{ padding: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {parentId || 'root'}
              </div>
              {primitiveProps.length > 0 && (
                <div style={{ fontSize: '12px', textAlign: 'left' }}>
                  {primitiveProps.map(({key, value}, i) => (
                    <div key={i}>
                      <span style={{ fontWeight: 'bold' }}>{key}: </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        },
        style: {
          minWidth: '200px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          background: '#fff',
        },
      });
  
      // Распределяем дочерние элементы
      let startX = x - currentLevelWidth / 2;
      childrenLayouts.forEach((layout) => {
        const childWidth = layout.width;
        const childX = startX + childWidth / 2;
        
        // Добавляем узлы и ребра дочернего элемента с пересчитанными координатами
        const shiftedNodes = layout.nodes.map(node => ({
          ...node,
          position: {
            x: node.position.x + childX,
            y: node.position.y + y + ySpacing
          }
        }));
        
        nodes.push(...shiftedNodes);
        edges.push(...layout.edges);
        edges.push({
          id: `e${currentId}-${shiftedNodes[0].id}`,
          source: currentId,
          target: shiftedNodes[0].id,
          type: 'step',
          animated: true,
          style: { 
            stroke: '#dc3545',
            strokeWidth: 2,
            opacity: 0.8,
          },
        });
  
        startX += childWidth + adjustedSpacing;
      });
  
      return { nodes, edges, width: currentLevelWidth };
    }
  
    return { nodes, edges, width: 200 }; // Базовая ширина для листовых узлов
  };

export const JsonVisualizer = ({ data }: JsonVisualizerProps) => {
  const { nodes, edges } = useMemo(() => {
    const { nodes, edges } = createNodesAndEdges(data);
    return { nodes, edges };
  }, [data]);

  return (
    <div className={styles.visualizerWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={1.5}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls 
          position="bottom-right"
          style={{ margin: 20 }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};
