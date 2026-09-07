// Stockfish.js WASM engine worker
import STOCKFISH from 'stockfish.js';

interface StockfishEngine {
    onmessage: ((event: MessageEvent | string) => void) | null;
    postMessage: (command: string) => void;
}

let engine: StockfishEngine | null = null;
let isReady = false;
const pendingCallbacks: Map<string, (move: string) => void> = new Map();

// Initialize Stockfish engine
function initStockfish() {
    if (!engine) {
        try {
            console.log('[Stockfish] Initializing WASM engine...');
            engine = STOCKFISH();

            if (engine) {
                engine.onmessage = function (event: MessageEvent | string) {
                    const line = typeof event === 'string' ? event : event.data;

                    if (line === 'readyok') {
                        isReady = true;
                    }

                    if (typeof line === 'string' && line.startsWith('bestmove')) {
                        const parts = line.split(' ');
                        const move = parts[1];

                        pendingCallbacks.forEach((callback) => {
                            callback(move);
                        });
                        pendingCallbacks.clear();
                    }
                };

                engine.postMessage('uci');
                engine.postMessage('setoption name UCI_LimitStrength value false');
                engine.postMessage('isready');
            }
        } catch (error) {
            console.error('[Stockfish] Failed to initialize:', error);
            engine = null;
        }
    }
}

function getStockfishConfig(elo: number) {
    let depth: number;
    let skillLevel: number;
    let mistakeChance: number;
    let multiPV: number = 1;

    if (elo < 800) {
        depth = 3;
        skillLevel = 1;
        mistakeChance = 0.30;
        multiPV = 3;
    } else if (elo < 1200) {
        depth = 5;
        skillLevel = 5;
        mistakeChance = 0.20;
        multiPV = 3;
    } else if (elo < 1600) {
        depth = 8;
        skillLevel = 10;
        mistakeChance = 0.10;
        multiPV = 2;
    } else if (elo < 2000) {
        depth = 12;
        skillLevel = 15;
        mistakeChance = 0.05;
        multiPV = 1;
    } else if (elo < 2400) {
        depth = 15;
        skillLevel = 18;
        mistakeChance = 0.02;
        multiPV = 1;
    } else {
        depth = 18;
        skillLevel = 20;
        mistakeChance = 0;
        multiPV = 1;
    }

    return { depth, skillLevel, mistakeChance, multiPV };
}

async function getBestMove(fen: string, elo: number): Promise<{ from: string; to: string; promotion?: string }> {
    initStockfish();

    const config = getStockfishConfig(elo);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Stockfish timeout'));
        }, 5000);

        const callback = (moveUCI: string) => {
            clearTimeout(timeout);

            if (!moveUCI || moveUCI === '(none)') {
                reject(new Error('No move found'));
                return;
            }

            const move = {
                from: moveUCI.substring(0, 2),
                to: moveUCI.substring(2, 4),
                promotion: moveUCI.length > 4 ? moveUCI[4] : undefined,
            };

            resolve(move);
        };

        const callbackId = Math.random().toString();
        pendingCallbacks.set(callbackId, callback);

        const checkReady = setInterval(() => {
            if (isReady && engine) {
                clearInterval(checkReady);
                engine.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
                engine.postMessage(`setoption name MultiPV value ${config.multiPV}`);
                engine.postMessage(`position fen ${fen}`);
                engine.postMessage(`go depth ${config.depth}`);
            }
        }, 30);

        setTimeout(() => clearInterval(checkReady), 5000);
    });
}

async function getBestMoveWithMistakes(fen: string, elo: number): Promise<{ from: string; to: string; promotion?: string }> {
    const config = getStockfishConfig(elo);

    if (Math.random() < config.mistakeChance) {
        const blunderDepth = Math.max(1, config.depth - 3);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Stockfish timeout'));
            }, 3000);

            const callback = (moveUCI: string) => {
                clearTimeout(timeout);

                if (!moveUCI || moveUCI === '(none)') {
                    reject(new Error('No move found'));
                    return;
                }

                const move = {
                    from: moveUCI.substring(0, 2),
                    to: moveUCI.substring(2, 4),
                    promotion: moveUCI.length > 4 ? moveUCI[4] : undefined,
                };

                resolve(move);
            };

            const callbackId = Math.random().toString();
            pendingCallbacks.set(callbackId, callback);

            const checkReady = setInterval(() => {
                if (isReady && engine) {
                    clearInterval(checkReady);
                    engine.postMessage(`setoption name Skill Level value 0`);
                    engine.postMessage(`position fen ${fen}`);
                    engine.postMessage(`go depth ${blunderDepth}`);
                }
            }, 30);

            setTimeout(() => clearInterval(checkReady), 3000);
        });
    }

    return getBestMove(fen, elo);
}

