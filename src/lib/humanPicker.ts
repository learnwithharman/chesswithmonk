import { Chess } from 'chess.js';
import { Move, EloConfig } from '@/lib/types';

/**
 * Simple placeholder that picks a random legal move.
 * In a real implementation this could use an Elo config to weight moves.
 */
export function pickHumanMove(game: Chess, _elo?: number | EloConfig): Move | null {
    const legalMoves = game.moves({ verbose: true }) as Array<{
        from: string;
        to: string;
        promotion?: string;
        san?: string;
    }>;
    if (legalMoves.length === 0) return null;
    const idx = Math.floor(Math.random() * legalMoves.length);
    const move = legalMoves[idx];
    return {
        from: move.from,
        to: move.to,
        promotion: move.promotion as any,
        san: move.san,
    };
}

/**
 * Placeholder for getSuggestions – returns an empty array.
 */
export function getSuggestions(_game: Chess, _elo?: number | EloConfig): [] {
    return [];
}
