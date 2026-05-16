import Phaser from "phaser";

export interface CloverParams {
  leaves: 3 | 4;
  hue: number;
  scale: number;
  rotation: number;
}

const LEAF_RX = 10;
const LEAF_RY = 16;
const LEAF_OFFSET = 12;
const STEM_R = 3;
const BASE_SIZE = (LEAF_OFFSET + LEAF_RY) * 2;

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

export class Clover extends Phaser.GameObjects.Container {
  public readonly leaves: 3 | 4;
  public readonly hue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, params: CloverParams) {
    super(scene, x, y);
    this.leaves = params.leaves;
    this.hue = params.hue;

    const leafColor = Phaser.Display.Color.HSLToColor(params.hue / 360, 0.55, 0.42).color;
    const stemColor = Phaser.Display.Color.HSLToColor(params.hue / 360, 0.5, 0.25).color;
    const angleStep = 360 / params.leaves;

    for (let i = 0; i < params.leaves; i++) {
      const rad = Phaser.Math.DegToRad(i * angleStep);
      const leaf = scene.add.ellipse(0, 0, LEAF_RX * 2, LEAF_RY * 2, leafColor);
      leaf.setRotation(rad);
      leaf.setPosition(Math.sin(rad) * LEAF_OFFSET, -Math.cos(rad) * LEAF_OFFSET);
      this.add(leaf);
    }

    const stem = scene.add.circle(0, 0, STEM_R, stemColor);
    this.add(stem);

    this.setRotation(Phaser.Math.DegToRad(params.rotation));
    this.setScale(params.scale);

    scene.add.existing(this);
  }

  isFourLeaf(): boolean {
    return this.leaves === 4;
  }
}
