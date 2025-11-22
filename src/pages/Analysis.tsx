// Analysis page with manual engine analysis, dynamic MultiPV, evaluation bar, and move quality labels
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Move } from '@/lib/types';
import { RotateCcw, Download, Upload, Copy, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyOpening, loadEcoTheory } from '@/lib/openingEngine';

// Stockfish engine worker for analysis
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const StockfishWorker = typeof window !== 'undefined' ? new Worker(new URL('../lib/stockfish-engine.worker.ts', import.meta.url), { type: 'module' }) : null;

const Analysis = () => {
    // Core game state
    const [game, setGame] = useState(new Chess());
    const [flipped, setFlipped] = useState(false);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [fen, setFen] = useState(game.fen());
    const [pgn, setPgn] = useState(game.pgn());

    // Engine related state
    const [evalScore, setEvalScore] = useState<number>(0);
    const [engineDepth, setEngineDepth] = useState(15);
    const [multiPV, setMultiPV] = useState(3);
    const [searchTime, setSearchTime] = useState(2);
    const [threads, setThreads] = useState(1);
    const [hash, setHash] = useState(64);
    const [engineLines, setEngineLines] = useState<any[]>([]);
    const [isRealTimeAnalysis, setIsRealTimeAnalysis] = useState(false);
    const [isComputing, setIsComputing] = useState(false);
    const [mateIn, setMateIn] = useState<number | null>(null);

    // UI / history state
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [moveQualities, setMoveQualities] = useState<Map<number, string>>(new Map());

    const { toast } = useToast();
    const [openingName, setOpeningName] = useState<string>('Starting Position');
    const [ecoCode, setEcoCode] = useState<string | null>(null);

    // Load settings from localStorage
    useEffect(() => {
        const savedThreads = localStorage.getItem('engineThreads');
        const savedHash = localStorage.getItem('engineHash');
        if (savedThreads) setThreads(parseInt(savedThreads));
        if (savedHash) setHash(parseInt(savedHash));
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('engineThreads', threads.toString());
    }, [threads]);

    useEffect(() => {
        localStorage.setItem('engineHash', hash.toString());
    }, [hash]);

    // Load opening theory data once
    useEffect(() => {
        loadEcoTheory();
    }, []);

    // Identify opening whenever FEN changes
    useEffect(() => {
        const match = identifyOpening(fen);
        if (match) {
            setOpeningName(match.opening_name);
            setEcoCode(match.eco_code);
        } else {
            // If it's the starting position, reset
            if (fen === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
                setOpeningName('Starting Position');
                setEcoCode(null);
            }
            // Otherwise keep the last known opening
        }
    }, [fen]);

    // Helper to map engine classification / cpLoss to a readable label
    const getQualityLabel = (cpLoss: number, classification: string): string => {
        if (classification === '??') return 'Blunder';
        if (classification === '?') return 'Mistake';
        if (classification === '?!') return 'Inaccuracy';
        if (classification === '✓') return 'Best';
        // Fallback based on cp loss magnitude
        if (cpLoss >= 300) return 'Blunder';
        if (cpLoss >= 150) return 'Mistake';
        if (cpLoss >= 50) return 'Inaccuracy';
        return 'Good';
    };

    // Core analysis function
    const analyzePosition = () => {
        if (!StockfishWorker) return;
        setIsComputing(true);
        const id = String(Math.random());
        const onMessage = (ev: MessageEvent) => {
            if (ev.data?.id !== id) return;
            StockfishWorker.removeEventListener('message', onMessage as any);
            setIsComputing(false);
            if (ev.data.suggestions && Array.isArray(ev.data.suggestions)) {
                const suggestionsWithSan = ev.data.suggestions.map((s: any) => {
                    try {
                        const temp = new Chess(game.fen());
                        const mv = temp.move({
                            from: s.move.from,
                            to: s.move.to,
                            promotion: s.move.promotion || 'q',
                        });
                        if (mv) return { ...s, move: { ...s.move, san: mv.san } };
                        return s;
                    } catch {
                        return s;
                    }
                });
                setEngineLines(suggestionsWithSan);
                setEvalScore(ev.data.suggestions[0]?.score || 0);
                // Determine quality for the most recent move (if any)
                if (lastMove && currentMoveIndex >= 0) {
                    const match = suggestionsWithSan.find((s: any) => s.move.san === lastMove.san);
                    if (match) {
                        const label = getQualityLabel(match.cpLoss ?? 0, match.classification ?? '');
                        setMoveQualities(prev => new Map(prev).set(currentMoveIndex, label));
                    }
                }
                // TODO: parse mate information from engine output and setMateIn if needed
            }
        };
        StockfishWorker.addEventListener('message', onMessage as any);
        StockfishWorker.postMessage({
            id,
            action: 'suggestions',
            fen: game.fen(),
            difficulty: 'advanced',
            depth: engineDepth,
            multiPV,
            threads,
            hash,
        });
    };

    // Trigger analysis when FEN changes if real-time analysis is enabled
    useEffect(() => {
        if (isRealTimeAnalysis) {
            analyzePosition();
        }
    }, [fen, isRealTimeAnalysis, threads, hash]);

    // Toggle real-time analysis
    const toggleAnalysis = () => {
        setIsRealTimeAnalysis(!isRealTimeAnalysis);
    };

    // Handle a user move on the board
    const onMove = (move: Move) => {
        try {
            const result = game.move(move);
            if (result) {
                const newGame = new Chess(game.fen());
                setGame(newGame);
                setLastMove(move);
                setFen(newGame.fen());
                setPgn(newGame.pgn());
                const history = newGame.history();
                setMoveHistory(history);
                setCurrentMoveIndex(history.length - 1);
            }
        } catch {
            // invalid move – ignore
        }
    };

    const handleReset = () => {
        const newGame = new Chess();
        setGame(newGame);
        setLastMove(null);
        setFen(newGame.fen());
        setPgn(newGame.pgn());
        setEvalScore(0);
        setMoveHistory([]);
        setCurrentMoveIndex(-1);
        setMoveQualities(new Map());
        setOpeningName('Starting Position');
        setEcoCode(null);
        setEngineLines([]);
    };

    const handlePgnImport = () => {
        try {
            const newGame = new Chess();
            newGame.loadPgn(pgn);
            setGame(newGame);
            setLastMove(null);
            setFen(newGame.fen());
            setPgn(newGame.pgn());
            toast({ title: 'PGN Loaded', description: 'Game loaded successfully.' });
        } catch {
            toast({ title: 'Invalid PGN', description: 'Could not load the game.', variant: 'destructive' });
        }
    };

    const handleFenImport = () => {
        try {
            const newGame = new Chess(fen);
            setGame(newGame);
            setLastMove(null);
            setPgn(newGame.pgn());
            setMoveHistory(newGame.history());
            setCurrentMoveIndex(newGame.history().length - 1);
            toast({ title: 'FEN Loaded', description: 'Position loaded successfully.' });
        } catch {
            toast({ title: 'Invalid FEN', description: 'Could not load the position.', variant: 'destructive' });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied', description: 'Copied to clipboard.' });
    };

    // Evaluation bar – normalize score to bar height (0-100%)
    // Cap score at ±500 centipawns for visual scaling
    // Positive score = White advantage (bar fills from bottom = black side)
    // Negative score = Black advantage (bar fills from top = white side)
    const cappedScore = Math.max(-500, Math.min(500, evalScore));
    const evalBarHeight = Math.max(5, Math.min(95, 50 + (cappedScore / 500) * 45));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] gap-6 max-w-[1800px] mx-auto">
                {/* Left – Move History */}
                <div className="hidden lg:block">
                    <MoveList
                        moves={moveHistory}
                        currentMoveIndex={currentMoveIndex}
                        onMoveClick={(idx) => setCurrentMoveIndex(idx)}
                        moveQualities={moveQualities}
                    />
                </div>

                {/* Center – Board and evaluation */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-card p-3 rounded-lg border">
                        <div>
                            <h2 className="text-lg font-bold">Analysis Board</h2>
                            <p className="text-muted-foreground text-sm">
                                {ecoCode && <span className="font-mono font-bold text-primary mr-2 text-xs">{ecoCode}</span>}
                                <span className="text-xs">{openingName}</span>
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>

                    <div className="flex gap-4 items-center justify-center h-[600px]">
                        {/* Evaluation Bar */}
                        <div className="w-8 bg-gray-300 rounded-sm relative overflow-hidden border h-full flex flex-col shrink-0">
                            <div className="absolute top-0 w-full bg-white transition-all duration-500" style={{ height: `${evalBarHeight}%` }} />
                            <div className="absolute bottom-0 w-full bg-gray-900 transition-all duration-500" style={{ height: `${100 - evalBarHeight}%` }} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className={`text-[10px] font-bold px-1 py-0.5 rounded ${mateIn !== null ? 'bg-yellow-500 text-black' : evalBarHeight > 50 ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
                                    {mateIn !== null ? `M${Math.abs(mateIn)}` : evalScore > 0 ? `+${(evalScore / 100).toFixed(1)}` : (evalScore / 100).toFixed(1)}
                                </div>
                            </div>
                        </div>

                        {/* Board Container - let it fill remaining space but keep aspect ratio */}
                        <div className="h-full aspect-square">
                            <ChessBoard
                                chess={game}
                                onMove={onMove}
                                flipped={flipped}
                                lastMove={lastMove}
                                suggestions={[]}
                                showSuggestions={false}
                            />
                        </div>
                    </div>

                    {/* Mobile move list */}
                    <div className="lg:hidden">
                        <MoveList
                            moves={moveHistory}
                            currentMoveIndex={currentMoveIndex}
                            onMoveClick={(idx) => setCurrentMoveIndex(idx)}
                            moveQualities={moveQualities}
                        />
                    </div>
                </div>

                {/* Right – Settings and best moves */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Engine Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Engine</label>
                                    <span className="text-xs text-muted-foreground">Stockfish 17.1</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Depth</label>
                                    <span className="text-xs text-muted-foreground">{engineDepth}</span>
                                </div>
                                <Slider value={[engineDepth]} onValueChange={([v]) => setEngineDepth(v)} min={5} max={17} step={1} className="w-full" />
                            </div>

                            {/* Threads Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Threads
                                        <span className="text-[10px] text-muted-foreground ml-1" title="How many CPU threads the engine uses. Higher = faster but heavier for your device.">ⓘ</span>
                                    </label>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Threads: {threads}</span>
                                </div>
                                <Slider value={[threads]} onValueChange={([v]) => setThreads(v)} min={1} max={16} step={1} className="w-full" />
                            </div>

                            {/* Hash Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        Hash
                                        <span className="text-[10px] text-muted-foreground ml-1" title="How much RAM the engine can use for transposition tables. More = stronger, but may slow low-end devices.">ⓘ</span>
                                    </label>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Hash: {hash} MB</span>
                                </div>
                                <Slider value={[hash]} onValueChange={([v]) => setHash(v)} min={16} max={1024} step={16} className="w-full" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Multiple Lines</label>
                                    <span className="text-xs text-muted-foreground">{multiPV}</span>
                                </div>
                                <Slider value={[multiPV]} onValueChange={([v]) => setMultiPV(v)} min={1} max={5} step={1} className="w-full" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Search Time</label>
                                    <span className="text-xs text-muted-foreground">{searchTime}s</span>
                                </div>
                                <Slider value={[searchTime]} onValueChange={([v]) => setSearchTime(v)} min={1} max={10} step={1} className="w-full" />
                            </div>

                            {/* Analyze button */}
                            <Button
                                onClick={toggleAnalysis}
                                variant={isRealTimeAnalysis ? "destructive" : "default"}
                                className="w-full"
                                size="lg"
                            >
                                {isRealTimeAnalysis ? (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" /> Stop Analysis
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" /> Analyze Position
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Best Moves</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1.5">
                                {engineLines.slice(0, multiPV).map((line, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-muted/50 rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground font-mono w-4">{i + 1}.</span>
                                            <span className="font-mono font-bold">{line.move.san}</span>
                                        </div>
                                        <span className={line.score > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                            {line.score > 0 ? '+' : ''}{(line.score / 100).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                {engineLines.length === 0 && (
                                    <div className="text-center text-muted-foreground text-xs py-4">Calculating...</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>FEN & PGN</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">FEN</label>
                                <div className="flex gap-2">
                                    <Textarea value={fen} onChange={(e) => setFen(e.target.value)} className="h-[40px] min-h-[40px] text-xs font-mono resize-none" />
                                    <div className="flex flex-col gap-1">
                                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={handleFenImport} title="Load FEN"><Upload className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => copyToClipboard(fen)} title="Copy FEN"><Copy className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">PGN</label>
                                <div className="flex gap-2">
                                    <Textarea value={pgn} onChange={(e) => setPgn(e.target.value)} className="h-[80px] text-xs font-mono resize-none" />
                                    <div className="flex flex-col gap-1">
                                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={handlePgnImport} title="Load PGN"><Upload className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => copyToClipboard(pgn)} title="Copy PGN"><Copy className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="outline" className="h-9 w-9" title="Download PGN"><Download className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
