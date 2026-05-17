import Phaser from "phaser";
import { Clover } from "../entities/Clover";
import { generateField } from "../systems/FieldGenerator";

const FIELD_MARGIN = 60;
const CLOVER_COUNT = 60;
const TAP_RADIUS = 28;
const NEXT_FIELD_DELAY_MS = 600;

export class FieldScene extends Phaser.Scene {
  private clovers: Clover[] = [];
  private acceptingInput = false;

  constructor() {
    super({ key: "FieldScene" });
  }

  create(): void {
    this.spawnField();

    const btn = this.add
      .text(20, 20, "새 들판", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#00000080",
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    btn.on("pointerdown", () => this.spawnField());

    this.scale.on("resize", () => this.spawnField());
  }

  private spawnField(): void {
    for (const c of this.clovers) c.destroy();
    this.clovers = [];

    const { width, height } = this.scale;
    const field = generateField({
      width: width - FIELD_MARGIN * 2,
      height: height - FIELD_MARGIN * 2,
      count: CLOVER_COUNT,
      seed: Math.floor(Math.random() * 1e9),
    });

    for (const data of field) {
      const clover = new Clover(
        this,
        data.x + FIELD_MARGIN,
        data.y + FIELD_MARGIN,
        data.params,
      );
      clover.setSize(TAP_RADIUS * 2, TAP_RADIUS * 2);
      clover.setInteractive(
        new Phaser.Geom.Circle(TAP_RADIUS, TAP_RADIUS, TAP_RADIUS),
        Phaser.Geom.Circle.Contains,
      );
      clover.on("pointerdown", () => this.handleTap(clover));
      this.clovers.push(clover);
    }

    this.acceptingInput = true;
  }

  private handleTap(clover: Clover): void {
    if (!this.acceptingInput) return;
    if (clover.isFourLeaf()) {
      this.onFound(clover);
    } else {
      this.onMiss(clover);
    }
  }

  private onFound(clover: Clover): void {
    this.acceptingInput = false;

    const baseScale = clover.scale;
    this.tweens.add({
      targets: clover,
      scale: baseScale * 1.6,
      duration: 180,
      ease: "Back.Out",
      yoyo: true,
    });

    const { width, height } = this.scale;
    const toast = this.add
      .text(width / 2, height / 2, "찾았다!", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "44px",
        color: "#ffffff",
        stroke: "#1a3d1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(200);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      scale: { from: 0.8, to: 1.1 },
      duration: 180,
      ease: "Back.Out",
    });

    this.time.delayedCall(NEXT_FIELD_DELAY_MS, () => {
      toast.destroy();
      this.spawnField();
    });
  }

  private onMiss(clover: Clover): void {
    const origX = clover.x;
    this.tweens.add({
      targets: clover,
      x: origX + 4,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        clover.x = origX;
      },
    });
  }
}
