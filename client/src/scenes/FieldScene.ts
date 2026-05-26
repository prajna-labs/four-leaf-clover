import Phaser from "phaser";
import { Clover } from "../entities/Clover";
import { generateField } from "../systems/FieldGenerator";

const FIELD_MARGIN = 60;
const TAP_RADIUS = 28;

const BASE_AREA = 375 * 812;
const BASE_COUNT = 60;
const DENSITY_MIN = 40;
const DENSITY_MAX = 120;

export function computeCloverCount(width: number, height: number): number {
  const area = width * height;
  const raw = Math.floor((area / BASE_AREA) * BASE_COUNT);
  return Math.max(DENSITY_MIN, Math.min(DENSITY_MAX, raw));
}
const HINT_PARTICLE_COUNT = 8;
const HINT_PARTICLE_ALPHA = 0.35;
const HINT_PARTICLE_RADIUS_MIN = 50;
const HINT_PARTICLE_RADIUS_MAX = 70;
const NEXT_FIELD_DELAY_MS = 600;

const HUD_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: "14px",
  color: "#ffffff",
  backgroundColor: "#00000080",
  padding: { x: 10, y: 6 },
};

export class FieldScene extends Phaser.Scene {
  private clovers: Clover[] = [];
  private acceptingInput = false;
  private foundCount = 0;
  private counterText!: Phaser.GameObjects.Text;
  private fieldStartTime = 0;
  private hintBtn!: Phaser.GameObjects.Text;
  private hintUsed = false;

  constructor() {
    super({ key: "FieldScene" });
  }

  create(): void {
    const btn = this.add
      .text(20, 20, "새 들판", HUD_TEXT_STYLE)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    btn.on("pointerdown", () => this.spawnField());

    this.counterText = this.add
      .text(this.scale.width - 20, 20, this.counterLabel(), HUD_TEXT_STYLE)
      .setOrigin(1, 0)
      .setDepth(100);

    this.hintBtn = this.add
      .text(this.scale.width / 2, this.scale.height - 20, "힌트", HUD_TEXT_STYLE)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    this.hintBtn.on("pointerdown", () => this.showHint());

    this.spawnField();

    this.scale.on("resize", () => {
      this.spawnField();
      this.counterText.setPosition(this.scale.width - 20, 20);
      this.hintBtn.setPosition(this.scale.width / 2, this.scale.height - 20);
    });
  }

  private counterLabel(): string {
    return `발견: ${this.foundCount}`;
  }

  private spawnField(): void {
    for (const c of this.clovers) c.destroy();
    this.clovers = [];

    this.fieldStartTime = this.time.now;
    this.hintUsed = false;
    this.hintBtn.setAlpha(1).setInteractive({ useHandCursor: true });

    const { width, height } = this.scale;
    const count = computeCloverCount(width, height);
    const field = generateField({
      width: width - FIELD_MARGIN * 2,
      height: height - FIELD_MARGIN * 2,
      count,
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
    this.foundCount += 1;
    this.counterText.setText(this.counterLabel());

    const elapsed = (this.time.now - this.fieldStartTime) / 1000;

    this.tweens.add({
      targets: this.counterText,
      scale: 1.25,
      duration: 130,
      yoyo: true,
      ease: "Back.Out",
    });

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
      .text(width / 2, height / 2, `찾았다!\n${elapsed.toFixed(1)}초`, {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "44px",
        color: "#ffffff",
        stroke: "#1a3d1f",
        strokeThickness: 5,
        align: "center",
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

  private showHint(): void {
    if (this.hintUsed) return;
    this.hintUsed = true;
    this.hintBtn.setAlpha(0.35).disableInteractive();

    const fourLeaf = this.clovers.find((c) => c.isFourLeaf());
    if (!fourLeaf) return;

    const chars = ["✦", "✧"];
    for (let i = 0; i < HINT_PARTICLE_COUNT; i++) {
      const angle =
        (i / HINT_PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const radius =
        HINT_PARTICLE_RADIUS_MIN +
        Math.random() * (HINT_PARTICLE_RADIUS_MAX - HINT_PARTICLE_RADIUS_MIN);
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      const delay = Math.random() * 600;

      const particle = this.add
        .text(fourLeaf.x, fourLeaf.y, chars[i % 2], {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: i % 2 === 0 ? "10px" : "9px",
          color: "#ffe87a",
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(150);

      this.tweens.add({
        targets: particle,
        x: fourLeaf.x + dx,
        y: fourLeaf.y + dy,
        alpha: HINT_PARTICLE_ALPHA,
        duration: 1000,
        delay,
        ease: "Sine.Out",
        onComplete: () => {
          this.tweens.add({
            targets: particle,
            alpha: 0,
            duration: 1000,
            ease: "Sine.In",
            onComplete: () => particle.destroy(),
          });
        },
      });
    }
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
