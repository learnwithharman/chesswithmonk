// Stockfish.js WASM engine
// @ts-ignore
import STOCKFISH from 'stockfish.js';

// Stockfish engine instance
let engine: any = null;
let isReady = false;
const pendingCallbacks: Map<string, (move: string) => void> = new Map();

// Initialize Stockfish engine
function initStockfish() {
    if (!engine) {
        try {
            console.log('[Stockfish] Initializing WASM engine...');
            // Initialize Stockfish WASM
            engine = STOCKFISH();
            console.log('[Stockfish] Engine created:', !!engine);

            // Set up message handler
            engine.onmessage = function (event: MessageEvent | string) {
                const line = typeof event === 'string' ? event : event.data;
                console.log('[Stockfish]', line);

                // Engine is ready
                if (line === 'readyok') {
                    isReady = true;
                    console.log('[Stockfish] Engine is ready!');
                }

                // Best move received
                if (line.startsWith('bestmove')) {
                    const parts = line.split(' ');
                    const move = parts[1];
                    console.log('[Stockfish] Best move:', move);

                    // Call all pending callbacks
                    pendingCallbacks.forEach((callback) => {
                        callback(move);
                    });
                    pendingCallbacks.clear();
                }
            };

            // Initialize UCI protocol
            console.log('[Stockfish] Sending UCI commands...');
            engine.postMessage('uci');
            engine.postMessage('setoption name UCI_LimitStrength value false');
            engine.postMessage('isready');
        } catch (error) {
            console.error('[Stockfish] Failed to initialize:', error);
            engine = null;
        }
    }
}

// Get Stockfish configuration based on ELO
function getStockfishConfig(elo: number) {
    let depth: number;
    let skillLevel: number; // 0-20 (Stockfish skill level)
    let mistakeChance: number;
    let multiPV: number = 1; // Number of lines to analyze

    if (elo < 800) {
        depth = 2;
        skillLevel = 1;
        mistakeChance = 0.30; // 30% chance of mistake
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
        depth = 16;
        skillLevel = 18;
        mistakeChance = 0.02;
        multiPV = 1;
    } else {
        depth = 20;
        skillLevel = 20;
        mistakeChance = 0;
        multiPV = 1;
    }

    return { depth, skillLevel, mistakeChance, multiPV };
}

// Get best move from Stockfish
async function getBestMove(fen: string, elo: number): Promise<{ from: string; to: string; promotion?: string }> {
    initStockfish();

    const config = getStockfishConfig(elo);
    console.log('[Stockfish] Getting best move for ELO:', elo, 'Config:', config);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('[Stockfish] Timeout!');
            reject(new Error('Stockfish timeout'));
        }, 15000); // 15 second timeout

        const callback = (moveUCI: string) => {
            clearTimeout(timeout);

            if (!moveUCI || moveUCI === '(none)') {
                reject(new Error('No move found'));
                return;
            }

            // Convert UCI format (e2e4) to Move object
            const move = {
                from: moveUCI.substring(0, 2),
                to: moveUCI.substring(2, 4),
                promotion: moveUCI.length > 4 ? moveUCI[4] : undefined,
            };

            console.log('[Stockfish] Returning move:', move);
            resolve(move);
        };

        const callbackId = Math.random().toString();
        pendingCallbacks.set(callbackId, callback);

        // Wait for engine to be ready
        const checkReady = setInterval(() => {
            if (isReady) {
                clearInterval(checkReady);
                console.log('[Stockfish] Engine ready, sending position...');

                // Set skill level for human-like play
                engine.postMessage(`setoption name Skill Level value ${config.skillLevel}`);

                // Set MultiPV for move variety
                engine.postMessage(`setoption name MultiPV value ${config.multiPV}`);

                // Set position
                engine.postMessage(`position fen ${fen}`);

                // Start analysis
                engine.postMessage(`go depth ${config.depth}`);
            }
        }, 50);

        // Cleanup check interval after timeout
        setTimeout(() => clearInterval(checkReady), 15000);
    });
}

