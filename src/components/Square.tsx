import { useMemo } from 'react';
import { Piece } from './Piece';
import { cn } from '@/lib/utils';

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

export function Square({
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

  const bgClass = useMemo(() => {
    if (isCheck) return 'bg-red-500/50';
    if (isWrong) return 'bg-red-400/60';
    if (isSelected) return 'bg-yellow-200/80';
    if (isLastMove) return 'bg-yellow-200/50'; // Standard last move highlight
    if (isHint) return 'bg-purple-400/50';

    return isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]';
  }, [isLight, isSelected, isLastMove, isCheck, isHint, isWrong]);

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center relative select-none aspect-square",
        bgClass
      )}
      style={customStyle}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      data-square={square}
    >
      {isCheck && (
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 70%)',
          boxShadow: 'inset 0 0 20px 5px rgba(255,0,0,0.6)'
        }} />
      )}

      {/* Rank and File Labels */}
      {square.endsWith('1') && (
        <span className={cn(
          "absolute bottom-0.5 right-1 text-[10px] font-bold z-10",
          isLight ? "text-[#779556]" : "text-[#ebecd0]"
        )}>
          {square[0]}
        </span>
      )}
      {square.startsWith('a') && (
        <span className={cn(
          "absolute top-0.5 left-1 text-[10px] font-bold z-10",
          isLight ? "text-[#779556]" : "text-[#ebecd0]"
        )}>
          {square[1]}
        </span>
      )}

      {/* Legal Move Indicator */}
      {isLegalMove && !piece && (
        <div className={cn(
          "w-3 h-3 rounded-full opacity-50",
          isLight ? "bg-[#779556]" : "bg-[#ebecd0]" // Inverted colors for better visibility
        )} />
      )}

      {/* Legal Capture Indicator (Ring) */}
      {isLegalMove && piece && (
        <div className="absolute inset-0 rounded-full border-4 border-black/10" />
      )}

      {/* Piece */}
      {piece && (
        <div className={cn(
          "w-full h-full p-0.5 z-20 cursor-grab active:cursor-grabbing transition-transform",
          isDragging ? "opacity-50 scale-110" : "opacity-100 scale-100"
        )}>
          <Piece type={piece.type} color={piece.color} />
        </div>
      )}
    </div>
  );
}
