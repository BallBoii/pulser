'use client';

import React from 'react';
import { PBInstruction } from '@/types/pulse';

interface ProgramEditorProps {
  instructions: PBInstruction[];
  onInstructionsChange: (instructions: PBInstruction[]) => void;
}

interface InstructionRowProps {
  instruction: PBInstruction;
  index: number;
  onUpdate: (index: number, instruction: PBInstruction) => void;
  onDelete: (index: number) => void;
}

const InstructionRow: React.FC<InstructionRowProps> = ({
  instruction,
  index,
  onUpdate,
  onDelete,
}) => {
  const handleFieldChange = (field: keyof PBInstruction, value: string | number | number[] | undefined) => {
    onUpdate(index, { ...instruction, [field]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2 border-b border-gray-600 hover:bg-gray-700">
      <div className="col-span-1 text-sm font-mono text-gray-400">
        {index}
      </div>
      
      {/* Flags */}
      <div className="col-span-2">
        <input
          type="text"
          value={Array.isArray(instruction.flags) ? instruction.flags.join(',') : instruction.flags.toString()}
          onChange={(e) => {
            const value = e.target.value;
            if (value.includes(',')) {
              // Array format: "0,1,2"
              const flags = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              handleFieldChange('flags', flags);
            } else if (value.match(/^[01]+$/)) {
              // Binary string format: "101100"
              handleFieldChange('flags', value);
            } else {
              // Numeric format
              const num = parseInt(value) || 0;
              handleFieldChange('flags', num);
            }
          }}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          placeholder="0 or 101 or 0,1,2"
        />
      </div>
      
      {/* Opcode */}
      <div className="col-span-2">
        <select
          value={instruction.opcode}
          onChange={(e) => handleFieldChange('opcode', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          title="Instruction opcode"
        >
          <option value="CONTINUE">CONTINUE</option>
          <option value="STOP">STOP</option>
          <option value="LOOP">LOOP</option>
          <option value="END_LOOP">END_LOOP</option>
          <option value="JSR">JSR</option>
          <option value="RTS">RTS</option>
          <option value="BRANCH">BRANCH</option>
          <option value="LONG_DELAY">LONG_DELAY</option>
          <option value="WAIT">WAIT</option>
          <option value="RTI">RTI</option>
        </select>
      </div>
      
      {/* Data */}
      <div className="col-span-1">
        <input
          type="number"
          value={instruction.data}
          onChange={(e) => handleFieldChange('data', parseInt(e.target.value) || 0)}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          title="Instruction data value"
          placeholder="0"
        />
      </div>
      
      {/* Duration */}
      <div className="col-span-2">
        <input
          type="number"
          value={instruction.duration}
          onChange={(e) => handleFieldChange('duration', parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          step="0.001"
          title="Pulse duration"
          placeholder="100"
        />
      </div>
      
      {/* Units */}
      <div className="col-span-1">
        <select
          value={instruction.units}
          onChange={(e) => handleFieldChange('units', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          title="Time units"
        >
          <option value="ns">ns</option>
          <option value="us">μs</option>
          <option value="ms">ms</option>
          <option value="s">s</option>
        </select>
      </div>
      
      {/* DDS Frequency */}
      <div className="col-span-1">
        <input
          type="number"
          value={instruction.freq0 ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
            handleFieldChange('freq0', val);
          }}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          placeholder="F0"
        />
      </div>
      
      {/* DDS Phase */}
      <div className="col-span-1">
        <input
          type="number"
          value={instruction.phase0 ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
            handleFieldChange('phase0', val);
          }}
          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
          placeholder="P0"
        />
      </div>
      
      {/* Delete button */}
      <div className="col-span-1">
        <button
          onClick={() => onDelete(index)}
          className="w-full px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ProgramEditor: React.FC<ProgramEditorProps> = ({
  instructions,
  onInstructionsChange,
}) => {
  const addInstruction = () => {
    const newInstruction: PBInstruction = {
      flags: 0,
      opcode: 'CONTINUE',
      data: 0,
      duration: 100,
      units: 'us',
    };
    onInstructionsChange([...instructions, newInstruction]);
  };

  const updateInstruction = (index: number, instruction: PBInstruction) => {
    const updated = [...instructions];
    updated[index] = instruction;
    onInstructionsChange(updated);
  };

  const deleteInstruction = (index: number) => {
    const updated = instructions.filter((_, i) => i !== index);
    onInstructionsChange(updated);
  };

  const loadExample = () => {
    const exampleInstructions: PBInstruction[] = [
      { flags: [0], opcode: 'CONTINUE', data: 0, duration: 500, units: 'us' },
      { flags: 0, opcode: 'CONTINUE', data: 0, duration: 200, units: 'us' },
      { flags: [1, 2], opcode: 'CONTINUE', data: 0, duration: 300, units: 'us' },
      { flags: 0, opcode: 'CONTINUE', data: 0, duration: 100, units: 'us' },
      { flags: 0, opcode: 'BRANCH', data: 0, duration: 50, units: 'us' },
    ];
    onInstructionsChange(exampleInstructions);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-600">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Pulse Program Editor</h3>
          <div className="space-x-2">
            <button
              onClick={loadExample}
              className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Load Example
            </button>
            <button
              onClick={addInstruction}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Instruction
            </button>
          </div>
        </div>
        
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-700 text-sm font-semibold mt-4 text-white">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Flags</div>
          <div className="col-span-2">Opcode</div>
          <div className="col-span-1">Data</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-1">Units</div>
          <div className="col-span-1">F0</div>
          <div className="col-span-1">P0</div>
          <div className="col-span-1">Del</div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {instructions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No instructions. Click &quot;Add Instruction&quot; or &quot;Load Example&quot; to get started.
          </div>
        ) : (
          instructions.map((instruction, index) => (
            <InstructionRow
              key={index}
              instruction={instruction}
              index={index}
              onUpdate={updateInstruction}
              onDelete={deleteInstruction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProgramEditor;