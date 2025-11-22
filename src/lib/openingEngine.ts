import { Chess } from 'chess.js';

// Type definitions for our ECO theory database
export interface EcoNode {
    fen: string;
    moves: Record<string, string>; // SAN -> FEN
    openings: EcoOpening[];
    depth: number;
}

export interface EcoOpening {
    eco: string;
    name: string;
    full_line: string;
}

export interface OpeningMatch {
    opening_name: string;
    eco_code: string;
    variation_name?: string;
    full_san_line: string;
    fen: string;
    matching_depth: number;
    confidence: number; // 1.0 = exact match
    transpositions: string[]; // Other opening names reaching this position
    next_moves: string[]; // Available theory moves from here
}

// Cache the database in memory
let ecoTheoryDB: Record<string, EcoNode> | null = null;

/**
 * Load the ECO theory database.
 * This should be called once at app startup or lazily.
 */
export async function loadEcoTheory(): Promise<void> {
    if (ecoTheoryDB) return;

    try {
        const response = await fetch('/data/eco_theory.json');
        if (!response.ok) throw new Error('Failed to load ECO theory');
        ecoTheoryDB = await response.json();
        console.log('ECO Theory loaded:', Object.keys(ecoTheoryDB!).length, 'positions');
    } catch (error) {
        console.error('Error loading ECO theory:', error);
        ecoTheoryDB = {}; // Fallback to empty to prevent crashes
    }
}

/**
 * Identify the opening for a given position.
 * @param fen The current FEN string
 * @param moveHistory Optional array of SAN moves played so far
 */
export function identifyOpening(fen: string): OpeningMatch | null {
    if (!ecoTheoryDB) {
        console.warn('ECO Theory not loaded yet');
        return null;
    }

    // Normalize FEN (remove move counters for transposition matching)
    // ECO FENs in our DB might have specific counters, but usually we match by position.
    // Our DB keys are full FENs. Let's try exact match first.
    let node = ecoTheoryDB[fen];

    // If no exact match, try matching without move counters (halfmove/fullmove)
    if (!node) {
        const fenParts = fen.split(' ');
        const positionFen = fenParts.slice(0, 4).join(' '); // pieces, turn, castling, enpassant

        // This is O(N) scan if we don't have a secondary index. 
        // For 7000 positions it's fast enough (~1-2ms).
        // But better to rely on exact match if possible.
        // Let's try to find a key that starts with this positionFen
        const matchingKey = Object.keys(ecoTheoryDB).find(k => k.startsWith(positionFen));
        if (matchingKey) {
            node = ecoTheoryDB[matchingKey];
        }
    }

    if (!node) return null;

    // We found a node!
    // If this node is a named opening, return it.
    // If not, it might be an intermediate position.
    // We want to find the "best" opening name associated with this position.

    // 1. Direct opening match
    if (node.openings.length > 0) {
        // Sort by length of line (specificity) or just take the first one
        // Usually the last one defined is the most specific variation
        const bestOpening = node.openings[node.openings.length - 1];

        // Collect all transpositions
        const transpositions = node.openings
            .filter(o => o.name !== bestOpening.name)
            .map(o => o.name);

        return {
            opening_name: bestOpening.name,
            eco_code: bestOpening.eco,
            full_san_line: bestOpening.full_line,
            fen: node.fen,
            matching_depth: node.depth,
            confidence: 1.0,
            transpositions,
            next_moves: Object.keys(node.moves)
        };
    }

    // 2. If this node has no name, but is part of the tree,
    // we might want to look up the tree to find the parent opening.
    // However, our trie structure doesn't have parent pointers.
    // But since we are playing a game, we likely passed through a named opening.
    // The UI should probably track the "last identified opening".

    // For now, return null if no specific name is attached to THIS position.
    return null;
}

/**
 * Get available theory moves from a position
 */
export function getTheoryMoves(fen: string): string[] {
    if (!ecoTheoryDB) return [];
    const node = ecoTheoryDB[fen];
    return node ? Object.keys(node.moves) : [];
}
