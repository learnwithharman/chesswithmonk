import React from 'react';
import { cn } from '@/lib/utils';
import { Piece } from './Piece';
import { Check, ChevronsUp, X, AlertTriangle, Info } from 'lucide-react';

export type MoveQuality = 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | null;

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
  moveQuality?: MoveQuality;
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
  moveQuality,
  onClick,
  onMouseDown,
  onTouchStart,
  isDragging,
  customStyle
}: SquareProps) {

  const getQualityColor = (q: MoveQuality) => {
    switch (q) {
      case 'brilliant': return 'bg-cyan-400/60';
      case 'best': return 'bg-green-500/60';
      case 'good': return 'bg-blue-500/50';
      case 'inaccuracy': return 'bg-yellow-400/50';
      case 'mistake': return 'bg-orange-500/60';
      case 'blunder': return 'bg-red-600/60';
      default: return '';
    }
  };

  const getQualityIcon = (q: MoveQuality) => {
    switch (q) {
      case 'brilliant': return <ChevronsUp className="w-4 h-4 text-cyan-200 drop-shadow-md" />;
      case 'best': return <Check className="w-4 h-4 text-green-100 drop-shadow-md" />;
      case 'good': return <Check className="w-3 h-3 text-blue-100 drop-shadow-md" />;
      case 'inaccuracy': return <Info className="w-3 h-3 text-yellow-100 drop-shadow-md" />;
      case 'mistake': return <AlertTriangle className="w-4 h-4 text-orange-100 drop-shadow-md" />;
      case 'blunder': return <X className="w-4 h-4 text-red-100 drop-shadow-md" />;
      default: return null;
    }
  };

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
      {/* Hint/Wrong highlighting */}
      {isHint && (
        <div className="absolute inset-0 bg-green-500/40 pointer-events-none z-0" />
      )}
      {isWrong && (
        <div className="absolute inset-0 bg-red-500/50 pointer-events-none z-0" />
      )}

      {/* Move Quality Highlight */}
      {moveQuality && (
        <div className={cn("absolute inset-0 pointer-events-none z-0 animate-pulse", getQualityColor(moveQuality))} />
      )}

      {/* Piece */}
      {piece && (
        <Piece
          type={piece.type}
          color={piece.color}
          draggable={false}
        />
      )}

      {/* Move Quality Icon */}
      {moveQuality && (
        <div className="absolute top-0 right-0 p-0.5 z-20 pointer-events-none animate-bounce">
          {getQualityIcon(moveQuality)}
        </div>
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
        <div className={cn(
          "absolute bottom-0.5 right-1 text-xs font-bold pointer-events-none",
          isLight ? "text-[#B58863]" : "text-[#F0D9B5]"
        )}>
          {square[0]}
        </div>
      )}
      {square[0] === 'a' && (
        <div className={cn(
          "absolute top-0.5 left-1 text-xs font-bold pointer-events-none",
          isLight ? "text-[#B58863]" : "text-[#F0D9B5]"
        )}>
          {square[1]}
        </div>
      )}
    </div>
  );
});

