import { useMemo, useCallback } from 'react';
import dagre from 'dagre';
import { 
  ReactFlow, 
  Node, 
  Edge,
  ConnectionMode,
  Background,
  Controls,
} from '@xyflow/react';
import { JsonNode } from './JsonNode';
import '@xyflow/react/dist/style.css';
import styles from './JsonVisualizer.module.scss';

interface JsonVisualizerProps {
  data: any;
  onChange?: (newData: any) => void;
}

// Add helper function for creating unique IDs
const createNodeId = (path: string[]): string => {
  return path.length > 0 ? path.join('-') : 'root';
};

const createNodesAndEdges = (
  obj: any, 
  parentPath: string[] = [],
  onPropertyChange?: (path: string[], oldKey: string, newKey: string, value: any) => void,
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (typeof obj !== 'object' || obj === null) {
    return { nodes, edges };
  }

  // Create current node
  const currentId = createNodeId(parentPath);
  const primitiveProps = Object.entries(obj)
    .filter(([_, value]) => typeof value !== 'object' || value === null)
    .map(([key, value]) => ({key, value}));

  nodes.push({
    id: currentId,
    type: 'jsonNode',
    position: { x: 0, y: 0 }, // Will be positioned by dagre
    data: { 
      label: parentPath[parentPath.length - 1] || 'root',
      properties: primitiveProps,
      onPropertyChange: (oldKey: string, newKey: string, newValue: any) => {
        onPropertyChange?.(parentPath, oldKey, newKey, newValue);
      }
    },
    style: {
      width: 250,
      border: '1px solid #ccc',
      borderRadius: '8px',
      background: '#fff',
    },
  });

  // Process child nodes
  Object.entries(obj)
    .filter(([_, value]) => typeof value === 'object' && value !== null)
    .forEach(([key, value]) => {
      const childPath = [...parentPath, key];
      const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(
        value,
        childPath,
        onPropertyChange
      );

      nodes.push(...childNodes);

      // Create edge from current node to first child
      if (childNodes.length > 0) {
        edges.push({
          id: `e-${currentId}-${createNodeId(childPath)}`,
          source: currentId,
          target: createNodeId(childPath),
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#dc3545',
            strokeWidth: 2,
          },
        });
      }

      edges.push(...childEdges);
    });

  return { nodes, edges };
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure layout
  dagreGraph.setGraph({
    rankdir: 'TB',
    align: 'DL',
    nodesep: 50,
    ranksep: 200,
    edgesep: 80,
  });

  // Add nodes and edges
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get positioned nodes
  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const JsonVisualizer = ({ data, onChange }: JsonVisualizerProps) => {
  const handlePropertyChange = useCallback((path: string[], oldKey: string, newKey: string, value: any) => {
    if (!onChange) return;
    
    const newData = JSON.parse(JSON.stringify(data)); // Deep clone to avoid reference issues
    let current = newData;
    let parent = null;
    
    // Navigate to the parent of the target object
    for (let i = 0; i < path.length; i++) {
      parent = current;
      current = current[path[i]];
    }
    
    // Handle the change
    if (parent === null) {
      // We're at root level
      if (oldKey !== newKey) {
        delete newData[oldKey];
      }
      newData[newKey] = value;
    } else {
      // We're at a nested level
      if (oldKey !== newKey) {
        delete current[oldKey];
      }
      current[newKey] = value;
    }
    
    onChange(newData);
  }, [data, onChange]);

  const { nodes, edges } = useMemo(() => {
    const elements = createNodesAndEdges(data, [], handlePropertyChange);
    return getLayoutedElements(elements.nodes, elements.edges);
  }, [data, handlePropertyChange]);

  return (
    <div className={styles.visualizerWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ jsonNode: JsonNode }}
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