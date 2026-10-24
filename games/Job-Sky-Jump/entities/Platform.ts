import Phaser from "phaser";

export type PlatformType =
  | "standard"
  | "cloud"
  | "spring"
  | "plane"
  | "spaceship";

export class Platform extends Phaser.GameObjects.Container {
  public static readonly WIDTH = 92;
  public static readonly HEIGHT = 24;
  public type: PlatformType;
  private readonly artwork: Phaser.GameObjects.Graphics;
  private direction = Math.random() < 0.5 ? -1 : 1;
  private movementSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PlatformType) {
    super(scene, x, y);
    this.type = type;
    this.movementSpeed = this.getMovementSpeed(type);
    this.artwork = scene.add.graphics();
    this.add(this.artwork);
    this.draw();
    scene.add.existing(this);
    this.setDepth(10);
  }

  public setType(type: PlatformType): void {
    this.type = type;
    this.movementSpeed = this.getMovementSpeed(type);
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.draw();
  }

  public update(delta: number, worldWidth: number): void {
    if (this.movementSpeed === 0 || !this.active) return;

    this.x += this.direction * this.movementSpeed * (delta / 1000);
    if (this.x < 55 || this.x > worldWidth - 55) {
      this.x = Phaser.Math.Clamp(this.x, 55, worldWidth - 55);
      this.direction *= -1;
    }
  }

  private getMovementSpeed(type: PlatformType): number {
    if (type === "plane") return 125;
    if (type === "spaceship") return 280;
    return 0;
  }

  private draw(): void {
    this.artwork.clear();

    if (this.type === "plane") {
      this.artwork.lineStyle(9, 0x183247, 1);
      this.artwork.strokeTriangle(-48, 0, 42, -8, 34, 8);
      this.artwork.fillStyle(0x36c9f2, 1);
      this.artwork.fillTriangle(-48, 0, 42, -8, 34, 8);
      this.artwork.fillTriangle(-3, -3, -20, -22, 12, -5);
      this.artwork.fillTriangle(2, 4, -15, 19, 13, 6);
      this.artwork.lineStyle(3, 0xffffff, 1);
      this.artwork.strokeTriangle(-48, 0, 42, -8, 34, 8);
      this.artwork.fillStyle(0xffe36e, 1);
      this.artwork.fillCircle(28, -1, 3);
      return;
    }

    if (this.type === "spaceship") {
      this.artwork.fillStyle(0x16253f, 0.5);
      this.artwork.fillEllipse(0, 8, 108, 26);
      this.artwork.lineStyle(9, 0x182444, 1);
      this.artwork.strokeEllipse(0, -1, 106, 36);
      this.artwork.fillStyle(0xa9eafa, 1);
      this.artwork.fillEllipse(0, -2, 104, 32);
      this.artwork.fillStyle(0xf5fbff, 1);
      this.artwork.fillEllipse(0, -5, 57, 25);
      this.artwork.fillStyle(0x7b83ff, 1);
      this.artwork.fillCircle(-29, 0, 5);
      this.artwork.fillCircle(29, 0, 5);
      this.artwork.lineStyle(3, 0xffffff, 1);
      this.artwork.strokeEllipse(0, -1, 106, 36);
      this.artwork.fillStyle(0xffb84f, 1);
      this.artwork.fillTriangle(-20, 13, -11, 27, -4, 13);
      this.artwork.fillTriangle(20, 13, 11, 27, 4, 13);
      return;
    }

    if (this.type === "cloud") {
      this.artwork.fillStyle(0xffffff, 1);
      this.artwork.fillRoundedRect(-46, -8, 92, 18, 9);
      this.artwork.fillCircle(-24, -7, 10);
      this.artwork.fillCircle(0, -13, 14);
      this.artwork.fillCircle(25, -7, 10);
      this.artwork.lineStyle(3, 0x24445b, 1);
      this.artwork.strokeRoundedRect(-46, -8, 92, 18, 9);
      this.artwork.strokeCircle(-24, -7, 10);
      this.artwork.strokeCircle(0, -13, 14);
      this.artwork.strokeCircle(25, -7, 10);
      return;
    }

    if (this.type === "spring") {
      this.artwork.fillStyle(0x68bd73, 1);
      this.artwork.fillRoundedRect(-46, 2, 92, 12, 6);
      this.artwork.lineStyle(3, 0x24445b, 1);
      this.artwork.strokeRoundedRect(-46, 2, 92, 12, 6);
      this.artwork.lineStyle(4, 0xe98dc6, 1);
      this.artwork.beginPath();
      this.artwork.moveTo(-8, 1);
      this.artwork.lineTo(-8, -8);
      this.artwork.lineTo(0, -8);
      this.artwork.lineTo(0, 0);
      this.artwork.lineTo(8, 0);
      this.artwork.lineTo(8, -9);
      this.artwork.strokePath();
      this.artwork.fillStyle(0xffd95a, 1);
      this.artwork.fillRoundedRect(-14, -15, 28, 6, 3);
      return;
    }

    this.artwork.fillStyle(0x63bd75, 1);
    this.artwork.fillRoundedRect(-46, -6, 92, 18, 7);
    this.artwork.fillStyle(0x8bdd87, 1);
    this.artwork.fillRoundedRect(-41, -9, 82, 8, 4);
    this.artwork.lineStyle(3, 0x24445b, 1);
    this.artwork.strokeRoundedRect(-46, -6, 92, 18, 7);
  }
}
