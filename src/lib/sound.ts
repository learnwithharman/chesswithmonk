import { Chess, Move } from 'chess.js';

let soundMuted = false;

if (typeof window !== 'undefined') {
  soundMuted = localStorage.getItem('chess_sound_muted') === 'true';
}

export function isMuted(): boolean {
  return soundMuted;
}

export function setMuted(muted: boolean): void {
  soundMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('chess_sound_muted', muted ? 'true' : 'false');
  }
}

export function toggleMuted(): boolean {
  setMuted(!soundMuted);
  return soundMuted;
}

export const SOUND_PATHS = {
  normal: '/sfx/normal%20moves.mp3',
  capture: '/sfx/captures.mp3',
  castle: '/sfx/castle.mp3',
  check: '/sfx/check.mp3',
  checkmate: '/sfx/gameover%20checkmate.mp3',
} as const;

export type SoundType = keyof typeof SOUND_PATHS;

/**
 * Plays a specific sound by type.
 */
export function playSound(type: SoundType): void {
  if (soundMuted || typeof window === 'undefined') return;

  try {
    const audioPath = SOUND_PATHS[type];
    const audio = new Audio(audioPath);
    audio.play().catch((err) => {
      // Browser autoplay policy warning - user has not interacted with DOM yet
      console.warn(`[SFX] Sound playback prevented for ${type}:`, err);
    });
  } catch (err) {
    console.error(`[SFX] Failed to play sound ${type}:`, err);
  }
}

/**
 * Plays the appropriate sound for a chess move based on move properties and game state.
 * Priority order:
 * 1. Checkmate -> gameover checkmate.mp3
 * 2. Check -> check.mp3
 * 3. Castle -> castle.mp3
 * 4. Capture -> captures.mp3
 * 5. Normal move -> normal moves.mp3
 */
export function playMoveSound(moveResult?: Partial<Move> | null, game?: Chess | null): SoundType {
  if (soundMuted || typeof window === 'undefined') return 'normal';

  // If moveResult wasn't passed directly, try to get last move from history if game is provided
  if (!moveResult && game) {
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      moveResult = history[history.length - 1];
    }
  }

  // 1. Checkmate
  const isCheckmate = game ? game.isCheckmate() : (moveResult?.san?.endsWith('#') ?? false);
  if (isCheckmate) {
    playSound('checkmate');
    return 'checkmate';
  }

  // 2. Check
  const inCheck = game ? game.inCheck() : (moveResult?.san?.includes('+') ?? false);
  if (inCheck) {
    playSound('check');
    return 'check';
  }

  // 3. Castle
  const isCastle =
    moveResult?.san === 'O-O' ||
    moveResult?.san === 'O-O-O' ||
    Boolean(moveResult?.flags && (moveResult.flags.includes('k') || moveResult.flags.includes('q')));
  if (isCastle) {
    playSound('castle');
    return 'castle';
  }

  // 4. Capture
  const isCapture =
    Boolean(moveResult?.captured) ||
    Boolean(moveResult?.flags && (moveResult.flags.includes('c') || moveResult.flags.includes('e'))) ||
    Boolean(moveResult?.san && moveResult.san.includes('x'));
  if (isCapture) {
    playSound('capture');
    return 'capture';
  }

  // 5. Normal move
  playSound('normal');
  return 'normal';
}
