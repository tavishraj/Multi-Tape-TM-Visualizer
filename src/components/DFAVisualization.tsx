import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
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
  type EdgeProps,
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { TMDefinition } from '../engine/types';

interface Props {
  definition: TMDefinition | null;
  currentState: string | null;
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM STATE NODE — with floating & breathing animations
   ───────────────────────────────────────────────────────────── */

function StateNode({ data }: NodeProps) {
  const isActive = data.isActive as boolean;
  const isAccept = data.isAccept as boolean;
  const isReject = data.isReject as boolean;
  const isStart = data.isStart as boolean;
  const label = data.label as string;

  // Determine colors based on state type
  const colors = useMemo(() => {
    if (isAccept) {
      return {
        border: isActive ? '#4ade80' : 'rgba(74,222,128,0.4)',
        bg: isActive ? 'rgba(74,222,128,0.12)' : 'rgba(18,18,30,0.9)',
        text: isActive ? '#bbf7d0' : '#4ade80',
        glow: 'rgba(74,222,128,0.5)',
        ring: 'rgba(74,222,128,0.25)',
      };
    }
    if (isReject) {
      return {
        border: isActive ? '#f87171' : 'rgba(248,113,113,0.4)',
        bg: isActive ? 'rgba(248,113,113,0.12)' : 'rgba(18,18,30,0.9)',
        text: isActive ? '#fecaca' : '#f87171',
        glow: 'rgba(248,113,113,0.5)',
        ring: 'transparent',
      };
    }
    return {
      border: isActive ? '#22d3ee' : 'rgba(34,211,238,0.35)',
      bg: isActive ? 'rgba(34,211,238,0.1)' : 'rgba(18,18,30,0.9)',
      text: isActive ? '#cffafe' : '#67e8f9',
      glow: 'rgba(34,211,238,0.5)',
      ring: 'transparent',
    };
  }, [isActive, isAccept, isReject]);

  return (
    <div className="relative">
      {/* Invisible handles for edge connections */}
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Left} id="left-target" className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Right} id="right-target" className="!opacity-0 !w-1 !h-1" />

      <motion.div
        initial={false}
        animate={{
          scale: isActive ? 1.12 : 1,
          boxShadow: isActive
            ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}40`
            : `0 0 0px transparent`,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.8,
        }}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `2px solid ${colors.border}`,
          background: colors.bg,
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Fira Code", monospace',
          fontSize: 12,
          fontWeight: 700,
          position: 'relative',
          backdropFilter: 'blur(8px)',
        }}
      >
        {label}

        {/* Breathing animation for idle nodes */}
        <motion.div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1px solid ${colors.border}`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />

        {/* Active ping ripple */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${colors.border}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Accept state double ring */}
        {isAccept && (
          <motion.div
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: `2px solid ${colors.ring}`,
            }}
            animate={{
              boxShadow: isActive
                ? [
                    `0 0 8px ${colors.glow}`,
                    `0 0 20px ${colors.glow}`,
                    `0 0 8px ${colors.glow}`,
                  ]
                : `0 0 0px transparent`,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      {/* Start state arrow */}
      {isStart && (
        <motion.div
          className="absolute -left-9 top-1/2 -translate-y-1/2"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
            <polygon points="0,0 24,10 0,20" fill="rgba(34,211,238,0.7)" />
            <polygon points="0,0 24,10 0,20" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
          </svg>
        </motion.div>
      )}

      <Handle type="source" position={Position.Top} id="top-source" className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Right} className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Left} id="left-source" className="!opacity-0 !w-1 !h-1" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM ANIMATED EDGE — with flow animation & glow
   ───────────────────────────────────────────────────────────── */

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps) {
  const isActive = (data?.isActive as boolean) || false;
  const isSelfLoop = (data?.isSelfLoop as boolean) || false;
  const edgeLabel = (data?.label as string) || '';

  // For self-loops, create a proper round circular arc
  // For normal edges, use bezier curves
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isSelfLoop) {
    // Create a circular self-loop that goes up from the node
    const loopRadius = 30;
    const loopHeight = 50;
    // Source and target are at similar positions for self-loops
    const cx = (sourceX + targetX) / 2;
    const cy = Math.min(sourceY, targetY);
    
    // Cubic bezier for a nice round loop going upward
    edgePath = `M ${sourceX} ${sourceY} C ${sourceX - loopRadius} ${cy - loopHeight}, ${targetX + loopRadius} ${cy - loopHeight}, ${targetX} ${targetY}`;
    labelX = cx;
    labelY = cy - loopHeight - 12;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      curvature: 0.3,
    });
  }

  return (
    <>
      {/* Glow layer behind the edge when active */}
      {isActive && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: (style?.stroke as string) || '#22d3ee',
            strokeWidth: 8,
            filter: 'blur(6px)',
            opacity: 0.3,
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: isActive ? '8 4' : 'none',
          animation: isActive ? 'edgeFlow 0.8s linear infinite' : 'none',
        }}
      />

      {/* Edge label rendered in HTML for better styling */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <motion.div
            initial={false}
            animate={{
              scale: isActive ? 1.05 : 1,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: isActive ? 'rgba(12,12,22,0.97)' : 'rgba(12,12,22,0.92)',
              border: `1.5px solid ${
                isActive
                  ? 'rgba(34,211,238,0.5)'
                  : isSelfLoop
                  ? 'rgba(168,85,247,0.2)'
                  : 'rgba(100,116,139,0.2)'
              }`,
              fontFamily: '"Fira Code", monospace',
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#67e8f9' : '#94a3b8',
              whiteSpace: 'nowrap',
              boxShadow: isActive
                ? '0 0 12px rgba(34,211,238,0.2)'
                : 'none',
            }}
          >
            {edgeLabel}
          </motion.div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { animated: AnimatedEdge };

/* ─────────────────────────────────────────────────────────────
   LAYOUT ALGORITHM — improved spacing with radial influence
   ───────────────────────────────────────────────────────────── */

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

  // Add unreachable states
  for (const s of states) {
    if (!visited.has(s)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(s);
    }
  }

  // Layout parameters — more generous spacing
  const LAYER_SPACING_X = 240;
  const NODE_SPACING_Y = 150;
  const PADDING_LEFT = 140;
  const PADDING_TOP = 120;

  const maxLayerSize = Math.max(...layers.map((l) => l.length));
  const totalHeight = maxLayerSize * NODE_SPACING_Y;

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    const layerHeight = layer.length * NODE_SPACING_Y;
    const offsetY = (totalHeight - layerHeight) / 2;

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      // Add slight stagger for visual interest
      const staggerX = nodeIdx % 2 === 0 ? 0 : 15;
      positions.set(layer[nodeIdx], {
        x: layerIdx * LAYER_SPACING_X + PADDING_LEFT + staggerX,
        y: nodeIdx * NODE_SPACING_Y + offsetY + PADDING_TOP,
      });
    }
  }

  return positions;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */

