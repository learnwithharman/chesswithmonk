import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RotateCcw, Undo, Redo, FlipVertical2, Lightbulb, Play, Zap, User, Settings2 } from 'lucide-react';
import Spinner from './ui/spinner';
import { Difficulty } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  playerColor: 'w' | 'b';
  onPlayerColorChange: (color: 'w' | 'b') => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  novice: 'Novice',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const difficultyDescriptions: Record<Difficulty, string> = {
  beginner: '~1000 ELO',
  novice: '~1400 ELO',
  intermediate: '~1800 ELO',
  advanced: '~2200+ ELO',
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
  playerColor,
  onPlayerColorChange,
}: ControlsProps) {
  return (
    <Card className="border border-border/80 bg-card/90 backdrop-blur-md shadow-xl rounded-xl">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Game Controls
          </span>
          <span className="text-xs font-normal text-muted-foreground font-mono">
            {difficultyLabels[difficulty]} ({difficultyDescriptions[difficulty]})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Play As Selector */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Play As
          </Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg border border-border/50">
            <Button
              variant={playerColor === 'w' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPlayerColorChange('w')}
              className={cn("w-full h-8 text-xs font-medium gap-1.5", playerColor === 'w' && "shadow-sm")}
            >
              <span className="w-3 h-3 rounded-full bg-white border border-black/30 inline-block" />
              White
            </Button>
            <Button
              variant={playerColor === 'b' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPlayerColorChange('b')}
              className={cn("w-full h-8 text-xs font-medium gap-1.5", playerColor === 'b' && "shadow-sm")}
            >
              <span className="w-3 h-3 rounded-full bg-neutral-900 border border-white/30 inline-block" />
              Black
            </Button>
          </div>
        </div>

        {/* AI Difficulty Selector */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Engine Level
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['beginner', 'novice', 'intermediate', 'advanced'] as Difficulty[]).map((level) => (
              <Button
                key={level}
                variant={difficulty === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDifficultyChange(level)}
                className={cn(
                  "w-full h-8 text-xs font-medium justify-between px-2.5",
                  difficulty === level ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "border-border/60 hover:bg-secondary"
                )}
              >
                <span>{difficultyLabels[level]}</span>
                <span className="text-[10px] opacity-75 font-mono">{difficultyDescriptions[level]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Move Actions
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo Move (U)"
              className="w-full h-9 border-border/60 hover:bg-secondary"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo Move (R)"
              className="w-full h-9 border-border/60 hover:bg-secondary"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onFlip}
              title="Flip Board (F)"
              className="w-full h-9 border-border/60 hover:bg-secondary"
            >
              <FlipVertical2 className="w-4 h-4" />
            </Button>
            <Button
              variant={showSuggestions ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleSuggestions}
              title="Toggle Hints (.)"
              className={cn("w-full h-9", !showSuggestions && "border-border/60 hover:bg-secondary")}
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI & Autoplay Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAiMove}
            className="w-full h-9 font-medium border border-border/50 gap-1.5"
            disabled={isAiThinking || isAutoplay}
          >
            {isAiThinking ? (
              <>
                <Spinner className="w-3.5 h-3.5" />
                Thinking...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-primary" />
                AI Move
              </>
            )}
          </Button>
          <Button
            variant={isAutoplay ? "default" : "secondary"}
            size="sm"
            onClick={onToggleAutoplay}
            className={cn("w-full h-9 font-medium border border-border/50 gap-1.5", isAutoplay && "bg-primary text-primary-foreground")}
          >
            <Zap className={cn("w-3.5 h-3.5", isAutoplay && "fill-current")} />
            {isAutoplay ? "Autoplay ON" : "Autoplay OFF"}
          </Button>
        </div>

        {/* New Game Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNewGame}
          className="w-full h-9 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all gap-1.5 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset / New Game
        </Button>

        {/* Keyboard Shortcuts */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span><kbd className="bg-muted/80 px-1 py-0.5 rounded border border-border/60">.</kbd> Hints</span>
            <span><kbd className="bg-muted/80 px-1 py-0.5 rounded border border-border/60">U</kbd> Undo</span>
            <span><kbd className="bg-muted/80 px-1 py-0.5 rounded border border-border/60">R</kbd> Redo</span>
            <span><kbd className="bg-muted/80 px-1 py-0.5 rounded border border-border/60">F</kbd> Flip</span>
            <span><kbd className="bg-muted/80 px-1 py-0.5 rounded border border-border/60">Space</kbd> AI Move</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



