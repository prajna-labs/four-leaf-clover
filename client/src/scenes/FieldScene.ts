import Phaser from "phaser";
import { Clover } from "../entities/Clover";
import { generateField } from "../systems/FieldGenerator";

const FIELD_MARGIN = 60;
const CLOVER_COUNT = 60;
const TAP_RADIUS = 28;
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
  private timerText!: Phaser.GameObjects.Text;
  private fieldStartTime = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

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

    this.timerText = this.add
      .text(this.scale.width / 2, 20, "0.0초", HUD_TEXT_STYLE)
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.spawnField();

    this.scale.on("resize", () => {
      this.spawnField();
      this.counterText.setPosition(this.scale.width - 20, 20);
      this.timerText.setX(this.scale.width / 2);
    });
  }

  private counterLabel(): string {
    return `발견: ${this.foundCount}`;
  }

  private spawnField(): void {
    for (const c of this.clovers) c.destroy();
    this.clovers = [];

    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
    this.fieldStartTime = this.time.now;
    this.timerText.setText("0.0초");
    this.timerEvent = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        const elapsed = (this.time.now - this.fieldStartTime) / 1000;
        this.timerText.setText(elapsed.toFixed(1) + "초");
      },
    });

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
    this.foundCount += 1;
    this.counterText.setText(this.counterLabel());

    const elapsed = (this.time.now - this.fieldStartTime) / 1000;
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

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
      .text(width / 2, height / 2, `찾았다! (${elapsed.toFixed(1)}초)`, {
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
