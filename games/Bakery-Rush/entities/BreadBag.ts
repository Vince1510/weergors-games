import Phaser from "phaser";

export class BreadBag extends Phaser.GameObjects.Container {
  public static readonly HOME_X = 400;
  public static readonly HOME_Y = 401;

  private readonly pieces: Phaser.GameObjects.Image[] = [];
  private readonly frame: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene, BreadBag.HOME_X, BreadBag.HOME_Y);
    this.ensureBreadTexture(scene);

    const bagBody = scene.add
      .rectangle(0, 0, 168, 64, 0x963f2c, 1)
      .setStrokeStyle(3, 0xffd276, 1);
    const bagFront = scene.add
      .rectangle(0, 10, 152, 35, 0xb95539)
      .setStrokeStyle(2, 0xd88348);
    const bagTop = scene.add.rectangle(0, -27, 160, 7, 0xffd276);
    const bagHandle = scene.add
      .ellipse(0, -34, 39, 19, 0x000000, 0)
      .setStrokeStyle(4, 0xffd276);
    const bagShadow = scene.add.ellipse(0, 34, 175, 14, 0x713d29, 0.3);
    this.frame = scene.add.graphics();

    this.add([
      bagShadow,
      bagFront,
      bagHandle,
      bagBody,
      bagTop,
      this.frame,
    ]);
    this.setDepth(10).setSize(220, 88);
    scene.add.existing(this);
    this.setHighlighted(false);
  }

  public addBread(): void {
    const offset = this.getBreadOffset(this.pieces.length);
    const bread = this.scene.add.image(offset.x, offset.y, "bakery-bag-bread");
    bread.setDisplaySize(30, 22);
    this.addAt(bread, this.length - 1);
    this.pieces.push(bread);
  }

  public removeBread(count: number): Phaser.GameObjects.Image[] {
    const removed = this.pieces.splice(0, count);
    for (const bread of removed) {
      const worldX = this.x + bread.x;
      const worldY = this.y + bread.y;
      this.remove(bread);
      this.scene.add.existing(bread);
      bread.setPosition(worldX, worldY);
    }
    return removed;
  }

  public setHighlighted(highlighted: boolean): void {
    this.frame.clear();
    this.frame.lineStyle(
      highlighted ? 5 : 4,
      highlighted ? 0xfff0a6 : 0xfbbf24,
      0.95,
    );
    this.frame.strokeRoundedRect(-95, -36, 190, 72, 10);
    this.frame.lineStyle(3, 0xfde68a, 0.85);
    this.frame.beginPath();
    this.frame.moveTo(-78, -26);
    this.frame.lineTo(78, -26);
    this.frame.moveTo(-78, -20);
    this.frame.lineTo(-78, 29);
    this.frame.moveTo(78, -20);
    this.frame.lineTo(78, 29);
    this.frame.strokePath();
  }

  private getBreadOffset(index: number): { x: number; y: number } {
    const offsets = [
      { x: -32, y: -26 },
      { x: 0, y: -34 },
      { x: 32, y: -26 },
      { x: -16, y: -44 },
      { x: 16, y: -44 },
    ];
    return offsets[index % offsets.length];
  }

  private ensureBreadTexture(scene: Phaser.Scene): void {
    const textureKey = "bakery-bag-bread";
    if (scene.textures.exists(textureKey)) return;

    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x92400e, 1);
    graphics.fillEllipse(15, 11, 28, 19);
    graphics.fillStyle(0xe7a83e, 1);
    graphics.fillEllipse(15, 10, 23, 14);
    graphics.lineStyle(1.5, 0xffedba, 1);
    graphics.beginPath();
    graphics.moveTo(8, 8);
    graphics.lineTo(11, 12);
    graphics.moveTo(14, 6);
    graphics.lineTo(17, 10);
    graphics.moveTo(20, 8);
    graphics.lineTo(23, 12);
    graphics.strokePath();
    graphics.generateTexture(textureKey, 30, 22);
    graphics.destroy();
  }
}
