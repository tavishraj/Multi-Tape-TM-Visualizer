import { useEffect, useRef, useState } from 'react';

// Mini Turing Machine tape animation — decorative, cyberpunk themed
const CELL_COUNT = 9;
const SYMBOLS = ['0', '1', 'Δ', '⊳', '⊲', '#', 'a', 'b', '×'];

export default function MiniTapeAnimation() {
  const [headPos, setHeadPos] = useState(4);
  const [cells, setCells] = useState<string[]>(() =>
    Array.from({ length: CELL_COUNT }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  );
  const [writing, setWriting] = useState(false);
  const [direction, setDirection] = useState<'R' | 'L'>('R');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const tick = () => {
      // Simulate a TM step: write, then move
      setWriting(true);

      timeoutRef.current = setTimeout(() => {
        // Write a random symbol at head
        setCells((prev) => {
          const next = [...prev];
          next[headPos] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
        setWriting(false);

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
            // Random direction change occasionally
            if (Math.random() < 0.3) {
              const newDir = Math.random() < 0.5 ? 'R' : 'L';
              setDirection(newDir);
              return newDir === 'R' ? prev + 1 : prev - 1;
            }
            return direction === 'R' ? prev + 1 : prev - 1;
          });
        }, 350);
      }, 400);
    };

    if (!paused) {
      timeoutRef.current = setTimeout(tick, 900);
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
      {/* Head indicator row */}
      <div className="mini-tape-head-row">
        {Array.from({ length: CELL_COUNT }).map((_, i) => (
          <div key={i} className="mini-tape-head-slot">
            {i === headPos && (
              <div className={`mini-tape-head ${writing ? 'writing' : ''}`}>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M7 10L1 2h12L7 10z" fill="currentColor" />
                  <rect x="5" y="0" width="4" height="3" rx="1" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tape cells */}
      <div className="mini-tape-cells">
        {cells.map((sym, i) => (
          <div
            key={i}
            className={`mini-tape-cell ${i === headPos ? 'active' : ''} ${
              i === headPos && writing ? 'writing' : ''
            }`}
          >
            <span>{sym}</span>
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="mini-tape-label">
        <span className="mini-tape-dot" />
        <span>TM simulation</span>
        <span className="mini-tape-dir">{direction === 'R' ? '→' : '←'}</span>
      </div>
    </div>
  );
}
