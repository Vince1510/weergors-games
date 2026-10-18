import Phaser from "phaser";
import { Backpack } from "../entities/Backpack";

export class GameScene extends Phaser.Scene {
  private backpack!: Backpack;
  private items!: Phaser.Physics.Arcade.Group;
  private groundSensor!: Phaser.GameObjects.Zone;

  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private missesText!: Phaser.GameObjects.Text;
  private wrongItemsText!: Phaser.GameObjects.Text;
  private spawnTimer!: Phaser.Time.TimerEvent;

  private clouds!: Phaser.GameObjects.Container[];

  private score: number = 0;
  private misses: number = 0;
  private wrongItemsCaught: number = 0;
  private readonly maxMisses: number = 3;
  private readonly maxWrongItems: number = 3;
  private isGameOver: boolean = false;
  private spawnDelay: number = 1200;
  private highScore: number = 0;
  private readonly baseSpawnDelay: number = 1200;

  constructor() {
    super({ key: "GameScene" });
  }

  public init(): void {
    this.score = 0;
    this.misses = 0;
    this.wrongItemsCaught = 0;
    this.isGameOver = false;
    this.spawnDelay = this.baseSpawnDelay;

    const savedHighScore = localStorage.getItem("backpack_catcher_highscore");
    this.highScore = savedHighScore ? Number.parseInt(savedHighScore, 10) || 0 : 0;
  }

