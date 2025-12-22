// Simplified Analysis page - Chess.com-style layout
import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { EvaluationBar } from '@/components/EvaluationBar';
import { MoveFeedbackPanel } from '@/components/MoveFeedbackPanel';
import { AnalysisProgressPopup } from '@/components/AnalysisProgressPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Move, PVLine, MoveQualityLabel } from '@/lib/types';
import { RotateCcw, Upload, Download, Zap, ZapOff, ChevronLeft, ChevronRight, FlipHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyOpening, loadEcoTheory } from '@/lib/openingEngine';
import {
    normalizeEvaluation,
    formatEvaluation,
    clearEvaluationCache
} from '@/lib/enginePipeline';
import { classifyMove } from '@/lib/moveClassifier';

// Stockfish engine worker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const StockfishWorker = typeof window !== 'undefined' ? new Worker(new URL('../lib/stockfish-engine.worker.ts', import.meta.url), { type: 'module' }) : null;

interface AnalyzedMove {
    moveNumber: number;
    san: string;
    fen: string;
    evaluation: number;
    mate: number | null;
    depth: number;
    quality: MoveQualityLabel;
    evaluationDelta: number;
    contextualLabels: MoveQualityLabel[];
    engineLines: PVLine[];
    from: string;
    to: string;
}

