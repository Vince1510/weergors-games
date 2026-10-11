import Phaser from "phaser";

export class Tree extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    tileSize: number = 50,
  ) {
    super(scene, x, y);

    // --- BOOM STAM ---
    const trunk = scene.add.rectangle(
      0,
      tileSize * 0.15,
      tileSize * 0.25,
      tileSize * 0.45,
      0x8b5a2b,
    );

    // --- BOOM KRUIN (Gelaagd voor diepte en realisme) ---
    // Donkere achtergrondblaadjes voor schaduw
    const foliageDark = scene.add.circle(
      0,
      -tileSize * 0.1,
      tileSize * 0.38,
      0x1e5b32,
    );
    // Hoofdblaadjes
    const foliageMain = scene.add.circle(
      0,
      -tileSize * 0.15,
      tileSize * 0.32,
      0x2e8b57,
    );
    // Lichte accentblaadjes voor lichtinval (top)
    const foliageLight = scene.add.circle(
      -tileSize * 0.08,
      -tileSize * 0.22,
      tileSize * 0.18,
      0x3cb371,
    );

    // Voeg alles toe aan de container
    this.add([trunk, foliageDark, foliageMain, foliageLight]);

    // Zorg voor correcte diepte en physics
    this.setDepth(y); // Handig voor top-down depth sorting indien nodig
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.allowGravity = false;
      body.setImmovable(true);
      // Maak de collider iets kleiner zodat je speler realistisch om de boom heen loopt
      const colSize = tileSize * 0.55;
      body.setSize(colSize, colSize);
      body.setOffset(-colSize / 2, -colSize / 2);
    }
  }
}
