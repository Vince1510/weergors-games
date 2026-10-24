import Phaser from "phaser";
import { AssetManager } from "../managers/AssetManager";

export class Player extends Phaser.GameObjects.Container {
  public static readonly WIDTH = 54;
  public static readonly HEIGHT = 64;
  public static readonly UMBRELLA_DURATION = 7000;
  public velocityX = 0;
  public velocityY = 0;
  private readonly umbrellaAttachment: Phaser.GameObjects.Graphics;
  private umbrellaExpiresAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const job = scene.add.image(0, 0, AssetManager.PLAYER_KEY);
    job.setDisplaySize(Player.WIDTH, Player.HEIGHT);
    this.add(job);

    this.umbrellaAttachment = scene.add.graphics();
    this.umbrellaAttachment.setPosition(0, -Player.HEIGHT / 2 - 17);
    this.umbrellaAttachment.setDepth(1);
    this.umbrellaAttachment.lineStyle(7, 0x183247, 1);
    this.umbrellaAttachment.beginPath();
    this.umbrellaAttachment.moveTo(-23, 1);
    this.umbrellaAttachment.lineTo(0, -19);
    this.umbrellaAttachment.lineTo(23, 1);
    this.umbrellaAttachment.strokePath();
    this.umbrellaAttachment.fillStyle(0xf05d78, 1);
    this.umbrellaAttachment.fillTriangle(-21, 0, 0, -18, 21, 0);
    this.umbrellaAttachment.lineStyle(3, 0xffffff, 1);
    this.umbrellaAttachment.beginPath();
    this.umbrellaAttachment.moveTo(-21, 0);
    this.umbrellaAttachment.lineTo(0, -18);
    this.umbrellaAttachment.lineTo(21, 0);
    this.umbrellaAttachment.strokePath();
    this.umbrellaAttachment.fillStyle(0xfff2a8, 1);
    this.umbrellaAttachment.fillTriangle(-10, 0, 0, -9, 0, 0);
    this.umbrellaAttachment.fillTriangle(0, -9, 10, 0, 0, 0);
    this.umbrellaAttachment.lineStyle(4, 0x183247, 1);
    this.umbrellaAttachment.lineBetween(0, 0, 0, 17);
    this.umbrellaAttachment.strokeCircle(4, 17, 4);
    this.umbrellaAttachment.setVisible(false);
    this.add(this.umbrellaAttachment);

    scene.add.existing(this);
    this.setDepth(50);
  }

  public get hasUmbrella(): boolean {
    return this.umbrellaExpiresAt > 0;
  }

  public activateUmbrella(): void {
    this.umbrellaExpiresAt =
      this.scene.time.now + Player.UMBRELLA_DURATION;
    this.umbrellaAttachment.setVisible(true);
  }

  public updateEffects(now: number): void {
    if (this.hasUmbrella && now >= this.umbrellaExpiresAt) {
      this.umbrellaExpiresAt = 0;
      this.umbrellaAttachment.setVisible(false);
    }
  }
}