  public preload(): void {
    // Laad de rugzak direct via het pad uit de public-map
    this.load.image("backpack", "/games/backpack-catcher/assets/backpack.png");

    const graphics = this.make.graphics();

    graphics.fillStyle(0xb91c1c, 1);
    graphics.fillCircle(18, 22, 14);
    graphics.fillStyle(0x7f1d1d, 1);
    graphics.fillRect(17, 3, 4, 9);
    graphics.fillStyle(0x22c55e, 1);
    graphics.fillEllipse(25, 7, 13, 7);
    graphics.generateTexture("item_apple", 36, 40);
    graphics.clear();

    graphics.fillStyle(0xfacc15, 1);
    graphics.fillCircle(18, 22, 14);
    graphics.fillStyle(0x92400e, 1);
    graphics.fillRect(17, 3, 4, 9);
    graphics.fillStyle(0x22c55e, 1);
    graphics.fillEllipse(25, 7, 13, 7);
    graphics.lineStyle(2, 0xfff7ae, 1);
    graphics.strokeCircle(18, 22, 12);
    graphics.generateTexture("item_golden_apple", 36, 40);
    graphics.clear();

    graphics.fillStyle(0xf472b6, 1);
    graphics.fillEllipse(18, 22, 12, 19);
    graphics.fillCircle(12, 12, 7);
    graphics.fillCircle(24, 12, 7);
    graphics.fillStyle(0xfbcfe8, 1);
    graphics.fillEllipse(14, 19, 3, 6);
    graphics.fillEllipse(22, 19, 3, 6);
    graphics.fillStyle(0x831843, 1);
    graphics.fillCircle(14, 12, 1.5);
    graphics.fillCircle(22, 12, 1.5);
    graphics.lineStyle(2, 0xbe185d, 1);
    graphics.strokeEllipse(18, 22, 11, 18);
    graphics.generateTexture("item_worm", 36, 40);
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

    // 4. Grasheuvels en een gelaagde grasbodem
    const bgGraphics = this.add.graphics();

    bgGraphics.fillStyle(0x7c4a24, 1);
    bgGraphics.fillRect(0, height - 66, width, 66);
    bgGraphics.fillStyle(0x398b3d, 1);
    bgGraphics.fillRect(0, height - 112, width, 54);
    bgGraphics.fillCircle(width * 0.15, height - 106, 42);
    bgGraphics.fillCircle(width * 0.42, height - 101, 50);
    bgGraphics.fillCircle(width * 0.73, height - 108, 46);
    bgGraphics.fillCircle(width * 0.94, height - 103, 38);

    bgGraphics.fillStyle(0x59b84a, 1);
    bgGraphics.fillRect(0, height - 112, width, 22);
    bgGraphics.fillStyle(0x8cdb62, 1);
    bgGraphics.fillRect(0, height - 112, width, 5);

    bgGraphics.fillStyle(0x2f8f46, 1);
    for (let x = 8; x < width; x += 22) {
      bgGraphics.fillTriangle(
        x,
        height - 108,
        x + 5,
        height - 121 - (x % 3) * 2,
        x + 11,
        height - 108,
      );
    }

    bgGraphics.fillStyle(0xfde68a, 1);
    for (let x = 18; x < width; x += 61) {
      bgGraphics.fillCircle(x, height - 83, 3);
      bgGraphics.fillCircle(x + 5, height - 87, 3);
      bgGraphics.fillCircle(x + 10, height - 83, 3);
      bgGraphics.fillCircle(x + 5, height - 79, 3);
      bgGraphics.fillStyle(0xf59e0b, 1);
      bgGraphics.fillCircle(x + 5, height - 83, 2);
      bgGraphics.fillStyle(0xfde68a, 1);
    }
    this.createAppleTree(width, height);
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
      .text(width - 20, 20, `Gemist: 0/${this.maxMisses}`, {
        fontSize: "22px",
        color: "#d63031",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);
    this.wrongItemsText = this.add
      .text(width - 20, 50, `Verkeerd: 0/${this.maxWrongItems}`, {
        fontSize: "18px",
        color: "#7c2d12",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);
    this.add
      .text(width / 2, 92, "VANG ALLEEN APPELS  •  WORMEN LATEN VALLEN", {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#14532dcc",
        padding: { x: 10, y: 7 },
        stroke: "#052e16",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

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

  private createAppleTree(width: number, height: number): void {
    const tree = this.add.graphics();
    const canopyY = height * 0.32;
    const treeCount = Math.ceil(width / 120) + 1;
    const spacing = width / (treeCount - 1);

    for (let treeIndex = 0; treeIndex < treeCount; treeIndex++) {
      const centerX = treeIndex * spacing;
      const treeTop = canopyY + Phaser.Math.Between(-8, 8);

      tree.fillStyle(0x7c4a24, 1);
      tree.fillRoundedRect(
        centerX - 13,
        treeTop + 52,
        26,
        height - (treeTop + 52),
        9,
      );
      tree.fillRoundedRect(centerX - 42, treeTop + 78, 34, 12, 6);
      tree.fillRoundedRect(centerX + 8, treeTop + 91, 38, 11, 5);

      tree.fillStyle(0x166534, 1);
      tree.fillCircle(centerX - 31, treeTop + 31, 34);
      tree.fillCircle(centerX, treeTop + 8, 42);
      tree.fillCircle(centerX + 34, treeTop + 31, 36);
      tree.fillCircle(centerX, treeTop + 49, 38);

      tree.fillStyle(0x22c55e, 0.82);
      tree.fillCircle(centerX - 13, treeTop - 2, 21);
      tree.fillCircle(centerX + 27, treeTop + 19, 19);

      tree.fillStyle(0xef4444, 1);
      for (const [offsetX, offsetY] of [
        [-27, 29],
        [-5, 3],
        [23, 34],
        [2, 48],
      ]) {
        const appleX = centerX + offsetX;
        const appleY = treeTop + offsetY;
        tree.fillCircle(appleX, appleY, 6);
        tree.fillStyle(0x7c3f16, 1);
        tree.fillRect(appleX - 1, appleY - 9, 2, 4);
        tree.fillStyle(0xef4444, 1);
      }
    }
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

    const { width, height } = this.scale;
    const difficulty = Math.min(8, Math.floor(this.score / 100));
    this.spawnDelay = Math.max(450, this.baseSpawnDelay - difficulty * 90);
    this.spawnTimer.delay = this.spawnDelay;

    const roll = Phaser.Math.Between(1, 100);
    const badChance = Math.min(45, 25 + difficulty * 2.5);
    const goldenChance = 13;
    const kind =
      roll <= badChance
        ? "bad"
        : roll <= badChance + goldenChance
          ? "golden"
          : "apple";
    const texture =
      kind === "bad"
        ? "item_worm"
        : kind === "golden"
          ? "item_golden_apple"
          : "item_apple";

    const x = Phaser.Math.Between(30, width - 30);
    const item = this.items.create(
      x,
      height * 0.32 + Phaser.Math.Between(-45, 45),
      texture,
    ) as Phaser.Physics.Arcade.Sprite;

    item.setData("kind", kind);
    const speed = Phaser.Math.Between(
      180 + difficulty * 25,
      320 + difficulty * 35,
    );
    item.setVelocityY(speed);
  }

  private catchItem(_backpack: unknown, item: unknown): void {
    const caughtItem = item as Phaser.Physics.Arcade.Sprite;
    if (!caughtItem.active || this.isGameOver) return;

    const kind = caughtItem.getData("kind") as string;
    caughtItem.destroy();

    if (kind === "bad") {
      this.wrongItemsCaught += 1;
      this.wrongItemsText.setText(
        `Verkeerd: ${this.wrongItemsCaught}/${this.maxWrongItems}`,
      );
      if (this.wrongItemsCaught >= this.maxWrongItems) {
        this.triggerGameOver("Je ving te vaak iets verkeerds!");
      }
      return;
    }

    this.score += kind === "golden" ? 50 : 10;
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
    const missedItem = item as Phaser.Physics.Arcade.Sprite;
    if (!missedItem.active || this.isGameOver) return;

    const kind = missedItem.getData("kind") as string;
    missedItem.destroy();
    if (kind === "bad") return;

    this.misses += 1;
    this.missesText.setText(`Gemist: ${this.misses}/${this.maxMisses}`);

    if (this.misses >= this.maxMisses) {
      this.triggerGameOver("Je miste te veel appels!");
    }
  }

  private triggerGameOver(reason: string): void {
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
    this.add
      .text(width / 2, height / 2 + 42, reason, {
        fontSize: "16px",
        color: "#fca5a5",
      })
      .setOrigin(0.5);

    const restartBtn = this.add
      .text(width / 2, height / 2 + 92, " Opnieuw Spelen ", {
        fontSize: "20px",
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
