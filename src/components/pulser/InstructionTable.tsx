import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Clock } from 'lucide-react';
import { FlagInput } from './FlagInput';
import { 
  PulseInstruction, 
  OPCODE_OPTIONS, 
  VisualizationSettings, 
  TIME_SCALE_MULTIPLIERS,
  formatDurationInScale,
  parseDurationFromScale,
  getOptimalTimeScale
} from '@/types/pulser/pulse';

interface InstructionTableProps {
  instructions: PulseInstruction[];
  settings: VisualizationSettings;
  onInstructionsChange: (instructions: PulseInstruction[]) => void;
  selectedInstructionId?: string;
  onSelectInstruction: (id: string) => void;
}

export function InstructionTable({ 
  instructions, 
  settings,
  onInstructionsChange, 
  selectedInstructionId, 
  onSelectInstruction 
}: InstructionTableProps) {
  // State to track editing values for duration inputs
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Initialize editing values when instructions change
  useEffect(() => {
    const newEditingValues: Record<string, string> = {};
    instructions.forEach(instruction => {
      if (!editingValues[instruction.id]) {
        newEditingValues[instruction.id] = formatDurationInScale(
          instruction.duration, 
          getInstructionTimeScale(instruction)
        );
      }
    });
    setEditingValues(prev => ({ ...prev, ...newEditingValues }));
  }, [instructions, editingValues]);

  const addInstruction = () => {
    const newInstruction: PulseInstruction = {
      id: `inst_${Date.now()}`,
      flags: 0,
      opcode: 'CONTINUE',
      data: 0,
      duration: 1000,
      length: 1000,
      displayTimeScale: 'μs' // default to microseconds
    };
    onInstructionsChange([...instructions, newInstruction]);
  };

  const removeInstruction = (id: string) => {
    onInstructionsChange(instructions.filter(inst => inst.id !== id));
  };

  // Use a generic type for value to avoid 'any'
  const updateInstruction = <K extends keyof PulseInstruction>(
    id: string,
    field: K,
    value: PulseInstruction[K]
  ) => {
    const updated = instructions.map(inst => {
      if (inst.id === id) {
        const updatedInst = { ...inst, [field]: value };
        // Update length when duration changes
        if (field === 'duration') {
          updatedInst.length = typeof value === 'number' ? value : inst.length;
        }
        return updatedInst;
      }
      return inst;
    });
    onInstructionsChange(updated);

    // Update editing value when time scale changes
    if (field === 'displayTimeScale') {
      const instruction = instructions.find(inst => inst.id === id);
      if (instruction) {
        const newFormattedValue = formatDurationInScale(
          instruction.duration,
          value as 'ns' | 'μs' | 'ms' | 's'
        );
        setEditingValues(prev => ({
          ...prev,
          [id]: newFormattedValue
        }));
      }
    }
  };

  const getInstructionTimeScale = (instruction: PulseInstruction) => {
    return instruction.displayTimeScale || getOptimalTimeScale(instruction.duration);
  };

  const formatDuration = (duration: number) => {
    const multiplier = TIME_SCALE_MULTIPLIERS[settings.timeScale];
    const scaledDuration = duration / multiplier;
    return scaledDuration.toFixed(scaledDuration < 1 ? 3 : 0);
  };



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>Pulse Instructions</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              const updatedInstructions = instructions.map(inst => ({
                ...inst,
                displayTimeScale: getOptimalTimeScale(inst.duration)
              }));
              onInstructionsChange(updatedInstructions);
            }}
            variant="outline"
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto Time Scales
          </Button>
          <Button onClick={addInstruction} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Instruction
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Opcode</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-24">Unit</TableHead>
              {settings.showTiming && <TableHead>Start Time ({settings.timeScale})</TableHead>}
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructions.map((instruction, index) => {
              const startTime = instructions
                .slice(0, index)
                .reduce((sum, inst) => sum + (inst.length || 0), 0);
              
              return (
                <TableRow 
                  key={instruction.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedInstructionId === instruction.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelectInstruction(instruction.id)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FlagInput
                      value={instruction.flags}
                      onChange={(value) => updateInstruction(instruction.id, 'flags', value)}
                      maxFlags={settings.flagCount}
                      className="w-48"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={instruction.opcode}
                      onValueChange={(value) => updateInstruction(
                        instruction.id,
                        'opcode',
                        value as PulseInstruction['opcode']
                      )}
                    >
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPCODE_OPTIONS.map(opcode => (
                          <SelectItem key={opcode} value={opcode}>
                            {opcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={instruction.data}
                      onChange={(e) => updateInstruction(instruction.id, 'data', parseInt(e.target.value) || 0)}
                      className="w-20"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={editingValues[instruction.id] || formatDurationInScale(instruction.duration, getInstructionTimeScale(instruction))}
                      onChange={(e) => {
                        setEditingValues(prev => ({
                          ...prev,
                          [instruction.id]: e.target.value
                        }));
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value.trim() === '') {
                          // Reset to formatted value if empty
                          const formattedValue = formatDurationInScale(instruction.duration, getInstructionTimeScale(instruction));
                          setEditingValues(prev => ({
                            ...prev,
                            [instruction.id]: formattedValue
                          }));
                          return;
                        }
                        
                        const numericValue = parseFloat(value);
                        if (isNaN(numericValue)) {
                          // Reset to formatted value if invalid
                          const formattedValue = formatDurationInScale(instruction.duration, getInstructionTimeScale(instruction));
                          setEditingValues(prev => ({
                            ...prev,
                            [instruction.id]: formattedValue
                          }));
                          return;
                        }
                        
                        const timeScale = getInstructionTimeScale(instruction);
                        const durationNs = parseDurationFromScale(numericValue.toString(), timeScale);
                        updateInstruction(instruction.id, 'duration', durationNs);
                        
                        // Update the editing value to the formatted version
                        const formattedValue = formatDurationInScale(durationNs, timeScale);
                        setEditingValues(prev => ({
                          ...prev,
                          [instruction.id]: formattedValue
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="w-24"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Select
                        value={getInstructionTimeScale(instruction)}
                        onValueChange={(value) => updateInstruction(
                          instruction.id,
                          'displayTimeScale',
                          value as PulseInstruction['displayTimeScale']
                        )}
                      >
                        <SelectTrigger 
                          onClick={(e) => e.stopPropagation()}
                          className="w-16"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ns">ns</SelectItem>
                          <SelectItem value="μs">μs</SelectItem>
                          <SelectItem value="ms">ms</SelectItem>
                          <SelectItem value="s">s</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const optimalScale = getOptimalTimeScale(instruction.duration);
                          updateInstruction(
                            instruction.id,
                            'displayTimeScale',
                            optimalScale as PulseInstruction['displayTimeScale']
                          );
                        }}
                        title="Auto-select optimal time scale"
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  {settings.showTiming && (
                    <TableCell className="font-mono text-sm">
                      {formatDuration(startTime)}
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInstruction(instruction.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}