// Worker message listener
addEventListener('message', async (e: MessageEvent) => {
    const { id, action, fen, elo } = e.data || {};

    if (action === 'pick') {
        try {
            const move = await getBestMoveWithMistakes(fen, elo || 1200);
            postMessage({ id, move });
        } catch (error) {
            console.error('[Stockfish Worker] Error:', error);
            postMessage({ id, move: null, error: String(error) });
        }
    }
    else if (action === 'analyze') {
        try {
            const move = await getBestMove(fen, 2400);
            postMessage({ id, move });
        } catch (error) {
            console.error('[Stockfish Worker] Analysis error:', error);
            postMessage({ id, move: null, error: String(error) });
        }
    }
    else if (action === 'suggestions' || action === 'suggest') {
        try {
            initStockfish();

            const depth = elo && elo > 1500 ? 10 : 8;
            interface Suggestion {
                pvNum: number;
                move: { from: string; to: string; promotion?: string };
                score: number;
                cpLoss: number;
                classification: string;
            }

            const suggestions: Suggestion[] = [];
            let analysisComplete = false;

            const getSuggestionsPromise = new Promise<Suggestion[]>((resolve) => {
                const timeout = setTimeout(() => {
                    analysisComplete = true;
                    resolve(suggestions.slice(0, 3));
                }, 3000);

                const originalHandler = engine ? engine.onmessage : null;

                const tempHandler = (event: MessageEvent | string) => {
                    const line = typeof event === 'string' ? event : event.data;

                    if (originalHandler) {
                        originalHandler(event);
                    }

                    if (typeof line === 'string' && line.includes('multipv')) {
                        const moveMatch = line.match(/pv\s+(\S+)/);
                        const scoreMatch = line.match(/score cp\s+(-?\d+)/);
                        const pvMatch = line.match(/multipv\s+(\d+)/);

                        if (moveMatch && scoreMatch && pvMatch) {
                            const moveUCI = moveMatch[1];
                            const score = parseInt(scoreMatch[1]);
                            const pvNum = parseInt(pvMatch[1]);

                            const existingIndex = suggestions.findIndex(s => s.pvNum === pvNum);
                            const suggestion: Suggestion = {
                                pvNum,
                                move: {
                                    from: moveUCI.substring(0, 2),
                                    to: moveUCI.substring(2, 4),
                                    promotion: moveUCI.length > 4 ? moveUCI[4] : undefined,
                                },
                                score,
                                cpLoss: 0,
                                classification: '✓',
                            };

                            if (existingIndex >= 0) {
                                suggestions[existingIndex] = suggestion;
                            } else {
                                suggestions.push(suggestion);
                            }
                        }
                    }

                    if (typeof line === 'string' && line.startsWith('bestmove') && !analysisComplete) {
                        analysisComplete = true;
                        clearTimeout(timeout);

                        if (engine) engine.onmessage = originalHandler;

                        if (suggestions.length > 0) {
                            suggestions.sort((a, b) => b.score - a.score);
                            const bestScore = suggestions[0].score;
                            suggestions.forEach(s => {
                                s.cpLoss = Math.abs(bestScore - s.score);
                                if (s.cpLoss >= 300) s.classification = '??';
                                else if (s.cpLoss >= 100) s.classification = '?';
                                else if (s.cpLoss >= 30) s.classification = '?!';
                            });
                        }

                        resolve(suggestions.slice(0, 3));
                    }
                };

                if (engine) engine.onmessage = tempHandler;

                const checkReady = setInterval(() => {
                    if (isReady && engine) {
                        clearInterval(checkReady);
                        engine.postMessage(`setoption name MultiPV value 3`);
                        engine.postMessage(`position fen ${fen}`);
                        engine.postMessage(`go depth ${depth}`);
                    }
                }, 30);

                setTimeout(() => clearInterval(checkReady), 3000);
            });

            const result = await getSuggestionsPromise;
            postMessage({ id, suggestions: result });

        } catch (error) {
            console.error('[Stockfish Worker] Suggestions error:', error);
            postMessage({ id, suggestions: [] });
        }
    }
});

export { };
