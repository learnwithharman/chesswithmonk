/**
 * Move Classifier - Intelligent move quality analysis
 * Classifies moves based on STRICT evaluation delta from the player's perspective,
 * enhanced with positional context (Winning/Losing state, Game Phase, etc.)
 */

import { Chess, Move } from 'chess.js';
import { MoveQualityLabel, PVLine as TypesPVLine, MoveQuality as TypesMoveQuality } from './types';

// Reexport types for convenience
export type PVLine = TypesPVLine;
export type MoveQuality = TypesMoveQuality;

export interface MoveClassificationParams {
    playedMove: Move;
    engineLines: PVLine[];
    evaluationBefore: number; // Side-to-move relative (Player's perspective)
    evaluationAfter: number; // Side-to-move relative (Opponent's perspective)
    depth: number;
    chess: Chess;
    moveNumber: number;
    fen: string;
}

// Position Categories
type PositionCategory =
    | 'DECISIVE_WINNING'   // > +7.0
    | 'WINNING'            // +2.0 to +7.0
    | 'ADVANTAGE'          // +0.8 to +2.0
    | 'EQUAL'              // -0.8 to +0.8
    | 'DISADVANTAGE'       // -2.0 to -0.8
    | 'LOSING'             // -7.0 to -2.0
    | 'DECISIVE_LOSING';   // < -7.0

// Piece values for material calculation
const PIECE_VALUES = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
};

/**
 * Check if a move involves a material sacrifice
 */
function isMaterialSacrifice(move: Move, chess: Chess): boolean {
    const capturedPiece = move.captured;
    const movingPiece = move.piece;

    if (!capturedPiece) return false;

    const capturedValue = PIECE_VALUES[capturedPiece];
    const movingValue = PIECE_VALUES[movingPiece];

    return movingValue > capturedValue;
}

export function isBookMove(fen: string, moveNumber: number): boolean {
    return moveNumber <= 10; // Slightly extended opening book
}

export function isForcedMove(chess: Chess): boolean {
    const legalMoves = chess.moves();
    return legalMoves.length <= 1; // Strictly forced only if 1 move, effectively forced if 2? Let's check context.
}

/**
 * Determine the category of the position from the current player's perspective.
 */
function getPositionCategory(evalPawns: number): PositionCategory {
    if (evalPawns >= 7.0) return 'DECISIVE_WINNING';
    if (evalPawns >= 2.0) return 'WINNING';
    if (evalPawns >= 0.8) return 'ADVANTAGE';
    if (evalPawns > -0.8) return 'EQUAL';
    if (evalPawns > -2.0) return 'DISADVANTAGE';
    if (evalPawns > -7.0) return 'LOSING';
    return 'DECISIVE_LOSING';
}

/**
 * Classify move quality based on evaluation, engine analysis, and CONTEXT.
 */
