import Phaser from "phaser";
import { Obstacle } from "../entities/Obstacle";
import type { ObstacleType } from "../entities/Obstacle";
import { Fish } from "../entities/Fish";
import { Log } from "../entities/Log";
import { Tree } from "../entities/Tree";

export interface LaneConfig {
  y: number;
  type: "grass" | "road" | "water";
  direction?: number;
  speed?: number;
  obstacleType?: ObstacleType;
}

export class LaneManager {
  private scene: Phaser.Scene;
  public lanes: LaneConfig[] = [];
  public obstacles!: Phaser.Physics.Arcade.Group;
  public logs!: Phaser.Physics.Arcade.Group;
  public fishes!: Phaser.Physics.Arcade.Group;
  public trees!: Phaser.Physics.Arcade.Group;
  public nextLaneY: number = 600;
  private gridTileSize: number;

  private worldWidth: number = 1200; // Vaste brede wereld (24 kolommen van 50px)
  private sideBuffer: number = 300;

  constructor(scene: Phaser.Scene, gridTileSize: number) {
    this.scene = scene;
    this.gridTileSize = gridTileSize;
  }

  public init(): void {
    this.lanes = [];
    this.obstacles = this.scene.physics.add.group();
    this.logs = this.scene.physics.add.group();
    this.fishes = this.scene.physics.add.group();
    this.trees = this.scene.physics.add.group();

    this.createPlaceholderTextures();

    const screenHeight = this.scene.scale.height;
    for (
      let y = screenHeight + this.gridTileSize * 2;
      y >= screenHeight - 200;
      y -= this.gridTileSize
    ) {
      this.createLane(y, "grass");
    }
    this.nextLaneY = screenHeight - 250;

    while (this.nextLaneY > -400) {
      this.generateRandomLane(screenHeight);
    }
  }

  public createLane(y: number, type: "grass" | "road" | "water"): void {
    let texture = "tile_grass";
    if (type === "road") texture = "tile_road";
    if (type === "water") texture = "tile_water";

    const startX = -this.sideBuffer + this.gridTileSize / 2;
    const endX = this.worldWidth + this.sideBuffer;

    for (let x = startX; x <= endX; x += this.gridTileSize) {
      const tile = this.scene.add.image(x, y, texture);
      tile.setOrigin(0.5);
    }

    this.lanes.push({ y, type });
  }

  public generateRandomLane(playerY: number = 0): void {
    const rand = Math.random();
    let laneType: "grass" | "road" | "water" = "grass";

    if (rand > 0.6) {
      laneType = "road";
    } else if (rand > 0.3) {
      laneType = "water";
    }

    this.createLane(this.nextLaneY, laneType);
    const laneIndex = this.lanes.length - 1;

    const distanceTraveled = Math.max(
      0,
      (this.scene.scale.height - this.nextLaneY) / 50,
    );
    const speedBoost = Math.min(160, distanceTraveled * 3.5);

    if (laneType === "road") {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const baseSpeed = Phaser.Math.Between(70, 110);
      const speed = baseSpeed + speedBoost;
      const obstacleType: ObstacleType =
        Math.random() > 0.5 ? "skelter" : "dog";

      this.lanes[laneIndex].direction = direction;
      this.lanes[laneIndex].speed = speed;
      this.lanes[laneIndex].obstacleType = obstacleType;

      const initialX = Phaser.Math.Between(50, this.worldWidth - 50);
      this.spawnObstacleOnLane(this.lanes[laneIndex], initialX);
    } else if (laneType === "water") {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = Phaser.Math.Between(60, 100) + speedBoost * 0.5;

      this.lanes[laneIndex].direction = direction;
      this.lanes[laneIndex].speed = speed;

      const initialX1 = Phaser.Math.Between(50, this.worldWidth - 50);
      this.spawnLogOnLane(this.lanes[laneIndex], initialX1);
    } else {
      let occupiedCols = new Set<number>();
      if (Math.random() < 0.5) {
        occupiedCols = this.spawnTreesOnGrassLane(this.nextLaneY);
      }

      if (Math.random() < 0.35) {
        this.spawnFishOnLane(this.nextLaneY, occupiedCols);
      }
    }

    this.nextLaneY -= this.gridTileSize;
    this.scene.physics.world.setBounds(
      -this.sideBuffer,
      this.nextLaneY - 200,
      this.worldWidth + this.sideBuffer * 2,
      Math.abs(this.nextLaneY) + 1000,
    );
  }

  private spawnTreesOnGrassLane(y: number): Set<number> {
    const totalCols = Math.floor(this.worldWidth / this.gridTileSize);
    const treeCount = Phaser.Math.Between(2, 5);
    const occupiedCols = new Set<number>();

    for (let i = 0; i < treeCount; i++) {
      const col = Phaser.Math.Between(0, totalCols - 1);
      occupiedCols.add(col);
    }

    if (occupiedCols.size >= totalCols - 1) {
      return new Set<number>();
    }

    occupiedCols.forEach((col) => {
      const x = col * this.gridTileSize + this.gridTileSize / 2;
      const tree = new Tree(this.scene, x, y, this.gridTileSize);
      this.trees.add(tree);
    });

    return occupiedCols;
  }

