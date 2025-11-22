import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Chess, Square as ChessSquare } from 'chess.js';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Square } from './Square';
import { Piece } from './Piece';
import { Move, Suggestion } from '@/lib/types';

interface ChessBoardProps {
  chess: Chess;
  onMove: (move: Move) => void;
  flipped: boolean;
  lastMove: Move | null;
  suggestions: Suggestion[];
  showSuggestions: boolean;
  hintMove?: Move | null;
  wrongMove?: Move | null;
  isDraggable?: boolean;
  customSquareStyles?: Record<string, React.CSSProperties>;
}

interface DraggingState {
  square: string;
  piece: { type: string; color: 'w' | 'b' };
}

export const ChessBoard = memo(function ChessBoard({
  chess,
  onMove,
  flipped,
  lastMove,
  suggestions,
  showSuggestions,
  hintMove,
  wrongMove,
  isDraggable = true,
  customSquareStyles = {}
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [draggingPiece, setDraggingPiece] = useState<DraggingState | null>(null);
  const [boardSize, setBoardSize] = useState(580);

  // Motion values for high-performance dragging
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Resize Observer to make board responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Use the smaller dimension to ensure the square board fits
        setBoardSize(Math.min(width, height));
      }
    };

    // Initial size
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const squareSize = boardSize / 8;

  // Memoize board state
  const board = useMemo(() => chess.board(), [chess.fen()]);

  // Determine king square for check highlight
  const inCheck = chess.inCheck();
  const checkSquare = useMemo(() => {
    if (!inCheck) return null;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === chess.turn()) {
          const rank = 8 - r;
          const file = String.fromCharCode(97 + f);
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [inCheck, board, chess]);

  const files = useMemo(() => flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [flipped]);
  const ranks = useMemo(() => flipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'], [flipped]);

  // Helper to get center coordinates of a square
  const getSquareCenter = useCallback((square: string) => {
    const fileChar = square[0];
    const rankChar = square[1];

    const fileIndex = fileChar.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = parseInt(rankChar) - 1;

    const col = flipped ? 7 - fileIndex : fileIndex;
    const row = flipped ? rankIndex : 7 - rankIndex;

    return {
      x: col * squareSize + squareSize / 2,
      y: row * squareSize + squareSize / 2
    };
  }, [flipped, squareSize]);

  // Snap pixel coordinates to board square
  const snapToSquare = useCallback((pixelX: number, pixelY: number): string | null => {
    const file = Math.floor(pixelX / squareSize);
    const rank = Math.floor(pixelY / squareSize);

    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;

    const fileChar = String.fromCharCode((flipped ? 7 - file : file) + 'a'.charCodeAt(0));
    const rankChar = String(flipped ? rank + 1 : 8 - rank);

    return `${fileChar}${rankChar}`;
  }, [flipped, squareSize]);

  const [dragTargetSquare, setDragTargetSquare] = useState<string | null>(null);
  const boardRectRef = useRef<DOMRect | null>(null);

  // Global event handlers for drag and drop
  useEffect(() => {
    if (!draggingPiece) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      dragX.set(clientX);
      dragY.set(clientY);

      if (boardRectRef.current) {
        const x = clientX - boardRectRef.current.left;
        const y = clientY - boardRectRef.current.top;
        const square = snapToSquare(x, y);

        if (square !== dragTargetSquare) {
          setDragTargetSquare(square);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const rect = boardRectRef.current || boardRef.current?.getBoundingClientRect();

      if (!rect) {
        resetDragState();
        return;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Magnetic Snap Logic
      let targetSquare: string | null = null;
      let minDistance = Infinity;
      const MAGNETIC_THRESHOLD = squareSize * 0.8;

      for (const legalMove of legalMoves) {
        const center = getSquareCenter(legalMove);
        const dist = Math.hypot(x - center.x, y - center.y);

        if (dist < MAGNETIC_THRESHOLD && dist < minDistance) {
          minDistance = dist;
          targetSquare = legalMove;
        }
      }

      if (!targetSquare) {
        targetSquare = snapToSquare(x, y);
      }

      if (targetSquare && legalMoves.includes(targetSquare)) {
        onMove({ from: draggingPiece.square, to: targetSquare });
      }

      resetDragState();
    };

    const resetDragState = () => {
      setDraggingPiece(null);
      setLegalMoves([]);
      setSelectedSquare(null);
      setDragTargetSquare(null);
      boardRectRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', resetDragState);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', resetDragState);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingPiece, legalMoves, snapToSquare, onMove, getSquareCenter, squareSize, dragX, dragY, dragTargetSquare]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, square: string) => {
    if (!isDraggable) return;

    const piece = chess.get(square as any);
    if (!piece || piece.color !== chess.turn()) return;

    if (boardRef.current) {
      boardRectRef.current = boardRef.current.getBoundingClientRect();
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragX.set(clientX);
    dragY.set(clientY);

    setDraggingPiece({ square, piece });

    const moves = chess.moves({ square: square as ChessSquare, verbose: true });
    setLegalMoves(moves.map(m => m.to));
    setSelectedSquare(square);
  }, [chess, dragX, dragY, isDraggable]);

  const handleSquareClick = useCallback((square: string) => {
    const piece = chess.get(square as ChessSquare);

    if (selectedSquare && selectedSquare !== square) {
      if (legalMoves.includes(square)) {
        onMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as ChessSquare, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else if (piece && piece.color === chess.turn()) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as ChessSquare, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
    }
  }, [chess, selectedSquare, legalMoves, onMove]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div
        ref={boardRef}
        className="relative bg-board-light grid grid-cols-8 shadow-xl rounded-sm overflow-hidden"
        style={{
          width: boardSize,
          height: boardSize,
          touchAction: 'none'
        }}
      >
        {ranks.map((rank, rankIndex) =>
          files.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const r = 8 - parseInt(rank);
            const f = file.charCodeAt(0) - 'a'.charCodeAt(0);
            const piece = board[r][f];
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const isCheck = checkSquare === square;
            const isDragging = draggingPiece?.square === square;
            const isTarget = dragTargetSquare === square;

            const isHintSource = hintMove?.from === square;
            const isHintTarget = hintMove?.to === square;
            const isWrongSource = wrongMove?.from === square;
            const isWrongTarget = wrongMove?.to === square;

            return (
              <div key={square} className="relative w-full h-full">
                <Square
                  square={square}
                  piece={!isDragging ? piece : null}
                  isLight={isLight}
                  isLastMove={isLastMoveSquare}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isCheck={isCheck}
                  isHint={isHintSource || isHintTarget}
                  isWrong={isWrongSource || isWrongTarget}
                  onClick={() => handleSquareClick(square)}
                  onMouseDown={(e) => handleMouseDown(e, square)}
                  onTouchStart={(e) => handleMouseDown(e, square)}
                  isDragging={false}
                />
                {isTarget && draggingPiece && (
                  <div className="absolute inset-0 border-4 border-white/50 pointer-events-none z-20 rounded-sm" />
                )}
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {draggingPiece && (
          <motion.div
            className="fixed pointer-events-none top-0 left-0 z-50"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1.2 }}
            exit={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            style={{
              x: dragX,
              y: dragY,
              width: squareSize,
              height: squareSize,
              marginLeft: -squareSize / 2,
              marginTop: -squareSize / 2,
              willChange: 'transform',
            }}
          >
            <Piece type={draggingPiece.piece.type} color={draggingPiece.piece.color} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