// Add human-like mistakes for low ELO
async function getBestMoveWithMistakes(fen: string, elo: number): Promise<{ from: string; to: string; promotion?: string }> {
    const config = getStockfishConfig(elo);

    // For low ELO, sometimes make a deliberate mistake
    if (Math.random() < config.mistakeChance) {
        console.log('[Stockfish] Making a deliberate mistake for ELO:', elo);
        // Reduce depth significantly for a "blunder"
        const blunderDepth = Math.max(1, config.depth - 3);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Stockfish timeout'));
            }, 10000);

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
                if (isReady) {
                    clearInterval(checkReady);

                    // Very low skill for mistakes
                    engine.postMessage(`setoption name Skill Level value 0`);
                    engine.postMessage(`position fen ${fen}`);
                    engine.postMessage(`go depth ${blunderDepth}`);
                }
            }, 50);

            setTimeout(() => clearInterval(checkReady), 10000);
        });
    }

    // Normal move
    return getBestMove(fen, elo);
}

// Worker message handler
self.onmessage = async (e: MessageEvent) => {
    const { id, action, fen, elo } = e.data;
    console.log('[Stockfish Worker] Received message:', { id, action, elo });

    if (action === 'pick') {
        try {
            const move = await getBestMoveWithMistakes(fen, elo || 1200);
            console.log('[Stockfish Worker] Sending move:', move);
            self.postMessage({ id, move });
        } catch (error) {
            console.error('[Stockfish Worker] Error:', error);
            // Fallback: return null and let the main thread handle it
            self.postMessage({ id, move: null, error: String(error) });
        }
    }
    else if (action === 'analyze') {
        // For analysis mode - deep analysis
        try {
            const move = await getBestMove(fen, 2400); // Always use high depth for analysis
            self.postMessage({ id, move });
        } catch (error) {
            console.error('[Stockfish Worker] Analysis error:', error);
            self.postMessage({ id, move: null, error: String(error) });
        }
    }
    else if (action === 'suggestions' || action === 'suggest') {
        // Get top 3 moves for suggestions
        console.log('[Stockfish Worker] Getting suggestions...');
        try {
            initStockfish();

            const depth = elo && elo > 1500 ? 10 : 8;

            const suggestions: any[] = [];
            let analysisComplete = false;

            // Create a promise that resolves when analysis is complete
            const getSuggestions = new Promise<any[]>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    analysisComplete = true;
                    console.log('[Stockfish Worker] Suggestions timeout, returning:', suggestions.length);
                    resolve(suggestions.slice(0, 3));
                }, 10000); // 10 second timeout

                // Store original handler
                const originalHandler = engine.onmessage;

                // Temporary handler for collecting suggestions
                const tempHandler = (event: MessageEvent | string) => {
                    const line = typeof event === 'string' ? event : event.data;

                    // Call original handler first
                    if (originalHandler) {
                        originalHandler(event);
                    }

                    // Parse MultiPV lines
                    if (line.includes('multipv')) {
                        const moveMatch = line.match(/pv\s+(\S+)/);
                        const scoreMatch = line.match(/score cp\s+(-?\d+)/);
                        const pvMatch = line.match(/multipv\s+(\d+)/);

                        if (moveMatch && scoreMatch && pvMatch) {
                            const moveUCI = moveMatch[1];
                            const score = parseInt(scoreMatch[1]);
                            const pvNum = parseInt(pvMatch[1]);

                            // Update or add suggestion
                            const existingIndex = suggestions.findIndex(s => s.pvNum === pvNum);
                            const suggestion = {
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
                            console.log('[Stockfish Worker] Found suggestion:', suggestion);
                        }
                    }

                    // Analysis complete
                    if (line.startsWith('bestmove') && !analysisComplete) {
                        analysisComplete = true;
                        clearTimeout(timeout);

                        // Restore original handler
                        engine.onmessage = originalHandler;

                        // Calculate cpLoss
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

                        console.log('[Stockfish Worker] Suggestions complete:', suggestions.length);
                        resolve(suggestions.slice(0, 3));
                    }
                };

                // Set temporary handler
                engine.onmessage = tempHandler;

                // Wait for ready and start analysis
                const checkReady = setInterval(() => {
                    if (isReady) {
                        clearInterval(checkReady);
                        console.log('[Stockfish Worker] Starting MultiPV analysis...');

                        engine.postMessage(`setoption name MultiPV value 3`);
                        engine.postMessage(`position fen ${fen}`);
                        engine.postMessage(`go depth ${depth}`);
                    }
                }, 50);

                setTimeout(() => clearInterval(checkReady), 10000);
            });

            const result = await getSuggestions;
            console.log('[Stockfish Worker] Sending suggestions:', result);
            self.postMessage({ id, suggestions: result });

        } catch (error) {
            console.error('[Stockfish Worker] Suggestions error:', error);
            self.postMessage({ id, suggestions: [] });
        }
    }
};

export { };