function DFAVisualizationInner({ definition, currentState }: Props) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [exporting, setExporting] = useState(false);
  const [prevState, setPrevState] = useState<string | null>(null);
  const [activeEdgeKey, setActiveEdgeKey] = useState<string | null>(null);

  // Track the previously active edge for highlight decay
  useEffect(() => {
    if (currentState && currentState !== prevState && prevState) {
      setActiveEdgeKey(`${prevState}|${currentState}`);
      const timer = setTimeout(() => setActiveEdgeKey(null), 800);
      return () => clearTimeout(timer);
    }
    setPrevState(currentState);
  }, [currentState]);

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
      .filter((state) => positions.has(state))
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
      const readStr = t.readSymbols.map((s) => (s === '_' ? '␣' : s)).join(',');
      const writeStr = t.writeSymbols.map((s) => (s === '_' ? '␣' : s)).join(',');
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
      const isTraversed = key === activeEdgeKey;

      // Compact label
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

      // Determine handles for bidirectional edges
      let sourceHandle: string | undefined;
      let targetHandle: string | undefined;
      if (isSelfLoop) {
        sourceHandle = 'top-source';
        targetHandle = 'bottom-target';
      } else if (hasBidi && !isFirstOfPair) {
        sourceHandle = 'bottom-source';
        targetHandle = 'bottom-target';
      }

      const edgeActive = isActive || isTraversed;
      const edgeColor = edgeActive
        ? '#22d3ee'
        : isSelfLoop
        ? 'rgba(168,85,247,0.4)'
        : 'rgba(100,116,139,0.3)';

      newEdges.push({
        id: `e-${edgeIdx++}`,
        source: from,
        target: to,
        type: 'animated',
        data: {
          isActive: edgeActive,
          isSelfLoop,
          label: combinedLabel,
        },
        style: {
          stroke: edgeColor,
          strokeWidth: edgeActive ? 2.5 : 1.5,
          filter: edgeActive
            ? 'drop-shadow(0 0 4px rgba(34,211,238,0.6))'
            : 'none',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeActive ? '#22d3ee' : 'rgba(100,116,139,0.4)',
          width: 16,
          height: 16,
        },
        ...(sourceHandle ? { sourceHandle } : {}),
        ...(targetHandle ? { targetHandle } : {}),
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [definition, currentState, activeEdgeKey, setNodes, setEdges]);

  // Lightweight update for active state changes
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
        const isTraversed = `${e.source}|${e.target}` === activeEdgeKey;
        const edgeActive = isActive || isTraversed;
        const edgeColor = edgeActive
          ? '#22d3ee'
          : isSelfLoop
          ? 'rgba(168,85,247,0.4)'
          : 'rgba(100,116,139,0.3)';

        return {
          ...e,
          data: {
            ...e.data,
            isActive: edgeActive,
          },
          style: {
            stroke: edgeColor,
            strokeWidth: edgeActive ? 2.5 : 1.5,
            filter: edgeActive
              ? 'drop-shadow(0 0 4px rgba(34,211,238,0.6))'
              : 'none',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeActive ? '#22d3ee' : 'rgba(100,116,139,0.4)',
            width: 16,
            height: 16,
          },
        };
      })
    );
  }, [currentState, activeEdgeKey, setNodes, setEdges]);

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
    <div className="relative h-full rounded-xl overflow-hidden border border-cyan-500/20 bg-[#0a0a0f]/85 backdrop-blur-lg shadow-lg shadow-cyan-900/10">
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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.4, maxZoom: 1.1 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'animated',
          }}
        >
          <Background color="rgba(34,211,238,0.03)" gap={30} size={1} />
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
