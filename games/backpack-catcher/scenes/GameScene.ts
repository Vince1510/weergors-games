import Phaser from "phaser";
import { Backpack } from "../entities/Backpack";

export class GameScene extends Phaser.Scene {
  private backpack!: Backpack;
  private items!: Phaser.Physics.Arcade.Group;
  private groundSensor!: Phaser.GameObjects.Zone;

  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private missesText!: Phaser.GameObjects.Text;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private clouds!: Phaser.GameObjects.Container[];

  private score: number = 0;
  private misses: number = 0;
  private maxMisses: number = 5;
  private isGameOver: boolean = false;
  private spawnDelay: number = 1200;
  private highScore: number = 0;

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
    // Laad de rugzak direct via het pad uit de public-map
    this.load.image("backpack", "/games/backpack-catcher/assets/backpack.png");

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
    graphics.destroy();
  }

  public create(): void {
    const { width, height } = this.scale;

    // --- ZOMERSE CARTOON ACHTERGROND ---

    // 1. Zonnige hemel blauw
    this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);

    // 2. Stralende cartoon zon met pulse-animatie
    const sun = this.add.circle(width - 60, 70, 45, 0xffd700, 1);
    this.tweens.add({
      targets: sun,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 3. Geanimeerde wolken die langzaam voorbijdrijven
    this.clouds = [];
    for (let i = 0; i < 3; i++) {
      const cloudX = Phaser.Math.Between(0, width);
      const cloudY = Phaser.Math.Between(50, 200);
      const cloudContainer = this.createCloud(cloudX, cloudY);
      (cloudContainer as any).speed = Phaser.Math.FloatBetween(0.2, 0.5);
      this.clouds.push(cloudContainer);
    }

    // 4. Grasheuvels en bodem aan de onderkant (Cartoon Style)
    const bgGraphics = this.make.graphics();

    // Achterste grasheuvels (donkerder groen)
    bgGraphics.fillStyle(0x27ae60, 1);
    bgGraphics.fillCircle(width * 0.2, height - 30, 120);
    bgGraphics.fillCircle(width * 0.7, height - 20, 160);

    // Voorste graslaag (fris groen)
    bgGraphics.fillStyle(0x2ecc71, 1);
    bgGraphics.fillRect(0, height - 60, width, 80);
    bgGraphics.fillCircle(width * 0.4, height - 50, 90);
    bgGraphics.fillCircle(width * 0.9, height - 40, 110);

    // Vrolijke graspolletjes op de rand
    bgGraphics.fillStyle(0x27ae60, 1);
    for (let x = 15; x < width; x += 35) {
      bgGraphics.fillTriangle(
        x,
        height - 60,
        x + 8,
        height - 80,
        x + 16,
        height - 60,
      );
    }
    bgGraphics.destroy();
    // ------------------------------------

    this.groundSensor = this.add.zone(width / 2, height + 20, width, 20);
    this.physics.add.existing(this.groundSensor, true);

    this.backpack = new Backpack(this, width / 2, height - 70);
    this.items = this.physics.add.group();

    this.physics.add.overlap(
      this.backpack,
      this.items,
      (backpackObj, itemObj) => {
        this.catchItem(backpackObj, itemObj);
      },
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.groundSensor,
      this.items,
      (sensorObj, itemObj) => {
        this.missItem(sensorObj, itemObj);
      },
      undefined,
      this,
    );

    // UI & Touch Input
    this.scoreText = this.add.text(20, 20, `Score: 0`, {
      fontSize: "22px",
      color: "#fff",
      fontStyle: "bold",
    });
    this.highScoreText = this.add.text(
      20,
      50,
      `High Score: ${this.highScore}`,
      { fontSize: "18px", color: "#ffeaa7", fontStyle: "bold" },
    );
    this.missesText = this.add
      .text(width - 20, 20, `Gemist: 0/5`, {
        fontSize: "22px",
        color: "#d63031",
        fontStyle: "bold",
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

  private createCloud(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const cloudGraphics = this.make.graphics();

    cloudGraphics.fillStyle(0xffffff, 0.9);
    cloudGraphics.fillCircle(0, 0, 20);
    cloudGraphics.fillCircle(15, -10, 25);
    cloudGraphics.fillCircle(35, 0, 20);
    cloudGraphics.fillRect(-10, 0, 55, 20);

    const textureKey = `cloud_${Math.random()}`;
    cloudGraphics.generateTexture(textureKey, 80, 40);
    cloudGraphics.destroy();

    const cloudImage = this.add.image(0, 0, textureKey);
    container.add(cloudImage);
    return container;
  }

  public override update(): void {
    if (this.isGameOver) return;

    const width = this.scale.width;
    this.clouds.forEach((cloud) => {
      cloud.x += (cloud as any).speed;
      if (cloud.x > width + 100) {
        cloud.x = -100;
        cloud.y = Phaser.Math.Between(50, 200);
      }
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
