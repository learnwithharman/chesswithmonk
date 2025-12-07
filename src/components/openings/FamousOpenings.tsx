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
    isCourseCompleted: boolean;
}

interface FamousOpeningsProps {
    onCourseStart?: () => void;
    onCourseEnd?: () => void;
}

const FamousOpenings = ({ onCourseStart, onCourseEnd }: FamousOpeningsProps) => {
    const [selectedOpening, setSelectedOpening] = useState<FamousOpeningData | null>(null);
    const [filter, setFilter] = useState<'all' | 'white' | 'black'>('all');
    const [learnedLines, setLearnedLines] = useState<Record<string, number>>({});
    const [suggestedMove, setSuggestedMove] = useState<Move | null>(null);
    const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, React.CSSProperties>>({});
    const [showCompletionMenu, setShowCompletionMenu] = useState(false);
    const [pendingOpening, setPendingOpening] = useState<FamousOpeningData | null>(null);
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
        showCelebration: false,
        isCourseCompleted: false
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load progress on mount
    useEffect(() => {
        const saved = localStorage.getItem('famous_openings_progress');
        if (saved) {
            setLearnedLines(JSON.parse(saved));
        }
    }, []);

    // Notify parent of view change
    useEffect(() => {
        if (selectedOpening) {
            onCourseStart?.();
        } else {
            onCourseEnd?.();
        }
    }, [selectedOpening, onCourseStart, onCourseEnd]);

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
        // Check completion
        const progress = learnedLines[opening.id] || 0;
        const isComplete = progress >= opening.totalLines;

        if (isComplete) {
            setPendingOpening(opening);
            setShowCompletionMenu(true);
            return;
        }

        launchCourse(opening, mode);
    };

    const launchCourse = (opening: FamousOpeningData, mode: Mode) => {
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
            showCelebration: false,
            isCourseCompleted: false
        });
        setCustomSquareStyles({});
    };

    const handleRestartCourse = () => {
        if (!pendingOpening) return;

        // Reset progress
        const newProgress = { ...learnedLines, [pendingOpening.id]: 0 };
        setLearnedLines(newProgress);
        localStorage.setItem('famous_openings_progress', JSON.stringify(newProgress));

        setShowCompletionMenu(false);
        launchCourse(pendingOpening, 'learn');
        setPendingOpening(null);
    };

    const handleContinueReview = () => {
        if (!pendingOpening) return;
        setShowCompletionMenu(false);
        launchCourse(pendingOpening, 'learn');
        setPendingOpening(null);
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

        // Check if course is completed
        if (gameState.currentLineIndex + 1 >= selectedOpening.lines.length) {
            setGameState(prev => ({
                ...prev,
                isCourseCompleted: true,
                showCelebration: true
            }));
            return;
        }

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
            showCelebration: false,
            isCourseCompleted: false
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
            <div className="container mx-auto px-4 py-8">
                {/* Celebration Dialog */}
                <Dialog open={gameState.showCelebration} onOpenChange={(open) => !open && setGameState(p => ({ ...p, showCelebration: false }))}>
                    <DialogContent className="sm:max-w-md text-center">
                        <DialogHeader>
                            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                                {gameState.isCourseCompleted ? (
                                    <Trophy className="w-8 h-8 text-primary" />
                                ) : (
                                    <PartyPopper className="w-8 h-8 text-primary" />
                                )}
                            </div>
                            <DialogTitle className="text-2xl text-center">
                                {gameState.isCourseCompleted ? "Course Completed!" : "Line Completed!"}
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                {gameState.isCourseCompleted
                                    ? "Congratulations! You have mastered all lines in this opening."
                                    : "Congratulations! You have learned this line."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            {!gameState.isCourseCompleted ? (
                                <Button onClick={nextLine} className="w-full text-lg h-12">
                                    Learn Next Line <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                </Button>
                            ) : (
                                <Button onClick={() => {
                                    setGameState(p => ({ ...p, showCelebration: false, mode: 'drill', isCourseCompleted: false }));
                                    resetLine();
                                }} className="w-full text-lg h-12">
                                    Start Drill Mode <Zap className="w-4 h-4 ml-2" />
                                </Button>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => {
                                    setGameState(p => ({ ...p, showCelebration: false, mode: 'drill', isCourseCompleted: false }));
                                    resetLine();
                                }}>
                                    <Zap className="w-4 h-4 mr-2" /> Drill
                                </Button>
                                {gameState.isCourseCompleted ? (
                                    <Button variant="outline" onClick={() => {
                                        // Restart course logic: reset to line 0
                                        setGameState(prev => ({
                                            ...prev,
                                            currentLineIndex: 0,
                                            currentMoveIndex: 0,
                                            chess: new Chess(),
                                            feedback: null,
                                            hint: null,
                                            isLineCompleted: false,
                                            showCelebration: false,
                                            isCourseCompleted: false
                                        }));
                                    }}>
                                        <RotateCcw className="w-4 h-4 mr-2" /> Restart Course
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={resetLine}>
                                        <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
                                    </Button>
                                )}
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedOpening(null)}>
                                Back to Course
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] gap-6 max-w-[1800px] mx-auto">

                    {/* LEFT COLUMN: Navigation & Modes */}
                    <div className="hidden lg:flex lg:flex-col gap-4">
                        <Button variant="outline" className="justify-start" onClick={() => setSelectedOpening(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Courses
                        </Button>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Training Mode</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button
                                    variant={gameState.mode === 'learn' ? 'default' : 'ghost'}
                                    className="justify-start"
                                    onClick={() => setGameState(p => ({ ...p, mode: 'learn', isTimerRunning: false }))}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <div className="flex flex-col items-start ml-1">
                                        <span className="text-sm font-semibold">Learn</span>
                                    </div>
                                </Button>
                                <Button
                                    variant={gameState.mode === 'practice' ? 'default' : 'ghost'}
                                    className="justify-start"
                                    onClick={() => setGameState(p => ({ ...p, mode: 'practice', isTimerRunning: false }))}
                                >
                                    <Crosshair className="w-4 h-4 mr-2" />
                                    <div className="flex flex-col items-start ml-1">
                                        <span className="text-sm font-semibold">Practice</span>
                                    </div>
                                </Button>
                                <Button
                                    variant={gameState.mode === 'drill' ? 'default' : 'ghost'}
                                    className="justify-start"
                                    onClick={() => setGameState(p => ({ ...p, mode: 'drill', isTimerRunning: false }))}
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    <div className="flex flex-col items-start ml-1">
                                        <span className="text-sm font-semibold">Drill</span>
                                    </div>
                                </Button>
                                <Button
                                    variant={gameState.mode === 'time' ? 'default' : 'ghost'}
                                    className="justify-start"
                                    onClick={() => setGameState(p => ({ ...p, mode: 'time', isTimerRunning: true }))}
                                >
                                    <Timer className="w-4 h-4 mr-2" />
                                    <div className="flex flex-col items-start ml-1">
                                        <span className="text-sm font-semibold">Time</span>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button variant="outline" onClick={resetLine} className="justify-start">
                                    <RotateCcw className="w-4 h-4 mr-2" /> Restart Line
                                </Button>
                                {!gameState.isLineCompleted && gameState.mode !== 'drill' && gameState.mode !== 'learn' && (
                                    <>
                                        <Button variant="outline" onClick={showHint} disabled={!!gameState.hint} className="justify-start">
                                            <Lightbulb className="w-4 h-4 mr-2" /> Hint
                                        </Button>
                                        <Button variant="outline" onClick={showSolution} className="justify-start">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Solution
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* CENTER COLUMN: Board */}
                    <div className="space-y-4">
                        <div className="w-full flex items-center justify-center">
                            <div className="max-w-full max-h-[80vh] aspect-square relative flex items-center justify-center">
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

                        {/* Mobile Fallback Controls */}
                        <div className="lg:hidden flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-card p-3 rounded-lg border">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedOpening(null)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="text-center">
                                    <h2 className="font-bold text-sm">{selectedOpening.name}</h2>
                                    <p className="text-xs text-muted-foreground">Line {gameState.currentLineIndex + 1} / {selectedOpening.lines.length}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={resetLine}>
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Mobile Navigation */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prevMove} disabled={gameState.currentMoveIndex === 0}>
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                {gameState.isLineCompleted ? (
                                    <Button onClick={nextLine} className="flex-1 bg-green-600 text-white">
                                        Next Line <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : gameState.mode === 'learn' ? (
                                    <Button onClick={nextMove} className="flex-1">
                                        Next Move <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : <div className="flex-1" />}
                            </div>

                            {/* Mobile Feedback */}
                            <Card className="bg-muted/30 border-none shadow-sm">
                                <CardContent className="p-3 text-sm">
                                    {gameState.feedback ? (
                                        <div className={`font-bold ${gameState.feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                            {gameState.feedback.message}
                                        </div>
                                    ) : gameState.isLineCompleted ? (
                                        <div className="text-green-500 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Line Completed!</div>
                                    ) : (
                                        <div className="text-muted-foreground">
                                            {gameState.mode === 'learn' ? `Play ${currentLine?.moves[gameState.currentMoveIndex]}` : 'Make your move...'}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Progress */}
                    <div className="hidden lg:flex lg:flex-col gap-4">
                        {/* Title Panel */}
                        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border text-center">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{gameState.mode} Mode</Badge>
                                <span className="text-xs text-muted-foreground">Line {gameState.currentLineIndex + 1} of {selectedOpening.lines.length}</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">{selectedOpening.name}</h2>
                        </div>

                        {/* Explanation / Feedback Bubble */}
                        <Card className="bg-muted/30 border-dashed shadow-sm relative overflow-hidden">
                            {/* Keep existing explanation logic but cleaned up for sidebar */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                            <CardContent className="p-4 text-sm leading-relaxed relative">
                                {gameState.isLineCompleted ? (
                                    <div className="flex items-center gap-3 text-green-500 font-medium p-2">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="text-lg">Line Completed!</span>
                                    </div>
                                ) : percent === 100 && gameState.mode === 'learn' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-bold text-lg">
                                            <Trophy className="w-6 h-6" />
                                            Course Completed!
                                        </div>
                                        <p className="text-muted-foreground">
                                            Congratulations! You have mastered all lines in this opening.
                                        </p>
                                        <div className="bg-primary/10 p-3 rounded-md text-primary text-xs font-semibold">
                                            Recommendation: Switch to Practice or Drill mode to test your memory without hints!
                                        </div>

                                        {/* Still show the current move info below if they want to play */}
                                        <div className="border-t border-border/40 pt-3 opacity-75">
                                            <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase">Current Move</div>
                                            <div className="text-sm font-medium">Play {currentLine?.moves[gameState.currentMoveIndex]}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {gameState.mode === 'learn' ? (
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-md shrink-0">
                                                        <span className="font-mono font-bold text-primary text-xl">
                                                            {currentLine?.moves[gameState.currentMoveIndex]}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase">Suggested Move</div>
                                                        <div className="text-sm font-medium">Play {currentLine?.moves[gameState.currentMoveIndex]}</div>
                                                    </div>
                                                </div>
                                                <div className="border-t border-border/40 pt-3">
                                                    <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase">Why this move?</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {currentLine?.explanations[gameState.currentMoveIndex] || "Make this move to continue the line."}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center py-4 gap-2">
                                                {gameState.feedback ? (
                                                    <div className={`text-lg font-bold ${gameState.feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {gameState.feedback.message}
                                                    </div>
                                                ) : (
                                                    <span className="text-lg text-muted-foreground font-medium">Find the best move...</span>
                                                )}
                                                {gameState.hint && (
                                                    <div className="mt-2 p-2 bg-yellow-500/10 text-yellow-600 rounded text-xs flex gap-2 items-center">
                                                        <Lightbulb className="w-3 h-3" /> {gameState.hint}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress & Stats Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-card border shadow-sm">
                                <CardContent className="p-3 flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">Total Completion</span>
                                    <div className="flex items-end justify-between">
                                        <span className="font-bold text-xl">{percent}%</span>
                                        <Progress value={percent} className="h-1.5 w-full mt-1" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dynamic Stat Card */}
                            <Card className="bg-card border shadow-sm">
                                <CardContent className="p-3 flex flex-col gap-1">
                                    {gameState.mode === 'drill' ? (
                                        <>
                                            <span className="text-xs text-muted-foreground">Streak</span>
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-orange-500" />
                                                <span className="font-bold text-xl">{gameState.streak}</span>
                                            </div>
                                        </>
                                    ) : gameState.mode === 'time' ? (
                                        <>
                                            <span className="text-xs text-muted-foreground">Time Remaining</span>
                                            <div className="flex items-center gap-2">
                                                <Timer className={`w-5 h-5 ${gameState.timer < 3 ? 'text-red-500' : 'text-primary'}`} />
                                                <span className={`font-bold text-xl font-mono ${gameState.timer < 3 ? 'text-red-500' : ''}`}>{gameState.timer}s</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs text-muted-foreground">Current Line</span>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                <span className="font-bold text-xl">#{gameState.currentLineIndex + 1}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="mt-auto pt-4 flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevMove} disabled={gameState.currentMoveIndex === 0} className="shrink-0 h-10 w-10">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            {gameState.isLineCompleted ? (
                                <Button onClick={nextLine} className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm">
                                    Next Line <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : gameState.mode === 'learn' ? (
                                <Button onClick={nextMove} className="flex-1 h-10 shadow-sm">
                                    Next Move <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
                                    {gameState.currentMoveIndex} / {currentLine?.moves.length} moves
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
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

            {/* Completion Menu Dialog */}
            <Dialog open={showCompletionMenu} onOpenChange={setShowCompletionMenu}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Course Completed!
                        </DialogTitle>
                        <DialogDescription>
                            You have already mastered 100% of the lines in <strong>{pendingOpening?.name}</strong>.
                            What would you like to do?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        <Button onClick={handleContinueReview} className="w-full h-12 text-lg">
                            <BookOpen className="w-4 h-4 mr-2" /> Continue / Review
                        </Button>
                        <Button variant="outline" onClick={handleRestartCourse} className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" /> Restart Course (Reset Progress)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                                    {progress >= opening.totalLines ? 'Review Completed Course' : progress > 0 ? 'Continue Learning' : 'Start Learning'}
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
