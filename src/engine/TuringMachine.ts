import type { TMDefinition, TapeState, TMSnapshot, Transition, LogEntry } from './types';

const TAPE_PADDING = 20;

export class TuringMachine {
  private definition: TMDefinition;
  private tapes: TapeState[];
  private currentState: string;
  private stepCount: number;
  private status: 'running' | 'accepted' | 'rejected' | 'halted';
  private history: TMSnapshot[];
  private log: LogEntry[];
  private transitionMap: Map<string, Transition>;

  constructor(definition: TMDefinition) {
    this.definition = definition;
    this.tapes = [];
    this.currentState = definition.startState;
    this.stepCount = 0;
    this.status = 'running';
    this.history = [];
    this.log = [];
    this.transitionMap = new Map();
    this.buildTransitionMap();
    this.initializeTapes();
    this.history.push(this.snapshot());
  }

  private buildTransitionMap(): void {
    for (const t of this.definition.transitions) {
      const key = `${t.fromState}|${t.readSymbols.join(',')}`;
      this.transitionMap.set(key, t);
    }
  }

  private initializeTapes(): void {
    const { numTapes, initialInput, blankSymbol } = this.definition;
    this.tapes = [];
    for (let i = 0; i < numTapes; i++) {
      const input = (initialInput[i] || '').split('');
      const cells: string[] = [];
      // pad left
      for (let j = 0; j < TAPE_PADDING; j++) cells.push(blankSymbol);
      // input
      for (const ch of input) cells.push(ch);
      // pad right
      for (let j = 0; j < TAPE_PADDING; j++) cells.push(blankSymbol);

      this.tapes.push({
        cells,
        headPosition: TAPE_PADDING, // start at first input character
        offset: 0,
      });
    }
  }

  private ensureTapeBounds(tapeIndex: number): void {
    const tape = this.tapes[tapeIndex];
    const blank = this.definition.blankSymbol;
    while (tape.headPosition < 0) {
      tape.cells.unshift(blank);
      tape.headPosition++;
      tape.offset--;
    }
    while (tape.headPosition >= tape.cells.length) {
      tape.cells.push(blank);
    }
  }

  snapshot(): TMSnapshot {
    return {
      currentState: this.currentState,
      tapes: this.tapes.map(t => ({
        cells: [...t.cells],
        headPosition: t.headPosition,
        offset: t.offset,
      })),
      stepCount: this.stepCount,
      status: this.status,
      lastTransition: this.history.length > 0
        ? this.history[this.history.length - 1]?.lastTransition ?? null
        : null,
    };
  }

  getSnapshot(): TMSnapshot {
    return this.snapshot();
  }

  getLog(): LogEntry[] {
    return [...this.log];
  }

  getDefinition(): TMDefinition {
    return this.definition;
  }

  getHistory(): TMSnapshot[] {
    return this.history;
  }

  step(): TMSnapshot {
    if (this.status !== 'running') return this.snapshot();

    // Read symbols from all tapes
    const readSymbols = this.tapes.map(t => {
      this.ensureTapeBounds(this.tapes.indexOf(t));
      return t.cells[t.headPosition] || this.definition.blankSymbol;
    });

    // Build key and look up transition
    const key = `${this.currentState}|${readSymbols.join(',')}`;
    const transition = this.transitionMap.get(key);

    if (!transition) {
      // No transition found — check if we're in accept or reject state
      if (this.definition.acceptStates.includes(this.currentState)) {
        this.status = 'accepted';
      } else if (this.definition.rejectStates.includes(this.currentState)) {
        this.status = 'rejected';
      } else {
        this.status = 'halted';
      }
      return this.snapshot();
    }

    const fromState = this.currentState;

    // Apply transition: write symbols
    for (let i = 0; i < this.definition.numTapes; i++) {
      this.tapes[i].cells[this.tapes[i].headPosition] = transition.writeSymbols[i];
    }

    // Move heads
    for (let i = 0; i < this.definition.numTapes; i++) {
      const dir = transition.directions[i];
      if (dir === 'R') this.tapes[i].headPosition++;
      else if (dir === 'L') this.tapes[i].headPosition--;
      this.ensureTapeBounds(i);
    }

    // Update state
    this.currentState = transition.toState;
    this.stepCount++;

    // Check accept/reject
    if (this.definition.acceptStates.includes(this.currentState)) {
      this.status = 'accepted';
    } else if (this.definition.rejectStates.includes(this.currentState)) {
      this.status = 'rejected';
    }

    // Log entry
    this.log.push({
      step: this.stepCount,
      fromState,
      toState: transition.toState,
      readSymbols: [...readSymbols],
      writeSymbols: [...transition.writeSymbols],
      directions: [...transition.directions],
    });

    const snap = this.snapshot();
    snap.lastTransition = transition;
    this.history.push(snap);

    return snap;
  }

  stepBack(): TMSnapshot | null {
    if (this.history.length <= 1) return null;
    this.history.pop();
    this.log.pop();
    const prev = this.history[this.history.length - 1];
    // Restore state from snapshot
    this.currentState = prev.currentState;
    this.tapes = prev.tapes.map(t => ({
      cells: [...t.cells],
      headPosition: t.headPosition,
      offset: t.offset,
    }));
    this.stepCount = prev.stepCount;
    this.status = prev.status;
    return this.snapshot();
  }

  reset(): TMSnapshot {
    this.currentState = this.definition.startState;
    this.stepCount = 0;
    this.status = 'running';
    this.history = [];
    this.log = [];
    this.initializeTapes();
    this.history.push(this.snapshot());
    return this.snapshot();
  }

  isRunning(): boolean {
    return this.status === 'running';
  }
}
