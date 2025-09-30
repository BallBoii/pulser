import { PBInstruction, TimelineSegment } from '@/types/pulse0';

// Unit conversion factors (to nanoseconds)
const UNIT_SCALE = {
  ns: 1,
  us: 1000,
  ms: 1000000,
  s: 1000000000,
};

/**
 * Convert duration to nanoseconds
 */
export function durationToNs(duration: number, units: string): number {
  const scale = UNIT_SCALE[units.toLowerCase() as keyof typeof UNIT_SCALE];
  if (!scale) {
    throw new Error(`Invalid time unit: ${units}`);
  }
  return duration * scale;
}

/**
 * Format duration with appropriate units for display
 */
export function formatDuration(durationNs: number): string {
  if (durationNs >= 1000000000) {
    return `${(durationNs / 1000000000).toFixed(2)} s`;
  } else if (durationNs >= 1000000) {
    return `${(durationNs / 1000000).toFixed(2)} ms`;
  } else if (durationNs >= 1000) {
    return `${(durationNs / 1000).toFixed(2)} μs`;
  } else {
    return `${durationNs.toFixed(0)} ns`;
  }
}

/**
 * Encode flags from various formats into boolean array
 */
export function encodeFlags(flags: number | string | number[], flagCount: number = 24): boolean[] {
  const result = new Array(flagCount).fill(false);
  
  if (typeof flags === 'number') {
    // Binary representation
    for (let i = 0; i < flagCount; i++) {
      result[i] = Boolean(flags & (1 << i));
    }
  } else if (typeof flags === 'string') {
    // String representation (first char = flag0)
    for (let i = 0; i < Math.min(flags.length, flagCount); i++) {
      result[i] = flags[i] === '1';
    }
  } else if (Array.isArray(flags)) {
    // Array of flag indices
    flags.forEach(index => {
      if (index >= 0 && index < flagCount) {
        result[index] = true;
      }
    });
  }
  
  return result;
}

/**
 * Convert instruction sequence to timeline segments for visualization
 */
export function instructionsToTimeline(instructions: PBInstruction[]): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  let currentTime = 0;
  
  for (const instruction of instructions) {
    const durationNs = durationToNs(instruction.duration, instruction.units);
    const flags = encodeFlags(instruction.flags);
    
    segments.push({
      startTime: currentTime,
      duration: durationNs,
      flags,
      opcode: instruction.opcode,
      instruction,
    });
    
    currentTime += durationNs;
  }
  
  return segments;
}

/**
 * Calculate total program duration in nanoseconds
 */
export function calculateTotalDuration(instructions: PBInstruction[]): number {
  return instructions.reduce((total, instruction) => {
    return total + durationToNs(instruction.duration, instruction.units);
  }, 0);
}

/**
 * Validate pulse program for common issues
 */
export function validateProgram(instructions: PBInstruction[]): string[] {
  const warnings: string[] = [];
  
  if (instructions.length === 0) {
    warnings.push('Empty instruction list');
    return warnings;
  }
  
  // Check for balanced LOOP/END_LOOP
  let loopDepth = 0;
  instructions.forEach((instruction, index) => {
    if (instruction.opcode.toUpperCase() === 'LOOP') {
      loopDepth++;
    } else if (instruction.opcode.toUpperCase() === 'END_LOOP') {
      loopDepth--;
      if (loopDepth < 0) {
        warnings.push(`Instruction ${index}: END_LOOP without matching LOOP`);
      }
    }
  });
  
  if (loopDepth > 0) {
    warnings.push('Unmatched LOOP instructions (missing END_LOOP)');
  }
  
  // Check program termination
  const lastInstruction = instructions[instructions.length - 1];
  if (!['STOP', 'BRANCH'].includes(lastInstruction.opcode.toUpperCase())) {
    warnings.push('Program should typically end with STOP or BRANCH instruction');
  }
  
  return warnings;
}