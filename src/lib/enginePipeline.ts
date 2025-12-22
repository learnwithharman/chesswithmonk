/**
 * Engine Pipeline - Chessigma-style evaluation processing
 * Handles evaluation normalization, depth filtering, and smooth interpolation
 */

export interface EvaluationState {
    current: number; // Current displayed evaluation
    target: number; // Target evaluation to interpolate towards
    lastDepth: number; // Last accepted depth
    interpolating: boolean; // Whether currently interpolating
}

export interface PositionEvaluation {
    evaluation: number; // Normalized evaluation (-15 to +15)
    depth: number;
    mate: number | null; // Mate in N moves (null if not mate)
    timestamp: number;
}

// Evaluation history by position FEN
const evaluationCache = new Map<string, PositionEvaluation>();

/**
 * Normalize raw engine centipawn evaluation
 * Maps cp/100 to range [-10, +10], mate positions to ±15
 */
export function normalizeEvaluation(cp: number, mate: number | null): number {
    if (mate !== null) {
        // Mate positions map to ±15
        return mate > 0 ? 15 : -15;
    }

    // Convert centipawns to pawns and clamp
    const pawns = cp / 100;
    return Math.max(-10, Math.min(10, pawns));
}

/**
 * Calculate smooth interpolation between current and target evaluation
 * Uses exponential smoothing weighted by depth confidence
 */
export function interpolateEvaluation(
    current: number,
    target: number,
    depth: number,
    deltaTime: number = 16 // ms per frame (60fps)
): number {
    // Skip interpolation for mate positions (instant update)
    if (Math.abs(target) === 15) {
        return target;
    }

    // Interpolation speed increases with depth (higher confidence = faster)
    const depthFactor = Math.min(depth / 20, 1); // Max at depth 20
    const speed = 0.1 + depthFactor * 0.15; // 0.1 to 0.25

    const delta = target - current;
    const step = delta * speed * (deltaTime / 16);

    // Snap to target if very close
    if (Math.abs(delta) < 0.01) {
        return target;
    }

    return current + step;
}

/**
 * Determine if we should accept a new evaluation based on depth
 * Only accept higher or equal depth for the same position
 */
export function shouldAcceptEvaluation(
    fen: string,
    newDepth: number,
    newEvaluation: number,
    newMate: number | null
): boolean {
    const cached = evaluationCache.get(fen);

    if (!cached) {
        // No previous evaluation, accept
        evaluationCache.set(fen, {
            evaluation: newEvaluation,
            depth: newDepth,
            mate: newMate,
            timestamp: Date.now(),
        });
        return true;
    }

    // Only accept if new depth is greater or equal
    if (newDepth >= cached.depth) {
        evaluationCache.set(fen, {
            evaluation: newEvaluation,
            depth: newDepth,
            mate: newMate,
            timestamp: Date.now(),
        });
        return true;
    }

    return false;
}

/**
 * Get cached evaluation for a position
 */
export function getCachedEvaluation(fen: string): PositionEvaluation | null {
    return evaluationCache.get(fen) || null;
}

/**
 * Calculate evaluation delta from perspective
 * Positive = advantage for the specified color
 */
export function getEvaluationDelta(
    beforeEval: number,
    afterEval: number,
    perspective: 'w' | 'b'
): number {
    // Black's perspective needs flipped sign
    if (perspective === 'b') {
        return -afterEval - (-beforeEval);
    }
    // White's perspective
    return afterEval - beforeEval;
}

/**
 * Convert evaluation to perspective-aware value
 * Always returns positive for advantage, negative for disadvantage
 */
export function getEvaluationForPerspective(
    evaluation: number,
    perspective: 'w' | 'b'
): number {
    return perspective === 'b' ? -evaluation : evaluation;
}

/**
 * Clear evaluation cache (useful for new games)
 */
export function clearEvaluationCache(): void {
    evaluationCache.clear();
}

/**
 * Get evaluation bar height percentage (0-100%)
 * Maps normalized evaluation (-10 to +10) to visual bar height
 */
export function getEvaluationBarHeight(evaluation: number): number {
    // evaluation is already clamped to [-10, +10] or ±15 for mate
    // Map to 0-100% where 50% is equal, 100% is white winning, 0% is black winning
    const clamped = Math.max(-15, Math.min(15, evaluation));
    return ((clamped + 15) / 30) * 100;
}

/**
 * Format evaluation for display
 * Returns string like "+2.5", "-0.8", or "M5" for mate
 */
export function formatEvaluation(evaluation: number, mate: number | null): string {
    if (mate !== null) {
        return `M${Math.abs(mate)}`;
    }

    const sign = evaluation >= 0 ? '+' : '';
    return `${sign}${evaluation.toFixed(1)}`;
}
