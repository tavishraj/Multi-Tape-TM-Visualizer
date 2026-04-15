import { motion, AnimatePresence } from 'framer-motion';
import type { TMSnapshot } from '../engine/types';
import { useRef, useEffect, useMemo } from 'react';

interface Props {
  snapshot: TMSnapshot | null;
}

const CELL_WIDTH = 52;
const VISIBLE_CELLS = 19; // odd number for centering

export default function TapeView({ snapshot }: Props) {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl bg-[#0d0d15]/60 border border-cyan-500/10 backdrop-blur-md">
        <span className="text-cyan-500/30 font-mono text-sm tracking-wider">
          Load an example to visualize the tape
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {snapshot.tapes.map((tape, tapeIndex) => (
        <TapeRow
          key={tapeIndex}
          tape={tape}
          tapeIndex={tapeIndex}
          status={snapshot.status}
          containerRefs={containerRefs}
        />
      ))}
    </div>
  );
}

function TapeRow({
  tape,
  tapeIndex,
  status,
}: {
  tape: TMSnapshot['tapes'][0];
  tapeIndex: number;
  status: string;
  containerRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate the visible window of cells centered on the head
  const { visibleCells, startIdx } = useMemo(() => {
    const half = Math.floor(VISIBLE_CELLS / 2);
    let start = tape.headPosition - half;
    const cells: { index: number; value: string }[] = [];

    for (let i = 0; i < VISIBLE_CELLS; i++) {
      const idx = start + i;
      const val = idx >= 0 && idx < tape.cells.length ? tape.cells[idx] : '_';
      cells.push({ index: idx, value: val });
    }

    return { visibleCells: cells, startIdx: start };
  }, [tape.headPosition, tape.cells]);

  // Auto-scroll to keep head centered
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const headOffset = (tape.headPosition - startIdx) * CELL_WIDTH;
      const containerCenter = container.clientWidth / 2;
      container.scrollLeft = headOffset - containerCenter + CELL_WIDTH / 2;
    }
  }, [tape.headPosition, startIdx]);

  return (
    <div className="relative rounded-xl bg-[#0d0d15]/70 border border-cyan-500/10 backdrop-blur-md p-4 overflow-hidden">
      {/* Tape label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.6)]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/70">
          Tape {tapeIndex}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
      </div>

      {/* Head indicator */}
      <div className="flex justify-center mb-1">
        <motion.div
          className="flex flex-col items-center"
          animate={{
            color: status === 'accepted' ? '#4ade80' : status === 'rejected' ? '#f472b6' : '#22d3ee',
          }}
        >
          <span className="text-xs font-bold font-mono tracking-wider" style={{ color: 'inherit' }}>
            HEAD
          </span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
            <polygon points="8,10 0,0 16,0" />
          </svg>
        </motion.div>
      </div>

      {/* Tape cells */}
      <div className="flex justify-center overflow-hidden" ref={scrollRef}>
        <div className="flex gap-0.5 relative">
          <AnimatePresence mode="popLayout">
            {visibleCells.map((cell) => {
              const isHead = cell.index === tape.headPosition;
              const isBlank = cell.value === '_';

              return (
                <motion.div
                  key={`${tapeIndex}-${cell.index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.15 },
                  }}
                  className={`
                    relative flex items-center justify-center shrink-0
                    transition-colors duration-150
                    ${
                      isHead
                        ? status === 'accepted'
                          ? 'border-2 border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.3),inset_0_0_15px_rgba(74,222,128,0.1)]'
                          : status === 'rejected'
                          ? 'border-2 border-pink-400 bg-pink-500/10 shadow-[0_0_20px_rgba(244,114,182,0.3),inset_0_0_15px_rgba(244,114,182,0.1)]'
                          : 'border-2 border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3),inset_0_0_15px_rgba(34,211,238,0.1)]'
                        : 'border border-cyan-500/15 bg-[#0a0a12]/80'
                    }
                    rounded-md
                  `}
                  style={{
                    width: CELL_WIDTH - 2,
                    height: CELL_WIDTH - 2,
                    fontFamily: '"Fira Code", monospace',
                  }}
                >
                  <span
                    className={`text-base font-bold ${
                      isHead
                        ? status === 'accepted'
                          ? 'text-green-300'
                          : status === 'rejected'
                          ? 'text-pink-300'
                          : 'text-cyan-200'
                        : isBlank
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {isBlank ? '␣' : cell.value}
                  </span>

                  {/* Cell index label */}
                  <span className="absolute bottom-0.5 right-1 text-[7px] text-gray-700 font-mono">
                    {cell.index}
                  </span>

                  {/* Neon glow pulse for active head */}
                  {isHead && (
                    <motion.div
                      className="absolute inset-0 rounded-md"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(34,211,238,0.2)',
                          '0 0 25px rgba(34,211,238,0.4)',
                          '0 0 10px rgba(34,211,238,0.2)',
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0d0d15] to-transparent pointer-events-none z-10 rounded-l-xl" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0d0d15] to-transparent pointer-events-none z-10 rounded-r-xl" />
    </div>
  );
}
