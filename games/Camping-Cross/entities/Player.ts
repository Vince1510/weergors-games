import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private gridTileSize: number;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number) {
    // Gebruik de geladen "job" afbeelding in plaats van de placeholder
    super(scene, x, y, "job");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.gridTileSize = tileSize;
    this.setOrigin(0.5);
    this.setDepth(10);

    // Geen setScale(), dus Job behoudt exact zijn originele grootte!
  }

  public move(dx: number, dy: number, _screenWidth: number): void {
    const newX = this.x + dx;
    const newY = this.y + dy;

    // De limiet aan de zijkanten is volledig verwijderd!
    this.setPosition(newX, newY);
  }

  public die(): void {
    this.setTint(0xff3333);
  }
}
