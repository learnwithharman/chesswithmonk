export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Square = string; // e.g., 'e2', 'e4'
export type Difficulty = 'beginner' | 'novice' | 'intermediate' | 'advanced';

export interface Position {
  square: Square;
  x: number;
  y: number;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  san?: string;
}

export interface Suggestion {
  move: Move;
  score: number;
  cpLoss: number;
  classification: '✓' | '?!' | '?' | '??';
}

export interface EloConfig {
  depth: number;
  randomness: number;
  blunderRate: number;
}

export interface GameState {
  fen: string;
  pgn: string;
  moveHistory: string[];
  whiteTime: number;
  blackTime: number;
}
