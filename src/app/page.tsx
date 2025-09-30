'use client';

import React, { useState } from 'react';
import ProgramEditor from '@/components/ProgramEditor';
import TimelineView from '@/components/TimelineView';
import { PBInstruction } from '@/types/pulse';
import { instructionsToTimeline, validateProgram, calculateTotalDuration, formatDuration } from '@/lib/utils/pulseUtils';

export default function Home() {
  const [instructions, setInstructions] = useState<PBInstruction[]>([]);
  const [timeScale, setTimeScale] = useState(1);
  const [timeUnit, setTimeUnit] = useState<'ns' | 'us' | 'ms' | 's'>('us');
  const [flagCount, setFlagCount] = useState(8);
  const [showTiming, setShowTiming] = useState(true);
  const [showOpcodes, setShowOpcodes] = useState(true);

  const timeline = instructionsToTimeline(instructions);
  const warnings = validateProgram(instructions);
  const totalDuration = calculateTotalDuration(instructions);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            PulseBlaster Visualizer
          </h1>
          <p className="text-gray-300">
            Create and visualize pulse sequences for SpinCore PulseBlaster devices
          </p>
        </header>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Visualization Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Time Scale
              </label>
              <div className="flex space-x-2">
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as 'ns' | 'us' | 'ms' | 's')}
                  className="px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white text-sm"
                >
                  <option value="ns">nanoseconds</option>
                  <option value="us">microseconds</option>
                  <option value="ms">milliseconds</option>
                  <option value="s">seconds</option>
                </select>
              </div>
              <input
                type="range"
                min={timeUnit === 'ns' ? '0.001' : timeUnit === 'us' ? '0.1' : timeUnit === 'ms' ? '10' : '1000'}
                max={timeUnit === 'ns' ? '1' : timeUnit === 'us' ? '10' : timeUnit === 'ms' ? '100' : '10000'}
                step={timeUnit === 'ns' ? '0.001' : timeUnit === 'us' ? '0.1' : timeUnit === 'ms' ? '1' : '100'}
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-400">{timeScale.toFixed(timeUnit === 'ns' ? 3 : timeUnit === 'us' ? 1 : 0)} px/{timeUnit}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Flag Count
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={flagCount}
                onChange={(e) => setFlagCount(parseInt(e.target.value) || 8)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showTiming}
                  onChange={(e) => setShowTiming(e.target.checked)}
                  className="mr-2"
                />
                Show Timing
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showOpcodes}
                  onChange={(e) => setShowOpcodes(e.target.checked)}
                  className="mr-2"
                />
                Show Opcodes
              </label>
            </div>

            <div className="text-sm text-gray-300">
              <div>Instructions: {instructions.length}</div>
              <div>Total Duration: {formatDuration(totalDuration)}</div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
            <h4 className="text-yellow-300 font-medium mb-2">⚠️ Program Warnings</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main content */}
        <div className="space-y-6">
          <ProgramEditor
            instructions={instructions}
            onInstructionsChange={setInstructions}
          />
          
          <TimelineView
            segments={timeline}
            flagCount={flagCount}
            timeScale={timeScale}
            timeUnit={timeUnit}
            showTiming={showTiming}
            showOpcodes={showOpcodes}
          />
        </div>

        {/* Export options */}
        {instructions.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Export</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const data = JSON.stringify(instructions, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'pulse_program.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export JSON
              </button>
              
              <button
                onClick={() => {
                  const pythonCode = generatePythonCode(instructions);
                  const blob = new Blob([pythonCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'pulse_program.py';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export Python
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generatePythonCode(instructions: PBInstruction[]): string {
  const instructionsCode = instructions.map(inst => {
    const flags = Array.isArray(inst.flags) 
      ? `[${inst.flags.join(', ')}]`
      : typeof inst.flags === 'string'
      ? `"${inst.flags}"`
      : inst.flags;
    
    let code = `    PBInstruction(flags=${flags}, opcode="${inst.opcode}", data=${inst.data}, duration=${inst.duration}, units="${inst.units}"`;
    
    if (inst.freq0 !== undefined) code += `, freq0=${inst.freq0}`;
    if (inst.phase0 !== undefined) code += `, phase0=${inst.phase0}`;
    if (inst.amp0 !== undefined) code += `, amp0=${inst.amp0}`;
    if (inst.freq1 !== undefined) code += `, freq1=${inst.freq1}`;
    if (inst.phase1 !== undefined) code += `, phase1=${inst.phase1}`;
    if (inst.amp1 !== undefined) code += `, amp1=${inst.amp1}`;
    
    code += `)`;
    return code;
  }).join(',\n');

  return `# Generated pulse program
from pulser import PulseBlaster, PBInstruction

# Program instructions
instructions = [
${instructionsCode}
]

# Run the program
with PulseBlaster(board=0, core_clock_MHz=100.0) as pb:
    pb.program_pulse_program(instructions)
    pb.start()
    # Add your timing logic here
    pb.stop()
`;
}