import Phaser from "phaser";

export class Backpack extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "backpack");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 1. Verklein de afbeelding
    this.setScale(0.2);

    // 2. Refresh de body zodat Arcade Physics snapt hoe groot de verkleinde sprite is
    this.refreshBody();

    this.setCollideWorldBounds(true);
    this.setImmovable(true);

    // 🔍 LOG 3: Check de exacte hitbox afmetingen
    console.log(
      `🎒 Backpack aangemaakt. DisplaySize: ${this.displayWidth}x${this.displayHeight}, Hitbox: ${this.body.width}x${this.body.height}`,
    );
  }

  public moveTo(x: number): void {
    this.x = Phaser.Math.Clamp(
      x,
      this.displayWidth / 2,
      this.scene.scale.width - this.displayWidth / 2,
    );
  }
}
