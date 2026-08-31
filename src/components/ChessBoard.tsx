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

interface BoardPiece {
  id: string;
  square: string;
  type: string;
  color: 'w' | 'b';
  col: number;
  row: number;
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
  customSquareStyles = {},
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
  const prevPiecesRef = useRef<Map<string, string>>(new Map()); // square -> pieceId map

  // Resize Observer to make board responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setBoardSize(Math.min(width, height));
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const squareSize = boardSize / 8;

  // Raw board array from chess.js
  const fen = chess.fen();
  const rawBoard = useMemo(() => chess.board(), [fen]);

  // Determine piece coordinates helper
  const getCoords = useCallback((square: string) => {
    const fileIndex = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = parseInt(square[1]) - 1;
    const col = flipped ? 7 - fileIndex : fileIndex;
    const row = flipped ? rankIndex : 7 - rankIndex;
    return { col, row };
  }, [flipped]);

  // Track pieces with stable IDs across FEN updates for smooth 180ms gliding animation
  const pieces = useMemo<BoardPiece[]>(() => {
    const newPieces: BoardPiece[] = [];
    const currentSquareToId = new Map<string, string>();
    const usedIds = new Set<string>();

    const prevMap = prevPiecesRef.current;

    // Helper to generate a unique ID for a piece
    let counter = 1;
    const makeId = (color: string, type: string) => {
      let id = `${color}_${type}_${counter++}`;
      while (usedIds.has(id)) {
        id = `${color}_${type}_${counter++}`;
      }
      return id;
    };

    // First pass: locate pieces on current board
    const currentPiecesBySquare: { square: string; color: 'w' | 'b'; type: string }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = rawBoard[r][f];
        if (p) {
          const rank = 8 - r;
          const file = String.fromCharCode(97 + f);
          const sq = `${file}${rank}`;
          currentPiecesBySquare.push({ square: sq, color: p.color, type: p.type });
        }
      }
    }

    // Step 1: If lastMove is present, assign the moved piece's ID from lastMove.from to lastMove.to
    if (lastMove && prevMap.has(lastMove.from)) {
      const movedPieceId = prevMap.get(lastMove.from)!;
      const targetPiece = currentPiecesBySquare.find(p => p.square === lastMove.to);
      if (targetPiece) {
        currentSquareToId.set(lastMove.to, movedPieceId);
        usedIds.add(movedPieceId);
      }
    }

    // Step 2: For pieces at same square with same type/color, retain existing ID
    for (const item of currentPiecesBySquare) {
      if (currentSquareToId.has(item.square)) continue;

      const existingId = prevMap.get(item.square);
      if (existingId && !usedIds.has(existingId)) {
        // verify piece color and type match prefix if stored
        currentSquareToId.set(item.square, existingId);
        usedIds.add(existingId);
      }
    }

    // Step 3: For remaining pieces, assign a new ID
    for (const item of currentPiecesBySquare) {
      if (!currentSquareToId.has(item.square)) {
        const id = makeId(item.color, item.type);
        currentSquareToId.set(item.square, id);
        usedIds.add(id);
      }

      const id = currentSquareToId.get(item.square)!;
      const { col, row } = getCoords(item.square);
      newPieces.push({
        id,
        square: item.square,
        color: item.color,
        type: item.type,
        col,
        row,
      });
    }

    // Save current square->id map for next move transition
    prevPiecesRef.current = currentSquareToId;

    return newPieces;
  }, [fen, rawBoard, lastMove, getCoords]);

  // Determine king square for check highlight
  const inCheck = chess.inCheck();
  const checkSquare = useMemo(() => {
    if (!inCheck) return null;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = rawBoard[r][f];
        if (p && p.type === 'k' && p.color === chess.turn()) {
          const rank = 8 - r;
          const file = String.fromCharCode(97 + f);
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [inCheck, rawBoard, chess]);

  const files = useMemo(() => flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [flipped]);
  const ranks = useMemo(() => flipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'], [flipped]);

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

      let targetSquare: string | null = null;
      let minDistance = Infinity;
      const MAGNETIC_THRESHOLD = squareSize * 0.85;

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
    window.addEventListener('touchcancel', resetDragState);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', resetDragState);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchcancel', resetDragState);
    };
  }, [draggingPiece, legalMoves, snapToSquare, onMove, getSquareCenter, squareSize, dragX, dragY, dragTargetSquare]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, square: string) => {
    if (e.type === 'mousedown') {
      e.preventDefault();
    }

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
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-1 md:p-0">
      <div
        ref={boardRef}
        className="relative bg-[#ebecd0] grid grid-cols-8 shadow-2xl rounded-sm overflow-hidden select-none ring-1 ring-black/10 dark:ring-white/10"
        style={{
          width: boardSize,
          height: boardSize,
          touchAction: 'none'
        }}
      >
        {/* Board Squares Layer */}
        {ranks.map((rank, rankIndex) =>
          files.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const isCheck = checkSquare === square;
            const pieceAtSquare = chess.get(square as ChessSquare);

            const isHintSource = hintMove?.from === square;
            const isHintTarget = hintMove?.to === square;
            const isWrongSource = wrongMove?.from === square;
            const isWrongTarget = wrongMove?.to === square;

            return (
              <div key={square} className="relative w-full h-full">
                <Square
                  square={square}
                  isLight={isLight}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  hasPiece={!!pieceAtSquare}
                  isLastMove={isLastMoveSquare}
                  isCheck={isCheck}
                  isHint={isHintSource || isHintTarget}
                  isWrong={isWrongSource || isWrongTarget}
                  onClick={() => handleSquareClick(square)}
                  onMouseDown={(e) => handleMouseDown(e, square)}
                  onTouchStart={(e) => handleMouseDown(e, square)}
                  customStyle={customSquareStyles[square]}
                />
                {dragTargetSquare === square && draggingPiece && (
                  <div className="absolute inset-0 border-4 border-amber-300/70 pointer-events-none z-20 rounded-sm" />
                )}
              </div>
            );
          })
        )}

        {/* Piece Overlay Layer with Crisp 180ms Movement Animation */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <AnimatePresence>
            {pieces.map((p) => {
              const isBeingDragged = draggingPiece?.square === p.square;

              return (
                <motion.div
                  key={p.id}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
                  initial={{
                    left: `${p.col * 12.5}%`,
                    top: `${p.row * 12.5}%`,
                    opacity: 1,
                  }}
                  animate={{
                    left: `${p.col * 12.5}%`,
                    top: `${p.row * 12.5}%`,
                    opacity: isBeingDragged ? 0 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    left: { duration: 0.18, ease: [0.2, 0, 0.2, 1] },
                    top: { duration: 0.18, ease: [0.2, 0, 0.2, 1] },
                    opacity: { duration: 0.1 },
                  }}
                  style={{
                    width: '12.5%',
                    height: '12.5%',
                    willChange: 'left, top',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, p.square)}
                  onTouchStart={(e) => handleMouseDown(e, p.square)}
                >
                  <Piece type={p.type} color={p.color} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Dragged Piece */}
      <AnimatePresence>
        {draggingPiece && (
          <motion.div
            className="fixed pointer-events-none top-0 left-0 z-50"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1.15 }}
            exit={{ scale: 1 }}
            transition={{ duration: 0.08 }}
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


