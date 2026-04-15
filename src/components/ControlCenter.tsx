import type { SimStatus } from '../hooks/useTuringMachine';

interface Props {
  simStatus: SimStatus;
  speed: number;
  setSpeed: (s: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  hasDefinition: boolean;
}

const SPEED_OPTIONS = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '5x', value: 5 },
  { label: 'Max', value: 100 },
];

function ControlButton({
  onClick,
  disabled,
  children,
  accent = 'cyan',
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  accent?: 'cyan' | 'magenta' | 'amber' | 'green';
  title?: string;
}) {
  const colors = {
    cyan: 'border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.15)]',
    magenta: 'border-pink-500/40 text-pink-400 hover:bg-pink-500/15 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,0,255,0.15)]',
    amber: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/15 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(255,191,0,0.15)]',
    green: 'border-green-500/40 text-green-400 hover:bg-green-500/15 hover:border-green-400 hover:shadow-[0_0_15px_rgba(0,255,128,0.15)]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2.5 rounded-lg border font-semibold text-sm transition-all duration-200
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none
                  ${colors[accent]} bg-transparent backdrop-blur-sm`}
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {children}
    </button>
  );
}

export default function ControlCenter({
  simStatus,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  hasDefinition,
}: Props) {
  const isRunning = simStatus === 'running';
  const isDone = simStatus === 'done';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#0d0d15]/80 border border-cyan-500/10 backdrop-blur-md">
      {/* Transport Controls */}
      <div className="flex items-center gap-2">
        <ControlButton
          onClick={onStepBackward}
          disabled={!hasDefinition || isRunning || simStatus === 'idle'}
          accent="magenta"
          title="Step Backward"
        >
          ⏮ Back
        </ControlButton>

        {isRunning ? (
          <ControlButton onClick={onPause} accent="amber" title="Pause">
            ⏸ Pause
          </ControlButton>
        ) : (
          <ControlButton
            onClick={onPlay}
            disabled={!hasDefinition || isDone}
            accent="green"
            title="Play"
          >
            ▶ Play
          </ControlButton>
        )}

        <ControlButton
          onClick={onStepForward}
          disabled={!hasDefinition || isRunning || isDone}
          accent="cyan"
          title="Step Forward"
        >
          Step ⏭
        </ControlButton>

        <ControlButton
          onClick={onReset}
          disabled={!hasDefinition}
          accent="amber"
          title="Reset"
        >
          ↺ Reset
        </ControlButton>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-cyan-500/20 mx-1" />

      {/* Speed Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400/60">
          Speed
        </span>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 border
                ${
                  speed === opt.value
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                    : 'bg-transparent border-cyan-500/20 text-cyan-500/50 hover:border-cyan-500/40 hover:text-cyan-400'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="ml-auto flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isRunning
              ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(0,255,128,0.6)]'
              : isDone
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(255,191,0,0.4)]'
              : 'bg-cyan-400/40'
          }`}
        />
        <span className="text-xs font-mono text-cyan-300/70 uppercase tracking-wider">
          {simStatus === 'idle'
            ? 'Ready'
            : simStatus === 'running'
            ? 'Computing...'
            : simStatus === 'paused'
            ? 'Paused'
            : 'Complete'}
        </span>
      </div>
    </div>
  );
}
