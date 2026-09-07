// Stockfish engine worker - High performance WASM engine integration
// Optimized for fast responsive play without blocking delays

let stockfish: Worker | null = null;
let isReady = false;

type Difficulty = 'beginner' | 'novice' | 'intermediate' | 'advanced';

interface StockfishConfig {
    depth: number;
    skillLevel: number;
    moveTime: number;
}

interface SuggestionItem {
    pvNum: number;
    move: {
        from: string;
        to: string;
        promotion?: string;
    };
    score: number;
    cpLoss: number;
    classification: string;
    depth: number;
    uciMove: string;
    mate: number | null;
}

function getDifficultyConfig(difficulty: Difficulty): StockfishConfig {
    switch (difficulty) {
        case 'beginner':
            return { depth: 6, skillLevel: 4, moveTime: 150 };
        case 'novice':
            return { depth: 9, skillLevel: 9, moveTime: 250 };
        case 'intermediate':
            return { depth: 12, skillLevel: 14, moveTime: 350 };
        case 'advanced':
            return { depth: 16, skillLevel: 20, moveTime: 500 };
    }
}

// Initialize Stockfish worker instance
function initStockfish() {
    if (stockfish) return;

    try {
        console.log('[Stockfish Worker] Initializing Stockfish 17.1...');
        stockfish = new Worker('/stockfish/stockfish.js/src/stockfish-17.1-lite-single-03e3232.js');

        stockfish.onmessage = (event) => {
            const message = event.data;
            if (message === 'readyok') {
                isReady = true;
                console.log('[Stockfish Worker] ✅ Engine ready!');
            }
        };

        stockfish.onerror = (error) => {
            console.error('[Stockfish Worker] ❌ Engine error:', error);
            stockfish = null;
            isReady = false;
        };

        // Initialize UCI protocol
        stockfish.postMessage('uci');
        stockfish.postMessage('isready');

    } catch (error) {
        console.error('[Stockfish Worker] ❌ Failed to initialize:', error);
        stockfish = null;
    }
}

// Get best move with strict time capping for instant responsiveness
async function getBestMove(fen: string, difficulty: Difficulty): Promise<{ from: string; to: string; promotion?: string }> {
    initStockfish();

    if (!stockfish) {
        throw new Error('Stockfish not initialized');
    }

    const config = getDifficultyConfig(difficulty);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('[Stockfish Worker] ❌ Timeout waiting for best move');
            reject(new Error('Timeout'));
        }, config.moveTime + 1500);

        let bestMove = '';

        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (typeof message === 'string' && message.startsWith('bestmove')) {
                const parts = message.split(' ');
                bestMove = parts[1];

                stockfish!.removeEventListener('message', messageHandler);
                clearTimeout(timeout);

                if (!bestMove || bestMove === '(none)') {
                    reject(new Error('No move found'));
                    return;
                }

                const move = {
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: bestMove.length > 4 ? bestMove[4] : undefined,
                };

                resolve(move);
            }
        };

        // Wait for engine readiness and dispatch UCI search
        const checkReady = setInterval(() => {
            if (isReady && stockfish) {
                clearInterval(checkReady);

                stockfish.addEventListener('message', messageHandler);
                stockfish.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`go depth ${config.depth} movetime ${config.moveTime}`);
            }
        }, 20);

        setTimeout(() => clearInterval(checkReady), config.moveTime + 1500);
    });
}

