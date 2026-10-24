import Phaser from "phaser";

interface GameOverData {
  score: number;
  bestScore: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  public create(data: GameOverData): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x113b4b, 0.78)
      .setInteractive();
    this.add
      .rectangle(width / 2, height / 2, width - 48, 320, 0xfff7df)
      .setStrokeStyle(5, 0x5b9fcb);

    this.add
      .text(width / 2, height / 2 - 112, "OEPS, JE VIEL!", {
        fontFamily: "Arial, sans-serif",
        fontSize: "32px",
        color: "#174b65",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 38, `Hoogte: ${data.score}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "25px",
        color: "#28657a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 5, `Beste score: ${data.bestScore}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#568093",
      })
      .setOrigin(0.5);

    const restartButton = this.add
      .text(width / 2, height / 2 + 88, "OPNIEUW SPELEN", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#489d78",
        padding: { x: 22, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restartButton.on("pointerdown", () => {
      this.scene.stop("GameScene");
      this.scene.start("GameScene");
    });
    restartButton.on("pointerover", () =>
      restartButton.setStyle({ backgroundColor: "#368262" }),
    );
    restartButton.on("pointerout", () =>
      restartButton.setStyle({ backgroundColor: "#489d78" }),
    );
  }
}
