import { Chess } from 'chess.js';

// Simple evaluation function (Material + Position)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

const evaluate = (fen: string): number => {
  const chess = new Chess(fen);
  let score = 0;

  const board = chess.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        // Add positional bonus (simplified: just pawns for now)
        if (piece.type === 'p') {
          // const rank = piece.color === 'w' ? (7 - i) : i;
          // const file = j;
          // value += PAWN_PST[pstIndex] || 0; 
        }
        score += piece.color === 'w' ? value : -value;
      }
    }
  }

  // Return score from White's perspective
  return score;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluate(game.fen());
  }

  const moves = game.moves();

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const getBestMove = (fen: string, depth: number = 2): { from: string; to: string; promotion?: string } | null => {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true }); // Get verbose moves with from/to
  let bestMove = null;
  let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, game.turn() === 'w'); // Next turn is opponent
    game.undo();

    if (game.turn() === 'w') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  // Return Move object with from, to, promotion
  if (bestMove) {
    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion,
    };
  }
  return null;
};

// Helper for suggestions
const getSuggestions = (fen: string, elo: number) => {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return [];

  let depth = 2;
  if (elo > 1200) depth = 3;
  // Limit depth to 3 for suggestions to keep it fast enough for real-time feedback

  const moveEvaluations: { move: any; score: number }[] = [];
  const isWhite = chess.turn() === 'w';

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
    chess.undo();
    moveEvaluations.push({ move, score: isWhite ? score : -score });
  }

  // Sort by score (best first)
  moveEvaluations.sort((a, b) => b.score - a.score);
  const bestScore = moveEvaluations[0].score;

  return moveEvaluations.slice(0, 3).map(evaluation => {
    const cpLoss = Math.abs(bestScore - evaluation.score);
    let classification = '✓';
    if (cpLoss >= 300) classification = '??';
    else if (cpLoss >= 100) classification = '?';
    else if (cpLoss >= 30) classification = '?!';

    return {
      move: {
        from: evaluation.move.from,
        to: evaluation.move.to,
        promotion: evaluation.move.promotion,
        san: evaluation.move.san,
      },
      score: evaluation.score,
      cpLoss,
      classification,
    };
  });
};

self.onmessage = (e: MessageEvent) => {
  const { id, action, fen, elo } = e.data;

  if (action === 'pick') {
    // Adjust depth based on ELO
    let depth = 2;
    if (elo > 1500) depth = 3;
    if (elo > 2000) depth = 4;

    // Add some randomness for lower ELO
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }); // Get verbose moves

    if (moves.length === 0) {
      self.postMessage({ id, move: null });
      return;
    }

    // Random move for very low ELO
    if (elo < 800 && Math.random() < 0.5) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      self.postMessage({
        id,
        move: {
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion,
        }
      });
      return;
    }

    const bestMove = getBestMove(fen, depth);
    if (bestMove) {
      self.postMessage({ id, move: bestMove });
    } else {
      // Fallback to first move
      self.postMessage({
        id,
        move: {
          from: moves[0].from,
          to: moves[0].to,
          promotion: moves[0].promotion,
        }
      });
    }
  }
  else if (action === 'evaluate') {
    const score = evaluate(fen);
    self.postMessage({ id, score });
  }
  else if (action === 'suggestions' || action === 'suggest') {
    const suggestions = getSuggestions(fen, elo || 1200);
    self.postMessage({ id, suggestions });
  }
};
