import Phaser from "phaser";

export class Fish extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "fish");

    // Voeg toe aan de scène en koppel Arcade Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);

    // Schaal de PNG-afbeelding zodat deze netjes op het grasvakje (50x50px) past
    this.setDisplaySize(35, 30);

    // Zorg ervoor dat de fysieke hitbox meeschaalt met de weergavegrootte
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setSize(this.width, this.height);
    }
  }

  public collect(): void {
    this.destroy();
  }
}
