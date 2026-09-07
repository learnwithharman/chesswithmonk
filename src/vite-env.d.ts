/// <reference types="vite/client" />

declare module 'stockfish.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const STOCKFISH: () => any;
  export default STOCKFISH;
}
