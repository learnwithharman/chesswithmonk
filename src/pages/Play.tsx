import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { Controls } from '@/components/Controls';
import { SuggestionPanel } from '@/components/SuggestionPanel';
import { PGNEditor } from '@/components/PGNEditor';
import { Move, Suggestion, Difficulty } from '@/lib/types';
import { getSuggestions } from '@/lib/humanPicker';
// Stockfish engine worker for realistic chess play
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AiWorker = typeof window !== 'undefined' ? new Worker(new URL('../lib/stockfish-engine.worker.ts', import.meta.url), { type: 'module' }) : null;
console.log('[Play] AiWorker created:', AiWorker ? 'YES' : 'NO');
import { useToast } from '@/hooks/use-toast';
import AiOverlay from '@/components/AiOverlay';
import EndGameBanner from '@/components/EndGameBanner';
import PromotionModal from '@/components/PromotionModal';
import { identifyOpening, loadEcoTheory } from '@/lib/openingEngine';

const Play = () => {
    const [game, setGame] = useState(() => {
        const g = new Chess();
        g.header('Site', 'Chesswithmonk.com');
        g.header('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
        return g;
    });
    const [position, setPosition] = useState(game.fen());
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [historyStack, setHistoryStack] = useState<string[]>([game.fen()]);
    const [difficulty, setDifficulty] = useState<Difficulty>('novice');
    const [flipped, setFlipped] = useState(false);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [gameResult, setGameResult] = useState<'white' | 'black' | 'draw' | null>(null);
    const { toast } = useToast();
    const [pendingPromotionMove, setPendingPromotionMove] = useState<Move | null>(null);
    const [openingName, setOpeningName] = useState<string | null>("Starting Position");

    const [ecoCode, setEcoCode] = useState<string | null>(null);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');

    useEffect(() => {
        loadEcoTheory();
    }, []);

    useEffect(() => {
        const match = identifyOpening(position);
        if (match) {
            setOpeningName(match.opening_name);
            setEcoCode(match.eco_code);
        }
    }, [position]);

    // Autoplay Effect
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Only autoplay if it's NOT the player's turn
        const isOpponentTurn = game.turn() !== playerColor;

        if (isAutoplay && isOpponentTurn && !game.isGameOver() && !pendingPromotionMove && !isAiThinking) {
            // Small delay to make it look natural
            timeoutId = setTimeout(() => {
                handleAiMove();
            }, 1000);
        } else if (game.isGameOver() || pendingPromotionMove) {
            setIsAutoplay(false);
        }

        return () => clearTimeout(timeoutId);
    }, [isAutoplay, game, pendingPromotionMove, isAiThinking, currentMoveIndex, playerColor]);

    // Load saved game from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('chess-game');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                game.load(data.fen);
                setPosition(data.fen);
                setMoveHistory(data.moves || []);
                setHistoryStack(data.history || [game.fen()]);
                setCurrentMoveIndex(data.moves?.length - 1 || -1);
            } catch (e) {
                console.error('Failed to load saved game');
            }
        }
    }, []);

    // Save game to localStorage
    useEffect(() => {
        const data = {
            fen: position,
            moves: moveHistory,
            history: historyStack,
        };
        localStorage.setItem('chess-game', JSON.stringify(data));
    }, [position, moveHistory, historyStack]);

    // Update suggestions when position changes
    useEffect(() => {
        if (showSuggestions && !game.isGameOver()) {
            setIsSuggesting(true);
            if (AiWorker) {
                // Use worker to get suggestions with depth based on difficulty
                const id = String(Math.random());
                const onMessage = (ev: MessageEvent) => {
                    if (ev.data?.id !== id) return;
                    AiWorker.removeEventListener('message', onMessage as any);
                    clearTimeout(timeout);
                    setIsSuggesting(false);

                    console.log('[Play] Received suggestions:', ev.data.suggestions);

                    if (ev.data.suggestions && Array.isArray(ev.data.suggestions)) {
                        // Add SAN to suggestions using chess.js
                        const suggestionsWithSan = ev.data.suggestions.map((s: any) => {
                            try {
                                const tempChess = new Chess(game.fen());
                                const move = tempChess.move({
                                    from: s.move.from,
                                    to: s.move.to,
                                    promotion: s.move.promotion || 'q',
                                });
                                if (move) {
                                    console.log('[Play] Converted move:', s.move, '→', move.san);
                                    return { ...s, move: { ...s.move, san: move.san } };
                                }
                                console.warn('[Play] Move conversion failed:', s.move);
                                return s;
                            } catch (e) {
                                console.error('[Play] Error converting move:', s.move, e);
                                return s;
                            }
                        });
                        console.log('[Play] Setting suggestions with SAN:', suggestionsWithSan);
                        setSuggestions(suggestionsWithSan);
                    }
                };
                // Safety timeout
                const timeout = setTimeout(() => {
                    AiWorker.removeEventListener('message', onMessage as any);
                    setIsSuggesting(false);
                    console.error('[Play] Suggestions worker timed out');
                }, 10000);

                AiWorker.addEventListener('message', onMessage as any);
                AiWorker.postMessage({ id, action: 'suggestions', fen: position, difficulty });
            }
        }
    }, [position, showSuggestions, difficulty, game]);



    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case '.':
                    setShowSuggestions(prev => !prev);
                    break;
                case 'u':
                    handleUndo();
                    break;
                case 'r':
                    handleRedo();
                    break;
                case 'f':
                    setFlipped(prev => !prev);
                    break;
                case ' ':
                    e.preventDefault();
                    // Block AI move if promotion is pending
                    if (!pendingPromotionMove) {
                        handleAiMove();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentMoveIndex, historyStack, pendingPromotionMove]);

    const commitMove = (move: Move) => {
        try {
            const result = game.move({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
            });

            if (result) {
                const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), result.san];
                const newHistoryStack = [...historyStack.slice(0, currentMoveIndex + 2), game.fen()];

                setMoveHistory(newHistory);
                setHistoryStack(newHistoryStack);
                setCurrentMoveIndex(newHistory.length - 1);
                setPosition(game.fen());
                setLastMove(move);

                if (game.isGameOver()) {
                    let message = 'Game Over!';
                    if (game.isCheckmate()) message = 'Checkmate!';
                    else if (game.isDraw()) message = 'Draw!';

                    // determine winner
                    if (game.isCheckmate()) {
                        // winner is opposite of the side to move
                        const loser = game.turn();
                        setGameResult(loser === 'w' ? 'black' : 'white');
                    } else if (game.isDraw()) {
                        setGameResult('draw');
                    }

                    toast({ title: message });
                }
            }
        } catch (e) {
            toast({
                title: 'Invalid Move',
                variant: 'destructive',
            });
        }
    };

    const handleMove = (move: Move) => {
        // Block any moves if promotion is pending
        if (pendingPromotionMove) return;

        // Detect pawn promotion: if moving piece is a pawn and destination rank is 8 or 1,
        // prompt the user to choose promotion piece.
        try {
            const movingPiece = game.get(move.from as any);
            if (movingPiece?.type === 'p' && (move.to[1] === '8' || move.to[1] === '1')) {
                // store pending move and show promotion chooser
                setPendingPromotionMove(move);
                return;
            }

            // otherwise commit directly
            commitMove(move);
        } catch (e) {
            toast({ title: 'Invalid Move', variant: 'destructive' });
        }
    };

    const handleAiMove = () => {
        // Block if game is over or promotion is pending
        if (game.isGameOver() || pendingPromotionMove) return;
        setIsAiThinking(true);

        // If worker available, ask it to compute the move and return it via message
        if (AiWorker) {
            const id = String(Math.random());
            const onMessage = (ev: MessageEvent) => {
                if (ev.data?.id !== id) return;
                AiWorker.removeEventListener('message', onMessage as any);
                clearTimeout(timeout);
                setIsAiThinking(false);
                if (ev.data.move) {
                    handleMove(ev.data.move);
                }
            };
            // Safety timeout in case worker doesn't respond
            const timeout = setTimeout(() => {
                AiWorker.removeEventListener('message', onMessage as any);
                setIsAiThinking(false);
                console.error('AI worker timed out');
            }, 15000);

            AiWorker.addEventListener('message', onMessage as any);
            AiWorker.postMessage({ id, action: 'pick', fen: position, difficulty });
        } else {
            // Fallback to synchronous computation
            // Convert difficulty to approximate ELO for fallback
            const eloMap: Record<Difficulty, number> = { beginner: 800, novice: 1200, intermediate: 1600, advanced: 2000 };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            import('@/lib/humanPicker').then(({ pickHumanMove }) => {
                try {
                    const move = pickHumanMove(game, eloMap[difficulty]);
                    if (move) handleMove(move);
                } catch (err) {
                    console.error('Failed to compute AI move', err);
                }
            }).catch(err => {
                console.error('Failed to compute AI move', err);
            }).finally(() => setIsAiThinking(false));
        }
    };

    const handleNewGame = () => {
        game.reset();
        setPosition(game.fen());
        setMoveHistory([]);
        setHistoryStack([game.fen()]);
        setCurrentMoveIndex(-1);
        setLastMove(null);
        setSuggestions([]);
        setGameResult(null); // Reset game result to hide popup
        setIsAutoplay(false);
        // If player chose black, flip board automatically
        if (playerColor === 'b') {
            setFlipped(true);
            // If player is black, AI (White) should move first if autoplay is on.
            // But usually new game starts with autoplay off.
            // If we want to support "Play as Black" immediately, we might need to trigger AI move if it's white's turn.
        } else {
            setFlipped(false);
        }
        toast({ title: 'New Game Started' });
    };

    // Effect to trigger AI move if player is Black and it's a new game (White's turn)
    // and Autoplay is ON. Or maybe just if player is Black, we want AI to move?
    // The user said "if i selected white autoplay will be used for blackside".
    // So if I select Black, Autoplay should be used for White side.
    // If I start a new game as Black, and Autoplay is ON, White should move.

    // Let's ensure board flip matches player color when color changes
    useEffect(() => {
        setFlipped(playerColor === 'b');
    }, [playerColor]);

    const handleUndo = () => {
        if (currentMoveIndex >= 0) {
            game.load(historyStack[currentMoveIndex]);
            setCurrentMoveIndex(currentMoveIndex - 1);
            setPosition(historyStack[currentMoveIndex]);
            setLastMove(null);
        }
    };

    const handleRedo = () => {
        if (currentMoveIndex < historyStack.length - 2) {
            const newIndex = currentMoveIndex + 1;
            game.load(historyStack[newIndex + 1]);
            setCurrentMoveIndex(newIndex);
            setPosition(historyStack[newIndex + 1]);
        }
    };

    const handleMoveClick = (index: number) => {
        game.load(historyStack[index + 1]);
        setCurrentMoveIndex(index);
        setPosition(historyStack[index + 1]);
    };


    const getPGNWithHeaders = () => {
        // Set all required PGN headers
        game.header('Event', '?');
        game.header('Site', 'ChessWithMonk');
        game.header('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
        game.header('Round', '?');
        game.header('White', '?');
        game.header('Black', '?');

        // Set result based on game state
        let result = '*';
        if (gameResult === 'white') result = '1-0';
        else if (gameResult === 'black') result = '0-1';
        else if (gameResult === 'draw') result = '1/2-1/2';
        game.header('Result', result);

        return game.pgn();
    };

    const handlePGNImport = (pgn: string) => {
        try {
            game.loadPgn(pgn);
            const history = game.history();
            game.reset();

            const newHistory: string[] = [];
            const newHistoryStack: string[] = [game.fen()];

            history.forEach(move => {
                game.move(move);
                newHistory.push(move);
                newHistoryStack.push(game.fen());
            });

            setMoveHistory(newHistory);
            setHistoryStack(newHistoryStack);
            setCurrentMoveIndex(newHistory.length - 1);
            setPosition(game.fen());
            setLastMove(null);
        } catch (e) {
            throw new Error('Invalid PGN');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <AiOverlay visible={isAiThinking} text="AI is thinking..." />
            <PromotionModal
                visible={!!pendingPromotionMove}
                color={
                    pendingPromotionMove ? (game.get(pendingPromotionMove.from as any)?.color as 'w' | 'b') : 'w'
                }
                onSelect={(piece) => {
                    if (!pendingPromotionMove) return;
                    const promoted = { ...pendingPromotionMove, promotion: piece } as Move;
                    setPendingPromotionMove(null);
                    commitMove(promoted);
                }}
                onCancel={() => setPendingPromotionMove(null)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] gap-6 max-w-[1800px] mx-auto">
                {/* Left Column - Move History & Suggestions */}
                <div className="hidden lg:flex lg:flex-col h-[calc(100vh-200px)]">
                    <div className="flex-1 min-h-0">
                        <MoveList
                            moves={moveHistory}
                            currentMoveIndex={currentMoveIndex}
                            onMoveClick={handleMoveClick}
                        />
                    </div>

                    {/* Opening Title Panel moved here */}
                    <div className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border border-border text-center shrink-0 my-2">
                        <h2 className="text-lg font-semibold text-foreground">
                            {ecoCode && <span className="text-primary mr-2 font-mono text-sm">{ecoCode}</span>}
                            <span className="text-base">{openingName || "Unknown Opening"}</span>
                        </h2>
                    </div>

                    <div className="h-px bg-border my-2 shrink-0"></div>
                    <div className="h-[320px] shrink-0 min-h-0">
                        <SuggestionPanel
                            suggestions={suggestions}
                            visible={showSuggestions}
                        />
                    </div>
                </div>

                {/* Center Column - Board */}
                <div className="space-y-4">
                    <div className="w-full flex items-center justify-center">
                        <div className="max-w-full max-h-[80vh] aspect-square relative">
                            <EndGameBanner visible={!!gameResult} winner={gameResult} onRestart={handleNewGame} />
                            <ChessBoard
                                chess={game}
                                onMove={handleMove}
                                flipped={flipped}
                                lastMove={lastMove}
                                suggestions={suggestions}
                                showSuggestions={showSuggestions}
                            />
                        </div>
                    </div>

                    {/* Mobile: Move History below board */}
                    <div className="lg:hidden">
                        <MoveList
                            moves={moveHistory}
                            currentMoveIndex={currentMoveIndex}
                            onMoveClick={handleMoveClick}
                        />
                    </div>

                    <div className="lg:hidden space-y-4">
                        <Controls
                            difficulty={difficulty}
                            onDifficultyChange={setDifficulty}
                            onNewGame={handleNewGame}
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            onFlip={() => setFlipped(!flipped)}
                            onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
                            onAiMove={handleAiMove}
                            isAiThinking={isAiThinking}
                            showSuggestions={showSuggestions}
                            canUndo={currentMoveIndex >= 0}
                            canRedo={currentMoveIndex < historyStack.length - 2}
                            isAutoplay={isAutoplay}
                            onToggleAutoplay={() => setIsAutoplay(!isAutoplay)}
                            playerColor={playerColor}
                            onPlayerColorChange={setPlayerColor}
                        />
                    </div>

                    <PGNEditor
                        pgn={getPGNWithHeaders()}
                        onImport={handlePGNImport}
                    />
                </div>

                {/* Right Column - Controls */}
                <div className="hidden lg:block">
                    <Controls
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        onNewGame={handleNewGame}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onFlip={() => setFlipped(!flipped)}
                        onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
                        onAiMove={handleAiMove}
                        isAiThinking={isAiThinking}
                        showSuggestions={showSuggestions}
                        canUndo={currentMoveIndex >= 0}
                        canRedo={currentMoveIndex < historyStack.length - 2}
                        isAutoplay={isAutoplay}
                        onToggleAutoplay={() => setIsAutoplay(!isAutoplay)}
                        playerColor={playerColor}
                        onPlayerColorChange={setPlayerColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default Play;
