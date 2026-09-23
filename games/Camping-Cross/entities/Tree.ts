import Phaser from "phaser";

export class Tree extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    tileSize: number = 50,
  ) {
    // Een donkergroene boom op het grid
    super(scene, x, y, tileSize - 8, tileSize - 8, 0x2e8b57);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setImmovable(true);
      body.setSize(tileSize - 8, tileSize - 8);
    }
  }
}