const Analysis = () => {
    // Core game state
    const [game, setGame] = useState(new Chess());
    const [flipped, setFlipped] = useState(false);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [fen, setFen] = useState(game.fen());
    const [pgn, setPgn] = useState('');

    // Pre-analysis state
    const [preAnalyzedMoves, setPreAnalyzedMoves] = useState<AnalyzedMove[]>([]);
    const [isPreAnalyzing, setIsPreAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
    const [currentNavigationIndex, setCurrentNavigationIndex] = useState(-1);

    // Evaluation state
    const [currentEvaluation, setCurrentEvaluation] = useState<number>(0);
    const [targetEvaluation, setTargetEvaluation] = useState<number>(0);
    const [mateIn, setMateIn] = useState<number | null>(null);

    // UI state
    const [engineLines, setEngineLines] = useState<PVLine[]>([]);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [historyStack, setHistoryStack] = useState<string[]>([game.fen()]);

    // Feedback panel state
    const [currentFeedback, setCurrentFeedback] = useState<{
        quality: MoveQualityLabel | null;
        evaluationDelta: number | null;
        contextualLabels: MoveQualityLabel[];
        move: string | null;
    }>({
        quality: null,
        evaluationDelta: null,
        contextualLabels: [],
        move: null,
    });

    // Opening info
    const [openingName, setOpeningName] = useState<string>('Starting Position');
    const [ecoCode, setEcoCode] = useState<string | null>(null);

    const { toast } = useToast();
    const interpolationFrameRef = useRef<number | null>(null);
    const lastInterpolationTimeRef = useRef<number>(Date.now());

    // Load ECO database
    useEffect(() => {
        loadEcoTheory();
    }, []);

    // Identify opening
    useEffect(() => {
        const match = identifyOpening(fen);
        if (match) {
            setOpeningName(match.opening_name);
            setEcoCode(match.eco_code);
        } else {
            if (fen === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
                setOpeningName('Starting Position');
                setEcoCode(null);
            }
        }
    }, [fen]);

    // Smooth evaluation interpolation
    useEffect(() => {
        const interpolate = () => {
            const now = Date.now();
            const deltaTime = now - lastInterpolationTimeRef.current;
            lastInterpolationTimeRef.current = now;

            setCurrentEvaluation((current) => {
                if (Math.abs(current - targetEvaluation) < 0.01) {
                    return targetEvaluation;
                }

                const speed = 0.15;
                const delta = targetEvaluation - current;
                const step = delta * speed * (deltaTime / 16);
                return current + step;
            });

            interpolationFrameRef.current = requestAnimationFrame(interpolate);
        };

        if (Math.abs(currentEvaluation - targetEvaluation) > 0.01) {
            interpolationFrameRef.current = requestAnimationFrame(interpolate);
        }

        return () => {
            if (interpolationFrameRef.current) {
                cancelAnimationFrame(interpolationFrameRef.current);
            }
        };
    }, [targetEvaluation, currentEvaluation]);

    // Analyze a single position
    const analyzePosition = useCallback((fenToAnalyze: string, depth: number = 18): Promise<{ evaluation: number; mate: number | null; depth: number; lines: PVLine[] }> => {
        return new Promise((resolve, reject) => {
            if (!StockfishWorker) {
                reject(new Error('Engine not available'));
                return;
            }

            const id = String(Math.random());

            const onMessage = (ev: MessageEvent) => {
                if (ev.data?.id !== id) return;
                StockfishWorker.removeEventListener('message', onMessage as any);

                if (ev.data.suggestions && Array.isArray(ev.data.suggestions)) {
                    const suggestions = ev.data.suggestions;

                    const lines: PVLine[] = suggestions.map((s: any) => {
                        try {
                            const temp = new Chess(fenToAnalyze);
                            const mv = temp.move({
                                from: s.move.from,
                                to: s.move.to,
                                promotion: s.move.promotion || 'q',
                            });

                            const normalized = normalizeEvaluation(s.score, s.mate);

                            return {
                                pvIndex: s.pvNum - 1,
                                moves: mv ? [{ ...s.move, san: mv.san }] : [s.move],
                                evaluation: normalized,
                                depth: s.depth || depth,
                                mate: s.mate || null,
                                uciMove: s.uciMove,
                            };
                        } catch {
                            return null;
                        }
                    }).filter(Boolean);

                    const bestLine = lines.find(line => line.pvIndex === 0);

                    resolve({
                        evaluation: bestLine?.evaluation || 0,
                        mate: bestLine?.mate || null,
                        depth: bestLine?.depth || depth,
                        lines,
                    });
                } else {
                    reject(new Error('No suggestions'));
                }
            };

            StockfishWorker.addEventListener('message', onMessage as any);
            StockfishWorker.postMessage({
                id,
                action: 'suggestions',
                fen: fenToAnalyze,
                difficulty: 'advanced',
                depth,
                multiPV: 3,
                threads: 1,
                hash: 128,
            });
        });
    }, []);

    // Fast Analysis - lightweight, shallow depth
    const runFastAnalysis = useCallback(async () => {
        setIsPreAnalyzing(true);
        setAnalysisProgress({ current: 0, total: 0 });

        try {
            const tempGame = new Chess();
            tempGame.loadPgn(pgn);
            const moves = tempGame.history({ verbose: true });

            setAnalysisProgress({ current: 0, total: moves.length });

            const replayGame = new Chess();
            const analyzed: AnalyzedMove[] = [];

            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                const fenBefore = replayGame.fen();

                const beforeAnalysis = await analyzePosition(fenBefore, 10); // Shallow depth

                replayGame.move(move);
                const fenAfter = replayGame.fen();

                const afterAnalysis = await analyzePosition(fenAfter, 10);

                const quality = classifyMove({
                    playedMove: move,
                    engineLines: beforeAnalysis.lines,
                    evaluationBefore: beforeAnalysis.evaluation,
                    evaluationAfter: afterAnalysis.evaluation,
                    depth: afterAnalysis.depth,
                    chess: replayGame,
                    moveNumber: Math.floor(i / 2) + 1,
                    fen: fenBefore,
                });

                analyzed.push({
                    moveNumber: i,
                    san: move.san,
                    fen: fenAfter,
                    evaluation: afterAnalysis.evaluation,
                    mate: afterAnalysis.mate,
                    depth: afterAnalysis.depth,
                    quality: quality.label,
                    evaluationDelta: quality.evaluationDelta,
                    contextualLabels: quality.contextualLabels,
                    engineLines: afterAnalysis.lines,
                    from: move.from,
                    to: move.to,
                });

                setAnalysisProgress({ current: i + 1, total: moves.length });
            }

            setPreAnalyzedMoves(analyzed);
            setCurrentNavigationIndex(-1);

            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());

            toast({ title: 'Fast Analysis Complete', description: `Analyzed ${moves.length} moves (depth 10)` });
        } catch (error) {
            console.error('Fast analysis error:', error);
            toast({ title: 'Analysis Failed', description: 'Could not complete analysis', variant: 'destructive' });
        } finally {
            setIsPreAnalyzing(false);
        }
    }, [pgn, analyzePosition, toast]);

    // Full Analysis - deep, thorough analysis
    const runFullAnalysis = useCallback(async () => {
        setIsPreAnalyzing(true);
        setAnalysisProgress({ current: 0, total: 0 });

        try {
            const tempGame = new Chess();
            tempGame.loadPgn(pgn);
            const moves = tempGame.history({ verbose: true });

            setAnalysisProgress({ current: 0, total: moves.length });

            const replayGame = new Chess();
            const analyzed: AnalyzedMove[] = [];

            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                const fenBefore = replayGame.fen();

                const beforeAnalysis = await analyzePosition(fenBefore, 20); // Deep analysis

                replayGame.move(move);
                const fenAfter = replayGame.fen();

                const afterAnalysis = await analyzePosition(fenAfter, 20);

                const quality = classifyMove({
                    playedMove: move,
                    engineLines: beforeAnalysis.lines,
                    evaluationBefore: beforeAnalysis.evaluation,
                    evaluationAfter: afterAnalysis.evaluation,
                    depth: afterAnalysis.depth,
                    chess: replayGame,
                    moveNumber: Math.floor(i / 2) + 1,
                    fen: fenBefore,
                });

                analyzed.push({
                    moveNumber: i,
                    san: move.san,
                    fen: fenAfter,
                    evaluation: afterAnalysis.evaluation,
                    mate: afterAnalysis.mate,
                    depth: afterAnalysis.depth,
                    quality: quality.label,
                    evaluationDelta: quality.evaluationDelta,
                    contextualLabels: quality.contextualLabels,
                    engineLines: afterAnalysis.lines,
                    from: move.from,
                    to: move.to,
                });

                setAnalysisProgress({ current: i + 1, total: moves.length });
            }

            setPreAnalyzedMoves(analyzed);
            setCurrentNavigationIndex(-1);

            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());

            toast({ title: 'Full Analysis Complete', description: `Analyzed ${moves.length} moves (depth 20)` });
        } catch (error) {
            console.error('Full analysis error:', error);
            toast({ title: 'Analysis Failed', description: 'Could not complete analysis', variant: 'destructive' });
        } finally {
            setIsPreAnalyzing(false);
        }
    }, [pgn, analyzePosition, toast]);

    // Navigation: Next move
    const handleNext = useCallback(() => {
        if (currentNavigationIndex < preAnalyzedMoves.length - 1) {
            const newIndex = currentNavigationIndex + 1;
            const move = preAnalyzedMoves[newIndex];

            setCurrentNavigationIndex(newIndex);

            const newGame = new Chess(move.fen);
            setGame(newGame);
            setFen(move.fen);

            // Convert Side-to-Move evaluation to Absolute (White-Perspective) for UI
            // If result was for Black's turn, negate it to get White's perspective
            const isBlackTurn = newGame.turn() === 'b';
            const absoluteEval = isBlackTurn ? -move.evaluation : move.evaluation;
            const absoluteMate = move.mate ? (isBlackTurn ? -move.mate : move.mate) : null;

            setTargetEvaluation(absoluteEval);
            setMateIn(absoluteMate);

            // Also convert engine lines to absolute for display
            const absoluteLines = move.engineLines.map(line => ({
                ...line,
                evaluation: isBlackTurn ? -line.evaluation : line.evaluation,
                mate: line.mate ? (isBlackTurn ? -line.mate : line.mate) : null,
            }));

            setEngineLines(absoluteLines);

            setCurrentFeedback({
                quality: move.quality,
                evaluationDelta: move.evaluationDelta,
                contextualLabels: move.contextualLabels,
                move: move.san,
            });

            setLastMove({ from: move.from, to: move.to });
        }
    }, [currentNavigationIndex, preAnalyzedMoves]);

    // Navigation: Previous move
    const handlePrevious = useCallback(() => {
        if (currentNavigationIndex > -1) {
            const newIndex = currentNavigationIndex - 1;
            setCurrentNavigationIndex(newIndex);

            if (newIndex === -1) {
                const newGame = new Chess(historyStack[0]);
                setGame(newGame);
                setFen(newGame.fen());
                setTargetEvaluation(0);
                setMateIn(null);
                setEngineLines([]);
                setLastMove(null);

                setCurrentFeedback({
                    quality: null,
                    evaluationDelta: null,
                    contextualLabels: [],
                    move: null,
                });
            } else {
                const move = preAnalyzedMoves[newIndex];
                const newGame = new Chess(move.fen);
                setGame(newGame);
                setFen(move.fen);

                // Convert Side-to-Move evaluation to Absolute (White-Perspective) for UI
                const isBlackTurn = newGame.turn() === 'b';
                const absoluteEval = isBlackTurn ? -move.evaluation : move.evaluation;
                const absoluteMate = move.mate ? (isBlackTurn ? -move.mate : move.mate) : null;

                setTargetEvaluation(absoluteEval);
                setMateIn(absoluteMate);

                // Also convert engine lines to absolute for display
                const absoluteLines = move.engineLines.map(line => ({
                    ...line,
                    evaluation: isBlackTurn ? -line.evaluation : line.evaluation,
                    mate: line.mate ? (isBlackTurn ? -line.mate : line.mate) : null,
                }));

                setEngineLines(absoluteLines);
                setLastMove({ from: move.from, to: move.to });

                setCurrentFeedback({
                    quality: move.quality,
                    evaluationDelta: move.evaluationDelta,
                    contextualLabels: move.contextualLabels,
                    move: move.san,
                });
            }
        }
    }, [currentNavigationIndex, preAnalyzedMoves, historyStack]);

    // Reset - clear everything
    const handleReset = () => {
        const newGame = new Chess();
        setGame(newGame);
        setLastMove(null);
        setFen(newGame.fen());
        setPgn('');
        setCurrentEvaluation(0);
        setTargetEvaluation(0);
        setMateIn(null);
        setMoveHistory([]);
        setHistoryStack([newGame.fen()]);
        setCurrentNavigationIndex(-1);
        setPreAnalyzedMoves([]);
        setEngineLines([]);
        setCurrentFeedback({
            quality: null,
            evaluationDelta: null,
            contextualLabels: [],
            move: null,
        });
        setOpeningName('Starting Position');
        setEcoCode(null);
        clearEvaluationCache();
        toast({ title: 'Reset Complete', description: 'Ready to import new game' });
    };

    // Import PGN
    const handlePgnImport = () => {
        try {
            const newGame = new Chess();
            newGame.loadPgn(pgn);
            const history = newGame.history();

            const replayGame = new Chess();
            const newStack = [replayGame.fen()];
            history.forEach(m => {
                replayGame.move(m);
                newStack.push(replayGame.fen());
            });

            const startGame = new Chess();
            setGame(startGame);
            setFen(startGame.fen());
            setLastMove(null);
            setMoveHistory(history);
            setHistoryStack(newStack);
            setCurrentNavigationIndex(-1);
            setPreAnalyzedMoves([]);

            toast({ title: 'PGN Loaded', description: `${history.length} moves loaded` });
        } catch {
            toast({ title: 'Invalid PGN', description: 'Could not load the game.', variant: 'destructive' });
        }
    };

    // Export PGN
    const handlePgnExport = () => {
        const exportPgn = game.pgn();
        navigator.clipboard.writeText(exportPgn);
        toast({ title: 'Exported', description: 'PGN copied to clipboard' });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_350px] gap-6 max-w-[1800px] mx-auto">
                {/* LEFT SIDEBAR */}
                <div className="hidden lg:flex lg:flex-col h-[calc(100vh-200px)] gap-4">
                    {/* Move History */}
                    <div className="flex-1 min-h-0 bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col">
                        <div className="p-3 border-b font-semibold bg-muted/30 text-sm">Move History</div>
                        <div className="flex-1 overflow-auto">
                            <MoveList
                                moves={moveHistory}
                                currentMoveIndex={currentNavigationIndex}
                                onMoveClick={() => { }}
                                moveQualities={new Map()}
                            />
                        </div>
                    </div>

                    {/* Opening Name */}
                    <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border text-center shrink-0">
                        <div className="text-xs text-muted-foreground mb-1">Opening</div>
                        <div className="font-semibold text-sm">
                            {ecoCode && <span className="text-primary mr-2 font-mono">{ecoCode}</span>}
                            <span>{openingName}</span>
                        </div>
                    </div>

                    {/* Compact FEN & PGN Import/Export */}
                    <Card className="shrink-0">
                        <CardHeader className="py-2 px-3">
                            <CardTitle className="text-xs font-semibold">FEN & PGN</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste PGN..."
                                    value={pgn}
                                    onChange={(e) => setPgn(e.target.value)}
                                    className="h-8 text-xs"
                                />
                                <Button size="sm" variant="outline" onClick={handlePgnImport} className="h-8 px-2">
                                    <Upload className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handlePgnExport} className="h-8 px-2">
                                    <Download className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER: Board */}
                <div className="space-y-4 w-full max-w-xl mx-auto lg:max-w-none">
                    <div className="w-full flex items-center justify-center">
                        <div className="w-full max-w-full aspect-square relative flex gap-2 md:gap-4 lg:max-h-[80vh] shrink-0">
                            <EvaluationBar
                                evaluation={currentEvaluation}
                                mateIn={mateIn}
                                isSmoothing={true}
                                perspective="w"
                                className="w-4 md:w-6 lg:w-8 h-full shrink-0"
                            />

                            <div className="h-full aspect-square relative shadow-2xl rounded-lg overflow-hidden flex-1">
                                <ChessBoard
                                    chess={game}
                                    onMove={(move) => {
                                        const newGame = new Chess(game.fen());
                                        try {
                                            const result = newGame.move(move);
                                            if (result) {
                                                setGame(newGame);
                                                setFen(newGame.fen());
                                                setLastMove({ from: move.from, to: move.to });
                                                // Trigger analysis for new position...
                                                analyzePosition(newGame.fen()).then((res) => {
                                                    setTargetEvaluation(res.evaluation); // Need logic
                                                });
                                            }
                                        } catch (e) { console.error(e); }
                                    }}
                                    flipped={flipped}
                                    lastMove={lastMove}
                                    suggestions={[]}
                                    showSuggestions={false}
                                    isDraggable={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex flex-col gap-3">
                        {preAnalyzedMoves.length > 0 && (
                            <div className="text-sm text-center text-muted-foreground">
                                Move {Math.max(0, currentNavigationIndex + 1)} of {preAnalyzedMoves.length}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={handlePrevious}
                                disabled={currentNavigationIndex <= -1}
                                variant="secondary"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={currentNavigationIndex >= preAnalyzedMoves.length - 1}
                                variant="secondary"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Move Feedback Panel */}
                    <div className="lg:hidden w-full mt-4">
                        <MoveFeedbackPanel
                            moveQuality={currentFeedback.quality}
                            evaluationDelta={currentFeedback.evaluationDelta}
                            contextualLabels={currentFeedback.contextualLabels}
                            currentMove={currentFeedback.move}
                            engineLines={engineLines}
                            multiPV={3}
                        />
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="hidden lg:flex lg:flex-col h-[calc(100vh-200px)] gap-4">
                    {/* Game Controls */}
                    <Card className="shrink-0">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm">Game Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => setFlipped(!flipped)} size="sm">
                                    <FlipHorizontal className="w-4 h-4 mr-2" /> Flip
                                </Button>
                                <Button variant="outline" onClick={handleReset} size="sm">
                                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                                </Button>
                            </div>

                            {moveHistory.length > 0 && preAnalyzedMoves.length === 0 && (
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                    <Button
                                        onClick={runFastAnalysis}
                                        disabled={isPreAnalyzing}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <ZapOff className="w-4 h-4 mr-2" /> Fast
                                    </Button>
                                    <Button
                                        onClick={runFullAnalysis}
                                        disabled={isPreAnalyzing}
                                        variant="default"
                                        size="sm"
                                    >
                                        <Zap className="w-4 h-4 mr-2" /> Full
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Move Feedback Panel */}
                    <div className="flex-1 min-h-0">
                        <MoveFeedbackPanel
                            moveQuality={currentFeedback.quality}
                            evaluationDelta={currentFeedback.evaluationDelta}
                            contextualLabels={currentFeedback.contextualLabels}
                            currentMove={currentFeedback.move}
                            engineLines={engineLines}
                            multiPV={3}
                        />
                    </div>
                </div>
            </div>

            {/* Progress Popup */}
            <AnalysisProgressPopup
                currentMove={analysisProgress.current}
                totalMoves={analysisProgress.total}
                visible={isPreAnalyzing}
            />
        </div>
    );
};

export default Analysis;
