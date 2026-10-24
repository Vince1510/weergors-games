import Phaser from "phaser";

export type SkyItemType = "spring" | "umbrella" | "plane" | "rocket";

const ITEM_COLORS: Record<SkyItemType, number> = {
  spring: 0xffd64f,
  umbrella: 0xf05d78,
  plane: 0x42c5e8,
  rocket: 0xff854a,
};

export class SkyItem extends Phaser.GameObjects.Container {
  public static readonly RADIUS = 22;
  private readonly artwork: Phaser.GameObjects.Graphics;
  private readonly initialY: number;
  private elapsed = 0;
  private readonly drift = Phaser.Math.FloatBetween(-16, 16);
  private readonly gameWidth: number;
  public readonly type: SkyItemType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: SkyItemType,
  ) {
    super(scene, x, y);
    this.type = type;
    this.initialY = y;
    this.gameWidth = scene.scale.width;
    this.artwork = scene.add.graphics();
    this.add(this.artwork);
    this.draw();
    scene.add.existing(this);
    this.setDepth(5);
  }

  public update(delta: number): void {
    this.elapsed += delta / 1000;
    this.x += this.drift * (delta / 1000);
    this.x = Phaser.Math.Wrap(
      this.x,
      -SkyItem.RADIUS,
      this.gameWidth + SkyItem.RADIUS,
    );
    this.y = this.initialY + Math.sin(this.elapsed * 2.5) * 5;
  }

  private draw(): void {
    const color = ITEM_COLORS[this.type];
    const graphics = this.artwork;

    graphics.lineStyle(8, 0x173247, 0.85);
    this.drawShape(graphics);
    graphics.lineStyle(4, 0xffffff, 1);
    this.drawShape(graphics);
    graphics.fillStyle(color, 1);

    if (this.type === "spring") {
      graphics.fillRoundedRect(-9, -11, 18, 30, 5);
      graphics.lineStyle(3, 0x8042a2, 1);
      graphics.beginPath();
      graphics.moveTo(-7, 14);
      graphics.lineTo(7, 7);
      graphics.lineTo(-7, 0);
      graphics.lineTo(7, -7);
      graphics.lineTo(7, -11);
      graphics.strokePath();
      graphics.fillStyle(0xfff3a0, 1);
      graphics.fillCircle(0, -13, 10);
    } else if (this.type === "umbrella") {
      graphics.fillTriangle(-20, -2, 0, -20, 20, -2);
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillTriangle(-10, -2, 0, -14, 0, -2);
      graphics.fillTriangle(0, -14, 10, -2, 0, -2);
      graphics.lineStyle(4, 0x173247, 1);
      graphics.lineBetween(0, -2, 0, 16);
      graphics.strokeCircle(4, 16, 4);
    } else if (this.type === "plane") {
      graphics.fillTriangle(-23, 0, 20, -7, 15, 4);
      graphics.fillTriangle(-3, -2, -13, -17, 9, -3);
      graphics.fillTriangle(0, 3, -9, 13, 9, 4);
      graphics.fillStyle(0xfff3a0, 1);
      graphics.fillCircle(8, -1, 2);
    } else {
      graphics.fillTriangle(0, -22, -11, -3, 11, -3);
      graphics.fillRoundedRect(-11, -5, 22, 24, 7);
      graphics.fillStyle(0x73e3f4, 1);
      graphics.fillCircle(0, 2, 5);
      graphics.fillStyle(0xffd64f, 1);
      graphics.fillTriangle(-7, 17, 0, 29, 0, 17);
      graphics.fillTriangle(7, 17, 0, 29, 0, 17);
    }
  }

  private drawShape(graphics: Phaser.GameObjects.Graphics): void {
    if (this.type === "spring") {
      graphics.strokeRoundedRect(-13, -17, 26, 40, 7);
    } else if (this.type === "umbrella") {
      graphics.beginPath();
      graphics.moveTo(-23, 0);
      graphics.lineTo(0, -22);
      graphics.lineTo(23, 0);
      graphics.strokePath();
      graphics.lineBetween(0, 0, 0, 18);
    } else if (this.type === "plane") {
      graphics.beginPath();
      graphics.moveTo(-27, 0);
      graphics.lineTo(22, -9);
      graphics.lineTo(16, 4);
      graphics.lineTo(-27, 0);
      graphics.moveTo(-4, -2);
      graphics.lineTo(-15, -19);
      graphics.lineTo(11, -4);
      graphics.strokePath();
    } else {
      graphics.strokeTriangle(0, -26, -15, -3, 15, -3);
      graphics.strokeRoundedRect(-15, -7, 30, 30, 9);
    }
  }
}
