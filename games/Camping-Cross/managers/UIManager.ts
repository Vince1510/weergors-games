import Phaser from "phaser";

export class UIManager {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private fishText!: Phaser.GameObjects.Text;

  private static readonly STORAGE_KEY = "camping_cross_high_score_v1";

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

    const currentHighScore = this.getHighScore();
    this.highScoreText = this.scene.add
      .text(20, 52, `High Score: ${currentHighScore}`, {
        fontSize: "18px",
        color: "#ffd700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.fishText = this.scene.add
      .text(20, 82, "Visjes: 🐟 x0", {
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

    // Check of de huidige score hoger is dan de high score en sla op
    if (this.saveHighScore(score)) {
      this.highScoreText.setText(`High Score: ${score}`);
    }
  }

  public updateFish(count: number): void {
    this.fishText.setText(`Visjes: 🐟 x${count}`);
  }

  private getHighScore(): number {
    try {
      const saved = localStorage.getItem(UIManager.STORAGE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  private saveHighScore(newScore: number): boolean {
    const currentHigh = this.getHighScore();
    if (newScore > currentHigh) {
      try {
        localStorage.setItem(UIManager.STORAGE_KEY, newScore.toString());
        return true;
      } catch (e) {
        // Negeren bij opslagfouten
      }
    }
    return false;
  }

  public showGameOver(finalScore: number, onRestart?: () => void): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    const finalHighScore = this.getHighScore();

    // --- ACHTERGROND CARD / PANEEL ---
    const cardWidth = 360;
    const cardHeight = 240;
    const cardX = screenWidth / 2;
    const cardY = screenHeight / 2 - 20;

    const cardBg = this.scene.add
      .graphics()
      .fillStyle(0x0b192c, 0.9) // Donkerblauwe stijlvolle kleur
      .fillRoundedRect(
        cardX - cardWidth / 2,
        cardY - cardHeight / 2,
        cardWidth,
        cardHeight,
        16,
      )
      .lineStyle(3, 0x00ffcc, 1) // Mooie cyaan rand
      .strokeRoundedRect(
        cardX - cardWidth / 2,
        cardY - cardHeight / 2,
        cardWidth,
        cardHeight,
        16,
      )
      .setScrollFactor(0)
      .setDepth(190);

    // --- GAME OVER TITEL ---
    this.scene.add
      .text(cardX, cardY - 70, "GAME OVER!", {
        fontSize: "36px",
        color: "#ff2222",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    // --- SCORES ---
    this.scene.add
      .text(
        cardX,
        cardY - 15,
        `Eindscore: ${finalScore}  |  High Score: ${finalHighScore}`,
        {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    // --- OPNIEUW SPELEN KNOP ---
    const buttonWidth = 240;
    const buttonHeight = 50;
    const buttonX = cardX;
    const buttonY = cardY + 55;

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
        fontSize: "20px",
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

    buttonZone.on("pointerdown", () => {
      if (typeof onRestart === "function") {
        onRestart();
      } else {
        this.scene.scene.restart();
      }
    });

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
