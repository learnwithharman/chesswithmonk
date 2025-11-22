import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <img src="/logo/Chess_slt45.svg" alt="ChessWithMonk Logo" className={className} />
  );
}

export default Logo;
