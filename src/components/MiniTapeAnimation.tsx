import { useEffect, useRef, useState, useCallback } from 'react';

// Neon color palette — fun & vibrant combos
const NEON_COLORS = [
  { main: '#22d3ee', glow: 'rgba(34,211,238,0.5)', bg: 'rgba(34,211,238,0.08)' },   // cyan
  { main: '#f472b6', glow: 'rgba(244,114,182,0.5)', bg: 'rgba(244,114,182,0.08)' }, // pink
  { main: '#a78bfa', glow: 'rgba(167,139,250,0.5)', bg: 'rgba(167,139,250,0.08)' }, // purple
  { main: '#34d399', glow: 'rgba(52,211,153,0.5)', bg: 'rgba(52,211,153,0.08)' },   // emerald
  { main: '#fbbf24', glow: 'rgba(251,191,36,0.5)', bg: 'rgba(251,191,36,0.08)' },   // amber
  { main: '#fb923c', glow: 'rgba(251,146,60,0.5)', bg: 'rgba(251,146,60,0.08)' },   // orange
  { main: '#f87171', glow: 'rgba(248,113,113,0.5)', bg: 'rgba(248,113,113,0.08)' }, // red
  { main: '#60a5fa', glow: 'rgba(96,165,250,0.5)', bg: 'rgba(96,165,250,0.08)' },   // blue
];

const CELL_COUNT = 15;
const SYMBOLS = ['0', '1', 'Δ', '⊳', '⊲', '#', 'a', 'b', '×', 'λ', '⊕', '∅', '→', '⟂', 'q'];

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function randomColor() {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

interface CellData {
  symbol: string;
  color: typeof NEON_COLORS[0];
}

export default function MiniTapeAnimation() {
  const [headPos, setHeadPos] = useState(7);
  const [cells, setCells] = useState<CellData[]>(() =>
    Array.from({ length: CELL_COUNT }, () => ({
      symbol: randomSymbol(),
      color: randomColor(),
    }))
  );
  const [writing, setWriting] = useState(false);
  const [direction, setDirection] = useState<'R' | 'L'>('R');
  const [activeColor, setActiveColor] = useState(NEON_COLORS[0]);
  const [stateLabel, setStateLabel] = useState('q₀');
  const [sparkles, setSparkles] = useState<{ id: number; x: number }[]>([]);
  const sparkleId = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);

  const states = ['q₀', 'q₁', 'q₂', 'q₃', 'q₄', 'qₐ', 'qᵣ'];

  const spawnSparkle = useCallback((pos: number) => {
    const id = sparkleId.current++;
    setSparkles((prev) => [...prev, { id, x: pos }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  }, []);

  useEffect(() => {
    const tick = () => {
      const newColor = randomColor();
      setActiveColor(newColor);
      setWriting(true);

      timeoutRef.current = setTimeout(() => {
        // Write a new symbol with a new color at head position
        setCells((prev) => {
          const next = [...prev];
          next[headPos] = { symbol: randomSymbol(), color: newColor };
          return next;
        });
        spawnSparkle(headPos);
        setWriting(false);

        // Transition state randomly
        setStateLabel(states[Math.floor(Math.random() * states.length)]);

        // Move head
        timeoutRef.current = setTimeout(() => {
          setHeadPos((prev) => {
            if (prev >= CELL_COUNT - 2) {
              setDirection('L');
              return prev - 1;
            }
            if (prev <= 1) {
              setDirection('R');
              return prev + 1;
            }
            if (Math.random() < 0.25) {
              const newDir = Math.random() < 0.5 ? 'R' : 'L';
              setDirection(newDir);
              return newDir === 'R' ? prev + 1 : prev - 1;
            }
            return direction === 'R' ? prev + 1 : prev - 1;
          });
        }, 300);
      }, 350);
    };

    if (!paused) {
      timeoutRef.current = setTimeout(tick, 750);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [headPos, direction, paused]);

  return (
    <div
      className="mini-tape-anim"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title="Interactive Turing Machine — hover to pause"
    >
      {/* State bubble + direction */}
      <div className="mini-tape-status-row">
        <div
          className="mini-tape-state-bubble"
          style={{
            borderColor: activeColor.main,
            color: activeColor.main,
            boxShadow: `0 0 12px ${activeColor.glow}`,
          }}
        >
          {stateLabel}
        </div>
        <div className="mini-tape-arrows">
          <span
            className={`mini-tape-arrow ${direction === 'L' ? 'active' : ''}`}
            style={direction === 'L' ? { color: activeColor.main, textShadow: `0 0 8px ${activeColor.glow}` } : {}}
          >
            ◀
          </span>
          <span className="mini-tape-arrow-label">move</span>
          <span
            className={`mini-tape-arrow ${direction === 'R' ? 'active' : ''}`}
            style={direction === 'R' ? { color: activeColor.main, textShadow: `0 0 8px ${activeColor.glow}` } : {}}
          >
            ▶
          </span>
        </div>
        <div className="mini-tape-info">
          <span className="mini-tape-info-tag" style={{ borderColor: `${activeColor.main}40`, color: activeColor.main }}>
            {writing ? 'WRITE' : 'READ'}
          </span>
        </div>
      </div>

      {/* Head indicator row */}
      <div className="mini-tape-head-row">
        {Array.from({ length: CELL_COUNT }).map((_, i) => (
          <div key={i} className="mini-tape-head-slot">
            {i === headPos && (
              <div
                className={`mini-tape-head ${writing ? 'writing' : ''}`}
                style={{ color: activeColor.main, filter: `drop-shadow(0 0 6px ${activeColor.glow})` }}
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <path d="M9 14L2 4h14L9 14z" fill="currentColor" />
                  <rect x="6" y="0" width="6" height="5" rx="1.5" fill="currentColor" />
                  <circle cx="9" cy="2.5" r="1" fill="#0a0a0f" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tape cells */}
      <div className="mini-tape-cells">
        {cells.map((cell, i) => {
          const isActive = i === headPos;
          const isWriting = isActive && writing;
          const color = isActive ? activeColor : cell.color;

          return (
            <div
              key={i}
              className={`mini-tape-cell ${isActive ? 'active' : ''} ${isWriting ? 'writing' : ''}`}
              style={
                isActive
                  ? {
                      borderColor: `${color.main}80`,
                      background: color.bg,
                      color: color.main,
                      boxShadow: isWriting
                        ? `0 0 18px ${color.glow}, inset 0 0 12px ${color.bg}`
                        : `0 0 10px ${color.glow}30`,
                    }
                  : {
                      color: `${cell.color.main}60`,
                    }
              }
            >
              <span>{cell.symbol}</span>
            </div>
          );
        })}

        {/* Sparkle effects */}
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="mini-tape-sparkle"
            style={{
              left: `${s.x * 36 + 18}px`,
              background: activeColor.main,
              boxShadow: `0 0 12px ${activeColor.glow}`,
            }}
          />
        ))}
      </div>

      {/* Bottom info bar */}
      <div className="mini-tape-label">
        <span className="mini-tape-dot" style={{ background: activeColor.main }} />
        <span>Turing Machine Simulation</span>
        <span className="mini-tape-separator">•</span>
        <span style={{ color: `${activeColor.main}90` }}>
          Cell {headPos}
        </span>
        <span className="mini-tape-separator">•</span>
        <span className="mini-tape-dir" style={{ color: activeColor.main }}>
          {direction === 'R' ? '→ RIGHT' : '← LEFT'}
        </span>
        <span className="mini-tape-hover-hint">hover to pause</span>
      </div>
    </div>
  );
}
