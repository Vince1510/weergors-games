import Phaser from "phaser";

export interface FishConfig {
  speed: number;
  points: number;
  color: number;
  size: number;
  type?: string;
  isSpecial?: boolean;
  isFast?: boolean;
}

export class Fish extends Phaser.GameObjects.Container {
  public speed: number;
  public points: number;
  public size: number;
  public fishType: string;
  public isHooked: boolean = false;

  public struggleTimer: number = 0;
  public isStruggling: boolean = false;

  private fishSprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, config: FishConfig) {
    super(scene, x, y);

    this.speed = config.isFast ? config.speed * 1.8 : config.speed * 0.6;
    this.points = config.points;
    this.size = config.size;
    this.fishType = config.type || "standard";

    const textureKey = scene.textures.exists(`fish_${this.fishType}`)
      ? `fish_${this.fishType}`
      : `fish_standard`;

    this.fishSprite = scene.add.image(0, 0, textureKey);

    // Grourdere schaal factor (2.8x) zodat ze goed zichtbaar zijn
    const targetSize = config.size * 2.8;
    const baseScale = targetSize / Math.max(this.fishSprite.width, 1);
    this.fishSprite.setScale(baseScale);

    this.add(this.fishSprite);
    this.setDepth(10);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setSize(targetSize * 1.2, targetSize);
      body.setOffset(-targetSize / 2, -targetSize / 2);
    }
  }

  public updateFish(screenWidth: number, deltaSec: number): void {
    if (this.isHooked) {
      this.scaleX = 1;
      this.scaleY = 1;
      this.updateStruggleAnimation(deltaSec);
      return;
    }

    this.angle = 0;
    this.scaleX = this.speed > 0 ? 1 : -1;
    this.scaleY = 1;

    this.x += this.speed;

    if (this.x < -120 && this.speed < 0) {
      this.x = screenWidth + 120;
    } else if (this.x > screenWidth + 120 && this.speed > 0) {
      this.x = -120;
    }
  }

  public resetAfterEscape(): void {
    this.isHooked = false;
    this.angle = 0;
    this.scaleY = 1;
    this.speed = -this.speed * 1.2;
    this.scaleX = this.speed > 0 ? 1 : -1;
  }

  private updateStruggleAnimation(deltaSec: number): void {
    this.struggleTimer += deltaSec * 10;
    this.isStruggling = Math.sin(this.struggleTimer) > 0.1;

    if (this.isStruggling) {
      this.angle = -90 + Math.sin(this.struggleTimer * 3) * 35;
    } else {
      this.angle = Phaser.Math.Linear(this.angle, -90, 0.1);
    }
  }
}
