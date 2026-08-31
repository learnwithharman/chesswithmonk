import { cn } from '@/lib/utils';
import { useState, useMemo, memo } from 'react';
import pieceDataUrls from '@/lib/pieceAssets';
import pieceImports from '@/lib/pieceImports';

interface PieceProps {
  type: string;
  color: 'w' | 'b';
  draggable?: boolean;
  onDragStart?: () => void;
  className?: string;
}

export const Piece = memo(function Piece({ type, color, draggable = false, onDragStart, className }: PieceProps) {
  const base = import.meta.env.BASE_URL || '/';
  const t = String(type || '').toLowerCase();

  const candidates = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return [
      origin ? `${origin}${base}pieces/${color}${t}.svg` : null,
      `${base}pieces/${color}${t}.svg`,
      `/pieces/${color}${t}.svg`,
      `pieces/${color}${t}.svg`,
      `./pieces/${color}${t}.svg`,
      pieceImports[`${color}${t}`],
      pieceDataUrls[`${color}${t}`],
    ].filter(Boolean) as string[];
  }, [base, color, t]);

  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = candidates[srcIndex] ?? null;

  const handleError = () => {
    setSrcIndex((i) => {
      const next = i + 1;
      if (next < candidates.length) return next;
      setFailed(true);
      return i;
    });
  };

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center select-none p-1 pointer-events-none',
        className
      )}
    >
      {failed ? (
        <div className="w-[88%] h-[88%] flex items-center justify-center text-3xl font-serif pointer-events-none opacity-90 drop-shadow">
          {color === 'w' ? '♙' : '♟'}
        </div>
      ) : (
        <img
          src={src ?? undefined}
          onError={handleError}
          alt={`${color === 'w' ? 'White' : 'Black'} ${t}`}
          className="w-[90%] h-[90%] pointer-events-none object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-150"
          draggable={false}
        />
      )}
    </div>
  );
});

