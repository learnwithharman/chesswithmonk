import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trophy, RefreshCw, Lightbulb, CheckCircle2, ArrowRight, RotateCcw, Play } from 'lucide-react';
import { PUZZLES, Puzzle } from '@/data/puzzles';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { toast } = useToast();

    // Puzzle Rotation Logic
    // Store indices for each difficulty
    const puzzleIndices = useRef({ easy: 0, medium: 0, hard: 0 });

    const loadNextPuzzle = useCallback(() => {
        const puzzleList = PUZZLES[difficulty] || PUZZLES['easy'];

        // Get current index for this difficulty
        let index = puzzleIndices.current[difficulty as keyof typeof puzzleIndices.current];

        // Select puzzle
        const nextPuzzle = puzzleList[index % puzzleList.length];

        // Increment index for next time (wrap around logic handled by modulo above, but good to keep index clean)
        puzzleIndices.current[difficulty as keyof typeof puzzleIndices.current] = (index + 1) % puzzleList.length;

        if (nextPuzzle) {
            const newGame = new Chess(nextPuzzle.fen);
            setGame(newGame);
            setCurrentPuzzle(nextPuzzle);
            setMoveIndex(0);
            setSolved(false);
            setFailed(false);
            setShowHint(false);
            setCustomSquareStyles({});
            setShowSuccessModal(false);
            // Flip board if it's black to move
            setFlipped(newGame.turn() === 'b');
        }
    }, [difficulty]);

    // Initial load when difficulty changes
    useEffect(() => {
        // When difficulty changes, we want to load the *current* puzzle for that difficulty, 
        // not necessarily skip to the next one immediately? 
        // The user said: "On 'Next Puzzle', do: currentIndex++ ... return puzzles[currentIndex]".
        // But on init/change difficulty, we should probably just load the current one without incrementing?
        // Or just load the next one. Let's load the next one to ensure fresh start.
        // Actually, to be safe and consistent, let's just call loadNextPuzzle.
        loadNextPuzzle();
    }, [difficulty, loadNextPuzzle]);

    const restartPuzzle = () => {
        if (currentPuzzle) {
            const newGame = new Chess(currentPuzzle.fen);
            setGame(newGame);
            setMoveIndex(0);
            setSolved(false);
            setFailed(false);
            setCustomSquareStyles({});
            setShowSuccessModal(false);
        }
    };

    const handleMove = (move: Move) => {
        if (solved || failed || !currentPuzzle) return;

        const tempGame = new Chess(game.fen());
        try {
            const result = tempGame.move(move);
            if (!result) return;

            const playedSan = result.san;
            const expectedSan = currentPuzzle.solution[moveIndex];

            // Normalize: Remove check/mate symbols for comparison
            const normalize = (m: string) => m.replace(/[+#]/g, '');
            const isCorrect = normalize(playedSan) === normalize(expectedSan);

            if (isCorrect) {
                // Correct move
                setGame(tempGame);
                const nextIndex = moveIndex + 1;
                setMoveIndex(nextIndex);

                // Green highlight for correct move
                setCustomSquareStyles({
                    [result.from]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },
                    [result.to]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' }
                });

                if (nextIndex >= currentPuzzle.solution.length) {
                    setSolved(true);
                    setShowSuccessModal(true);
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
                setCustomSquareStyles({
                    [move.from]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
                    [move.to]: { backgroundColor: 'rgba(239, 68, 68, 0.5)' }
                });

                setFailed(true);
                toast({ title: "Incorrect Move", variant: "destructive" });

                setTimeout(() => {
                    setCustomSquareStyles({});
                    setFailed(false);
                }, 1000);
            }
        } catch (e) {
            return;
        }
    };

    const showSolution = () => {
        if (!currentPuzzle || solved) return;

        if (moveIndex % 2 !== 0) {
            toast({ title: "Wait for opponent's move", variant: "destructive" });
            return;
        }

        const nextMoveSan = currentPuzzle.solution[moveIndex];
        const tempGame = new Chess(game.fen());

        try {
            const result = tempGame.move(nextMoveSan);
            if (!result) return;

            // Highlight the destination square (and source)
            setCustomSquareStyles({
                [result.from]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' },
                [result.to]: { backgroundColor: 'rgba(34, 197, 94, 0.5)' }
            });

        } catch (e) {
            console.error("Failed to find solution move:", e);
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
                            <Button onClick={loadNextPuzzle} variant="outline">
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
                                        <SelectItem value="easy">Easy (Mate in 1)</SelectItem>
                                        <SelectItem value="medium">Medium (Mate in 2-3)</SelectItem>
                                        <SelectItem value="hard">Hard (Mate in 5-6)</SelectItem>
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
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Goal</span>
                                <span className="font-bold">Mate in {currentPuzzle?.mateIn}</span>
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

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            Puzzle Completed!
                        </DialogTitle>
                        <DialogDescription>
                            Great job! You've solved this puzzle.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button variant="outline" onClick={restartPuzzle} className="w-full sm:w-auto">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restart
                        </Button>
                        <Button onClick={loadNextPuzzle} className="w-full sm:w-auto">
                            <Play className="w-4 h-4 mr-2" />
                            Next Puzzle
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
