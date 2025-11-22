import React from 'react';

export function EndGameBanner({ visible, winner, onRestart }: { visible: boolean; winner: 'white' | 'black' | 'draw' | null; onRestart: () => void; }) {
  if (!visible) return null;

  const title = winner === 'draw' ? "It's a draw" : `${winner === 'white' ? 'White' : 'Black'} wins!`;

  return (
    <div className="absolute inset-0 z-[9998] flex items-center justify-center pointer-events-none">
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-xl w-[420px] text-center pointer-events-auto">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4">Game over</p>
        <div className="flex justify-center gap-3">
          <button onClick={onRestart} className="px-4 py-2 rounded bg-primary text-white">New Game</button>
        </div>
      </div>
    </div>
  );
}

export default EndGameBanner;
