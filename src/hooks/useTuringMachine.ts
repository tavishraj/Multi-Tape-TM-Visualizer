import { useState, useCallback, useRef, useEffect } from 'react';
import { TuringMachine } from '../engine/TuringMachine';
import type { TMDefinition, TMSnapshot, LogEntry } from '../engine/types';

export type SimStatus = 'idle' | 'running' | 'paused' | 'done';

export function useTuringMachine() {
  const machineRef = useRef<TuringMachine | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [snapshot, setSnapshot] = useState<TMSnapshot | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');
  const [speed, setSpeed] = useState<number>(1);
  const [definition, setDefinition] = useState<TMDefinition | null>(null);

  const loadDefinition = useCallback((def: TMDefinition) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const machine = new TuringMachine(def);
    machineRef.current = machine;
    setDefinition(def);
    setSnapshot(machine.getSnapshot());
    setLog([]);
    setSimStatus('idle');
  }, []);

  const doStep = useCallback(() => {
    const machine = machineRef.current;
    if (!machine) return;
    const snap = machine.step();
    setSnapshot(snap);
    setLog(machine.getLog());
    if (snap.status !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSimStatus('done');
    }
  }, []);

  const play = useCallback(() => {
    if (!machineRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimStatus('running');
    const ms = speed >= 100 ? 10 : Math.max(10, 800 / speed);
    intervalRef.current = setInterval(() => {
      const machine = machineRef.current;
      if (!machine || !machine.isRunning()) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setSimStatus('done');
        return;
      }
      // For max speed, do multiple steps per tick
      const stepsPerTick = speed >= 100 ? 10 : 1;
      for (let i = 0; i < stepsPerTick; i++) {
        if (!machine.isRunning()) break;
        machine.step();
      }
      setSnapshot(machine.getSnapshot());
      setLog(machine.getLog());
      if (!machine.isRunning()) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setSimStatus('done');
      }
    }, ms);
  }, [speed]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSimStatus('paused');
  }, []);

  const stepForward = useCallback(() => {
    if (!machineRef.current) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    doStep();
    setSimStatus(machineRef.current.isRunning() ? 'paused' : 'done');
  }, [doStep]);

  const stepBackward = useCallback(() => {
    const machine = machineRef.current;
    if (!machine) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const snap = machine.stepBack();
    if (snap) {
      setSnapshot(snap);
      setLog(machine.getLog());
      setSimStatus(snap.stepCount === 0 ? 'idle' : 'paused');
    }
  }, []);

  const reset = useCallback(() => {
    const machine = machineRef.current;
    if (!machine) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const snap = machine.reset();
    setSnapshot(snap);
    setLog([]);
    setSimStatus('idle');
  }, []);

  // Update interval when speed changes during playback
  useEffect(() => {
    if (simStatus === 'running' && machineRef.current) {
      play();
    }
  }, [speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
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
  };
}
