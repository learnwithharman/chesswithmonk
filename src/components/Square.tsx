import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SquareProps {
  square: string;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  hasPiece: boolean;
  isLastMove?: boolean;
  isCheck?: boolean;
  isHint?: boolean;
  isWrong?: boolean;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  customStyle?: React.CSSProperties;
}

export function Square({
  square,
  isLight,
  isSelected,
  isLegalMove,
  hasPiece,
  isLastMove,
  isCheck,
  isHint,
  isWrong,
  onClick,
  onMouseDown,
  onTouchStart,
  customStyle
}: SquareProps) {

  const bgClass = useMemo(() => {
    if (isCheck) return 'bg-red-500/50';
    if (isWrong) return 'bg-red-500/60';
    if (isSelected) return 'bg-amber-300/45 ring-2 ring-amber-400/80 ring-inset';
    if (isLastMove) return 'bg-amber-300/35 ring-1 ring-amber-400/40 ring-inset';
    if (isHint) return 'bg-purple-500/40 ring-2 ring-purple-400/80 ring-inset';

    return isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]';
  }, [isLight, isSelected, isLastMove, isCheck, isHint, isWrong]);

  const file = square[0];
  const rank = square[1];

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center relative select-none aspect-square transition-colors duration-150",
        bgClass
      )}
      style={customStyle}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      data-square={square}
    >
      {/* Check Glow */}
      {isCheck && (
        <div className="absolute inset-0 pointer-events-none z-0 animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0) 75%)',
          boxShadow: 'inset 0 0 16px 4px rgba(220,38,38,0.7)'
        }} />
      )}

      {/* Rank Labels (left side on rank 'a') */}
      {file === 'a' && (
        <span className={cn(
          "absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold pointer-events-none z-10",
          isLight ? "text-[#779556]" : "text-[#ebecd0]"
        )}>
          {rank}
        </span>
      )}

      {/* File Labels (bottom side on rank '1') */}
      {rank === '1' && (
        <span className={cn(
          "absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold pointer-events-none z-10",
          isLight ? "text-[#779556]" : "text-[#ebecd0]"
        )}>
          {file}
        </span>
      )}

      {/* Legal Move Indicator (Empty Square: Centered Dot) */}
      {isLegalMove && !hasPiece && (
        <div className={cn(
          "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full pointer-events-none z-20 opacity-60 transition-transform hover:scale-125",
          isLight ? "bg-[#58733e]" : "bg-[#d4d6ba]"
        )} />
      )}

      {/* Legal Capture Indicator (Occupied Square: Corner Ring Overlay) */}
      {isLegalMove && hasPiece && (
        <div className="absolute inset-0.5 sm:inset-1 rounded-full border-4 border-black/20 dark:border-white/30 pointer-events-none z-20" />
      )}
    </div>
  );
}