  private spawnFishOnLane(
    y: number,
    excludedCols: Set<number> = new Set(),
  ): void {
    const maxColumns = Math.floor(this.worldWidth / this.gridTileSize);

    const availableCols: number[] = [];
    for (let col = 1; col < maxColumns - 1; col++) {
      if (!excludedCols.has(col)) {
        availableCols.push(col);
      }
    }

    if (availableCols.length === 0) return;

    const randomCol = Phaser.Utils.Array.GetRandom(availableCols);
    const x = randomCol * this.gridTileSize + this.gridTileSize / 2;

    const fish = new Fish(this.scene, x, y);
    this.fishes.add(fish);
  }

  public spawnObstaclesForActiveLanes(isGameOver: boolean): void {
    if (isGameOver) return;
    const cameraY = this.scene.cameras.main.scrollY;

    this.lanes.forEach((lane) => {
      if (lane.y > cameraY - 100 && lane.y < cameraY + 700) {
        if (lane.type === "road" && Math.random() < 0.4) {
          this.spawnObstacleOnLane(lane);
        } else if (lane.type === "water" && Math.random() < 0.3) {
          this.spawnLogOnLane(lane);
        }
      }
    });
  }

  private spawnObstacleOnLane(lane: LaneConfig, customX?: number): void {
    if (!lane.direction || !lane.speed || !lane.obstacleType) return;

    const spawnMargin = 150;
    const startX =
      customX !== undefined
        ? customX
        : lane.direction === 1
          ? -spawnMargin
          : this.worldWidth + spawnMargin;

    const minDistanceBetweenObstacles = 200;
    const hasObstacleTooClose = this.obstacles.getChildren().some((obj) => {
      const obs = obj as Obstacle;
      return (
        Math.abs(obs.y - lane.y) < 10 &&
        Math.abs(obs.x - startX) < minDistanceBetweenObstacles
      );
    });

    if (hasObstacleTooClose && customX === undefined) return;

    const obstacle = new Obstacle(
      this.scene,
      startX,
      lane.y,
      lane.obstacleType,
      lane.direction,
      lane.speed,
    );

    this.obstacles.add(obstacle);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setVelocityX(lane.direction * lane.speed);
    }
  }

  private spawnLogOnLane(lane: LaneConfig, customX?: number): void {
    if (!lane.direction || !lane.speed) return;

    const spawnMargin = 180;
    const startX =
      customX !== undefined
        ? customX
        : lane.direction === 1
          ? -spawnMargin
          : this.worldWidth + spawnMargin;

    const minDistanceBetweenLogs = 220;
    const hasLogTooClose = this.logs.getChildren().some((obj) => {
      const log = obj as Log;
      return (
        Math.abs(log.y - lane.y) < 10 &&
        Math.abs(log.x - startX) < minDistanceBetweenLogs
      );
    });

    if (hasLogTooClose && customX === undefined) return;

    const log = new Log(this.scene, startX, lane.y, lane.direction, lane.speed);
    this.logs.add(log);
  }

  public cleanupOldObjects(): void {
    const cameraY = this.scene.cameras.main.scrollY;
    const destroyMargin = 300;

    (this.obstacles.getChildren() as Obstacle[]).forEach((obstacle) => {
      if (
        obstacle &&
        (obstacle.y > cameraY + 900 ||
          obstacle.x < -destroyMargin ||
          obstacle.x > this.worldWidth + destroyMargin)
      ) {
        obstacle.destroy();
      }
    });

    (this.logs.getChildren() as Log[]).forEach((log) => {
      if (
        log &&
        (log.y > cameraY + 900 ||
          log.x < -destroyMargin ||
          log.x > this.worldWidth + destroyMargin)
      ) {
        log.destroy();
      }
    });

    (this.fishes.getChildren() as Fish[]).forEach((fish) => {
      if (fish && fish.y > cameraY + 900) fish.destroy();
    });

    (this.trees.getChildren() as Tree[]).forEach((tree) => {
      if (tree && tree.y > cameraY + 900) tree.destroy();
    });
  }

  private createPlaceholderTextures(): void {
    if (!this.scene.textures.exists("tile_water")) {
      const gWater = this.scene.make.graphics();
      gWater.fillStyle(0x3399ff);
      gWater.fillRect(0, 0, 50, 50);
      gWater.lineStyle(1, 0x2277dd);
      gWater.strokeRect(0, 0, 50, 50);
      gWater.generateTexture("tile_water", 50, 50);
    }
  }
}
