// Types for PulseBlaster instructions and visualization
export interface PBInstruction {
  flags: number | string | number[];
  opcode: string;
  data: number;
  duration: number;
  units: string;
  
  // DDS fields (optional)
  freq0?: number;
  phase0?: number;
  amp0?: number;
  dds_en0?: number;
  phase_reset0?: number;
  
  freq1?: number;
  phase1?: number;
  amp1?: number;
  dds_en1?: number;
  phase_reset1?: number;
}

export interface PulseProgram {
  instructions: PBInstruction[];
  name?: string;
  description?: string;
  totalDuration?: number;
}

export interface TimelineSegment {
  startTime: number;
  duration: number;
  flags: boolean[]; // Array of flag states
  opcode: string;
  instruction: PBInstruction;
}

export interface VisualizationSettings {
  timeScale: number; // pixels per microsecond
  flagCount: number; // number of flags to display
  showTiming: boolean;
  showOpcodes: boolean;
  colorScheme: 'default' | 'high-contrast' | 'colorblind';
}