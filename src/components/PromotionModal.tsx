import React from 'react';
import pieceImports from '@/lib/pieceImports';

type Props = {
  visible: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel?: () => void;
};

export function PromotionModal({ visible, color, onSelect, onCancel }: Props) {
  if (!visible) return null;

  const options: Array<{ key: 'q' | 'r' | 'b' | 'n'; label: string }> = [
    { key: 'q', label: 'Queen' },
    { key: 'r', label: 'Rook' },
    { key: 'b', label: 'Bishop' },
    { key: 'n', label: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-lg p-4 shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-3">Choose promotion</h3>
        <div className="grid grid-cols-4 gap-3">
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className="flex flex-col items-center justify-center p-2 bg-muted rounded hover:brightness-105"
            >
              <img src={pieceImports[`${color}${opt.key}`]} alt={opt.label} className="w-10 h-10 mb-1" />
              <div className="text-xs">{opt.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="px-3 py-1 rounded bg-transparent text-sm" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default PromotionModal;
