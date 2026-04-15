# Multi-Tape Turing Machine Visualizer

This is a web-based **Multi-Tape Turing Machine Simulator** built to make computational theory easier to understand and visualize. It helps display how read/write heads move across multiple tapes in real-time.

## Features

* **Multi-Tape Architecture**: Simulates complex Turing Machines with multiple independent tapes.
* **Interactive Visualization**: Watch read/write heads shift across the tapes as the machine executes steps.
* **State Diagrams**: Automatically generates animated state transition diagrams using React Flow, which can be exported as images.
* **Built-in Examples**: Includes pre-configured problems (like binary addition or palindrome checking) to see the engine in action quickly.
* **Metrics**: Tracks execution speed, total steps taken, and overall machine efficiency during runtime.

## Technology Stack

* **Frontend**: React 19 + TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS integration
* **Animations**: Framer Motion
* **Node Visualization**: `@xyflow/react` for state diagrams

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tavishraj/Multi-Tape-TM-Visualizer.git
   cd Multi-Tape-TM-Visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## How It Works

The engine dynamically processes a Turing Machine's configuration—states, alphabet, blank symbols, and the transition function—and translates those computational steps into visual nodes and tape shifts. Using the Metrics Panel, you monitor the steps and state changes live.

---

Tavish Raj
2024UCS1505
