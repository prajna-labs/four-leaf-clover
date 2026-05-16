export interface CloverParams {
  leaves: 3 | 4;
  hue: number;
  scale: number;
  rotation: number;
}

export const LEAF_RX = 10;
export const LEAF_RY = 16;
export const LEAF_OFFSET = 12;
export const STEM_R = 3;
export const BASE_SIZE = (LEAF_OFFSET + LEAF_RY) * 2;

export function generateCloverSVG(params: CloverParams): string {
  const { leaves, hue, scale, rotation } = params;
  const size = BASE_SIZE * scale;
  const cx = size / 2;
  const cy = size / 2;
  const sRx = LEAF_RX * scale;
  const sRy = LEAF_RY * scale;
  const sOff = LEAF_OFFSET * scale;
  const sStem = STEM_R * scale;
  const angleStep = 360 / leaves;
  const leafFill = `hsl(${hue}, 55%, 42%)`;
  const stemFill = `hsl(${hue}, 50%, 25%)`;

  let leavesMarkup = "";
  for (let i = 0; i < leaves; i++) {
    const angle = rotation + i * angleStep;
    leavesMarkup += `<ellipse cx="${cx}" cy="${cy - sOff}" rx="${sRx}" ry="${sRy}" fill="${leafFill}" transform="rotate(${angle} ${cx} ${cy})"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${leavesMarkup}<circle cx="${cx}" cy="${cy}" r="${sStem}" fill="${stemFill}"/></svg>`;
}
