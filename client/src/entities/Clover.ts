import Phaser from "phaser";
import { LEAF_OFFSET, LEAF_RX, LEAF_RY, STEM_R, type CloverParams } from "./cloverSvg";

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
