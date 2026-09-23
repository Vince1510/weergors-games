import Phaser from "phaser";

export class UIManager {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private fishText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createUI(): void {
    this.scoreText = this.scene.add
      .text(20, 20, "Score: 0", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.fishText = this.scene.add
      .text(20, 50, "Visjes: 🐟 x0", {
        fontSize: "20px",
        color: "#ffdd55",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  public updateScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  public updateFish(count: number): void {
    this.fishText.setText(`Visjes: 🐟 x${count}`);
  }

  public showGameOver(onRestart: () => void): void {
    const screenWidth = this.scene.scale.width;

    this.scene.add
      .text(screenWidth / 2, 260, "GAME OVER!", {
        fontSize: "40px",
        color: "#ff2222",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    const buttonWidth = 240;
    const buttonHeight = 60;
    const buttonX = screenWidth / 2;
    const buttonY = 340;

    const restartBtnBg = this.scene.add
      .graphics()
      .fillStyle(0xff9900, 1)
      .fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12,
      )
      .lineStyle(3, 0xffffff, 1)
      .strokeRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12,
      )
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.add
      .text(buttonX, buttonY, "Opnieuw Spelen", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const buttonZone = this.scene.add
      .zone(buttonX, buttonY, buttonWidth, buttonHeight)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202)
      .setInteractive({ useHandCursor: true });

    buttonZone.on("pointerdown", onRestart);

    buttonZone.on("pointerover", () => {
      restartBtnBg.clear();
      restartBtnBg
        .fillStyle(0xe68a00, 1)
        .fillRoundedRect(
          buttonX - buttonWidth / 2,
          buttonY - buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          12,
        )
        .lineStyle(3, 0xffffff, 1)
        .strokeRoundedRect(
          buttonX - buttonWidth / 2,
          buttonY - buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          12,
        );
    });

    buttonZone.on("pointerout", () => {
      restartBtnBg.clear();
      restartBtnBg
        .fillStyle(0xff9900, 1)
        .fillRoundedRect(
          buttonX - buttonWidth / 2,
          buttonY - buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          12,
        )
        .lineStyle(3, 0xffffff, 1)
        .strokeRoundedRect(
          buttonX - buttonWidth / 2,
          buttonY - buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          12,
        );
    });
  }
}
