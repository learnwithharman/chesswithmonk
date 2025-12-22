// Stockfish engine worker - Completely rewritten for reliable move suggestions
// Uses Stockfish 17.1 WASM engine

let stockfish: Worker | null = null;
let isReady = false;
let currentAnalysis: { resolve: (value: any) => void; reject: (error: any) => void; timeout: NodeJS.Timeout } | null = null;

type Difficulty = 'beginner' | 'novice' | 'intermediate' | 'advanced';

interface StockfishConfig {
    depth: number;
    skillLevel: number;
    moveTime: number;
}

function getDifficultyConfig(difficulty: Difficulty): StockfishConfig {
    switch (difficulty) {
        case 'beginner':
            return { depth: 5, skillLevel: 5, moveTime: 1000 };
        case 'novice':
            return { depth: 10, skillLevel: 10, moveTime: 2000 };
        case 'intermediate':
            return { depth: 15, skillLevel: 15, moveTime: 5000 };
        case 'advanced':
            return { depth: 20, skillLevel: 20, moveTime: 10000 };
    }
}

// Initialize Stockfish
function initStockfish() {
    if (stockfish) return;

    try {
        console.log('[Stockfish Worker] Initializing Stockfish 17.1...');
        stockfish = new Worker('/stockfish/stockfish.js/src/stockfish-17.1-lite-single-03e3232.js');

        stockfish.onmessage = (event) => {
            const message = event.data;
            console.log('[Stockfish]', message);

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

// Get best move
async function getBestMove(fen: string, difficulty: Difficulty): Promise<{ from: string; to: string; promotion?: string }> {
    initStockfish();

    if (!stockfish) {
        throw new Error('Stockfish not initialized');
    }

    const config = getDifficultyConfig(difficulty);
    console.log('[Stockfish Worker] Getting best move with config:', config);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('[Stockfish Worker] ❌ Timeout waiting for best move');
            reject(new Error('Timeout'));
        }, config.moveTime + 5000);

        let bestMove = '';

        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (message.startsWith('bestmove')) {
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

                console.log('[Stockfish Worker] ✅ Best move:', bestMove, '→', move);
                resolve(move);
            }
        };

        // Wait for engine to be ready
        const checkReady = setInterval(() => {
            if (isReady && stockfish) {
                clearInterval(checkReady);

                stockfish.addEventListener('message', messageHandler);
                stockfish.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`go depth ${config.depth}`);
            }
        }, 50);

        setTimeout(() => clearInterval(checkReady), config.moveTime + 5000);
    });
}

// Get top N move suggestions
async function getSuggestions(fen: string, difficulty: Difficulty, multiPV: number = 3, depth?: number, threads: number = 1, hash: number = 64): Promise<any[]> {
    initStockfish();

    if (!stockfish) {
        console.error('[Stockfish Worker] ❌ Stockfish not available');
        return [];
    }

    const config = getDifficultyConfig(difficulty);
    const suggestionDepth = depth || (difficulty === 'beginner' ? 5 :
        difficulty === 'novice' ? 10 :
            difficulty === 'intermediate' ? 15 : 18);

    console.log('[Stockfish Worker] Getting suggestions - depth:', suggestionDepth, 'difficulty:', difficulty, 'threads:', threads, 'hash:', hash);

    return new Promise((resolve) => {
        const suggestions: any[] = [];
        let currentDepth = 0;
        let mateDetected: number | null = null;

        const timeout = setTimeout(() => {
            console.log('[Stockfish Worker] ⏱️ Timeout, returning', suggestions.length, 'suggestions');
            resolve(suggestions.slice(0, multiPV));
        }, config.moveTime);

        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            // Parse depth
            const depthMatch = message.match(/depth\s+(\d+)/);
            if (depthMatch) {
                currentDepth = parseInt(depthMatch[1]);
            }

            // Parse mate score - format: "score mate 5" or "score mate -3"
            const mateMatch = message.match(/score mate\s+(-?\d+)/);
            if (mateMatch) {
                mateDetected = parseInt(mateMatch[1]);
            }

            // Parse MultiPV lines - format: "info depth 10 multipv 1 score cp 25 pv e2e4 e7e5"
            if (message.includes('multipv') && message.includes('pv')) {
                const pvMatch = message.match(/multipv\s+(\d+)/);
                const scoreMatch = message.match(/score cp\s+(-?\d+)/);
                const pvMovesMatch = message.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?(?:\s+[a-h][1-8][a-h][1-8][qrbn]?)*)/);

                if (pvMatch && (scoreMatch || mateMatch) && pvMovesMatch) {
                    const pvNum = parseInt(pvMatch[1]);
                    const score = scoreMatch ? parseInt(scoreMatch[1]) : (mateDetected! > 0 ? 100000 : -100000);
                    const moves = pvMovesMatch[1].split(' ');
                    const firstMove = moves[0]; // Get the first move in UCI format (e.g., "e2e4")

                    console.log('[Stockfish Worker] 📊 Parsed line PV', pvNum, ':', firstMove, 'score:', score, 'depth:', currentDepth);

                    if (firstMove && firstMove.length >= 4) {
                        const existingIndex = suggestions.findIndex(s => s.pvNum === pvNum);
                        const suggestion = {
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
                            // Only update if depth is higher
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

                // Calculate cpLoss and classifications
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

                console.log('[Stockfish Worker] ✅ Analysis complete. Suggestions:', suggestions.length);
                resolve(suggestions.slice(0, multiPV));
            }
        };

        // Wait for engine to be ready
        const checkReady = setInterval(() => {
            if (isReady && stockfish) {
                clearInterval(checkReady);

                stockfish.addEventListener('message', messageHandler);
                stockfish.postMessage(`setoption name Threads value ${threads}`);
                stockfish.postMessage(`setoption name Hash value ${hash}`);
                stockfish.postMessage(`setoption name MultiPV value ${multiPV}`);
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`go depth ${suggestionDepth}`);
            }
        }, 50);

        setTimeout(() => clearInterval(checkReady), config.moveTime);
    });
}

// Worker message handler
self.onmessage = async (e: MessageEvent) => {
    const { id, action, fen, difficulty } = e.data;
    console.log('[Stockfish Worker] 📥 Received:', action, 'difficulty:', difficulty);

    try {
        if (action === 'pick') {
            const move = await getBestMove(fen, difficulty || 'novice');
            console.log('[Stockfish Worker] 📤 Sending best move:', move);
            self.postMessage({ id, move });
        }
        else if (action === 'suggestions' || action === 'suggest') {
            const { multiPV = 3, depth, threads = 1, hash = 64 } = e.data;
            const suggestions = await getSuggestions(fen, difficulty || 'novice', multiPV, depth, threads, hash);
            console.log('[Stockfish Worker] 📤 Sending', suggestions.length, 'suggestions');
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
