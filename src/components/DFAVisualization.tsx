import { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type NodeProps,
  ReactFlowProvider,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import type { TMDefinition } from '../engine/types';

interface Props {
  definition: TMDefinition | null;
  currentState: string | null;
}

// Custom node component for states
function StateNode({ data }: NodeProps) {
  const isActive = data.isActive as boolean;
  const isAccept = data.isAccept as boolean;
  const isReject = data.isReject as boolean;
  const isStart = data.isStart as boolean;
  const label = data.label as string;

  let borderColor = 'border-cyan-500/40';
  let bgColor = 'bg-[#12121e]';
  let textColor = 'text-cyan-300';
  let shadow = '';
  let ring = '';

  if (isActive) {
    borderColor = 'border-cyan-400';
    bgColor = 'bg-cyan-500/15';
    textColor = 'text-cyan-200';
    shadow = 'shadow-[0_0_25px_rgba(34,211,238,0.5)]';
  }
  if (isAccept) {
    borderColor = isActive ? 'border-green-400' : 'border-green-500/40';
    bgColor = isActive ? 'bg-green-500/15' : 'bg-[#12121e]';
    textColor = isActive ? 'text-green-200' : 'text-green-400';
    shadow = isActive ? 'shadow-[0_0_25px_rgba(74,222,128,0.5)]' : '';
    ring = 'ring-2 ring-green-500/30 ring-offset-2 ring-offset-[#0a0a0f]';
  }
  if (isReject) {
    borderColor = isActive ? 'border-red-400' : 'border-red-500/40';
    bgColor = isActive ? 'bg-red-500/15' : 'bg-[#12121e]';
    textColor = isActive ? 'text-red-200' : 'text-red-400';
    shadow = isActive ? 'shadow-[0_0_25px_rgba(248,113,113,0.5)]' : '';
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Left} id="left-target" className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Right} id="right-target" className="!opacity-0 !w-1 !h-1" />
      <div
        className={`
          flex items-center justify-center
          w-[68px] h-[68px] rounded-full border-2
          ${borderColor} ${bgColor} ${textColor} ${shadow} ${ring}
          font-mono text-[11px] font-bold
          transition-all duration-300
        `}
        style={{ fontFamily: '"Fira Code", monospace' }}
      >
        {label}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-400"
            style={{
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              opacity: 0.2,
            }}
          />
        )}
      </div>
      {isStart && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2">
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <polygon points="0,0 22,9 0,18" fill="rgba(34,211,238,0.7)" />
          </svg>
        </div>
      )}
      <Handle type="source" position={Position.Top} id="top-source" className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Right} className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Left} id="left-source" className="!opacity-0 !w-1 !h-1" />
    </div>
  );
}

const nodeTypes = { stateNode: StateNode };

/**
 * Compute a hierarchical BFS layout.
 * Keep terminal states near their natural layer but offset vertically.
 */
