import { useState } from 'react';
import { useTuringMachine } from '../hooks/useTuringMachine';
import { EXAMPLES } from '../engine/examples';
import type { TMDefinition } from '../engine/types';
import BackgroundCanvas from './BackgroundCanvas';
import ExampleSelector from './ExampleSelector';
import ControlCenter from './ControlCenter';
import MetricsPanel from './MetricsPanel';
import TapeView from './TapeView';
import TransitionLog from './TransitionLog';
import DFAVisualization from './DFAVisualization';

import MiniTapeAnimation from './MiniTapeAnimation';

export default function Dashboard() {
  const {
    snapshot,
    log,
    simStatus,
    speed,
    setSpeed,
    definition,
    loadDefinition,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
  } = useTuringMachine();

  const [currentExampleId, setCurrentExampleId] = useState<string | null>(null);

  const handleSelectExample = (def: TMDefinition) => {
    const ex = EXAMPLES.find((e) => e.definition === def);
    setCurrentExampleId(ex?.id || null);
    loadDefinition(def);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] overflow-hidden">
      {/* Animated background */}
      <BackgroundCanvas />

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full min-h-screen p-4 lg:p-6 gap-4">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              <div className="w-3 h-3 rounded-sm bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
              <div className="w-3 h-3 rounded-sm bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
            </div>
            <div>
              <h1
                className="text-xl lg:text-2xl font-black tracking-tight"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                <span className="text-cyan-400">Multi Tape </span>
                <span className="text-gray-200">Turing </span>
                <span className="text-pink-400">Machine</span>
              </h1>
              <span
                className="text-[10px] text-gray-500 tracking-[0.15em] font-medium"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                by Tavish Raj
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ExampleSelector
              onSelect={handleSelectExample}
              currentId={currentExampleId}
            />
          </div>
        </header>

        {/* Description */}
        {definition && (
          <div className="px-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12121e]/60 border border-cyan-500/10">
              <span className="text-cyan-400 text-sm font-bold font-mono">
                {definition.name}
              </span>
              <span className="text-gray-500 text-xs">—</span>
              <span className="text-gray-400 text-xs">
                {definition.description}
              </span>
              <span className="text-gray-600 text-xs ml-2">
                [{definition.numTapes} tape{definition.numTapes > 1 ? 's' : ''}]
              </span>
            </div>
          </div>
        )}

        {/* Control Center + Mini Animation */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <ControlCenter
              simStatus={simStatus}
              speed={speed}
              setSpeed={setSpeed}
              onPlay={play}
              onPause={pause}
              onStepForward={stepForward}
              onStepBackward={stepBackward}
              onReset={reset}
              hasDefinition={!!definition}
            />
          </div>
        </div>

        {/* Interactive TM Animation */}
        <div className="flex justify-end px-1">
          <MiniTapeAnimation />
        </div>

        {/* Metrics */}
        <MetricsPanel snapshot={snapshot} simStatus={simStatus} />

        {/* Tape View */}
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
            <h2
              className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/70"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Tape Visualization
            </h2>
          </div>
          <TapeView snapshot={snapshot} />
        </section>

        {/* Bottom section: DFA + Log side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
          {/* DFA Visualization */}
          <div className="lg:col-span-3 min-h-[400px]">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full" />
              <h2
                className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400/70"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                State Transition Diagram
              </h2>
            </div>
            <div className="h-[400px]">
              <DFAVisualization
                definition={definition}
                currentState={snapshot?.currentState || null}
              />
            </div>
          </div>

          {/* Transition Log */}
          <div className="lg:col-span-2 min-h-[400px]">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
              <h2
                className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400/70"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                Execution Log
              </h2>
            </div>
            <div className="h-[400px]">
              <TransitionLog log={log} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-[10px] text-gray-700 font-mono tracking-widest uppercase">
          Multi-Tape Turing Machine Simulator • Theoretical Computer Science Visualization
        </footer>
      </div>
    </div>
  );
}
