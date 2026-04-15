import type { TMSnapshot } from '../engine/types';
import type { SimStatus } from '../hooks/useTuringMachine';

interface Props {
  snapshot: TMSnapshot | null;
  simStatus: SimStatus;
}

function MetricCard({
  label,
  value,
  accent = 'cyan',
}: {
  label: string;
  value: string | number;
  accent?: 'cyan' | 'magenta' | 'green' | 'amber';
}) {
  const accentColors = {
    cyan: 'border-cyan-500/20 text-cyan-300',
    magenta: 'border-pink-500/20 text-pink-300',
    green: 'border-green-500/20 text-green-300',
    amber: 'border-amber-500/20 text-amber-300',
  };
  const glowColors = {
    cyan: 'text-cyan-400',
    magenta: 'text-pink-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
  };

  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg bg-[#0a0a12]/60 border ${accentColors[accent]} backdrop-blur-sm min-w-[120px]`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
        {label}
      </span>
      <span
        className={`text-lg font-bold font-mono ${glowColors[accent]}`}
        style={{ fontFamily: '"Fira Code", monospace' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function MetricsPanel({ snapshot, simStatus }: Props) {
  if (!snapshot) {
    return (
      <div className="flex gap-3 flex-wrap">
        <MetricCard label="State" value="—" />
        <MetricCard label="Steps" value="0" accent="magenta" />
        <MetricCard label="Head Values" value="—" accent="green" />
        <MetricCard label="Status" value="No Machine" accent="amber" />
      </div>
    );
  }

  const headValues = snapshot.tapes
    .map((t) => {
      const v = t.cells[t.headPosition];
      return v === '_' ? '␣' : v;
    })
    .join(', ');

  const statusLabel =
    snapshot.status === 'accepted'
      ? '✓ Accepted'
      : snapshot.status === 'rejected'
      ? '✗ Rejected'
      : snapshot.status === 'halted'
      ? '◼ Halted'
      : simStatus === 'running'
      ? '⟳ Running'
      : '● Ready';

  return (
    <div className="flex gap-3 flex-wrap">
      <MetricCard label="Current State" value={snapshot.currentState} />
      <MetricCard label="Total Steps" value={snapshot.stepCount} accent="magenta" />
      <MetricCard label="Head Read Value" value={`[${headValues}]`} accent="green" />
      <MetricCard
        label="Machine Status"
        value={statusLabel}
        accent={
          snapshot.status === 'accepted'
            ? 'green'
            : snapshot.status === 'rejected'
            ? 'magenta'
            : 'amber'
        }
      />
    </div>
  );
}
