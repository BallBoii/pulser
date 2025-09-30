import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseProgram } from '@/types/pulser/pulse';

interface ExampleProgramsProps {
  onLoadExample: (program: PulseProgram) => void;
}

const EXAMPLE_PROGRAMS: PulseProgram[] = [
  {
    name: "Simple Pulse Train",
    totalLength: 10000000,
    instructions: [
      {
        id: "ex1_1",
        flags: 0x000001,
        opcode: "CONTINUE",
        data: 0,
        duration: 1000000,
        length: 1000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex1_2", 
        flags: 0x000000,
        opcode: "CONTINUE",
        data: 0,
        duration: 1000000,
        length: 1000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex1_3",
        flags: 0x000001,
        opcode: "CONTINUE",
        data: 0,
        duration: 1000000,
        length: 1000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex1_4",
        flags: 0x000000,
        opcode: "STOP",
        data: 0,
        duration: 7000000,
        length: 7000000,
        displayTimeScale: "ms"
      }
    ]
  },
  {
    name: "Multi-Channel Sequence",
    totalLength: 20000000,
    instructions: [
      {
        id: "ex2_1",
        flags: 0x000003,
        opcode: "CONTINUE",
        data: 0,
        duration: 2000000,
        length: 2000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex2_2",
        flags: 0x00000C,
        opcode: "CONTINUE", 
        data: 0,
        duration: 3000000,
        length: 3000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex2_3",
        flags: 0x000030,
        opcode: "CONTINUE",
        data: 0,
        duration: 5000000,
        length: 5000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex2_4",
        flags: 0x000000,
        opcode: "STOP",
        data: 0,
        duration: 10000000,
        length: 10000000,
        displayTimeScale: "ms"
      }
    ]
  },
  {
    name: "Loop Example",
    totalLength: 50000000,
    instructions: [
      {
        id: "ex3_1",
        flags: 0x000001,
        opcode: "LOOP",
        data: 10,
        duration: 1000000,
        length: 1000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex3_2",
        flags: 0x000002,
        opcode: "CONTINUE",
        data: 0,
        duration: 500000,
        length: 500000,
        displayTimeScale: "μs"
      },
      {
        id: "ex3_3",
        flags: 0x000000,
        opcode: "END_LOOP",
        data: 0,
        duration: 500000,
        length: 500000,
        displayTimeScale: "μs"
      },
      {
        id: "ex3_4",
        flags: 0x000000,
        opcode: "STOP",
        data: 0,
        duration: 30000000,
        length: 30000000,
        displayTimeScale: "ms"
      }
    ]
  },
  {
    name: "Complex Timing",
    totalLength: 15000000,
    instructions: [
      {
        id: "ex4_1",
        flags: 0x00000F,
        opcode: "CONTINUE",
        data: 0,
        duration: 100000,
        length: 100000,
        displayTimeScale: "μs"
      },
      {
        id: "ex4_2",
        flags: 0x0000F0,
        opcode: "CONTINUE",
        data: 0,
        duration: 250000,
        length: 250000,
        displayTimeScale: "μs"
      },
      {
        id: "ex4_3",
        flags: 0x000F00,
        opcode: "CONTINUE",
        data: 0,
        duration: 500000,
        length: 500000,
        displayTimeScale: "μs"
      },
      {
        id: "ex4_4",
        flags: 0x00F000,
        opcode: "CONTINUE",
        data: 0,
        duration: 1000000,
        length: 1000000,
        displayTimeScale: "ms"
      },
      {
        id: "ex4_5",
        flags: 0x000000,
        opcode: "STOP",
        data: 0,
        duration: 13150000,
        length: 13150000,
        displayTimeScale: "ms"
      }
    ]
  }
];

export function ExamplePrograms({ onLoadExample }: ExampleProgramsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_PROGRAMS.map((program, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start"
              onClick={() => onLoadExample(program)}
            >
              <div className="font-medium">{program.name}</div>
              <div className="text-xs text-muted-foreground">
                {program.instructions.length} instructions • {(program.totalLength / 1000000).toFixed(1)} ms
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}