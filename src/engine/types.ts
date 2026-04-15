/** Direction the tape head can move */
export type Direction = 'L' | 'R' | 'S';

/** A single transition rule */
export interface Transition {
  fromState: string;
  readSymbols: string[];    // one per tape
  toState: string;
  writeSymbols: string[];   // one per tape
  directions: Direction[];  // one per tape
}

/** Full Turing Machine definition */
export interface TMDefinition {
  name: string;
  description: string;
  numTapes: number;
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  transitions: Transition[];
  startState: string;
  acceptStates: string[];
  rejectStates: string[];
  blankSymbol: string;
  initialInput: string[];   // one per tape
}

/** Runtime state of a single tape */
export interface TapeState {
  cells: string[];
  headPosition: number;
  /** The minimum index that has been written — used to track expansion */
  offset: number;
}

/** A snapshot of the entire machine at one point in time */
export interface TMSnapshot {
  currentState: string;
  tapes: TapeState[];
  stepCount: number;
  status: 'running' | 'accepted' | 'rejected' | 'halted';
  lastTransition: Transition | null;
}

/** An entry in the transition log */
export interface LogEntry {
  step: number;
  fromState: string;
  toState: string;
  readSymbols: string[];
  writeSymbols: string[];
  directions: Direction[];
}

/** A built-in example */
export interface TMExample {
  id: string;
  definition: TMDefinition;
}