// Get top N move suggestions
async function getSuggestions(
    fen: string,
    difficulty: Difficulty,
    multiPV: number = 3,
    depth?: number,
    threads: number = 1,
    hash: number = 64
): Promise<SuggestionItem[]> {
    initStockfish();

    if (!stockfish) {
        console.error('[Stockfish Worker] ❌ Stockfish not available');
        return [];
    }

    const config = getDifficultyConfig(difficulty);
    const suggestionDepth = depth || (difficulty === 'beginner' ? 5 :
        difficulty === 'novice' ? 8 :
            difficulty === 'intermediate' ? 12 : 15);

    return new Promise((resolve) => {
        const suggestions: SuggestionItem[] = [];
        let currentDepth = 0;
        let mateDetected: number | null = null;

        const timeout = setTimeout(() => {
            resolve(suggestions.slice(0, multiPV));
        }, config.moveTime + 500);

        const messageHandler = (event: MessageEvent) => {
            const message = event.data;
            if (typeof message !== 'string') return;

            // Parse depth
            const depthMatch = message.match(/depth\s+(\d+)/);
            if (depthMatch) {
                currentDepth = parseInt(depthMatch[1]);
            }

            // Parse mate score
            const mateMatch = message.match(/score mate\s+(-?\d+)/);
            if (mateMatch) {
                mateDetected = parseInt(mateMatch[1]);
            }

            // Parse MultiPV lines
            if (message.includes('multipv') && message.includes('pv')) {
                const pvMatch = message.match(/multipv\s+(\d+)/);
                const scoreMatch = message.match(/score cp\s+(-?\d+)/);
                const pvMovesMatch = message.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?(?:\s+[a-h][1-8][a-h][1-8][qrbn]?)*)/);

                if (pvMatch && (scoreMatch || mateMatch) && pvMovesMatch) {
                    const pvNum = parseInt(pvMatch[1]);
                    const score = scoreMatch ? parseInt(scoreMatch[1]) : (mateDetected! > 0 ? 100000 : -100000);
                    const moves = pvMovesMatch[1].split(' ');
                    const firstMove = moves[0];

                    if (firstMove && firstMove.length >= 4) {
                        const existingIndex = suggestions.findIndex(s => s.pvNum === pvNum);
                        const suggestion: SuggestionItem = {
                            pvNum,
                            move: {
                                from: firstMove.substring(0, 2),
                                to: firstMove.substring(2, 4),
                                promotion: firstMove.length > 4 ? firstMove[4] : undefined,
                            },
                            score,
                            cpLoss: 0,
                            classification: '✓',
                            depth: currentDepth,
                            uciMove: firstMove,
                            mate: mateDetected,
                        };

                        if (existingIndex >= 0) {
                            if (currentDepth >= suggestions[existingIndex].depth) {
                                suggestions[existingIndex] = suggestion;
                            }
                        } else {
                            suggestions.push(suggestion);
                        }
                    }
                }
            }

            // Analysis complete
            if (message.startsWith('bestmove')) {
                clearTimeout(timeout);
                stockfish!.removeEventListener('message', messageHandler);

                if (suggestions.length > 0) {
                    suggestions.sort((a, b) => b.score - a.score);
                    const bestScore = suggestions[0].score;

                    suggestions.forEach(s => {
                        s.cpLoss = Math.abs(bestScore - s.score);
                        if (s.cpLoss >= 300) s.classification = '??';
                        else if (s.cpLoss >= 100) s.classification = '?';
                        else if (s.cpLoss >= 30) s.classification = '?!';
                        else s.classification = '✓';
                    });
                }

                resolve(suggestions.slice(0, multiPV));
            }
        };

        const checkReady = setInterval(() => {
            if (isReady && stockfish) {
                clearInterval(checkReady);

                stockfish.addEventListener('message', messageHandler);
                stockfish.postMessage(`setoption name Threads value ${threads}`);
                stockfish.postMessage(`setoption name Hash value ${hash}`);
                stockfish.postMessage(`setoption name MultiPV value ${multiPV}`);
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`go depth ${suggestionDepth} movetime ${config.moveTime}`);
            }
        }, 20);

        setTimeout(() => clearInterval(checkReady), config.moveTime + 500);
    });
}

// Worker message handler
self.onmessage = async (e: MessageEvent) => {
    const { id, action, fen, difficulty } = e.data;

    try {
        if (action === 'pick') {
            const move = await getBestMove(fen, difficulty || 'novice');
            self.postMessage({ id, move });
        }
        else if (action === 'suggestions' || action === 'suggest') {
            const { multiPV = 3, depth, threads = 1, hash = 64 } = e.data;
            const suggestions = await getSuggestions(fen, difficulty || 'novice', multiPV, depth, threads, hash);
            self.postMessage({ id, suggestions });
        }
        else if (action === 'analyze') {
            const move = await getBestMove(fen, 'advanced');
            self.postMessage({ id, move });
        }
    } catch (error) {
        console.error('[Stockfish Worker] ❌ Error:', error);
        self.postMessage({
            id,
            move: null,
            suggestions: [],
            error: String(error)
        });
    }
};

export { };
