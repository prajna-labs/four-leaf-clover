import Phaser from "phaser";
import { Clover } from "../entities/Clover";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 40, "Clover 엔티티 — §6.2 데모", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0);

    const cols = 4;
    const rows = 3;
    const cellW = width / (cols + 1);
    const cellH = (height - 120) / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        new Clover(this, cellW * (c + 1), 120 + cellH * (r + 1), {
          leaves: idx % 5 === 0 ? 4 : 3,
          hue: 90 + Math.random() * 60,
          scale: 0.9 + Math.random() * 0.8,
          rotation: Math.random() * 360,
        });
      }
    }
  }
}
