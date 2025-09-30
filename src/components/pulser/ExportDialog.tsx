import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download } from 'lucide-react';
import { PulseProgram } from '@/types/pulser/pulse';
import { toast } from 'sonner';

interface ExportDialogProps {
  program: PulseProgram;
  children: React.ReactNode;
}

export function ExportDialog({ program, children }: ExportDialogProps) {
  const [open, setOpen] = useState(false);

  const generateJSON = () => {
    return JSON.stringify(program, null, 2);
  };

  const generatePython = () => {
    const instructionsCode = program.instructions.map(inst => {
      // Convert bitmask flags back to array of flag indices
      let flagsOutput;
      if (typeof inst.flags === 'number') {
        if (inst.flags === 0) {
          flagsOutput = '[]';
        } else {
          const flagIndices: number[] = [];
          for (let i = 0; i < 24; i++) {
            if ((inst.flags >> i) & 1) {
              flagIndices.push(i);
            }
          }
          flagsOutput = `[${flagIndices.join(', ')}]`;
        }
      } else {
        flagsOutput = `"${inst.flags}"`;
      }

      return `    PBInstruction(flags=${flagsOutput}, opcode="${inst.opcode}", data=${inst.data}, duration=${inst.duration}, units="ns")`;
    }).join(',\n');

    return `# Generated pulse program
from pulser import PulseBlaster, PBInstruction

# Program instructions
instructions = [
${instructionsCode}
]

# Run the program
with PulseBlaster(board=0, core_clock_MHz=500.0) as pb:
    pb.program_pulse_program(instructions)
    pb.start()
    # Add your timing logic here
    pb.stop()
`;
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${format} code copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`File ${filename} downloaded`);
  };

  const jsonContent = generateJSON();
  const pythonContent = generatePython();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Pulse Program</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">JSON Format</TabsTrigger>
            <TabsTrigger value="python">Python Script</TabsTrigger>
          </TabsList>
          
          <TabsContent value="json" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Export as JSON for storage and configuration management
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(jsonContent, 'JSON')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(jsonContent, `${program.name || 'pulse_program'}.json`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
              value={jsonContent}
              readOnly
              className="font-mono text-sm h-96 resize-none"
            />
          </TabsContent>
          
          <TabsContent value="python" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Export as Python script for direct execution with SpinAPI
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(pythonContent, 'Python')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(pythonContent, `${program.name || 'pulse_program'}.py`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
              value={pythonContent}
              readOnly
              className="font-mono text-sm h-96 resize-none"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}