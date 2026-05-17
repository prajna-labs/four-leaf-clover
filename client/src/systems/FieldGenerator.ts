import type { CloverParams } from "../entities/cloverSvg";

export interface FieldClover {
  x: number;
  y: number;
  params: CloverParams;
}

export interface FieldOptions {
  width: number;
  height: number;
  count: number;
  seed: number;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateField(options: FieldOptions): FieldClover[] {
  const { width, height, count, seed } = options;
  const result: FieldClover[] = [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const rng = mulberry32(seed);
  const fourLeafIndex = Math.floor(rng() * count);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (rng() - 0.5) * cellW * 0.8;
    const jitterY = (rng() - 0.5) * cellH * 0.8;
    result.push({
      x: cellW * (col + 0.5) + jitterX,
      y: cellH * (row + 0.5) + jitterY,
      params: {
        leaves: i === fourLeafIndex ? 4 : 3,
        hue: 90 + rng() * 60,
        scale: 0.8 + rng() * 0.6,
        rotation: rng() * 360,
      },
    });
  }
  return result;
}
