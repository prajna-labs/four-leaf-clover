import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, "네잎클로버 찾기\nPhase 1 부트스트랩 OK", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "28px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
  }
}
