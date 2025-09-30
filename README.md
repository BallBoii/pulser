# PulseBlaster Visualizer

A modern web-based visualizer for SpinCore PulseBlaster pulse sequences built with Next.js, React, and TypeScript.

## Features

- **Interactive Program Editor**: Create and edit pulse programs with a user-friendly interface
- **Timeline Visualization**: Visual representation of pulse sequences with timing information
- **Multiple Flag Support**: Configure and visualize up to 24 digital output flags
- **Real-time Validation**: Automatic program validation with warnings for common issues
- **Export Options**: Export programs as JSON or Python code
- **Flexible Input Formats**: Support for multiple flag input formats (binary, string, array)
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
pnpm build
```

## Usage

### Creating a Pulse Program

1. **Add Instructions**: Click "Add Instruction" to create new pulse instructions
2. **Set Flags**: Configure digital output flags using:
   - Numbers: `5` (binary representation)
   - Binary strings: `"101"` (first character = flag0)
   - Arrays: `[0, 2, 4]` (list of flag indices)
3. **Choose Opcodes**: Select from available PulseBlaster opcodes
4. **Set Timing**: Configure duration and time units (ns, μs, ms, s)
5. **DDS Support**: Add frequency and phase register IDs for DDS-enabled boards

### Visualization Controls

- **Time Scale**: Adjust horizontal zoom (pixels per microsecond)
- **Flag Count**: Set number of flags to display (1-24)
- **Show Timing**: Toggle timing information display
- **Show Opcodes**: Toggle opcode track display

### Example Programs

Click "Load Example" to load a sample pulse program with:
- Flag transitions
- Multiple timing scales
- Branch instructions for loops

### Export Options

- **JSON Export**: Save program as JSON for later import
- **Python Export**: Generate Python code using the PulseBlaster wrapper

## Integration with PulseBlaster Hardware

The visualizer is designed to work with the Python PulseBlaster wrapper (`pulser.py`). Generated Python code can be directly used with SpinCore PulseBlaster devices:

```python
from pulser import PulseBlaster, PBInstruction

# Load your exported program
with PulseBlaster(board=0, core_clock_MHz=100.0) as pb:
    pb.program_pulse_program(instructions)
    pb.start()
    # Your timing logic here
    pb.stop()
```

## Project Structure

```
src/
├── app/
│   └── page.tsx          # Main application page
├── components/
│   ├── ProgramEditor.tsx # Instruction editing interface
│   ├── TimelineView.tsx  # Timeline visualization component
│   └── *.module.css      # Component styles
├── types/
│   └── pulse.ts          # TypeScript type definitions
└── utils/
    └── pulseUtils.ts     # Utility functions for pulse operations
```

## Technology Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **pnpm**: Fast, disk space efficient package manager
