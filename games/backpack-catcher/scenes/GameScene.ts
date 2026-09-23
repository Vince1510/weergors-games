import Phaser from "phaser";
import { Backpack } from "../entities/Backpack";
import backpackImg from "../../../public/games/backpack-catcher/assets/backpack.png";

export class GameScene extends Phaser.Scene {
  private backpack!: Backpack;
  private items!: Phaser.Physics.Arcade.Group;
  private groundSensor!: Phaser.GameObjects.Zone;

  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private missesText!: Phaser.GameObjects.Text;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private score: number = 0;
  private misses: number = 0;
  private maxMisses: number = 5;
  private isGameOver: boolean = false;
  private spawnDelay: number = 1200;
  private highScore: number = 0;

  // overerving
  constructor() {
    super({ key: "GameScene" });
  }

  public init(): void {
    this.score = 0;
    this.misses = 0;
    this.isGameOver = false;
    this.spawnDelay = 1200;

    const savedHighScore = localStorage.getItem("backpack_catcher_highscore");
    this.highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
  }

  public preload(): void {
    this.load.image("backpack", backpackImg);

    const graphics = this.make.graphics();

    // Zaklamp
    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture("item_flashlight", 30, 30);
    graphics.clear();

    // Tent
    graphics.fillStyle(0x2ecc71, 1);
    graphics.fillTriangle(15, 0, 0, 30, 30, 30);
    graphics.generateTexture("item_tent", 30, 30);
    graphics.clear();

    // Marshmallow
    graphics.fillStyle(0xecf0f1, 1);
    graphics.fillRoundedRect(0, 0, 25, 30, 6);
    graphics.generateTexture("item_marshmallow", 25, 30);
    graphics.destroy(); // Ruimt het tijdelijke graphics-object op uit het geheugen
  }

  public create(): void {
    const { width, height } = this.scale;

    this.groundSensor = this.add.zone(width / 2, height + 20, width, 20);
    this.physics.add.existing(this.groundSensor, true);

    this.backpack = new Backpack(this, width / 2, height - 70);
    this.items = this.physics.add.group();

    // 🔍 LOG 1: Check of de speler & fysica correct zijn geïnitieerd
    console.log("🎮 GameScene Gestart. Backpack Body:", this.backpack.body);

    // Dynamic Overlap met Console Logs
    this.physics.add.overlap(
      this.backpack,
      this.items,
      (backpackObj, itemObj) => {
        console.log("🎯 HIT! Backpack raakt een item:", itemObj);
        this.catchItem(backpackObj, itemObj);
      },
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.groundSensor,
      this.items,
      (sensorObj, itemObj) => {
        console.log("❌ GEMIST! Item raakt de grond:", itemObj);
        this.missItem(sensorObj, itemObj);
      },
      undefined,
      this,
    );

    // UI & Touch Input
    this.scoreText = this.add.text(20, 20, `Score: 0`, {
      fontSize: "22px",
      color: "#fff",
    });
    this.highScoreText = this.add.text(
      20,
      50,
      `High Score: ${this.highScore}`,
      { fontSize: "18px", color: "#f1c40f" },
    );
    this.missesText = this.add
      .text(width - 20, 20, `Gemist: 0/5`, {
        fontSize: "22px",
        color: "#e74c3c",
      })
      .setOrigin(1, 0);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameOver) {
        this.backpack.moveTo(pointer.x);
      }
    });

    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnItem(): void {
    if (this.isGameOver) return;

    const { width } = this.scale;
    const itemKeys = ["item_flashlight", "item_tent", "item_marshmallow"];
    const randomKey = Phaser.Utils.Array.GetRandom(itemKeys);

    const x = Phaser.Math.Between(40, width - 40);
    const item = this.items.create(
      x,
      -30,
      randomKey,
    ) as Phaser.Physics.Arcade.Sprite;

    // 🔍 LOG 2: Check of het item een physics body heeft
    console.log(
      `📦 Item gespawned (${randomKey}) op X:${x}. Body actief:`,
      !!item.body,
    );

    const speed = Phaser.Math.Between(180, 320);
    item.setVelocityY(speed);
  }

  private catchItem(_backpack: unknown, item: unknown): void {
    (item as Phaser.GameObjects.GameObject).destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText(`High Score: ${this.highScore}`);
      localStorage.setItem(
        "backpack_catcher_highscore",
        this.highScore.toString(),
      );
    }
  }

  private missItem(_sensor: unknown, item: unknown): void {
    (item as Phaser.GameObjects.GameObject).destroy();
    if (this.isGameOver) return;

    this.misses += 1;
    this.missesText.setText(`Gemist: ${this.misses}/5`);

    if (this.misses >= this.maxMisses) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    this.physics.pause();
    this.spawnTimer.remove();

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.add
      .text(width / 2, height / 2 - 40, "GAME OVER", {
        fontSize: "40px",
        color: "#e74c3c",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 10, `Eindscore: ${this.score}`, {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5);

    const restartBtn = this.add
      .text(width / 2, height / 2 + 70, " Opnieuw Spelen ", {
        fontSize: "22px",
        color: "#000",
        backgroundColor: "#2ecc71",
        padding: { x: 15, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    restartBtn.on("pointerdown", () => {
      this.scene.restart();
    });
  }
}
