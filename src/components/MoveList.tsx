import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MoveListProps {
  moves: string[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
  moveQualities?: Map<number, string>;
}

export function MoveList({ moves, currentMoveIndex, onMoveClick, moveQualities }: MoveListProps) {
  // Group moves into pairs (white, black)
  const movePairs: Array<{ white: string; black?: string; index: number }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
      index: i,
    });
  }

  return (
    <Card className="flex flex-col w-full h-full">
      <CardHeader className="pb-2 pt-2.5 px-3">
        <CardTitle className="text-xs font-semibold">Move History</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2 flex-1">
        <ScrollArea className="h-[calc(80vh-60px)] px-3">
          {movePairs.length === 0 ? (
            <p className="text-muted-foreground text-xs">No moves yet</p>
          ) : (
            <div className="space-y-0">
              {movePairs.map((pair, pairIndex) => (
                <div
                  key={pairIndex}
                  className="flex items-center text-xs hover:bg-muted/30 rounded transition-colors py-0.5"
                >
                  <span className="text-muted-foreground font-mono w-7 text-[11px] shrink-0">
                    {pairIndex + 1}.
                  </span>
                  <button
                    className={cn(
                      'px-1.5 py-0.5 rounded hover:bg-accent transition-colors font-mono text-[11px] min-w-[45px] text-left',
                      currentMoveIndex === pair.index && 'bg-primary text-primary-foreground font-semibold'
                    )}
                    onClick={() => onMoveClick(pair.index)}
                  >
                    {pair.white}
                  </button>
                  {moveQualities?.get(pair.index) && (
                    <span className="ml-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded px-1">
                      {moveQualities.get(pair.index)}
                    </span>
                  )}
                  {pair.black && (
                    <>
                      <button
                        className={cn(
                          'px-1.5 py-0.5 rounded hover:bg-accent transition-colors font-mono text-[11px] min-w-[45px] text-left ml-1',
                          currentMoveIndex === pair.index + 1 && 'bg-primary text-primary-foreground font-semibold'
                        )}
                        onClick={() => onMoveClick(pair.index + 1)}
                      >
                        {pair.black}
                      </button>
                      {moveQualities?.get(pair.index + 1) && (
                        <span className="ml-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded px-1">
                          {moveQualities.get(pair.index + 1)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
