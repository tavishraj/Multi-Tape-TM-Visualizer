import type { TMExample } from './types';

/**
 * 10 Built-in Turing Machine Examples
 * Each is a fully specified TMDefinition with transitions and initial input.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Language a^n b^n c^n  (2-tape TM)
// Strategy: Tape 0 has input. Scan a's copying to tape 1, then match b's
// against tape 1, then match c's count.
// ─────────────────────────────────────────────────────────────────────────────
const anbncn: TMExample = {
  id: 'anbncn',
  definition: {
    name: 'a^n b^n c^n',
    description: 'Verifies equal counts of a, b, and c using two tapes.',
    numTapes: 2,
    states: ['q0', 'q1', 'q2', 'q3', 'q_acc', 'q_rej'],
    inputAlphabet: ['a', 'b', 'c'],
    tapeAlphabet: ['a', 'b', 'c', 'X', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: ['q_rej'],
    initialInput: ['aabbcc', ''],
    transitions: [
      // q0: read a's from tape0, write X to tape1 as tally
      { fromState: 'q0', readSymbols: ['a', '_'], toState: 'q0', writeSymbols: ['a', 'X'], directions: ['R', 'R'] },
      // q0 -> q1: hit first b, rewind tape1
      { fromState: 'q0', readSymbols: ['b', '_'], toState: 'q1', writeSymbols: ['b', '_'], directions: ['S', 'L'] },
      // q1: rewind tape1 to start
      { fromState: 'q1', readSymbols: ['b', 'X'], toState: 'q1', writeSymbols: ['b', 'X'], directions: ['S', 'L'] },
      { fromState: 'q1', readSymbols: ['b', '_'], toState: 'q2', writeSymbols: ['b', '_'], directions: ['S', 'R'] },
      // q2: match b's on tape0 with X's on tape1
      { fromState: 'q2', readSymbols: ['b', 'X'], toState: 'q2', writeSymbols: ['b', 'X'], directions: ['R', 'R'] },
      // q2 -> q3: all b's matched, now tape1 should be at blank
      { fromState: 'q2', readSymbols: ['c', '_'], toState: 'q3', writeSymbols: ['c', '_'], directions: ['S', 'L'] },
      // rewind tape1 again
      { fromState: 'q3', readSymbols: ['c', 'X'], toState: 'q3', writeSymbols: ['c', 'X'], directions: ['S', 'L'] },
      { fromState: 'q3', readSymbols: ['c', '_'], toState: 'q4', writeSymbols: ['c', '_'], directions: ['S', 'R'] },
      // q4: match c's with X's
      { fromState: 'q4', readSymbols: ['c', 'X'], toState: 'q4', writeSymbols: ['c', 'X'], directions: ['R', 'R'] },
      { fromState: 'q4', readSymbols: ['_', '_'], toState: 'q_acc', writeSymbols: ['_', '_'], directions: ['S', 'S'] },
      // reject cases
      { fromState: 'q0', readSymbols: ['c', '_'], toState: 'q_rej', writeSymbols: ['c', '_'], directions: ['S', 'S'] },
      { fromState: 'q0', readSymbols: ['_', '_'], toState: 'q_rej', writeSymbols: ['_', '_'], directions: ['S', 'S'] },
      { fromState: 'q2', readSymbols: ['_', 'X'], toState: 'q_rej', writeSymbols: ['_', 'X'], directions: ['S', 'S'] },
      { fromState: 'q2', readSymbols: ['c', 'X'], toState: 'q_rej', writeSymbols: ['c', 'X'], directions: ['S', 'S'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Binary Palindrome (1-tape)
// ─────────────────────────────────────────────────────────────────────────────
const binaryPalindrome: TMExample = {
  id: 'binary-palindrome',
  definition: {
    name: 'Binary Palindrome (w = w^R)',
    description: 'Checks if a binary string is a palindrome by comparing first and last characters.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q_acc', 'q_rej'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'X', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: ['q_rej'],
    initialInput: ['10101'],
    transitions: [
      // q0: read left-most char
      { fromState: 'q0', readSymbols: ['0'], toState: 'q1', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['1'], toState: 'q2', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['X'], directions: ['S'] },
      { fromState: 'q0', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['S'] },
      // q1: scan right to find rightmost - looking for match with 0
      { fromState: 'q1', readSymbols: ['0'], toState: 'q1', writeSymbols: ['0'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['1'], toState: 'q1', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['_'], toState: 'q3', writeSymbols: ['_'], directions: ['L'] },
      { fromState: 'q1', readSymbols: ['X'], toState: 'q3', writeSymbols: ['X'], directions: ['L'] },
      // q3: at rightmost, check if it's 0
      { fromState: 'q3', readSymbols: ['0'], toState: 'q5', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q3', readSymbols: ['1'], toState: 'q_rej', writeSymbols: ['1'], directions: ['S'] },
      { fromState: 'q3', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['X'], directions: ['S'] },
      // q2: scan right to find rightmost - looking for match with 1
      { fromState: 'q2', readSymbols: ['0'], toState: 'q2', writeSymbols: ['0'], directions: ['R'] },
      { fromState: 'q2', readSymbols: ['1'], toState: 'q2', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q2', readSymbols: ['_'], toState: 'q4', writeSymbols: ['_'], directions: ['L'] },
      { fromState: 'q2', readSymbols: ['X'], toState: 'q4', writeSymbols: ['X'], directions: ['L'] },
      // q4: at rightmost, check if it's 1
      { fromState: 'q4', readSymbols: ['1'], toState: 'q5', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['0'], toState: 'q_rej', writeSymbols: ['0'], directions: ['S'] },
      { fromState: 'q4', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['X'], directions: ['S'] },
      // q5: scan back left to beginning
      { fromState: 'q5', readSymbols: ['0'], toState: 'q5', writeSymbols: ['0'], directions: ['L'] },
      { fromState: 'q5', readSymbols: ['1'], toState: 'q5', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q5', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Binary Addition  (1-tape, input like  101+110=___)
// Strategy: Simple ripple carry from right to left
// ─────────────────────────────────────────────────────────────────────────────
const binaryAddition: TMExample = {
  id: 'binary-addition',
  definition: {
    name: 'Binary Addition',
    description: 'Adds two binary numbers. Uses unary tallying approach: converts to unary, concatenates, converts back. Simplified version adds 1 to a binary number repeatedly.',
    numTapes: 2,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q_acc'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['101', '011'],
    transitions: [
      // q0: go to end of both tapes
      { fromState: 'q0', readSymbols: ['0', '0'], toState: 'q0', writeSymbols: ['0', '0'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['0', '1'], toState: 'q0', writeSymbols: ['0', '1'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['1', '0'], toState: 'q0', writeSymbols: ['1', '0'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['1', '1'], toState: 'q0', writeSymbols: ['1', '1'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['_', '_'], toState: 'q1', writeSymbols: ['_', '_'], directions: ['L', 'L'] },
      { fromState: 'q0', readSymbols: ['0', '_'], toState: 'q0', writeSymbols: ['0', '0'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['1', '_'], toState: 'q0', writeSymbols: ['1', '0'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['_', '0'], toState: 'q0', writeSymbols: ['0', '0'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['_', '1'], toState: 'q0', writeSymbols: ['0', '1'], directions: ['R', 'R'] },
      // q1: add without carry (from right to left)
      { fromState: 'q1', readSymbols: ['0', '0'], toState: 'q1', writeSymbols: ['0', '0'], directions: ['L', 'L'] },
      { fromState: 'q1', readSymbols: ['0', '1'], toState: 'q1', writeSymbols: ['1', '1'], directions: ['L', 'L'] },
      { fromState: 'q1', readSymbols: ['1', '0'], toState: 'q1', writeSymbols: ['1', '0'], directions: ['L', 'L'] },
      { fromState: 'q1', readSymbols: ['1', '1'], toState: 'q2', writeSymbols: ['0', '1'], directions: ['L', 'L'] },
      { fromState: 'q1', readSymbols: ['_', '_'], toState: 'q_acc', writeSymbols: ['_', '_'], directions: ['R', 'R'] },
      // q2: add with carry
      { fromState: 'q2', readSymbols: ['0', '0'], toState: 'q1', writeSymbols: ['1', '0'], directions: ['L', 'L'] },
      { fromState: 'q2', readSymbols: ['0', '1'], toState: 'q2', writeSymbols: ['0', '1'], directions: ['L', 'L'] },
      { fromState: 'q2', readSymbols: ['1', '0'], toState: 'q2', writeSymbols: ['0', '0'], directions: ['L', 'L'] },
      { fromState: 'q2', readSymbols: ['1', '1'], toState: 'q2', writeSymbols: ['1', '1'], directions: ['L', 'L'] },
      { fromState: 'q2', readSymbols: ['_', '_'], toState: 'q_acc', writeSymbols: ['1', '_'], directions: ['R', 'R'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Unary Multiplication  111*11 = 111111  (1-tape)
// ─────────────────────────────────────────────────────────────────────────────
const unaryMultiplication: TMExample = {
  id: 'unary-multiplication',
  definition: {
    name: 'Unary Multiplication',
    description: 'Multiplies two unary numbers separated by *. Example: 111*11 = 111111.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q_acc'],
    inputAlphabet: ['1', '*'],
    tapeAlphabet: ['1', '*', 'X', 'Y', '=', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['111*11='],
    transitions: [
      // q0: mark a 1 in first number as X
      { fromState: 'q0', readSymbols: ['1'], toState: 'q1', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['*'], toState: 'q5', writeSymbols: ['*'], directions: ['R'] },
      // q1: scan right past first number and * to second number
      { fromState: 'q1', readSymbols: ['1'], toState: 'q1', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['*'], toState: 'q2', writeSymbols: ['*'], directions: ['R'] },
      // q2: for each 1 in second number, write a 1 after =
      { fromState: 'q2', readSymbols: ['1'], toState: 'q3', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q2', readSymbols: ['Y'], toState: 'q2', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q2', readSymbols: ['='], toState: 'q4', writeSymbols: ['='], directions: ['L'] },
      // q3: go to end (past =) and write 1
      { fromState: 'q3', readSymbols: ['1'], toState: 'q3', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q3', readSymbols: ['Y'], toState: 'q3', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q3', readSymbols: ['='], toState: 'q3', writeSymbols: ['='], directions: ['R'] },
      { fromState: 'q3', readSymbols: ['_'], toState: 'q2', writeSymbols: ['1'], directions: ['L'] },
      // back-scan in q2 to find next Y or = (already handled above)
      // q4: restore Y's back to 1's and go back to find next X
      { fromState: 'q4', readSymbols: ['Y'], toState: 'q4', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['*'], toState: 'q4', writeSymbols: ['*'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['1'], toState: 'q4', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      // q5: all of first number processed, clean up
      { fromState: 'q5', readSymbols: ['1'], toState: 'q5', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q5', readSymbols: ['='], toState: 'q_acc', writeSymbols: ['='], directions: ['R'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. String Copy  w → ww  (2-tape)
// ─────────────────────────────────────────────────────────────────────────────
const stringCopy: TMExample = {
  id: 'string-copy',
  definition: {
    name: 'String Copy (w → ww)',
    description: 'Duplicates a binary input string by copying it to a second tape and writing it back.',
    numTapes: 2,
    states: ['q0', 'q1', 'q2', 'q3', 'q_acc'],
    inputAlphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['abba', ''],
    transitions: [
      // q0: copy tape0 → tape1
      { fromState: 'q0', readSymbols: ['a', '_'], toState: 'q0', writeSymbols: ['a', 'a'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['b', '_'], toState: 'q0', writeSymbols: ['b', 'b'], directions: ['R', 'R'] },
      { fromState: 'q0', readSymbols: ['_', '_'], toState: 'q1', writeSymbols: ['_', '_'], directions: ['S', 'L'] },
      // q1: rewind tape1
      { fromState: 'q1', readSymbols: ['_', 'a'], toState: 'q1', writeSymbols: ['_', 'a'], directions: ['S', 'L'] },
      { fromState: 'q1', readSymbols: ['_', 'b'], toState: 'q1', writeSymbols: ['_', 'b'], directions: ['S', 'L'] },
      { fromState: 'q1', readSymbols: ['_', '_'], toState: 'q2', writeSymbols: ['_', '_'], directions: ['S', 'R'] },
      // q2: append tape1 contents after tape0 contents
      { fromState: 'q2', readSymbols: ['_', 'a'], toState: 'q2', writeSymbols: ['a', 'a'], directions: ['R', 'R'] },
      { fromState: 'q2', readSymbols: ['_', 'b'], toState: 'q2', writeSymbols: ['b', 'b'], directions: ['R', 'R'] },
      { fromState: 'q2', readSymbols: ['_', '_'], toState: 'q_acc', writeSymbols: ['_', '_'], directions: ['S', 'S'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Balanced Parentheses  (1-tape)
// ─────────────────────────────────────────────────────────────────────────────
const balancedParentheses: TMExample = {
  id: 'balanced-parentheses',
  definition: {
    name: 'Balanced Parentheses',
    description: 'Validates whether a string of parentheses is properly balanced.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q_acc', 'q_rej'],
    inputAlphabet: ['(', ')'],
    tapeAlphabet: ['(', ')', 'X', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: ['q_rej'],
    initialInput: ['(()())'],
    transitions: [
      // q0: scan right for first )
      { fromState: 'q0', readSymbols: ['('], toState: 'q0', writeSymbols: ['('], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: [')'], toState: 'q1', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q0', readSymbols: ['_'], toState: 'q2', writeSymbols: ['_'], directions: ['L'] },
      // q1: scan left for matching (
      { fromState: 'q1', readSymbols: ['X'], toState: 'q1', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q1', readSymbols: ['('], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['_'], toState: 'q_rej', writeSymbols: ['_'], directions: ['S'] },
      // q2: verify all consumed (no unmatched '(' left)
      { fromState: 'q2', readSymbols: ['X'], toState: 'q2', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q2', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['S'] },
      { fromState: 'q2', readSymbols: ['('], toState: 'q_rej', writeSymbols: ['('], directions: ['S'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Binary Sorting  (1-tape, bubble sort: move all 0's left of 1's)
// ─────────────────────────────────────────────────────────────────────────────
const binarySorting: TMExample = {
  id: 'binary-sorting',
  definition: {
    name: 'Binary Sorting',
    description: 'Sorts a binary string so all 0s come before all 1s using a bubble-sort-like approach.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q3', 'q_acc'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['1010011'],
    transitions: [
      // q0: scan right looking for "10" pattern to swap
      { fromState: 'q0', readSymbols: ['0'], toState: 'q0', writeSymbols: ['0'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['1'], toState: 'q1', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['S'] },
      // q1: saw a 1, check next
      { fromState: 'q1', readSymbols: ['1'], toState: 'q1', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['0'], toState: 'q2', writeSymbols: ['1'], directions: ['L'] }, // swap: write 1 where 0 was
      { fromState: 'q1', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['S'] },
      // q2: go back to write 0 where the 1 was
      { fromState: 'q2', readSymbols: ['1'], toState: 'q3', writeSymbols: ['0'], directions: ['L'] }, // write 0 where 1 was
      // q3: go back to start for another pass
      { fromState: 'q3', readSymbols: ['0'], toState: 'q3', writeSymbols: ['0'], directions: ['L'] },
      { fromState: 'q3', readSymbols: ['1'], toState: 'q3', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q3', readSymbols: ['_'], toState: 'q0', writeSymbols: ['_'], directions: ['R'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Find the Middle  (1-tape, uses two pointers converging)
// ─────────────────────────────────────────────────────────────────────────────
const findMiddle: TMExample = {
  id: 'find-middle',
  definition: {
    name: 'Find the Middle',
    description: 'Locates the center character of an odd-length string by marking from both ends.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q_acc'],
    inputAlphabet: ['a'],
    tapeAlphabet: ['a', 'X', 'M', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['aaaaaaa'],
    transitions: [
      // q0: mark leftmost 'a' as X
      { fromState: 'q0', readSymbols: ['a'], toState: 'q1', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      // single char left = found middle
      { fromState: 'q0', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['L'] },
      // q1: scan right to find rightmost 'a'
      { fromState: 'q1', readSymbols: ['a'], toState: 'q1', writeSymbols: ['a'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['_'], toState: 'q2', writeSymbols: ['_'], directions: ['L'] },
      { fromState: 'q1', readSymbols: ['X'], toState: 'q2', writeSymbols: ['X'], directions: ['L'] },
      // q2: mark rightmost 'a' as X
      { fromState: 'q2', readSymbols: ['a'], toState: 'q3', writeSymbols: ['X'], directions: ['L'] },
      // if we hit X immediately, the single remaining was already handled
      { fromState: 'q2', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['M'], directions: ['S'] },
      // q3: scan left back to leftmost unmarked region
      { fromState: 'q3', readSymbols: ['a'], toState: 'q3', writeSymbols: ['a'], directions: ['L'] },
      { fromState: 'q3', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      // Only one 'a' left in the middle
      { fromState: 'q0', readSymbols: ['a'], toState: 'q4', writeSymbols: ['a'], directions: ['R'] },
      // q4 checks if next is X or _, meaning this was the last a
      // Actually let's fix: q0 marks 'a' as X (first rule), if after marking, we go right and see X or _, done
      // Let me simplify with a special check
    ],
  },
};

// Fix: Rebuild findMiddle more carefully
const findMiddleFixed: TMExample = {
  id: 'find-middle',
  definition: {
    name: 'Find the Middle',
    description: 'Locates the center character of an odd-length string by shrinking from both ends.',
    numTapes: 1,
    states: ['qStart', 'qRight', 'qMarkR', 'qLeft', 'qFound', 'q_acc'],
    inputAlphabet: ['a'],
    tapeAlphabet: ['a', 'X', 'M', '_'],
    blankSymbol: '_',
    startState: 'qStart',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['aaaaaaa'],
    transitions: [
      // qStart: mark leftmost a → X, go right to find rightmost
      { fromState: 'qStart', readSymbols: ['a'], toState: 'qRight', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'qStart', readSymbols: ['X'], toState: 'qStart', writeSymbols: ['X'], directions: ['R'] },
      // qRight: go right to end
      { fromState: 'qRight', readSymbols: ['a'], toState: 'qRight', writeSymbols: ['a'], directions: ['R'] },
      { fromState: 'qRight', readSymbols: ['X'], toState: 'qRight', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'qRight', readSymbols: ['_'], toState: 'qMarkR', writeSymbols: ['_'], directions: ['L'] },
      // qMarkR: find rightmost a, mark as X
      { fromState: 'qMarkR', readSymbols: ['X'], toState: 'qMarkR', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'qMarkR', readSymbols: ['a'], toState: 'qLeft', writeSymbols: ['X'], directions: ['L'] },
      // if no a found (all X) — shouldn't happen with odd length but safe case
      { fromState: 'qMarkR', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['R'] },
      // qLeft: go back left to find leftmost unmarked
      { fromState: 'qLeft', readSymbols: ['a'], toState: 'qLeft', writeSymbols: ['a'], directions: ['L'] },
      { fromState: 'qLeft', readSymbols: ['X'], toState: 'qFound', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'qLeft', readSymbols: ['_'], toState: 'qFound', writeSymbols: ['_'], directions: ['R'] },
      // qFound: check if only one a remains
      { fromState: 'qFound', readSymbols: ['a'], toState: 'qCheck', writeSymbols: ['a'], directions: ['R'] },
      { fromState: 'qFound', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['X'], directions: ['S'] },
      // qCheck: if next is X or _, this was the only a -> found middle
      { fromState: 'qCheck', readSymbols: ['X'], toState: 'q_acc', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'qCheck', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['L'] },
      { fromState: 'qCheck', readSymbols: ['a'], toState: 'qGoLeft', writeSymbols: ['a'], directions: ['L'] },
      // qGoLeft: more than one a remaining, go back to start
      { fromState: 'qGoLeft', readSymbols: ['a'], toState: 'qGoLeft', writeSymbols: ['a'], directions: ['L'] },
      { fromState: 'qGoLeft', readSymbols: ['X'], toState: 'qStart', writeSymbols: ['X'], directions: ['R'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Unary to Binary Conversion  (2-tape)
// Count 1's on tape0, produce binary on tape1 by repeated division by 2
// Simpler approach: decrement unary, increment binary
// ─────────────────────────────────────────────────────────────────────────────
const unaryToBinary: TMExample = {
  id: 'unary-to-binary',
  definition: {
    name: 'Unary to Binary Conversion',
    description: 'Converts a unary number (e.g. 11111 = 5) to binary (101) using repeated halving.',
    numTapes: 2,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q_acc'],
    inputAlphabet: ['1'],
    tapeAlphabet: ['1', '0', 'X', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['1111111', ''],
    transitions: [
      // Strategy: Each pass, halve the unary number and record remainder bit
      // q0: check if tape0 is all blank (done)
      { fromState: 'q0', readSymbols: ['1', '_'], toState: 'q1', writeSymbols: ['1', '_'], directions: ['S', 'S'] },
      { fromState: 'q0', readSymbols: ['_', '_'], toState: 'q_acc', writeSymbols: ['_', '_'], directions: ['S', 'S'] },
      // q1: count/halve — mark pairs of 1's, if odd one left, write 1 to tape1, else 0
      { fromState: 'q1', readSymbols: ['1', '_'], toState: 'q2', writeSymbols: ['X', '_'], directions: ['R', 'S'] },
      // q2: expect another 1 for the pair
      { fromState: 'q2', readSymbols: ['1', '_'], toState: 'q1', writeSymbols: ['X', '_'], directions: ['R', 'S'] }, // pair complete
      { fromState: 'q2', readSymbols: ['_', '_'], toState: 'q3', writeSymbols: ['_', '1'], directions: ['L', 'R'] }, // odd: remainder 1
      // q1 hitting blank means even  
      { fromState: 'q1', readSymbols: ['_', '_'], toState: 'q3', writeSymbols: ['_', '0'], directions: ['L', 'R'] }, // even: remainder 0
      // q3: restore tape0 with half the 1's (one 1 for each pair of X's)
      { fromState: 'q3', readSymbols: ['X', '_'], toState: 'q4', writeSymbols: ['1', '_'], directions: ['L', 'S'] },
      { fromState: 'q4', readSymbols: ['X', '_'], toState: 'q3', writeSymbols: ['_', '_'], directions: ['L', 'S'] },
      { fromState: 'q3', readSymbols: ['_', '_'], toState: 'q0', writeSymbols: ['_', '_'], directions: ['R', 'S'] },
      { fromState: 'q4', readSymbols: ['_', '_'], toState: 'q0', writeSymbols: ['_', '_'], directions: ['R', 'S'] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Unary Subtraction  (1-tape)  111-11 = 1
// ─────────────────────────────────────────────────────────────────────────────
const unarySubtraction: TMExample = {
  id: 'unary-subtraction',
  definition: {
    name: 'Unary Subtraction',
    description: 'Subtracts one unary number from another (a-b). Input format: 111-11= produces result after =.',
    numTapes: 1,
    states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q_acc'],
    inputAlphabet: ['1', '-', '='],
    tapeAlphabet: ['1', '-', '=', 'X', 'Y', '_'],
    blankSymbol: '_',
    startState: 'q0',
    acceptStates: ['q_acc'],
    rejectStates: [],
    initialInput: ['11111-11='],
    transitions: [
      // q0: mark a 1 in the first number
      { fromState: 'q0', readSymbols: ['1'], toState: 'q1', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['X'], toState: 'q0', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q0', readSymbols: ['-'], toState: 'q3', writeSymbols: ['-'], directions: ['R'] }, // first number exhausted
      // q1: scan right past first number and - to find unmarked 1 in second number
      { fromState: 'q1', readSymbols: ['1'], toState: 'q1', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q1', readSymbols: ['-'], toState: 'q2', writeSymbols: ['-'], directions: ['R'] },
      // q2: find first unmarked 1 in second number
      { fromState: 'q2', readSymbols: ['Y'], toState: 'q2', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q2', readSymbols: ['1'], toState: 'q_back', writeSymbols: ['Y'], directions: ['L'] }, // mark it
      { fromState: 'q2', readSymbols: ['='], toState: 'q4', writeSymbols: ['='], directions: ['L'] }, // second number exhausted (a > b)
      // q_back: go all the way left to start
      { fromState: 'q_back', readSymbols: ['Y'], toState: 'q_back', writeSymbols: ['Y'], directions: ['L'] },
      { fromState: 'q_back', readSymbols: ['-'], toState: 'q_back', writeSymbols: ['-'], directions: ['L'] },
      { fromState: 'q_back', readSymbols: ['1'], toState: 'q_back', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q_back', readSymbols: ['X'], toState: 'q_back', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q_back', readSymbols: ['_'], toState: 'q0', writeSymbols: ['_'], directions: ['R'] },
      // q3: first number exhausted, check if second also exhausted (a <= b → result 0)
      { fromState: 'q3', readSymbols: ['Y'], toState: 'q3', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q3', readSymbols: ['='], toState: 'q_acc', writeSymbols: ['='], directions: ['S'] }, // a == b, result = 0
      { fromState: 'q3', readSymbols: ['1'], toState: 'q_acc', writeSymbols: ['1'], directions: ['S'] }, // a < b, result = 0 (underflow)
      // q4: a > b, write remaining 1's after =
      { fromState: 'q4', readSymbols: ['Y'], toState: 'q4', writeSymbols: ['Y'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['-'], toState: 'q4', writeSymbols: ['-'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['X'], toState: 'q4', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q4', readSymbols: ['1'], toState: 'q_write', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q4', readSymbols: ['_'], toState: 'q_acc', writeSymbols: ['_'], directions: ['R'] },
      // q_write: go to end and write a 1
      { fromState: 'q_write', readSymbols: ['X'], toState: 'q_write', writeSymbols: ['X'], directions: ['R'] },
      { fromState: 'q_write', readSymbols: ['-'], toState: 'q_write', writeSymbols: ['-'], directions: ['R'] },
      { fromState: 'q_write', readSymbols: ['Y'], toState: 'q_write', writeSymbols: ['Y'], directions: ['R'] },
      { fromState: 'q_write', readSymbols: ['='], toState: 'q_write', writeSymbols: ['='], directions: ['R'] },
      { fromState: 'q_write', readSymbols: ['1'], toState: 'q_write', writeSymbols: ['1'], directions: ['R'] },
      { fromState: 'q_write', readSymbols: ['_'], toState: 'q_goback', writeSymbols: ['1'], directions: ['L'] },
      // q_goback: go back to continue
      { fromState: 'q_goback', readSymbols: ['1'], toState: 'q_goback', writeSymbols: ['1'], directions: ['L'] },
      { fromState: 'q_goback', readSymbols: ['='], toState: 'q_goback', writeSymbols: ['='], directions: ['L'] },
      { fromState: 'q_goback', readSymbols: ['Y'], toState: 'q_goback', writeSymbols: ['Y'], directions: ['L'] },
      { fromState: 'q_goback', readSymbols: ['-'], toState: 'q_goback', writeSymbols: ['-'], directions: ['L'] },
      { fromState: 'q_goback', readSymbols: ['X'], toState: 'q_goback', writeSymbols: ['X'], directions: ['L'] },
      { fromState: 'q_goback', readSymbols: ['_'], toState: 'q4', writeSymbols: ['_'], directions: ['R'] },
    ],
  },
};

// Add extra states to definitions that reference them
findMiddleFixed.definition.states.push('qCheck', 'qGoLeft');
unarySubtraction.definition.states.push('q_back', 'q_write', 'q_goback');
anbncn.definition.states.push('q4');

export const EXAMPLES: TMExample[] = [
  anbncn,
  binaryPalindrome,
  binaryAddition,
  unaryMultiplication,
  stringCopy,
  balancedParentheses,
  binarySorting,
  findMiddleFixed,
  unaryToBinary,
  unarySubtraction,
];
