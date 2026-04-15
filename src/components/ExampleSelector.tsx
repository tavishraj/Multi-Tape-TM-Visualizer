import { EXAMPLES } from '../engine/examples';
import type { TMDefinition } from '../engine/types';

interface Props {
  onSelect: (def: TMDefinition) => void;
  currentId: string | null;
}

export default function ExampleSelector({ onSelect, currentId }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
        Load Example
      </label>
      <select
        value={currentId || ''}
        onChange={(e) => {
          const ex = EXAMPLES.find((ex) => ex.id === e.target.value);
          if (ex) onSelect(ex.definition);
        }}
        className="bg-[#12121a] border border-cyan-500/30 text-cyan-300 text-sm rounded-lg px-3 py-2 
                   focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none
                   cursor-pointer transition-all duration-200 hover:border-cyan-400/60
                   min-w-[280px]"
        style={{ fontFamily: '"Fira Code", monospace' }}
      >
        <option value="" disabled>
          ── Select a Turing Machine ──
        </option>
        {EXAMPLES.map((ex, i) => (
          <option key={ex.id} value={ex.id}>
            {i + 1}. {ex.definition.name}
          </option>
        ))}
      </select>
    </div>
  );
}
