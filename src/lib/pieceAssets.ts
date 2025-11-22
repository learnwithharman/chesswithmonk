// Generated lightweight SVG data-URIs for chess pieces. These are simple
// stylized glyphs so the board remains representable even if external
// images fail to load. They are intentionally small and embedded to avoid
// network asset issues.

function makeSvg(letter: string, fill: string, stroke: string) {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>
    <rect width='100%' height='100%' fill='${fill}' rx='20' />
    <text x='50%' y='54%' font-size='120' text-anchor='middle' fill='${stroke}' font-family='Segoe UI, Roboto, Arial, sans-serif' font-weight='700' dominant-baseline='middle'>${letter}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const whiteFill = '#f6f6f4';
const whiteStroke = '#222';
const blackFill = '#4b5563';
const blackStroke = '#fff';

const pieceLetters: Record<string, string> = {
  p: 'P',
  r: 'R',
  n: 'N',
  b: 'B',
  q: 'Q',
  k: 'K',
};

export const pieceDataUrls: Record<string, string> = {};

Object.entries(pieceLetters).forEach(([type, letter]) => {
  pieceDataUrls[`w${type}`] = makeSvg(letter, whiteFill, whiteStroke);
  pieceDataUrls[`b${type}`] = makeSvg(letter, blackFill, blackStroke);
});

export default pieceDataUrls;
