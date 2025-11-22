import { useState, useEffect, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trophy, RefreshCw, Lightbulb, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { PUZZLES, Puzzle } from '@/data/puzzles';

export default function Puzzles() {
    const [game, setGame] = useState(new Chess());
    const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
    const [moveIndex, setMoveIndex] = useState(0);
    const [solved, setSolved] = useState(false);
    const [failed, setFailed] = useState(false);
    const [difficulty, setDifficulty] = useState<string>('easy');
    const [showHint, setShowHint] = useState(false);
    const [customSquareStyles, setCustomSquareStyles] = useState<Record<string, React.CSSProperties>>({});
    const [flipped, setFlipped] = useState(false);
    const { toast } = useToast();

    const loadRandomPuzzle = useCallback(() => {
        const puzzleList = PUZZLES[difficulty] || [];
        const randomPuzzle = puzzleList[Math.floor(Math.random() * puzzleList.length)];

        if (randomPuzzle) {
            const newGame = new Chess(randomPuzzle.fen);
            setGame(newGame);
            setCurrentPuzzle(randomPuzzle);
            setMoveIndex(0);
            setSolved(false);
            setFailed(false);
            setShowHint(false);
            setCustomSquareStyles({});
            // Flip board if it's black to move
            setFlipped(newGame.turn() === 'b');
        }
    }, [difficulty]);

    useEffect(() => {
        loadRandomPuzzle();
    }, [loadRandomPuzzle]);

    const handleMove = (move: Move) => {
        if (solved || failed || !currentPuzzle) return;

        const tempGame = new Chess(game.fen());
        try {
            const result = tempGame.move(move);
            if (!result) return;

            const playedSan = result.san;
            const expectedSan = currentPuzzle.solution[moveIndex];
            const sourceSquare = move.from;
            const targetSquare = move.to;

            if (playedSan === expectedSan) {
                // Correct move
                setGame(tempGame);
                const nextIndex = moveIndex + 1;
                setMoveIndex(nextIndex);

                // Green highlight for correct move
                setCustomSquareStyles({
                    [sourceSquare]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },
                    [targetSquare]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' }
                });

                if (nextIndex >= currentPuzzle.solution.length) {
                    setSolved(true);
                    toast({ title: "Puzzle Solved!", className: "bg-green-500 text-white" });
                } else {
                    // Opponent's response
                    if (nextIndex < currentPuzzle.solution.length) {
                        setTimeout(() => {
                            const opponentMoveSan = currentPuzzle.solution[nextIndex];
                            const gameCopy = new Chess(tempGame.fen());
                            gameCopy.move(opponentMoveSan);
                            setGame(gameCopy);
                            setMoveIndex(nextIndex + 1);
                            setCustomSquareStyles({}); // Clear highlights after opponent move
                        }, 500);
                    }
                }
            } else {
                // Incorrect move
                // Red highlight for incorrect move
                setCustomSquareStyles({
                    [sourceSquare]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
                    [targetSquare]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' }
                });

                // Snap back logic (clear highlights after delay)
                setTimeout(() => {
                    setCustomSquareStyles({});
                }, 500);
            }
        } catch (e) {
            return;
        }
    };

    const showSolution = () => {
        if (!currentPuzzle || solved) return;

        // Execute the current move in the solution
        const nextMove = currentPuzzle.solution[moveIndex];
        const tempGame = new Chess(game.fen());

        try {
            const result = tempGame.move(nextMove);
            if (!result) return;

            setGame(tempGame);
            const nextIndex = moveIndex + 1;
            setMoveIndex(nextIndex);

            // Green highlight for the solution move
            setCustomSquareStyles({
                [result.from]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },
                [result.to]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' }
            });

            // Check if puzzle is solved
            if (nextIndex >= currentPuzzle.solution.length) {
                setSolved(true);
                toast({ title: "Puzzle Solved!", className: "bg-green-500 text-white" });
            } else {
                // If there's an opponent move next, play it automatically
                if (nextIndex < currentPuzzle.solution.length) {
                    setTimeout(() => {
                        const opponentMoveSan = currentPuzzle.solution[nextIndex];
                        const gameCopy = new Chess(tempGame.fen());
                        const opponentResult = gameCopy.move(opponentMoveSan);

                        if (opponentResult) {
                            setGame(gameCopy);
                            setMoveIndex(nextIndex + 1);
                            setCustomSquareStyles({}); // Clear highlights after opponent move
                        }
                    }, 500);
                }
            }
        } catch (e) {
            console.error("Failed to execute solution move:", e);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 max-w-6xl mx-auto">
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                Daily Puzzles
                            </h2>
                            <p className="text-muted-foreground">Solve chess tactics to improve your game</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={showSolution} variant="secondary">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Show Solution
                            </Button>
                            <Button onClick={loadRandomPuzzle} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Next Puzzle
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center relative">
                        <div className="w-full max-w-[600px] max-h-[80vh] aspect-square relative">
                            <ChessBoard
                                chess={game}
                                onMove={handleMove}
                                flipped={flipped}
                                customSquareStyles={customSquareStyles}
                                lastMove={null}
                                suggestions={[]}
                                showSuggestions={false}
                            />
                            {solved && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none z-10">
                                    <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl flex items-center gap-2 animate-in zoom-in">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Solved!
                                    </div>
                                </div>
                            )}
                            {failed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none z-10">
                                    <div className="bg-destructive text-white px-6 py-3 rounded-full font-bold text-xl flex items-center gap-2 animate-in zoom-in">
                                        <XCircle className="w-6 h-6" />
                                        Incorrect
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Difficulty</label>
                                <Select value={difficulty} onValueChange={(v: string) => setDifficulty(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy (Beginner)</SelectItem>
                                        <SelectItem value="medium">Medium (Intermediate)</SelectItem>
                                        <SelectItem value="hard">Hard (Advanced)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Hint</span>
                                    <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>
                                        <Lightbulb className={`w-4 h-4 ${showHint ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                    </Button>
                                </div>
                                {showHint && currentPuzzle && (
                                    <div className="bg-muted p-3 rounded-md text-sm">
                                        <p className="font-medium mb-1">Theme:</p>
                                        <p className="text-muted-foreground capitalize">{currentPuzzle.theme}</p>
                                        <p className="font-medium mt-2 mb-1">Hint:</p>
                                        <p className="text-muted-foreground">{currentPuzzle.hint}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Puzzle Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Rating</span>
                                <span className="font-bold">{currentPuzzle?.rating || '?'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">To Move</span>
                                <span className="font-bold flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-white border border-gray-300' : 'bg-black'}`} />
                                    {game.turn() === 'w' ? 'White' : 'Black'}
                                </span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ArrowRight className="w-4 h-4" />
                                    <span>Find the best move</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
