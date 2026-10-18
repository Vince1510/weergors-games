import Phaser from "phaser";

export const CUSTOMER_PATIENCE_SECONDS = 18;

export class Customer extends Phaser.GameObjects.Container {
  public readonly orderCount: number;
  public patience = CUSTOMER_PATIENCE_SECONDS;
  public readonly maxPatience = CUSTOMER_PATIENCE_SECONDS;
  public readonly orderText: Phaser.GameObjects.Text;
  public readonly patienceBar: Phaser.GameObjects.Graphics;
  public readonly patienceText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, orderCount: number, styleIndex: number) {
    super(scene, x, 163);
    this.orderCount = orderCount;

    const colors = [0x9b59b6, 0x337ea6, 0xd77a52];
    const skinTones = [0xf0c49b, 0xb87955, 0xefd0ac];
    const hairColors = [0x714734, 0x66717b, 0x49352e];
    const customerColor = colors[styleIndex % colors.length];
    const skinTone = skinTones[styleIndex % skinTones.length];
    const hairColor = hairColors[styleIndex % hairColors.length];

    const shadow = scene.add.ellipse(0, 73, 64, 13, 0x36534f, 0.28);
    const shoulders = scene.add
      .ellipse(0, 54, 70, 55, customerColor)
      .setStrokeStyle(2, 0xffffff, 0.48);
    const shirt = scene.add.ellipse(0, 60, 46, 40, 0xffffff, 0.12);
    const neck = scene.add.ellipse(0, 28, 18, 30, skinTone);
    const ears = [
      scene.add.circle(-24, -7, 8, skinTone),
      scene.add.circle(24, -7, 8, skinTone),
    ];
    const face = scene.add
      .ellipse(0, -11, 49, 57, skinTone)
      .setStrokeStyle(2, 0xb97858, 0.55);
    const hair = scene.add
      .ellipse(0, -31, 53, 27, hairColor)
      .setStrokeStyle(1, 0x4b3028);
    const hairLock = scene.add.ellipse(-14, -24, 24, 25, hairColor);
    const eyeWhiteLeft = scene.add.ellipse(-9, -8, 9, 11, 0xfff9ed);
    const eyeWhiteRight = scene.add.ellipse(9, -8, 9, 11, 0xfff9ed);
    const eyeLeft = scene.add.circle(-8, -7, 3.5, 0x273b3b);
    const eyeRight = scene.add.circle(10, -7, 3.5, 0x273b3b);
    const glintLeft = scene.add.circle(-9, -8, 1.2, 0xffffff);
    const glintRight = scene.add.circle(9, -8, 1.2, 0xffffff);
    const nose = scene.add.ellipse(0, 2, 6, 5, 0xd99c78);
    const smile = scene.add.ellipse(0, 10, 13, 8, 0x923f43);
    const smileHighlight = scene.add.ellipse(0, 7, 10, 5, skinTone);
    const blush = [
      scene.add.ellipse(-16, 4, 8, 4, 0xec8790, 0.45),
      scene.add.ellipse(16, 4, 8, 4, 0xec8790, 0.45),
    ];
    const orderBubble = scene.add
      .rectangle(0, -72, 88, 33, 0xfffdf2)
      .setStrokeStyle(2, 0xd4a75c);
    const bubbleTail = scene.add
      .triangle(0, -53, -8, 0, 8, 0, 0, 12, 0xfffdf2)
      .setStrokeStyle(1, 0xd4a75c);
    this.orderText = scene.add
      .text(0, -73, `🥐  × ${orderCount}`, {
        fontSize: "12px",
        color: "#58432f",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const patienceTrack = scene.add
      .rectangle(0, 81, 70, 8, 0x52716d)
      .setStrokeStyle(1, 0xe9fff0);
    this.patienceBar = scene.add.graphics();
    this.patienceText = scene.add
      .text(0, 94, `${CUSTOMER_PATIENCE_SECONDS}s`, {
        fontSize: "9px",
        color: "#31534d",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([
      shadow,
      neck,
      shoulders,
      shirt,
      ...ears,
      face,
      hair,
      hairLock,
      eyeWhiteLeft,
      eyeWhiteRight,
      eyeLeft,
      eyeRight,
      glintLeft,
      glintRight,
      nose,
      smile,
      smileHighlight,
      ...blush,
      orderBubble,
      bubbleTail,
      this.orderText,
      patienceTrack,
      this.patienceBar,
      this.patienceText,
    ]);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-48, -92, 96, 193),
      Phaser.Geom.Rectangle.Contains,
    );
    if (this.input) this.input.cursor = "pointer";
    scene.add.existing(this);
  }

  public updatePatience(deltaSeconds: number): boolean {
    this.patience = Math.max(0, this.patience - deltaSeconds);
    const ratio = this.patience / this.maxPatience;
    this.patienceText.setText(`${Math.ceil(this.patience)}s`);
    this.patienceText.setColor(ratio < 0.3 ? "#fca5a5" : "#e2e8f0");
    this.patienceBar.clear();
    this.patienceBar.fillStyle(
      ratio < 0.3 ? 0xef4444 : ratio < 0.6 ? 0xf59e0b : 0x22c55e,
    );
    this.patienceBar.fillRect(-33, 78, 66 * ratio, 6);
    return this.patience === 0;
  }
}
