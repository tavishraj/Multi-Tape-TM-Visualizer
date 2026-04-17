# Multi-Tape Turing Machine Visualizer

![Theoretical Computation](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200)

## Overview

This project is a web-based Multi-Tape Turing Machine Simulator. It is designed to visualize the internal mechanics of computational theory, making abstract concepts accessible and visually engaging. By providing a live, simulated environment, users can observe how read/write heads interact with multiple simultaneous tapes to solve complex algorithms.

## Theoretical Background

### The Turing Machine
A Turing Machine is a mathematical model of computation introduced by Alan Turing in 1936. It consists of an infinite tape divided into discrete cells, a read/write head that scans the tape, and a finite state control that determines the machine's actions. Despite its simplicity, a Turing Machine is capable of simulating any computer algorithm and forms the foundational basis for modern computer science.

### Multi-Tape Extension
A Multi-Tape Turing Machine is a variant that features multiple tapes, each with its own independent read/write head. While mathematically equivalent in computational power to a standard single-tape machine, a multi-tape architecture is significantly more efficient for solving complex problems. It allows algorithms like binary addition, copying, and palindrome checking to be executed in fewer steps by managing separate streams of data simultaneously.

![Computational Architecture](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200)

## Core Features

* **Multi-Tape Architecture**: Simulates complex Turing Machines with multiple independent tapes and heads.
* **Live Tape Visualization**: Observe character reading, writing, and head shifting across tapes during algorithmic execution.
* **Dynamic State Diagrams**: Automatically constructs animated state transition diagrams mapping the logic of the machine.
* **Built-in Examples**: Includes pre-configured computational problems such as binary addition and palindrome checking.
* **Export Capabilities**: Allows users to export high-resolution diagrams of the machine's finite state automaton.

## Project Structure

```
Multi-Tape-TM-Visualizer/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── BackgroundCanvas.tsx     # Animated cyberpunk background
│   │   ├── ControlCenter.tsx        # Play/Pause/Step/Reset controls & speed selector
│   │   ├── DFAVisualization.tsx     # State transition diagram (React Flow + Framer Motion)
│   │   ├── Dashboard.tsx            # Main layout orchestrating all components
│   │   ├── ExampleSelector.tsx      # Dropdown to load built-in TM examples
│   │   ├── MetricsPanel.tsx         # Current state, steps, head values, status display
│   │   ├── TapeView.tsx             # Multi-tape visualization with animated heads
│   │   └── TransitionLog.tsx        # Step-by-step execution log
│   ├── engine/
│   │   ├── TuringMachine.ts         # Core TM computation engine (step, reset, snapshot)
│   │   ├── examples.ts              # 10 built-in TM definitions
│   │   └── types.ts                 # TypeScript interfaces (TMDefinition, Transition, etc.)
│   ├── hooks/
│   │   └── useTuringMachine.ts      # React hook managing TM state & simulation loop
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles, animations, custom cursor
├── index.html                   # HTML entry
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite + Tailwind CSS v4 config
├── vercel.json                  # Vercel deployment config
└── README.md
```

## Input / Output Example — `a^n b^n c^n` (2-Tape TM)

This machine verifies that a string contains equal counts of `a`, `b`, and `c` in order.

### Machine Definition

| Property       | Value                                       |
|----------------|---------------------------------------------|
| **Tapes**      | 2                                           |
| **States**     | q0, q1, q2, q3, q4, q_acc, q_rej            |
| **Start**      | q0                                          |
| **Accept**     | q_acc                                       |
| **Reject**     | q_rej                                       |
| **Input**      | Tape 0: `aabbcc` · Tape 1: _(blank)_        |

### Transition Table (key rules)

| From  | Read (T0,T1) | To    | Write (T0,T1) | Move (T0,T1) | Description                      |
|-------|-------------|-------|---------------|---------------|----------------------------------|
| q0    | a, _        | q0    | a, X          | R, R          | Copy a's as tally marks on T1    |
| q0    | b, _        | q1    | b, _          | S, L          | End of a's, rewind T1            |
| q1    | b, _        | q2    | b, _          | S, R          | T1 rewound, start matching b's   |
| q2    | b, X        | q2    | b, X          | R, R          | Match each b with a tally X      |
| q2    | c, _        | q3    | c, _          | S, L          | b's matched, rewind T1 for c's   |
| q3    | c, _        | q4    | c, _          | S, R          | T1 rewound, start matching c's   |
| q4    | c, X        | q4    | c, X          | R, R          | Match each c with a tally X      |
| q4    | _, _        | q_acc | _, _          | S, S          | All matched → **ACCEPT**         |

### Execution Trace (Input: `aabbcc`)

```
Step 0  │ State: q0    │ T0: [a]abbcc  │ T1: [_]        │ Read: a,_  → Write: a,X  → Move: R,R
Step 1  │ State: q0    │ T0: a[a]bbcc  │ T1: X[_]       │ Read: a,_  → Write: a,X  → Move: R,R
Step 2  │ State: q0    │ T0: aa[b]bcc  │ T1: XX[_]      │ Read: b,_  → Write: b,_  → Move: S,L
Step 3  │ State: q1    │ T0: aa[b]bcc  │ T1: X[X]       │ Read: b,X  → Write: b,X  → Move: S,L
Step 4  │ State: q1    │ T0: aa[b]bcc  │ T1: [X]X       │ (rewind continues...)
  ...   │              │               │                │ (matching b's, then c's)
Final   │ State: q_acc │ T0: aabbcc[_] │ T1: XX[_]      │ ✅ ACCEPTED — equal a,b,c counts
```

> **Key insight**: Tape 1 acts as a counter. The machine tallies `a`'s onto Tape 1, then verifies `b`'s and `c`'s each consume the same number of tallies, proving `n(a) = n(b) = n(c)`.

## Technology Stack and Tools

This application is built with modern web technologies focused on performance and dynamic visualization:

* **React 19**: Core frontend library for building the user interface.
* **TypeScript**: Provides strong static typing ensuring the mathematical engine runs without structural errors.
* **Vite**: High-performance build tool and development server.
* **Tailwind CSS**: Utility-first CSS framework used for styling the dark-mode aesthetic.
* **Framer Motion**: Animation library powering the smooth transitions of the tapes and read/write heads.
* **XYFlow**: Node-based visualization library utilized for generating the interactive State Transition Diagrams.
* **HTML-to-Image**: Tool utilized to locally render and export the state diagrams into PNG metrics.

---

Tavish Raj
2024UCS1505
