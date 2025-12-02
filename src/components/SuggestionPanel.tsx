import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Suggestion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  visible: boolean;
}

export function SuggestionPanel({ suggestions, visible }: SuggestionPanelProps) {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  const getIcon = (classification: string) => {
    switch (classification) {
      case '✓': return <CheckCircle className="w-4 h-4 text-suggestion-green" />;
      case '?!': return <TrendingUp className="w-4 h-4 text-highlight-amber" />;
      case '?': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case '??': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getClassificationText = (classification: string) => {
    switch (classification) {
      case '✓': return 'Excellent';
      case '?!': return 'Inaccuracy';
      case '?': return 'Mistake';
      case '??': return 'Blunder';
      default: return '';
    }
  };

  return (
    <Card className="animate-fade-in flex flex-col h-full">
      <CardHeader className="pb-2 pt-2.5 px-3 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Move Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-3 pb-3">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.move.from}-${suggestion.move.to}-${index}`}
                className={cn(
                  'p-2.5 rounded-lg border transition-all hover:shadow-md',
                  index === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {getIcon(suggestion.classification)}
                    <span className={cn(
                      'text-xs font-bold uppercase',
                      suggestion.classification === '✓' ? 'text-suggestion-green' :
                        suggestion.classification === '?!' ? 'text-highlight-amber' :
                          'text-destructive'
                    )}>
                      {getClassificationText(suggestion.classification)}
                    </span>
                    <span className="font-mono font-bold text-sm ml-1">
                      {suggestion.move.san || `${suggestion.move.from}-${suggestion.move.to}`}
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      Best Move
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Evaluation: {(suggestion.score / 100).toFixed(2)}</span>
                  {suggestion.cpLoss > 0 && (
                    <span>Loss: {(suggestion.cpLoss / 100).toFixed(2)} pawns</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
