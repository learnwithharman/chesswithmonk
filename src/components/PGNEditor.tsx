import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PGNEditorProps {
  pgn: string;
  onImport: (pgn: string) => void;
}

export function PGNEditor({ pgn, onImport }: PGNEditorProps) {
  const [editingPGN, setEditingPGN] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const { toast } = useToast();

  const handleExport = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${Date.now()}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'PGN Exported',
      description: 'Game saved to your downloads',
    });
  };

  const handleImport = () => {
    try {
      onImport(pgnText);
      setEditingPGN(false);
      toast({
        title: 'PGN Imported',
        description: 'Game loaded successfully',
      });
    } catch (e) {
      toast({
        title: 'Import Failed',
        description: 'Invalid PGN format',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">PGN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!editingPGN ? (
          <>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!pgn}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPGN(true);
                  setPgnText(pgn);
                }}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </>
        ) : (
          <>
            <Textarea
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              className="font-mono text-xs min-h-[120px]"
              placeholder="Paste PGN here..."
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleImport}
                className="flex-1"
              >
                Load PGN
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPGN(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
