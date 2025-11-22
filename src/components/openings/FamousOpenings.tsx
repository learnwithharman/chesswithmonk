import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { ArrowLeft, BookOpen, Crosshair, Timer, Zap, Trophy, Lightbulb, RotateCcw, CheckCircle, XCircle, Play, PartyPopper } from 'lucide-react';
import { FAMOUS_OPENINGS_DATA, FamousOpeningData, FamousOpeningLine } from '@/data/famous_openings';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Move } from '@/lib/types';

type Mode = 'learn' | 'practice' | 'drill' | 'time';

interface GameState {
    mode: Mode;
    currentLineIndex: number;
    currentMoveIndex: number;
    chess: Chess;
    feedback: { type: 'success' | 'error' | 'info'; message: string } | null;
    hint: string | null;
    isLineCompleted: boolean;
    streak: number;
    timer: number;
    isTimerRunning: boolean;
    showSolution: boolean;
    showCelebration: boolean;
}

const FamousOpenings = () => {
    const [selectedOpening, setSelectedOpening] = useState<FamousOpeningData | null>(null);
    const [filter, setFilter] = useState<'all' | 'white' | 'black'>('all');
    const [learnedLines, setLearnedLines] = useState<Record<string, number>>({});
    const [suggestedMove, setSuggestedMove] = useState<Move | null>(null);
    const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, React.CSSProperties>>({});
    const { toast } = useToast();

    // Game State
    const [gameState, setGameState] = useState<GameState>({
        mode: 'learn',
        currentLineIndex: 0,
        currentMoveIndex: 0,
        chess: new Chess(),
        feedback: null,
        hint: null,
        isLineCompleted: false,
        streak: 0,
        timer: 10,
        isTimerRunning: false,
        showSolution: false,
        showCelebration: false
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load progress on mount
    useEffect(() => {
        const saved = localStorage.getItem('famous_openings_progress');
        if (saved) {
            setLearnedLines(JSON.parse(saved));
        }
    }, []);

    // Save progress
    const saveProgress = (openingId: string) => {
        const current = learnedLines[openingId] || 0;
        const total = FAMOUS_OPENINGS_DATA.find(o => o.id === openingId)?.totalLines || 0;

        // Only increment if we haven't completed all lines (simple logic for now)
        // Ideally we track specific lines completed, but for now we just increment
        const newCount = Math.min(current + 1, total);

        const newProgress = { ...learnedLines, [openingId]: newCount };
        setLearnedLines(newProgress);
        localStorage.setItem('famous_openings_progress', JSON.stringify(newProgress));
    };

    // Timer Logic
    useEffect(() => {
        if (gameState.mode === 'time' && gameState.isTimerRunning && !gameState.isLineCompleted && !gameState.showCelebration) {
            timerRef.current = setInterval(() => {
                setGameState(prev => {
                    if (prev.timer <= 1) {
                        // Time up!
                        clearInterval(timerRef.current!);
                        return {
                            ...prev,
                            timer: 0,
                            isTimerRunning: false,
                            feedback: { type: 'error', message: "Time's up!" },
                            showSolution: true
                        };
                    }
                    return { ...prev, timer: prev.timer - 1 };
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState.mode, gameState.isTimerRunning, gameState.isLineCompleted, gameState.showCelebration]);

    // Auto-move logic
    useEffect(() => {
        if (gameState.mode === 'learn' && !gameState.isLineCompleted && selectedOpening) {
            const isOpponentTurn = selectedOpening.color === 'white'
                ? gameState.currentMoveIndex % 2 !== 0
                : gameState.currentMoveIndex % 2 === 0;

            if (isOpponentTurn) {
                const timer = setTimeout(() => {
                    nextMove();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [gameState.currentMoveIndex, gameState.mode, gameState.isLineCompleted, selectedOpening]);

    const startCourse = (opening: FamousOpeningData, mode: Mode = 'learn') => {
        setSelectedOpening(opening);
        const chess = new Chess();
        setGameState({
            mode,
            currentLineIndex: 0,
            currentMoveIndex: 0,
            chess,
            feedback: null,
            hint: null,
            isLineCompleted: false,
            streak: 0,
            timer: 10,
            isTimerRunning: mode === 'time',
            showSolution: false,
            showCelebration: false
        });
        setCustomSquareStyles({});
    };

    const currentLine = selectedOpening?.lines[gameState.currentLineIndex];

    // Calculate suggested move for Learn mode
    useEffect(() => {
        if (gameState.mode === 'learn' && currentLine && gameState.currentMoveIndex < currentLine.moves.length && !gameState.isLineCompleted) {
            const nextMoveSan = currentLine.moves[gameState.currentMoveIndex];
            const tempChess = new Chess(gameState.chess.fen());
            try {
                const move = tempChess.move(nextMoveSan);
                if (move) {
                    setSuggestedMove({ from: move.from, to: move.to });
                } else {
                    setSuggestedMove(null);
                }
            } catch (e) {
                setSuggestedMove(null);
            }
        } else {
            setSuggestedMove(null);
        }
    }, [gameState.mode, gameState.currentMoveIndex, currentLine, gameState.chess, gameState.isLineCompleted]);

    const validateUserMove = (move: { from: string; to: string; promotion?: string }) => {
        if (!currentLine) return false;

        const expectedMoveSan = currentLine.moves[gameState.currentMoveIndex];

        // Create a temp chess instance to validate move and get SAN
        const tempChess = new Chess(gameState.chess.fen());
        try {
            const result = tempChess.move(move);
            if (!result) return false;
            return result.san === expectedMoveSan;
        } catch (e) {
            return false;
        }
    };

    const handleMove = (move: { from: string; to: string; promotion?: string }) => {
        if (gameState.isLineCompleted || gameState.showSolution || gameState.showCelebration) return;

        const isCorrect = validateUserMove(move);

        if (isCorrect) {
            const newChess = new Chess(gameState.chess.fen());
            newChess.move(move);

            const nextIndex = gameState.currentMoveIndex + 1;
            const isFinished = nextIndex >= (currentLine?.moves.length || 0);

            // Green highlight for correct move
            setCustomSquareStyles({
                [move.from]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },
                [move.to]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' }
            });

            // Clear highlight after a short delay or keep it until next move?
            // Puzzles clear it when opponent moves. Here we might want to keep it briefly.
            setTimeout(() => {
                setCustomSquareStyles({});
            }, 500);

            setGameState(prev => ({
                ...prev,
                chess: newChess,
                currentMoveIndex: nextIndex,
                feedback: { type: 'success', message: 'Correct!' },
                isLineCompleted: isFinished,
                streak: prev.mode === 'drill' ? prev.streak + 1 : prev.streak,
                timer: 10, // Reset timer for next move
                hint: null,
                showCelebration: isFinished
            }));

            if (isFinished) {
                if (selectedOpening) saveProgress(selectedOpening.id);
            }

        } else {
            // Incorrect
            if (!currentLine) return;

            const correctMove = currentLine.moves[gameState.currentMoveIndex];
            const explanation = currentLine.explanations[gameState.currentMoveIndex];

            // Red highlight for incorrect move
            setCustomSquareStyles({
                [move.from]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
                [move.to]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' }
            });

            // Snap back logic
            setTimeout(() => {
                setCustomSquareStyles({});
            }, 500);

            if (gameState.mode === 'drill') {
                setGameState(prev => ({
                    ...prev,
                    feedback: { type: 'error', message: `Wrong! The correct move is ${correctMove}` },
                    hint: explanation,
                    streak: 0
                }));
            } else {
                setGameState(prev => ({
                    ...prev,
                    feedback: { type: 'error', message: `Wrong move! The correct move is ${correctMove}` },
                    hint: explanation
                }));
            }
        }
    };

    const nextMove = useCallback(() => {
        if (!selectedOpening) return; // Guard
        const currentLine = selectedOpening.lines[gameState.currentLineIndex]; // Get fresh line
        if (!currentLine) return;

        // Use functional update to ensure we have the latest state if needed, 
        // but here we rely on the effect dependency to trigger this with fresh scope.
        // However, to be absolutely safe inside the callback:

        setGameState(prev => {
            if (prev.currentMoveIndex >= currentLine.moves.length) return prev;

            const moveSan = currentLine.moves[prev.currentMoveIndex];
            const newChess = new Chess(prev.chess.fen());
            try {
                newChess.move(moveSan);
            } catch (e) {
                console.error("Auto move failed", e);
                return prev;
            }

            const isFinished = prev.currentMoveIndex + 1 >= currentLine.moves.length;

            if (isFinished) {
                saveProgress(selectedOpening.id);
            }

            return {
                ...prev,
                chess: newChess,
                currentMoveIndex: prev.currentMoveIndex + 1,
                isLineCompleted: isFinished,
                hint: null,
                feedback: null,
                showCelebration: isFinished
            };
        });
    }, [selectedOpening, gameState.currentLineIndex]); // Dependencies for the callback

    const prevMove = () => {
        if (gameState.currentMoveIndex <= 0) return;

        const newChess = new Chess(gameState.chess.fen());
        newChess.undo();

        setGameState(prev => ({
            ...prev,
            chess: newChess,
            currentMoveIndex: prev.currentMoveIndex - 1,
            isLineCompleted: false,
            feedback: null,
            showCelebration: false
        }));
        setCustomSquareStyles({});
    };

    const showHint = () => {
        if (!currentLine) return;
        const explanation = currentLine.explanations[gameState.currentMoveIndex];
        setGameState(prev => ({ ...prev, hint: explanation }));
    };

    const showSolution = () => {
        if (!currentLine) return;
        const move = currentLine.moves[gameState.currentMoveIndex];
        setGameState(prev => ({
            ...prev,
            showSolution: true,
            feedback: { type: 'info', message: `The move is ${move}` }
        }));

        // Auto play after 1s
        setTimeout(() => {
            nextMove();
            setGameState(prev => ({ ...prev, showSolution: false }));
        }, 1500);
    };

    const nextLine = () => {
        if (!selectedOpening) return;
        const nextIndex = (gameState.currentLineIndex + 1) % selectedOpening.lines.length;

        setGameState({
            mode: gameState.mode,
            currentLineIndex: nextIndex,
            currentMoveIndex: 0,
            chess: new Chess(),
            feedback: null,
            hint: null,
            isLineCompleted: false,
            streak: gameState.streak,
            timer: 10,
            isTimerRunning: gameState.mode === 'time',
            showSolution: false,
            showCelebration: false
        });
        setCustomSquareStyles({});
    };

    const resetLine = () => {
        setGameState(prev => ({
            ...prev,
            currentMoveIndex: 0,
            chess: new Chess(),
            feedback: null,
            hint: null,
            isLineCompleted: false,
            timer: 10,
            showSolution: false,
            showCelebration: false
        }));
        setCustomSquareStyles({});
    };

    const filteredOpenings = FAMOUS_OPENINGS_DATA.filter(op =>
        filter === 'all' || op.color === filter
    );

    if (selectedOpening) {
        const progress = learnedLines[selectedOpening.id] || 0;
        const percent = Math.round((progress / selectedOpening.totalLines) * 100);

        return (
            <div className="h-full w-full flex items-center justify-center p-4 lg:p-8 bg-background overflow-hidden">
                {/* Celebration Dialog */}
                <Dialog open={gameState.showCelebration} onOpenChange={(open) => !open && setGameState(p => ({ ...p, showCelebration: false }))}>
                    <DialogContent className="sm:max-w-md text-center">
                        <DialogHeader>
                            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                                <PartyPopper className="w-8 h-8 text-primary" />
                            </div>
                            <DialogTitle className="text-2xl text-center">Line Completed!</DialogTitle>
                            <DialogDescription className="text-center">
                                Congratulations! You have learned this line.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            <Button onClick={nextLine} className="w-full text-lg h-12">
                                Learn Next Line <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => {
                                    setGameState(p => ({ ...p, showCelebration: false, mode: 'drill' }));
                                    resetLine();
                                }}>
                                    <Zap className="w-4 h-4 mr-2" /> Drill
                                </Button>
                                <Button variant="outline" onClick={resetLine}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedOpening(null)}>
                                Back to Course
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1800px] h-full items-center">

                    {/* LEFT: Board Area - Maximized and Centered */}
                    <div className="flex-1 flex items-center justify-center h-full min-h-0 w-full">
                        {/* Container for the board that constrains it to be square and fit within viewport */}
                        <div className="max-w-full max-h-full aspect-square relative flex items-center justify-center">
                            <ChessBoard
                                chess={gameState.chess}
                                onMove={handleMove}
                                flipped={selectedOpening.color === 'black'}
                                lastMove={null}
                                suggestions={[]}
                                showSuggestions={false}
                                isDraggable={true}
                                hintMove={gameState.mode === 'learn' ? suggestedMove : null}
                                customSquareStyles={customSquareStyles}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Control Panel - Fixed Width Sidebar */}
                    <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-3 h-full max-h-[90vh] overflow-hidden">

                        {/* Header: Title & Back */}
                        <div className="flex items-center gap-3 shrink-0 pb-1.5 border-b border-border/40">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOpening(null)} className="h-8 w-8">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div>
                                <h2 className="text-lg font-bold leading-tight">{selectedOpening.name}</h2>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{gameState.mode}</Badge>
                                    <span>Line {gameState.currentLineIndex + 1} / {selectedOpening.lines.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Explanation / Feedback Bubble */}
                        <Card className="bg-muted/30 border-none shadow-sm shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                            <CardContent className="p-3 text-sm leading-relaxed relative">
                                {gameState.isLineCompleted ? (
                                    <div className="flex items-center gap-3 text-green-500 font-medium">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Line Completed!</span>
                                    </div>
                                ) : (
                                    <>
                                        {gameState.mode === 'learn' ? (
                                            <div className="space-y-3">
                                                {/* Suggested Move */}
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-md shrink-0">
                                                        <span className="font-mono font-bold text-primary text-base">
                                                            {currentLine?.moves[gameState.currentMoveIndex]}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-xs text-muted-foreground mb-1">
                                                            SUGGESTED MOVE
                                                        </div>
                                                        <div className="text-sm">
                                                            Play {currentLine?.moves[gameState.currentMoveIndex]}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Explanation */}
                                                <div className="border-t border-border/40 pt-3">
                                                    <div className="font-semibold text-xs text-muted-foreground mb-1">
                                                        WHY THIS MOVE?
                                                    </div>
                                                    <div className="text-sm leading-relaxed">
                                                        {currentLine?.explanations[gameState.currentMoveIndex] ||
                                                            "Make this move to continue the line."}
                                                    </div>
                                                </div>

                                                {/* Previous move context */}
                                                {gameState.currentMoveIndex > 0 && (
                                                    <div className="border-t border-border/40 pt-3">
                                                        <div className="font-semibold text-xs text-muted-foreground mb-1">
                                                            RESPONDING TO
                                                        </div>
                                                        <div className="text-sm">
                                                            Opponent played <span className="font-mono font-semibold">
                                                                {currentLine?.moves[gameState.currentMoveIndex - 1]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center py-2 gap-2">
                                                {gameState.feedback ? (
                                                    <div className={`text-lg font-bold ${gameState.feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {gameState.feedback.message}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Find the best move...</span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mode Selectors Grid */}
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            <Button
                                variant={gameState.mode === 'learn' ? 'default' : 'outline'}
                                className="justify-start h-12"
                                onClick={() => setGameState(p => ({ ...p, mode: 'learn', isTimerRunning: false }))}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-bold text-sm">Learn</span>
                                    <span className="opacity-70 font-normal">Study the lines</span>
                                </div>
                            </Button>
                            <Button
                                variant={gameState.mode === 'practice' ? 'default' : 'outline'}
                                className="justify-start h-12"
                                onClick={() => setGameState(p => ({ ...p, mode: 'practice', isTimerRunning: false }))}
                            >
                                <Crosshair className="w-4 h-4 mr-2" />
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-bold text-sm">Practice</span>
                                    <span className="opacity-70 font-normal">Test yourself</span>
                                </div>
                            </Button>
                            <Button
                                variant={gameState.mode === 'drill' ? 'default' : 'outline'}
                                className="justify-start h-12"
                                onClick={() => setGameState(p => ({ ...p, mode: 'drill', isTimerRunning: false }))}
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-bold text-sm">Drill</span>
                                    <span className="opacity-70 font-normal">Build muscle memory</span>
                                </div>
                            </Button>
                            <Button
                                variant={gameState.mode === 'time' ? 'default' : 'outline'}
                                className="justify-start h-12"
                                onClick={() => setGameState(p => ({ ...p, mode: 'time', isTimerRunning: true }))}
                            >
                                <Timer className="w-4 h-4 mr-2" />
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-bold text-sm">Time</span>
                                    <span className="opacity-70 font-normal">Race the clock</span>
                                </div>
                            </Button>
                        </div>

                        {/* Stats / Progress */}
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            <Card className="bg-card border shadow-sm">
                                <CardContent className="p-3 flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">Progress</span>
                                    <div className="flex items-end justify-between">
                                        <span className="font-bold text-lg">{percent}%</span>
                                        <span className="text-xs text-muted-foreground mb-1">{progress}/{selectedOpening.totalLines}</span>
                                    </div>
                                    <Progress value={percent} className="h-1" />
                                </CardContent>
                            </Card>

                            {gameState.mode === 'drill' ? (
                                <Card className="bg-card border shadow-sm">
                                    <CardContent className="p-3 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Streak</span>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                                            <span className="font-bold text-lg">{gameState.streak}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : gameState.mode === 'time' ? (
                                <Card className="bg-card border shadow-sm">
                                    <CardContent className="p-3 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Time</span>
                                        <div className="flex items-center gap-2">
                                            <Timer className={`w-5 h-5 ${gameState.timer < 3 ? 'text-red-500' : 'text-primary'}`} />
                                            <span className={`font-bold text-lg font-mono ${gameState.timer < 3 ? 'text-red-500' : ''}`}>{gameState.timer}s</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-card border shadow-sm">
                                    <CardContent className="p-3 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Accuracy</span>
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            <span className="font-bold text-lg">-</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>



                        {/* Bottom Controls */}
                        <div className="flex flex-col gap-2 shrink-0">
                            {/* Hint / Solution */}
                            {!gameState.isLineCompleted && gameState.mode !== 'drill' && gameState.mode !== 'learn' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" onClick={showHint} disabled={!!gameState.hint} className="h-10">
                                        <Lightbulb className="w-4 h-4 mr-2" /> Hint
                                    </Button>
                                    <Button variant="secondary" onClick={showSolution} className="h-10">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Solution
                                    </Button>
                                </div>
                            )}

                            {/* Hint Display */}
                            {gameState.hint && (
                                <Alert className="py-2">
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertDescription className="text-xs">{gameState.hint}</AlertDescription>
                                </Alert>
                            )}

                            {/* Navigation / Next Move */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prevMove} disabled={gameState.currentMoveIndex === 0} className="shrink-0">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>

                                {gameState.isLineCompleted ? (
                                    <Button onClick={nextLine} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                        Next Line <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : gameState.mode === 'learn' ? (
                                    <Button onClick={nextMove} className="flex-1">
                                        Next Move <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <Button variant="outline" size="icon" onClick={resetLine} className="shrink-0" title="Restart Line">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div >
            </div >
        );
    }

    // Menu View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Famous Openings</h2>
                    <p className="text-muted-foreground">Curated courses to master the most popular lines.</p>
                </div>
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    <Button
                        variant={filter === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'white' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('white')}
                    >
                        White
                    </Button>
                    <Button
                        variant={filter === 'black' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('black')}
                    >
                        Black
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOpenings.map(opening => {
                    const progress = learnedLines[opening.id] || 0;
                    const percent = Math.round((progress / opening.totalLines) * 100);

                    return (
                        <Card key={opening.id} className="group hover:border-primary/50 transition-colors cursor-pointer flex flex-col" onClick={() => startCourse(opening)}>
                            <div className="relative aspect-video bg-muted/50 overflow-hidden border-b">
                                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                                    <div className="w-full h-full pointer-events-none">
                                        <ChessBoard
                                            chess={new Chess(opening.fen)}
                                            onMove={() => { }}
                                            flipped={opening.color === 'black'}
                                            lastMove={null}
                                            suggestions={[]}
                                            showSuggestions={false}
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge variant={opening.color === 'white' ? 'default' : 'secondary'} className="capitalize">
                                        {opening.color}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{opening.name}</CardTitle>
                                <CardDescription className="line-clamp-2 h-10">
                                    {opening.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{opening.totalLines} lines total</span>
                                        <span>{progress > 0 ? `${percent}%` : 'Not started'}</span>
                                    </div>
                                    <Progress value={percent} className="h-1.5" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="secondary">
                                    {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}

export default FamousOpenings;
