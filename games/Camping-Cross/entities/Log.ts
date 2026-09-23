import Phaser from "phaser";

export class Log extends Phaser.GameObjects.Rectangle {
  public speed: number;
  public direction: number;
  private worldWidth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: number,
    baseSpeed: number,
    width: number = 130,
    worldWidth: number = 1500,
  ) {
    // Maak de rechthoek aan met een hoogte van 40 pixels zodat hij het hele vakje dekt
    super(scene, x, y, width, 40, 0x8b4513);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.direction = direction;
    this.worldWidth = worldWidth;

    const speedVariation = Phaser.Math.FloatBetween(0.8, 1.2);
    this.speed = baseSpeed * speedVariation;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setImmovable(true);
      // Zorg dat de hitbox exact de afmeting van de log dekt
      body.setSize(width, 40);
    }
  }

  public updateLog(delta: number): void {
    this.x += (this.direction * this.speed * delta) / 1000;

    const margin = 100;
    if (this.direction === 1 && this.x > this.worldWidth + margin) {
      this.x = -margin;
    } else if (this.direction === -1 && this.x < -margin) {
      this.x = this.worldWidth + margin;
    }
  }
}
