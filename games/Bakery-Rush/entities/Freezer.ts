import Phaser from "phaser";

export class Freezer extends Phaser.GameObjects.Container {
  public readonly doughToken: Phaser.GameObjects.Container;

  private readonly tokenStartX: number;
  private readonly tokenStartY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const width = 146;
    const height = 146;
    const shadow = scene.add.ellipse(2, 76, 148, 20, 0x47332b, 0.28);
    const cabinet = scene.add
      .rectangle(0, 0, width, height, 0x2f607d)
      .setStrokeStyle(4, 0x173e59);
    const cabinetHighlight = scene.add
      .rectangle(-4, -3, 132, 132, 0x6cb5c7)
      .setStrokeStyle(2, 0xa8e3df);
    const door = scene.add
      .rectangle(-9, 1, 104, 112, 0x398ba0)
      .setStrokeStyle(3, 0xd4f1e8);
    const frost = scene.add
      .rectangle(-9, -41, 93, 23, 0xbce8df)
      .setStrokeStyle(1, 0xf3fff4);
    const frostText = scene.add
      .text(-9, -41, "VERS DEEG", {
        fontSize: "8px",
        color: "#28566a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const handle = scene.add
      .rectangle(32, 2, 7, 34, 0xffdfa0)
      .setStrokeStyle(2, 0x9d6a39);
    const badge = scene.add.circle(-9, 8, 30, 0xf3d796).setStrokeStyle(3, 0xa66a3c);
    const badgeText = scene.add
      .text(-9, 8, "🥐", { fontSize: "25px" })
      .setOrigin(0.5);
    const footLeft = scene.add.rectangle(-48, 77, 17, 8, 0x3c4144);
    const footRight = scene.add.rectangle(48, 77, 17, 8, 0x3c4144);
    const title = scene.add
      .text(0, -60, "VRIEZER", {
        fontSize: "11px",
        color: "#f2ffef",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const hint = scene.add
      .text(0, 57, "PAK EEN BROODJE DEEG", {
        fontSize: "7px",
        color: "#effff0",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([
      shadow,
      cabinet,
      cabinetHighlight,
      door,
      frost,
      frostText,
      handle,
      badge,
      badgeText,
      footLeft,
      footRight,
      title,
      hint,
    ]);
    scene.add.existing(this);

    this.tokenStartX = x;
    this.tokenStartY = y + 8;

    const doughBase = scene.add
      .circle(0, 0, 27, 0xfff0a6)
      .setStrokeStyle(4, 0xb76d35);
    const doughText = scene.add
      .text(0, 0, "🥐", { fontSize: "22px" })
      .setOrigin(0.5);

    this.doughToken = scene.add
      .container(this.tokenStartX, this.tokenStartY, [doughBase, doughText])
      .setDepth(10)
      .setSize(58, 58)
      .setInteractive(
        new Phaser.Geom.Rectangle(-29, -29, 58, 58),
        Phaser.Geom.Rectangle.Contains,
      );
    this.doughToken.setData("bakery-dough", true);
    if (this.doughToken.input) this.doughToken.input.cursor = "grab";
  }

  public resetDoughToken(): void {
    this.doughToken.setPosition(this.tokenStartX, this.tokenStartY);
    this.doughToken.setScale(1);
    this.doughToken.setAlpha(1);
  }
}