function computeLayout(
  states: string[],
  transitions: TMDefinition['transitions'],
  startState: string,
  acceptStates: string[],
  rejectStates: string[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Build adjacency (excluding self-loops)
  const adj = new Map<string, Set<string>>();
  for (const s of states) adj.set(s, new Set());
  for (const t of transitions) {
    if (t.fromState !== t.toState) {
      adj.get(t.fromState)?.add(t.toState);
    }
  }

  // BFS from startState to determine layers
  const visited = new Set<string>();
  const layers: string[][] = [];
  const queue: string[] = [startState];
  visited.add(startState);

  while (queue.length > 0) {
    const layerSize = queue.length;
    const layer: string[] = [];
    for (let i = 0; i < layerSize; i++) {
      const s = queue.shift()!;
      layer.push(s);
      for (const next of adj.get(s) || []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    layers.push(layer);
  }

  // Add unreachable states to the last layer
  for (const s of states) {
    if (!visited.has(s)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(s);
    }
  }

  // Keep natural BFS layers — DON'T forcefully move terminals
  // This prevents super-long edges across the entire diagram

  // Layout parameters
  const LAYER_SPACING_X = 200;
  const NODE_SPACING_Y = 130;
  const PADDING_LEFT = 120;
  const PADDING_TOP = 100;

  // Find total height needed per layer and center vertically
  const maxLayerSize = Math.max(...layers.map(l => l.length));
  const totalHeight = maxLayerSize * NODE_SPACING_Y;

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    const layerHeight = layer.length * NODE_SPACING_Y;
    const offsetY = (totalHeight - layerHeight) / 2;

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      positions.set(layer[nodeIdx], {
        x: layerIdx * LAYER_SPACING_X + PADDING_LEFT,
        y: nodeIdx * NODE_SPACING_Y + offsetY + PADDING_TOP,
      });
    }
  }

  return positions;
}

function DFAVisualizationInner({ definition, currentState }: Props) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [exporting, setExporting] = useState(false);

  // Build nodes and edges from definition
  useEffect(() => {
    if (!definition) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const states = definition.states;
    const positions = computeLayout(
      states,
      definition.transitions,
      definition.startState,
      definition.acceptStates,
      definition.rejectStates
    );

    const newNodes: Node[] = states
      .filter(state => positions.has(state))
      .map((state) => ({
        id: state,
        type: 'stateNode',
        position: positions.get(state)!,
        data: {
          label: state,
          isActive: state === currentState,
          isAccept: definition.acceptStates.includes(state),
          isReject: definition.rejectStates.includes(state),
          isStart: state === definition.startState,
        },
      }));

    // Build edges: group transitions by (fromState, toState)
    const edgeMap = new Map<string, string[]>();
    for (const t of definition.transitions) {
      const key = `${t.fromState}|${t.toState}`;
      const readStr = t.readSymbols.map(s => s === '_' ? '␣' : s).join(',');
      const writeStr = t.writeSymbols.map(s => s === '_' ? '␣' : s).join(',');
      const dirStr = t.directions.join(',');
      const label = `${readStr}→${writeStr},${dirStr}`;
      if (!edgeMap.has(key)) edgeMap.set(key, []);
      edgeMap.get(key)!.push(label);
    }

    // Track pairs for bidirectional offsets
    const processedPairs = new Set<string>();

    const newEdges: Edge[] = [];
    let edgeIdx = 0;
    for (const [key, labels] of edgeMap) {
      const [from, to] = key.split('|');
      const isSelfLoop = from === to;
      const isActive = from === currentState;

      // Compact label: show count if too many
      let combinedLabel: string;
      if (labels.length > 3) {
        combinedLabel = `${labels.length} transitions`;
      } else if (labels.length > 1) {
        combinedLabel = labels.slice(0, 2).join(' | ');
        if (labels.length > 2) combinedLabel += ` +${labels.length - 2}`;
      } else {
        combinedLabel = labels[0];
      }

      // Check for bidirectional edges
      const reversePair = `${to}|${from}`;
      const hasBidi = edgeMap.has(reversePair) && from !== to;
      const pairKey = [from, to].sort().join('::');
      const isFirstOfPair = !processedPairs.has(pairKey);
      if (hasBidi) processedPairs.add(pairKey);

      // Determine edge handles for bidirectional edges
      let sourceHandle: string | undefined;
      let targetHandle: string | undefined;
      if (isSelfLoop) {
        sourceHandle = 'top-source';
        targetHandle = 'bottom-target';
      } else if (hasBidi && !isFirstOfPair) {
        sourceHandle = 'bottom-source';
        targetHandle = 'bottom-target';
      }

      newEdges.push({
        id: `e-${edgeIdx++}`,
        source: from,
        target: to,
        type: 'smoothstep',
        animated: isActive,
        label: combinedLabel,
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 6,
        labelBgStyle: {
          fill: '#0c0c16',
          fillOpacity: 0.95,
          stroke: isActive ? 'rgba(34,211,238,0.3)' : 'rgba(100,116,139,0.15)',
          strokeWidth: 1,
        },
        labelStyle: {
          fontFamily: '"Fira Code", monospace',
          fontSize: 8,
          fill: isActive ? '#67e8f9' : '#64748b',
          fontWeight: isActive ? 600 : 400,
        },
        style: {
          stroke: isActive
            ? '#22d3ee'
            : isSelfLoop
            ? 'rgba(168,85,247,0.35)'
            : 'rgba(100,116,139,0.3)',
          strokeWidth: isActive ? 2 : 1.2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#22d3ee' : 'rgba(100,116,139,0.45)',
          width: 14,
          height: 14,
        },
        ...(sourceHandle ? { sourceHandle } : {}),
        ...(targetHandle ? { targetHandle } : {}),
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [definition, currentState, setNodes, setEdges]);

  // Update only active highlight without full rebuild
  useEffect(() => {
    if (!definition || !currentState) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isActive: n.id === currentState },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => {
        const isActive = e.source === currentState;
        const isSelfLoop = e.source === e.target;
        return {
          ...e,
          animated: isActive,
          labelStyle: {
            ...(e.labelStyle as object),
            fill: isActive ? '#67e8f9' : '#64748b',
            fontWeight: isActive ? 600 : 400,
          },
          labelBgStyle: {
            ...(e.labelBgStyle as object),
            stroke: isActive ? 'rgba(34,211,238,0.3)' : 'rgba(100,116,139,0.15)',
          },
          style: {
            stroke: isActive
              ? '#22d3ee'
              : isSelfLoop
              ? 'rgba(168,85,247,0.35)'
              : 'rgba(100,116,139,0.3)',
            strokeWidth: isActive ? 2 : 1.2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isActive ? '#22d3ee' : 'rgba(100,116,139,0.45)',
            width: 14,
            height: 14,
          },
        };
      })
    );
  }, [currentState, setNodes, setEdges]);

  const handleExport = useCallback(async () => {
    if (!flowRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 3,
        filter: (node) => {
          const el = node as HTMLElement;
          if (!el.classList) return true;
          if (el.classList.contains('react-flow__controls')) return false;
          if (el.classList.contains('react-flow__attribution')) return false;
          return true;
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `turing-machine-dfa-${definition?.name?.replace(/\s+/g, '-') || 'export'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('PNG export encountered an issue. Please try again.');
    }
    setExporting(false);
  }, [definition]);

  if (!definition) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl bg-[#0d0d15]/60 border border-cyan-500/10 backdrop-blur-md">
        <span className="text-cyan-500/30 font-mono text-sm">
          State diagram will appear here
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-xl overflow-hidden border border-cyan-500/10">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="absolute top-3 right-3 z-50 px-4 py-2 rounded-lg border border-pink-500/40 
                   text-pink-400 text-xs font-bold uppercase tracking-wider
                   bg-[#0d0d15]/90 backdrop-blur-sm
                   hover:bg-pink-500/15 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,0,255,0.15)]
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-wait"
      >
        {exporting ? '⏳ Exporting...' : '⬇ Export DFA (PNG)'}
      </button>

      <div ref={flowRef} className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.35, maxZoom: 1.1 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background color="rgba(34,211,238,0.04)" gap={25} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-[#12121e] !border-cyan-500/20 !shadow-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function DFAVisualization(props: Props) {
  return (
    <ReactFlowProvider>
      <DFAVisualizationInner {...props} />
    </ReactFlowProvider>
  );
}
