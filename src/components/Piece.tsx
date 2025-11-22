import { cn } from '@/lib/utils';
import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
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
  // Build a list of candidate URLs for the piece image so it works across
  // different dev server base URLs / network setups. Try them in order and
  // fall back if one fails to load.
  const base = import.meta.env.BASE_URL || '/';
  const t = String(type || '').toLowerCase();

  const candidates = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // First try runtime/public paths (use the files you put into `public/pieces`),
    // then try the bundled imports under `src/assets/pieces`, and finally
    // fallback to embedded data-URIs.
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
      // mark failed when we've exhausted candidates
      setFailed(true);
      return i;
    });
  };

  return (
    <motion.div
      className={cn(
        'absolute inset-0 flex items-center justify-center select-none z-10',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      style={{
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)', // GPU acceleration
      }}
      whileDrag={{ scale: 1.15, zIndex: 50 }}
      whileHover={draggable ? { scale: 1.05 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <div
        draggable={draggable}
        onDragStart={(e) => {
          if (draggable && onDragStart) {
            e.dataTransfer.effectAllowed = 'move';
            onDragStart();
          }
        }}
        className="w-full h-full flex items-center justify-center"
      >
        {failed ? (
          <div className="w-[85%] h-[85%] flex items-center justify-center text-2xl pointer-events-none opacity-80">
            {color === 'w' ? '♙' : '♟'}
          </div>
        ) : (
          <img
            src={src ?? undefined}
            onError={handleError}
            alt={`${color === 'w' ? 'White' : 'Black'} ${t}`}
            className="w-[85%] h-[85%] pointer-events-none"
            draggable={false}
          />
        )}
      </div>
    </motion.div>
  );
});
