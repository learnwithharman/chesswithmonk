import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RotateCcw, Undo, Redo, FlipVertical2, Lightbulb, Play, Zap } from 'lucide-react';
import Spinner from './ui/spinner';
import { Difficulty } from '@/lib/types';

interface ControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFlip: () => void;
  onToggleSuggestions: () => void;
  onAiMove: () => void;
  showSuggestions: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isAiThinking?: boolean;
  isAutoplay: boolean;
  onToggleAutoplay: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  novice: 'Novice',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const difficultyDescriptions: Record<Difficulty, string> = {
  beginner: '~1000 ELO - Makes mistakes',
  novice: '~1400 ELO - Decent play',
  intermediate: '~1800 ELO - Strong tactical play',
  advanced: '~2200+ ELO - Near perfect',
};

export function Controls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onUndo,
  onRedo,
  onFlip,
  onToggleSuggestions,
  onAiMove,
  showSuggestions,
  canUndo,
  canRedo,
  isAiThinking = false,
  isAutoplay,
  onToggleAutoplay,
}: ControlsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              AI Difficulty
            </Label>
            <span className="text-xs text-muted-foreground">
              {difficultyLabels[difficulty]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={difficulty === 'beginner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDifficultyChange('beginner')}
              className="w-full"
            >
              Beginner
            </Button>
            <Button
              variant={difficulty === 'novice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDifficultyChange('novice')}
              className="w-full"
            >
              Novice
            </Button>
            <Button
              variant={difficulty === 'intermediate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDifficultyChange('intermediate')}
              className="w-full"
            >
              Intermediate
            </Button>
            <Button
              variant={difficulty === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDifficultyChange('advanced')}
              className="w-full"
            >
              Advanced
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {difficultyDescriptions[difficulty]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="w-full"
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="w-full"
          >
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFlip}
            className="w-full"
          >
            <FlipVertical2 className="w-4 h-4 mr-2" />
            Flip
          </Button>
          <Button
            variant={showSuggestions ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleSuggestions}
            className="w-full"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Hints
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAiMove}
            className="w-full"
            disabled={isAiThinking || isAutoplay}
          >
            {isAiThinking ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Thinking...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                AI Move
              </>
            )}
          </Button>
          <Button
            variant={isAutoplay ? "default" : "secondary"}
            size="sm"
            onClick={onToggleAutoplay}
            className={`w-full ${isAutoplay ? "animate-pulse" : ""}`}
          >
            <Zap className={`w-4 h-4 mr-2 ${isAutoplay ? "fill-current" : ""}`} />
            {isAutoplay ? "Autoplay ON" : "Autoplay OFF"}
          </Button>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={onNewGame}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>

        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-semibold mb-2">Keyboard Shortcuts</h4>
          <div className="text-xs space-y-1 text-muted-foreground font-mono">
            <div><kbd className="bg-muted px-1 rounded">.</kbd> Toggle hints</div>
            <div><kbd className="bg-muted px-1 rounded">u</kbd> Undo move</div>
            <div><kbd className="bg-muted px-1 rounded">r</kbd> Redo move</div>
            <div><kbd className="bg-muted px-1 rounded">f</kbd> Flip board</div>
            <div><kbd className="bg-muted px-1 rounded">Space</kbd> AI move</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

