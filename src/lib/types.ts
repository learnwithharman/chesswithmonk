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

// New types for analysis engine
export type MoveQualityLabel =
  | 'Brilliant'
  | 'Great'
  | 'Excellent'
  | 'Best'
  | 'Good'
  | 'Inaccuracy'
  | 'Mistake'
  | 'Blunder'
  | 'Book Move'
  | 'Forced Move'
  | 'Missed Win'
  | 'Missed Draw';

export interface MoveQuality {
  label: MoveQualityLabel;
  evaluationDelta: number;
  contextualLabels: MoveQualityLabel[];
}

export interface PVLine {
  pvIndex: number; // 0, 1, 2 for MultiPV=3
  moves: Move[]; // Full PV line
  evaluation: number; // Normalized
  depth: number;
  mate: number | null;
  uciMove?: string; // First move in UCI format
}

export interface EngineUpdate {
  depth: number;
  multiPV: number;
  lines: PVLine[];
  bestLine: PVLine | null;
  mate: number | null;
}

export interface EvaluationState {
  current: number;
  target: number;
  interpolating: boolean;
  lastDepth: number;
}

