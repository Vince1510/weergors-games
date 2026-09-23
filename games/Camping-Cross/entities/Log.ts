import Phaser from "phaser";

export class Log extends Phaser.GameObjects.Rectangle {
  public speed: number;
  public direction: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: number,
    baseSpeed: number,
    width: number = 130,
  ) {
    super(scene, x, y, width, 36, 0x8b4513);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.direction = direction;

    // Geeft elke individuele boomstam een willekeurige snelheidsvariatie (+/- 20%)
    const speedVariation = Phaser.Math.FloatBetween(0.8, 1.2);
    this.speed = baseSpeed * speedVariation;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setImmovable(true);
    }
  }

  // Zelfstandige verplaatsing over het water
  public updateLog(delta: number): void {
    this.x += (this.direction * this.speed * delta) / 1000;
  }
}
