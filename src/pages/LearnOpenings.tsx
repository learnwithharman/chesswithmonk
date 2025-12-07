import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, RotateCcw, CheckCircle2, XCircle, Flame, Trophy, Lightbulb, HelpCircle, PlayCircle, Timer, GraduationCap, Dumbbell, Zap } from 'lucide-react';
import { Move } from '@/lib/types';

interface Variation {
    name: string;
    eco: string;
    fen: string;
    moves: string; // PGN string
}

type Mode = 'learn' | 'practice' | 'drill' | 'time';

const LearnOpenings = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ecoCode = searchParams.get('eco');
    const variationName = searchParams.get('name');

    const [game, setGame] = useState(new Chess());
    const [variation, setVariation] = useState<Variation | null>(null);
    const [moveList, setMoveList] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [mode, setMode] = useState<Mode>('learn');

    // State for Practice/Drill/Time
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [hintMove, setHintMove] = useState<Move | null>(null);
    const [wrongMove, setWrongMove] = useState<Move | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const { toast } = useToast();

    // Load variation data
    useEffect(() => {
        if (!ecoCode || !variationName) return;

        fetch('/data/eco_index.json')
            .then(res => res.json())
            .then(index => {
                const variations = index[ecoCode];
                const found = variations?.find((v: any) => v.name === variationName);
                if (found) {
                    setVariation(found);
                    // Parse moves
                    const tempGame = new Chess();
                    try {
                        tempGame.loadPgn(found.moves);
                        const history = tempGame.history();
                        setMoveList(history);

                        // Reset game state
                        setGame(new Chess());
                        setCurrentMoveIndex(0);
                        setFeedback(null);
                        setHintMove(null);
                        setWrongMove(null);
                        setTimerActive(false);
                        setElapsedTime(0);
                        setStartTime(null);

                        // Auto-play first move if user is Black (i.e., first move is White's)
                        // We assume if the PGN starts with White's move, user is playing White?
                        // Wait, usually "Learn" mode implies you play the side of the opening.
                        // If it's a "Defense", you are Black. If "Gambit" or "Attack", usually White.
                        // BUT, standard trainer logic:
                        // If 1. e4 ... -> User is White.
                        // If 1. d4 Nf6 ... -> If learning Nf6, User is Black.
                        // The simplest heuristic requested: "If line starts with a White move, user is White. If line starts with a Black move, user is Black."
                        // However, PGNs almost always start with White move unless it's a fragment.
                        // Let's look at the moves list.
                        // If the stored moves are "1. e4 c5", user plays e4.
                        // If the stored moves are "1... c5", user plays c5.
                        // But `tempGame.history()` returns SAN array.
                        // We need to check whose turn it is at the start of the line.
                        // Standard PGNs start from initial position.
                        // So user is ALWAYS White by that logic unless we have a way to know "Perspective".
                        // The user request says: "Detect learner side automatically: if line starts with a White move, user is White. If line starts with a Black move, user is Black."
                        // This implies the PGN fragment might start with Black?
                        // Most ECO lines in the JSON are likely full lines from start.
                        // Let's assume for "All Openings", the user plays the side that makes the *first move in the sequence*.
                        // Wait, if I want to learn Sicilian (as Black), the line is 1. e4 c5.
                        // I should see e4 played automatically, then I play c5.
                        // How to distinguish?
                        // The JSON data doesn't explicitly say "Color".
                        // Heuristic: If the opening name contains "Defense", "Counter", "Benoni", user is likely Black.
                        // Otherwise White.

                        const isBlackOpening = found.name.includes('Defense') || found.name.includes('Counter') || found.name.includes('Benoni');

                        if (isBlackOpening && history.length > 0) {
                            // Auto-play first move (White's move)
                            setTimeout(() => {
                                const firstMove = history[0];
                                const g = new Chess();
                                g.move(firstMove);
                                setGame(g);
                                setCurrentMoveIndex(1);
                            }, 500);
                        }

                    } catch (e) {
                        console.error("PGN Parse Error", e);
                    }
                }
            });
    }, [ecoCode, variationName]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - (startTime || Date.now()));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [timerActive, startTime]);

    const resetGame = () => {
        setGame(new Chess());
        setCurrentMoveIndex(0);
        setFeedback(null);
        setHintMove(null);
        setWrongMove(null);
        setTimerActive(false);
        setElapsedTime(0);
        setStartTime(null);

        // Re-trigger auto-play for Black openings if needed
        if (variation) {
            const isBlackOpening = variation.name.includes('Defense') || variation.name.includes('Counter') || variation.name.includes('Benoni');
            if (isBlackOpening && moveList.length > 0) {
                setTimeout(() => {
                    const firstMove = moveList[0];
                    const g = new Chess();
                    g.move(firstMove);
                    setGame(g);
                    setCurrentMoveIndex(1);
                }, 500);
            }
        }
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        resetGame();
    };

    const handleMove = (move: Move) => {
        if (!variation || currentMoveIndex >= moveList.length) return;

        const tempGame = new Chess(game.fen());
        try {
            const result = tempGame.move(move);
            if (!result) return;

            const playedSan = result.san;
            const expectedSan = moveList[currentMoveIndex];

            if (playedSan === expectedSan) {
                // Correct move
                setGame(tempGame);
                setFeedback('correct');
                setHintMove(null);
                setWrongMove(null);

                const nextIndex = currentMoveIndex + 1;
                setCurrentMoveIndex(nextIndex);

                // If Time mode, start timer on first move (or second if Black)
                if (mode === 'time' && !timerActive) {
                    // Start if it's the first USER move.
                    // If White: index 0 -> 1.
                    // If Black: index 1 -> 2.
                    setStartTime(Date.now());
                    setTimerActive(true);
                }

                // Auto-play opponent move
                if (nextIndex < moveList.length) {
                    setTimeout(() => {
                        const computerSan = moveList[nextIndex];
                        const g = new Chess(tempGame.fen());
                        g.move(computerSan);
                        setGame(g);
                        setCurrentMoveIndex(nextIndex + 1);
                        setFeedback(null);
                    }, 500);
                } else {
                    // Finished!
                    setTimerActive(false);
                    toast({
                        title: "Variation Completed!",
                        description: mode === 'time' ? `Time: ${(elapsedTime / 1000).toFixed(1)}s` : "Great job!",
                        className: "bg-green-500 text-white"
                    });
                }
            } else {
                // Wrong move
                setFeedback('wrong');
                setWrongMove(move);

                if (mode === 'learn') {
                    setTimeout(showHint, 500);
                } else {
                    setTimeout(() => {
                        setWrongMove(null);
                    }, 500);
                }
            }
        } catch (e) {
            return;
        }
    };

    const showHint = () => {
        if (currentMoveIndex >= moveList.length) return;
        const expectedSan = moveList[currentMoveIndex];
        const temp = new Chess(game.fen());
        const m = temp.move(expectedSan);
        if (m) setHintMove({ from: m.from, to: m.to });
    };

    const stepForward = () => {
        if (currentMoveIndex >= moveList.length) return;
        const expectedSan = moveList[currentMoveIndex];
        const temp = new Chess(game.fen());
        temp.move(expectedSan);
        setGame(temp);
        setCurrentMoveIndex(currentMoveIndex + 1);
    };

    const stepBackward = () => {
        if (currentMoveIndex <= 0) return;
        const temp = new Chess();
        for (let i = 0; i < currentMoveIndex - 1; i++) {
            temp.move(moveList[i]);
        }
        setGame(temp);
        setCurrentMoveIndex(currentMoveIndex - 1);
    };

    if (!ecoCode) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">No Opening Selected</h2>
                <Button onClick={() => navigate('/openings')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Go to Explorer
                </Button>
            </div>
        );
    }

    if (!variation) return <div className="p-8 text-center">Loading variation...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] gap-6 max-w-[1800px] mx-auto">
                {/* Left Column - Controls/Modes (Matches Play's Left Sidebar area) */}
                <div className="hidden lg:flex lg:flex-col gap-4">
                    <Button variant="outline" className="justify-start" onClick={() => navigate('/openings')}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Explorer
                    </Button>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Learning Mode</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button
                                variant={mode === 'learn' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => handleModeChange('learn')}
                            >
                                <GraduationCap className="w-4 h-4 mr-2" /> Learn
                            </Button>
                            <Button
                                variant={mode === 'practice' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => handleModeChange('practice')}
                            >
                                <Dumbbell className="w-4 h-4 mr-2" /> Practice
                            </Button>
                            <Button
                                variant={mode === 'drill' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => handleModeChange('drill')}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Drill
                            </Button>
                            <Button
                                variant={mode === 'time' ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => handleModeChange('time')}
                            >
                                <Timer className="w-4 h-4 mr-2" /> Time Attack
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="outline" onClick={resetGame} className="justify-start">
                                <RotateCcw className="w-4 h-4 mr-2" /> Restart
                            </Button>
                            {mode === 'learn' && (
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={stepBackward} disabled={currentMoveIndex === 0} className="flex-1">
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </Button>
                                    <Button variant="outline" onClick={stepForward} disabled={currentMoveIndex >= moveList.length} className="flex-1">
                                        Next <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </Button>
                                </div>
                            )}
                            {(mode === 'practice' || mode === 'drill') && (
                                <Button variant="outline" onClick={showHint} className="justify-start">
                                    <HelpCircle className="w-4 h-4 mr-2" /> Hint
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Center Column - Board */}
                <div className="space-y-4">
                    <div className="w-full flex items-center justify-center">
                        <div className="max-w-full max-h-[80vh] aspect-square relative">
                            <ChessBoard
                                chess={game}
                                onMove={handleMove}
                                flipped={false} // TODO: Support playing as Black
                                lastMove={null}
                                suggestions={[]}
                                showSuggestions={false}
                                hintMove={hintMove}
                                wrongMove={wrongMove}
                            />

                            {/* Feedback Overlay */}
                            {feedback === 'wrong' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in zoom-in duration-200">
                                    <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                                        <XCircle className="w-6 h-6" />
                                        Wrong Move
                                    </div>
                                </div>
                            )}
                            {feedback === 'correct' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in zoom-in duration-200 pointer-events-none">
                                    <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Correct!
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="lg:hidden flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-card p-3 rounded-lg border">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/openings')}>
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <div className="text-center">
                                <h2 className="font-bold">{variation.name}</h2>
                                <p className="text-xs text-muted-foreground">{variation.eco}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={resetGame}>
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                        </div>
                        {mode === 'learn' && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={stepBackward} disabled={currentMoveIndex === 0} className="flex-1">
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </Button>
                                <Button variant="outline" onClick={stepForward} disabled={currentMoveIndex >= moveList.length} className="flex-1">
                                    Next <ChevronLeft className="w-4 h-4 rotate-180" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Title & Progress */}
                <div className="hidden lg:flex lg:flex-col gap-4">
                    {/* Title Panel */}
                    <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border text-center">
                        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            {variation.name}
                        </h2>
                        <p className="text-primary font-mono text-sm mt-1">{variation.eco}</p>
                    </div>

                    {/* Progress Panel */}
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Progress</span>
                                {mode === 'time' && (
                                    <span className="font-mono text-xl text-primary">
                                        {(elapsedTime / 1000).toFixed(1)}s
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Moves Completed</span>
                                        <span className="font-bold">{currentMoveIndex} / {moveList.length}</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${(currentMoveIndex / Math.max(moveList.length, 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                                        Current Goal
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {currentMoveIndex >= moveList.length
                                            ? "Variation completed! Select another mode or opening."
                                            : mode === 'learn'
                                                ? "Study the moves and try to memorize the pattern."
                                                : "Play the correct move from memory."
                                        }
                                    </p>
                                </div>

                                {/* Move List */}
                                <div className="flex flex-wrap gap-2 text-sm font-mono">
                                    {moveList.map((move, i) => (
                                        <span
                                            key={i}
                                            className={`px-1.5 py-0.5 rounded ${i === currentMoveIndex - 1
                                                ? "bg-primary text-primary-foreground font-bold"
                                                : i < currentMoveIndex
                                                    ? "text-muted-foreground"
                                                    : "opacity-30"
                                                }`}
                                        >
                                            {i % 2 === 0 && <span className="text-muted-foreground mr-1">{Math.floor(i / 2) + 1}.</span>}
                                            {move}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LearnOpenings;