export function classifyMove(params: MoveClassificationParams): MoveQuality {
    const {
        playedMove,
        engineLines,
        evaluationBefore,
        evaluationAfter,
        depth,
        chess,
        moveNumber,
        fen,
    } = params;

    const contextualLabels: MoveQualityLabel[] = [];

    // 1. Calculate Evaluation Loss (Raw)
    // Formula: evalBefore + evalAfter (since evalAfter is opponent's score)
    const evalLossRaw = evaluationBefore + evaluationAfter;

    // 2. Determine Context
    const categoryBefore = getPositionCategory(evaluationBefore);
    const evalAfterPlayer = -evaluationAfter; // Convert back to player's perspective for category check
    const categoryAfter = getPositionCategory(evalAfterPlayer);

    // 3. Apply Dampening / Sensitivity Logic
    let adjustedEvalLoss = evalLossRaw;

    // Rule A: The "Already Winning" Dampener
    // If clearly winning, small drops don't matter unless we blow the win.
    if (categoryBefore === 'DECISIVE_WINNING') {
        if (categoryAfter === 'DECISIVE_WINNING' || categoryAfter === 'WINNING') {
            adjustedEvalLoss *= 0.0; // Effectively 0 loss, it's irrelevant
        } else {
            // We dropped out of winning! Full penalty.
            // No dampening.
        }
    }
    else if (categoryBefore === 'WINNING') {
        if (categoryAfter === 'WINNING' || categoryAfter === 'DECISIVE_WINNING') {
            adjustedEvalLoss *= 0.2; // Very lenient
        }
    }

    // Rule B: The "Already Losing" Dampener
    // If lost, maintaining "lostness" is fine.
    if (categoryBefore === 'DECISIVE_LOSING') {
        if (categoryAfter === 'DECISIVE_LOSING') {
            adjustedEvalLoss *= 0.0; // Best move (fighting on)
        }
    }
    else if (categoryBefore === 'LOSING') {
        if (categoryAfter === 'LOSING' || categoryAfter === 'DECISIVE_LOSING') {
            // If we stayed losing, strictness depends. usually just 0.5 dampener?
            // Actually, if I am losing -3 and go to -4, it's bad.
            // If I am -6 and go to -6.5, meh.
            // Let's stick to dampening only for DECISIVE.
            if (evalLossRaw < 0.5) adjustedEvalLoss *= 0.5;
        }
    }

    // Rule C: Opening Leniency
    // In moves 1-8, relax thresholds. It's theory/style.
    if (moveNumber <= 8) {
        adjustedEvalLoss *= 0.8;
    }

    // Convert to centipawns
    const cpLoss = Math.round(adjustedEvalLoss * 100);

    // Get best engine move
    const bestLine = engineLines.find(line => line.pvIndex === 0);
    const bestMove = bestLine?.uciMove || '';
    const playedUCI = `${playedMove.from}${playedMove.to}${playedMove.promotion || ''}`;
    const isBestMove = playedUCI === bestMove;

    // Rank Analysis
    const playedLine = engineLines.find(line => line.uciMove === playedUCI);
    const playedRank = playedLine ? playedLine.pvIndex + 1 : 999;

    // --- CONTEXTUAL LABELS ---

    if (isBookMove(fen, moveNumber)) {
        contextualLabels.push('Book Move');
    }

    if (isForcedMove(chess)) {
        contextualLabels.push('Forced Move');
    }

    // Missed Win:
    // Only if we dropped from Winning/Decisive -> Equal/Losing
    if (
        (categoryBefore === 'WINNING' || categoryBefore === 'DECISIVE_WINNING') &&
        (categoryAfter === 'EQUAL' || categoryAfter === 'DISADVANTAGE' || categoryAfter === 'LOSING')
    ) {
        contextualLabels.push('Missed Win');
    }

    // Missed Draw:
    // Equal -> Losing/Decisive Losing
    if (
        categoryBefore === 'EQUAL' &&
        (categoryAfter === 'LOSING' || categoryAfter === 'DECISIVE_LOSING')
    ) {
        contextualLabels.push('Missed Draw');
    }

    // --- CLASSIFICATION ---

    let label: MoveQualityLabel;

    // 1. Brilliant
    // High depth, sacrifice, maintains position
    if (
        depth >= 15 &&
        !isBestMove &&
        isMaterialSacrifice(playedMove, chess) &&
        cpLoss <= 20 // Slight leniency for brilliance
    ) {
        label = 'Brilliant';
    }
    // 2. Great (Alternative Best)
    // If it's the 2nd best move and loss is tiny, it's Great.
    else if (
        !isBestMove &&
        playedRank === 2 &&
        cpLoss <= 15
    ) {
        label = 'Great';
    }
    // 3. Excellent (Improving Best)
    // Or just strong best move
    else if (isBestMove && cpLoss <= 0) {
        label = 'Excellent';
    }
    // 4. Best
    else if (isBestMove || cpLoss <= 5) { // Extremely close to best
        label = 'Best';
    }
    // 5. Good
    else if (cpLoss <= 25) {
        label = 'Good';
    }
    // 6. Inaccuracy
    else if (cpLoss <= 60) {
        label = 'Inaccuracy';
    }
    // 7. Mistake
    else if (cpLoss <= 120) {
        label = 'Mistake';
    }
    // 8. Blunder
    else {
        label = 'Blunder';
    }

    // Safety Override: If we are 'Winning' contextually regardless of drops, don't scream Blunder?
    // Already handled by 'adjustedEvalLoss'.
    // BUT: If Missed Win is present, FORCE Blunder/Mistake.
    if (contextualLabels.includes('Missed Win') && label !== 'Blunder') {
        label = 'Blunder'; // Throwing a win is typically a blunder.
    }
    if (contextualLabels.includes('Missed Draw') && label !== 'Blunder') {
        label = 'Blunder';
    }

    return {
        label,
        evaluationDelta: -evalLossRaw, // Show RAW delta to user approx
        contextualLabels,
    };
}

export function getMoveQualityDescription(quality: MoveQuality): string {
    const { label, evaluationDelta, contextualLabels } = quality;
    let description = label;
    if (contextualLabels.length > 0) {
        description += ` (${contextualLabels.join(', ')})`;
    }
    const deltaStr = evaluationDelta >= 0 ? `+${evaluationDelta.toFixed(2)}` : evaluationDelta.toFixed(2);
    description += ` [${deltaStr}]`;
    return description;
}
