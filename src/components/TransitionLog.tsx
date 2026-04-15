import { useRef, useEffect } from 'react';
import type { LogEntry } from '../engine/types';

interface Props {
  log: LogEntry[];
}

export default function TransitionLog({ log }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const formatDirection = (d: string) => {
    switch (d) {
      case 'L': return '←';
      case 'R': return '→';
      case 'S': return '●';
      default: return d;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl bg-[#0a0a10]/80 border border-cyan-500/10 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/10 bg-[#0d0d18]/60">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/60 ml-2">
          Transition Log
        </span>
        <span className="ml-auto text-[10px] font-mono text-gray-600">
          {log.length} entries
        </span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin font-mono text-xs"
           style={{ fontFamily: '"Fira Code", monospace', maxHeight: '300px' }}>
        {log.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-600 text-xs">Awaiting computation...</span>
          </div>
        )}
        {log.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-cyan-500/5 transition-colors group"
          >
            <span className="text-gray-600 w-8 text-right shrink-0 text-[10px]">
              {entry.step.toString().padStart(3, '0')}
            </span>
            <span className="text-cyan-500/40">│</span>
            <span className="text-pink-400">{entry.fromState}</span>
            <span className="text-cyan-500/50">→</span>
            <span className="text-green-400">{entry.toState}</span>
            <span className="text-cyan-500/30 mx-0.5">:</span>
            <span className="text-gray-500">R</span>
            <span className="text-amber-300">[{entry.readSymbols.map(s => s === '_' ? '␣' : s).join(',')}]</span>
            <span className="text-gray-500">W</span>
            <span className="text-blue-300">[{entry.writeSymbols.map(s => s === '_' ? '␣' : s).join(',')}]</span>
            <span className="text-gray-500">M</span>
            <span className="text-purple-300">[{entry.directions.map(formatDirection).join(',')}]</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
