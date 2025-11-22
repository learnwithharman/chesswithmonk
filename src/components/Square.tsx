import React from 'react';
import { cn } from '@/lib/utils';
import { Piece } from './Piece';

interface SquareProps {
  square: string;
  piece: { type: string; color: 'w' | 'b' } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
  isHint?: boolean;
  isWrong?: boolean;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  isDragging?: boolean;
  customStyle?: React.CSSProperties;
}

export const Square = React.memo(function Square({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  isHint,
  isWrong,
  onClick,
  onMouseDown,
  onTouchStart,
  isDragging,
  customStyle
}: SquareProps) {
  return (
    <div
      className={cn(
        'relative w-full aspect-square transition-colors cursor-pointer select-none',
        isLight ? 'bg-board-light' : 'bg-board-dark',
        isSelected && 'ring-4 ring-primary ring-inset',
        isLastMove && 'bg-highlight-amber/40',
        isDragging && 'opacity-50'
      )}
      style={customStyle}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Hint/Wrong highlighting - BEFORE piece so it's behind */}
      {isHint && (
        <div className="absolute inset-0 bg-green-500/40 pointer-events-none z-0" />
      )}
      {isWrong && (
        <div className="absolute inset-0 bg-red-500/50 pointer-events-none z-0" />
      )}

      {/* Piece - rendered AFTER highlights so it's on top */}
      {piece && (
        <Piece
          type={piece.type}
          color={piece.color}
          draggable={false} // Disable HTML5 drag, using mouse events instead
        />
      )}

      {isLegalMove && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none',
        )}>
          <div className={cn(
            'rounded-full',
            piece ? 'w-full h-full border-4 border-gray-400/30' : 'w-1/3 h-1/3 bg-gray-400/30'
          )} />
        </div>
      )}

      {isCheck && (
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 70%)',
          boxShadow: 'inset 0 0 20px 5px rgba(255,0,0,0.6)'
        }} />
      )}

      {/* Coordinate labels */}
      {square[1] === '1' && (
        <div className="absolute bottom-0.5 right-1 text-xs font-semibold opacity-60 pointer-events-none">
          {square[0]}
        </div>
      )}
      {square[0] === 'a' && (
        <div className="absolute top-0.5 left-1 text-xs font-semibold opacity-60 pointer-events-none">
          {square[1]}
        </div>
      )}
    </div>
  );
});
