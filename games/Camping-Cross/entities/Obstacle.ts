import Phaser from "phaser";

export type ObstacleType = "skelter" | "dog";

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: ObstacleType,
    direction: number,
    speed: number,
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);

    // Zorg dat de afbeelding netjes op het vakje (50px hoog) past
    this.setDisplaySize(45, 45);

    if (direction === -1) {
      this.setFlipX(true);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setVelocityX(direction * speed);
    }
  }
}
