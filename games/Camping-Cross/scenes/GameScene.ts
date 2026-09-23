import Phaser from "phaser";
import { Fish } from "../entities/Fish";
import { Log } from "../entities/Log";
import { Tree } from "../entities/Tree";
import { Player } from "../entities/Player";
import { InputManager } from "../managers/InputManager";
import { LaneManager } from "../managers/LaneManager";
import { UIManager } from "../managers/UIManager";

export class JobTheCatScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private laneManager!: LaneManager;
  private uiManager!: UIManager;

  private gridTileSize: number = 50;
  private highestYReached: number = 0;
  private fishCount: number = 0;
  private score: number = 0;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: "JobTheCatScene" });
  }

  preload(): void {
    this.load.image("dog", "/games/Camping-Cross/assets/dog.png");
    this.load.image("fish", "/games/Camping-Cross/assets/fish.png");
    this.load.image("skelter", "/games/Camping-Cross/assets/skelter.png");
    this.load.image("job", "/games/Camping-Cross/assets/Job.png");
    this.createPlaceholderTextures();
  }

  create(): void {
    this.isGameOver = false;
    this.score = 0;
    this.fishCount = 0;

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    this.inputManager = new InputManager(this);
    this.laneManager = new LaneManager(this, this.gridTileSize);
    this.uiManager = new UIManager(this);

    this.laneManager.init();
    this.uiManager.createUI();

    const startX =
      Math.floor(screenWidth / 2 / this.gridTileSize) * this.gridTileSize +
      this.gridTileSize / 2;
    const startY = screenHeight - 100;
    this.highestYReached = startY;

    this.player = new Player(this, startX, startY, this.gridTileSize);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 150);

    this.inputManager.setupControls(
      (dx, dy) => this.movePlayer(dx, dy),
      () => this.isGameOver,
    );

    // Obstakel botsing (auto's / honden)
    this.physics.add.overlap(
      this.player,
      this.laneManager.obstacles,
      this.hitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Visjes verzamelen
    this.physics.add.overlap(
      this.player,
      this.laneManager.fishes,
      this.collectFish as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.time.addEvent({
      delay: 700,
      callback: () =>
        this.laneManager.spawnObstaclesForActiveLanes(this.isGameOver),
      callbackScope: this,
      loop: true,
    });
  }

  override update(time: number, delta: number): void {
    if (this.isGameOver) return;

    this.inputManager.updateKeyboard((dx, dy) => this.movePlayer(dx, dy));

    // 1. LAAT ALLE BOOMSTAMMEN ZELFSTANDIG DRIJVEN
    this.laneManager.logs.getChildren().forEach((gameObject) => {
      const log = gameObject as Log;
      if (log && log.active) {
        log.updateLog(delta);
      }
    });

    // 2. CONTROLEER WATER & SPOOL
    this.checkWaterAndLogs(delta);

    while (this.player.y - 500 < this.laneManager.nextLaneY) {
      this.laneManager.generateRandomLane();
    }

    this.laneManager.cleanupOldObjects();
  }

  private checkWaterAndLogs(delta: number): void {
    const currentLane = this.laneManager.lanes.find(
      (lane) => Math.abs(lane.y - this.player.y) < this.gridTileSize / 2,
    );

    if (currentLane && currentLane.type === "water") {
      let currentLog: Log | null = null;
      const playerBounds = this.player.getBounds();

      // Check of de speler op een van de bewegende stammen staat
      this.laneManager.logs.getChildren().forEach((gameObject) => {
        const log = gameObject as Log;
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            playerBounds,
            log.getBounds(),
          )
        ) {
          currentLog = log;
        }
      });

      if (currentLog) {
        // De speler staat op een bewegende stam en drijft mee
        this.player.x +=
          ((currentLog as Log).direction * (currentLog as Log).speed * delta) /
          1000;

        // Uit het scherm gedreven = Game Over
        if (this.player.x < 0 || this.player.x > this.scale.width) {
          this.hitObstacle();
        }
      } else {
        // In het water gesprongen = Verdrinken
        this.hitObstacle();
      }
    }
  }

  private movePlayer(dx: number, dy: number): void {
    const snappedX = Phaser.Math.Snap.To(
      this.player.x,
      this.gridTileSize,
      this.gridTileSize / 2,
    );
    this.player.x = snappedX;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    // Check of er een boom staat op het beoogde doel-vakje
    const isBlockedByTree = this.laneManager.trees.getChildren().some((obj) => {
      const tree = obj as Tree;
      return (
        Math.abs(tree.x - targetX) < this.gridTileSize / 2 &&
        Math.abs(tree.y - targetY) < this.gridTileSize / 2
      );
    });

    if (isBlockedByTree) {
      return; // Blokkeer de stap als er een boom staat
    }

    const maxAllowedY = Math.min(
      this.scale.height - 100,
      this.highestYReached + this.gridTileSize * 2,
    );

    if (dy > 0 && targetY > maxAllowedY) return;

    this.player.move(dx, dy, this.scale.width);

    if (this.player.y < this.highestYReached) {
      const distanceStepped = Math.floor(
        (this.highestYReached - this.player.y) / this.gridTileSize,
      );
      this.highestYReached = this.player.y;
      this.score += distanceStepped;
      this.uiManager.updateScore(this.score);
    }
  }

  private collectFish(_player: Player, fish: Fish): void {
    fish.collect();
    this.fishCount += 1;
    this.score += 10;
    this.uiManager.updateFish(this.fishCount);
    this.uiManager.updateScore(this.score);
  }

  private hitObstacle(): void {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();
    this.player.die();

    this.uiManager.showGameOver(() => this.scene.restart());
  }

  private createPlaceholderTextures(): void {
    if (!this.textures.exists("tile_grass")) {
      const gGrass = this.make.graphics();
      gGrass.fillStyle(0x7ec850);
      gGrass.fillRect(0, 0, 50, 50);
      gGrass.lineStyle(1, 0x6db840);
      gGrass.strokeRect(0, 0, 50, 50);
      gGrass.generateTexture("tile_grass", 50, 50);
    }

    if (!this.textures.exists("tile_road")) {
      const gRoad = this.make.graphics();
      gRoad.fillStyle(0xd2b48c);
      gRoad.fillRect(0, 0, 50, 50);
      gRoad.fillStyle(0xc2a47c);
      gRoad.fillRect(5, 5, 40, 40);
      gRoad.generateTexture("tile_road", 50, 50);
    }

    if (!this.textures.exists("job_cat")) {
      const gCat = this.make.graphics();
      gCat.fillStyle(0xff9900);
      gCat.fillCircle(20, 20, 16);
      gCat.fillStyle(0xffffff);
      gCat.fillCircle(14, 15, 4);
      gCat.fillCircle(26, 15, 4);
      gCat.fillStyle(0x000000);
      gCat.fillCircle(14, 15, 2);
      gCat.fillCircle(26, 15, 2);
      gCat.generateTexture("job_cat", 40, 40);
    }
  }
}
