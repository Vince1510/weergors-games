import Phaser from "phaser";
import { Platform } from "../entities/Platform";
import { Player } from "../entities/Player";
import { SkyItem } from "../entities/SkyItem";
import { InputManager } from "../managers/InputManager";
import { ScoreManager } from "../managers/ScoreManager";
import { SpawnManager } from "../managers/SpawnManager";
import { ThemeManager } from "../managers/ThemeManager";

const GRAVITY = 1050;
const JUMP_VELOCITY = -700;
const SPRING_VELOCITY = -1100;
const PLAYER_SPEED = 300;
const PLATFORM_GAP_MIN = 130;
const PLATFORM_GAP_MAX = 180;
const SPEED_BOOST_DURATION = 1800;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputManager!: InputManager;
  private scoreManager!: ScoreManager;
  private spawnManager!: SpawnManager;
  private themeManager!: ThemeManager;
  private readonly platforms: Platform[] = [];
  private readonly items: SkyItem[] = [];
  private platformTopY = 0;
  private platformTopX = 0;
  private startingPlayerY = 0;
  private highestPlayerY = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private effectText!: Phaser.GameObjects.Text;
  private speedBoostUntil = 0;
  private speedBoostDirection = 1;
  private isGameOver = false;

  constructor() {
    super("GameScene");
  }

  public create(): void {
    this.platforms.length = 0;
    this.items.length = 0;
    this.isGameOver = false;
    this.speedBoostUntil = 0;
    this.scoreManager = new ScoreManager();
    this.spawnManager = new SpawnManager(this);
    this.inputManager = new InputManager(this);

    const { width, height } = this.scale;
    this.themeManager = new ThemeManager(this, width, height);
    this.createHud();

    const startingPlatform = this.spawnManager.createPlatform(
      width / 2,
      height - 75,
      this.scoreManager.getScore(),
    );
    this.platforms.push(startingPlatform);
    this.platformTopY = startingPlatform.y;
    this.platformTopX = startingPlatform.x;

    this.player = new Player(
      this,
      width / 2,
      startingPlatform.y - Player.HEIGHT / 2 - 6,
    );
    this.player.velocityY = JUMP_VELOCITY;
    this.startingPlayerY = this.player.y;
    this.highestPlayerY = this.player.y;

    for (let index = 0; index < 9; index++) {
      this.addPlatformAbove();
    }

    this.cameras.main.setScroll(0, 0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  public update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    const deltaSeconds = Math.min(delta / 1000, 0.05);
    const previousBottom = this.player.y + Player.HEIGHT / 2;
    const now = this.time.now;
    this.player.updateEffects(now);

    const horizontalInput = this.inputManager.getHorizontalInput(this.player.x);
    this.player.velocityX =
      horizontalInput * PLAYER_SPEED +
      (now < this.speedBoostUntil ? this.speedBoostDirection * PLAYER_SPEED : 0);
    this.player.x += this.player.velocityX * deltaSeconds;
    const gravityScale = this.player.hasUmbrella ? 0.28 : 1;
    this.player.velocityY += GRAVITY * gravityScale * deltaSeconds;
    this.player.y += this.player.velocityY * deltaSeconds;

    if (this.player.x < 0) this.player.x = this.scale.width;
    if (this.player.x > this.scale.width) this.player.x = 0;

    for (const platform of this.platforms) {
      platform.update(delta, this.scale.width);
    }
    this.checkPlatformLandings(previousBottom);
    this.updateItems(delta, now);
    this.updateCameraAndScore();
    this.themeManager.update(this.scoreManager.getScore(), delta);
    this.recyclePlatforms();

    if (
      this.player.y - Player.HEIGHT / 2 >
      this.cameras.main.scrollY + this.scale.height
    ) {
      this.endGame();
    }
  }

  private createHud(): void {
    this.scoreText = this.add
      .text(20, 20, "HOOGTE  0", {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#174b65",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.effectText = this.add
      .text(20, 72, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#fff7b8",
        fontStyle: "bold",
        stroke: "#17384a",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(
        this.scale.width - 20,
        24,
        `BEST  ${this.scoreManager.getBestScore()}`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#28657a",
          fontStyle: "bold",
          stroke: "#ffffff",
          strokeThickness: 3,
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(this.scale.width / 2, this.scale.height - 24, "←  →   /   A  D", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#28657a",
        stroke: "#ffffff",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private addPlatformAbove(): void {
    const gap = Phaser.Math.Between(PLATFORM_GAP_MIN, PLATFORM_GAP_MAX);
    this.platformTopY -= gap;

    const x = this.getNextPlatformX();
    const platform = this.spawnManager.createPlatform(
      x,
      this.platformTopY,
      this.scoreManager.getScore(),
    );
    this.platforms.push(platform);
    this.spawnItem(platform);
  }

  private checkPlatformLandings(previousBottom: number): void {
    if (this.player.velocityY <= 0) return;

    const playerBottom = this.player.y + Player.HEIGHT / 2;
    const platformTopOffset = Platform.HEIGHT / 2;

    for (const platform of this.platforms) {
      if (!platform.visible || !platform.active) continue;

      const platformTop = platform.y - platformTopOffset;
      const overlapsHorizontally =
        Math.abs(this.player.x - platform.x) <
        (Player.WIDTH + Platform.WIDTH) / 2;

      if (
        overlapsHorizontally &&
        previousBottom <= platformTop &&
        playerBottom >= platformTop
      ) {
        this.player.y = platformTop - Player.HEIGHT / 2;
        this.player.velocityY =
          platform.type === "spring" ? SPRING_VELOCITY : JUMP_VELOCITY;

        if (platform.type === "cloud") {
          platform.setVisible(false);
          platform.setActive(false);
        }
        break;
      }
    }
  }

  private updateCameraAndScore(): void {
    const camera = this.cameras.main;
    const followLine = camera.scrollY + this.scale.height * 0.4;

    if (this.player.y < followLine) {
      camera.scrollY = this.player.y - this.scale.height * 0.4;
    }

    this.highestPlayerY = Math.min(this.highestPlayerY, this.player.y);
    const score = Math.floor(
      Math.max(0, this.startingPlayerY - this.highestPlayerY) / 50,
    );

    this.scoreManager.setScore(score);
    this.scoreText.setText(`HOOGTE  ${score}`);
  }

  private recyclePlatforms(): void {
    const cameraBottom = this.cameras.main.scrollY + this.scale.height + 100;

    for (const platform of this.platforms) {
      if (platform.y <= cameraBottom) continue;

      platform.setType(
        this.spawnManager.getPlatformType(this.scoreManager.getScore()),
      );
      platform.setPosition(
        this.getNextPlatformX(),
        this.platformTopY -
          Phaser.Math.Between(PLATFORM_GAP_MIN, PLATFORM_GAP_MAX),
      );
      this.platformTopY = platform.y;
      this.platformTopX = platform.x;
      platform.setVisible(true);
      platform.setActive(true);
      this.spawnItem(platform);
    }
  }

  private getNextPlatformX(): number {
    const minX = Math.max(48, this.platformTopX - 145);
    const maxX = Math.min(this.scale.width - 48, this.platformTopX + 145);
    return Phaser.Math.Between(minX, maxX);
  }

  private spawnItem(platform: Platform): void {
    const item = this.spawnManager.spawnItemAbove(
      platform,
      this.scoreManager.getScore(),
    );
    if (item) this.items.push(item);
  }

  private updateItems(delta: number, now: number): void {
    for (let index = this.items.length - 1; index >= 0; index--) {
      const item = this.items[index];
      item.update(delta);

      if (
        Math.abs(this.player.x - item.x) < Player.WIDTH / 2 + SkyItem.RADIUS &&
        Math.abs(this.player.y - item.y) < Player.HEIGHT / 2 + SkyItem.RADIUS
      ) {
        this.collectItem(item, now);
        item.destroy();
        this.items.splice(index, 1);
        continue;
      }

      if (
        item.y > this.cameras.main.scrollY + this.scale.height + 100 ||
        item.y < this.cameras.main.scrollY - 100
      ) {
        item.destroy();
        this.items.splice(index, 1);
      }
    }

    if (!this.player.hasUmbrella && now >= this.speedBoostUntil) {
      this.effectText.setText("");
    }
  }

  private collectItem(item: SkyItem, now: number): void {
    if (item.type === "spring") {
      this.player.velocityY = -1150;
      this.effectText.setText("VEERBOOST!");
    } else if (item.type === "umbrella") {
      this.player.activateUmbrella();
      this.player.velocityY = Math.min(this.player.velocityY, 180);
      this.effectText.setText("PARAPLU ACTIEF");
    } else if (item.type === "plane") {
      this.player.velocityY = -950;
      this.speedBoostDirection =
        this.player.x < this.scale.width / 2 ? 1 : -1;
      this.speedBoostUntil = now + SPEED_BOOST_DURATION;
      this.effectText.setText("VLIEGTUIGBOOST!");
    } else {
      this.player.velocityY = -1450;
      this.effectText.setText("RAKETBOOST!");
    }
  }

  private endGame(): void {
    this.isGameOver = true;
    const score = this.scoreManager.getScore();
    const bestScore = this.scoreManager.saveScore();
    this.scene.pause();
    this.scene.launch("GameOverScene", { score, bestScore });
  }

  private cleanup(): void {
    this.inputManager?.destroy();
    this.themeManager?.destroy();
    for (const item of this.items) {
      item.destroy();
    }
    this.items.length = 0;
  }
}
