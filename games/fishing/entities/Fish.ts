import Phaser from "phaser";

export interface FishConfig {
  speed: number;
  points: number;
  color: number;
  size: number;
  type?:
    | "standard"
    | "dolphin"
    | "sunfish" // Maanvis
    | "jellyfish" // Kwal
    | "piranha"
    | "eel" // Paling
    | "swordfish" // Zwaardvis
    | "shark"
    | "lightning" // Lightning Eel
    | "octopus" // Octopus
    | "monster" // Monsterlijke diepzeevis
    | "whale"; // Grote walvis
  isSpecial?: boolean;
  isFast?: boolean;
}

export class Fish extends Phaser.GameObjects.Container {
  public speed: number;
  public points: number;
  public size: number;
  public fishType: string;
  public isHooked: boolean = false;

  public struggleTimer: number = 0;
  public isStruggling: boolean = false;

  private fishBody: Phaser.GameObjects.Graphics;
  private glowEffect?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, config: FishConfig) {
    super(scene, x, y);

    this.speed = config.isFast ? config.speed * 1.8 : config.speed * 0.6;
    this.points = config.points;
    this.size = config.size;
    this.fishType = config.type || "standard";

    this.fishBody = scene.add.graphics();
    this.drawFishGraphic(config);

    this.add(this.fishBody);
    this.setDepth(10);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setSize(config.size * 1.2, config.size);
      body.setOffset(-config.size / 2, -config.size / 2);
    }
  }

  private drawFishGraphic(config: FishConfig): void {
    const g = this.fishBody;
    const s = config.size;
    g.clear();

    switch (this.fishType) {
      // 1. DOLFIJN
      case "dolphin":
        g.fillStyle(0x4682b4, 1);
        g.fillEllipse(0, 0, s * 1.3, s * 0.5);
        g.fillTriangle(s * 0.5, 0, s * 0.8, s * 0.05, s * 0.5, s * 0.1);
        g.fillTriangle(
          -s * 0.1,
          -s * 0.2,
          s * 0.1,
          -s * 0.5,
          -s * 0.3,
          -s * 0.2,
        );
        g.fillTriangle(-s * 0.6, 0, -s * 0.9, -s * 0.3, -s * 0.9, s * 0.3);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(s * 0.3, -s * 0.1, 3);
        break;

      // 2. MAANVIS (Ronde, platte vis)
      case "sunfish":
        g.fillStyle(0x94a3b8, 1);
        g.fillEllipse(0, 0, s * 0.9, s * 1.2);
        // Hoge vinnen boven en onder
        g.fillTriangle(0, -s * 0.6, s * 0.3, -s * 1.1, -s * 0.2, -s * 0.6);
        g.fillTriangle(0, s * 0.6, s * 0.3, s * 1.1, -s * 0.2, s * 0.6);
        g.fillStyle(0x000000, 1);
        g.fillCircle(s * 0.2, -s * 0.2, 3);
        break;

      // 3. KWAL (Transparant paars/roze met tentakels)
      case "jellyfish":
        g.fillStyle(0xdda0dd, 0.7);
        g.beginPath();
        g.arc(0, 0, s * 0.6, Math.PI, 0, false);
        g.closePath();
        g.fillPath();

        g.lineStyle(1.5, 0xee82ee, 0.8);
        g.lineBetween(-s * 0.3, 0, -s * 0.3, s * 0.8);
        g.lineBetween(0, 0, 0, s * 0.9);
        g.lineBetween(s * 0.3, 0, s * 0.3, s * 0.7);
        break;

      // 4. PIRANHA
      case "piranha":
        g.fillStyle(0xcc2222, 1);
        g.fillCircle(0, 0, s * 0.5);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(s * 0.3, -2, s * 0.5, 0, s * 0.3, 2);
        g.fillStyle(0x881111, 1);
        g.fillTriangle(-s * 0.4, 0, -s * 0.7, -s * 0.3, -s * 0.7, s * 0.3);
        g.fillStyle(0xffff00, 1);
        g.fillCircle(s * 0.2, -s * 0.15, 4);
        break;

      // 5. PALING (Langgerekt slangachtig)
      case "eel":
        g.fillStyle(0x556b2f, 1);
        g.fillRoundedRect(-s, -s * 0.2, s * 2, s * 0.4, 8);
        g.fillStyle(0xffd700, 1);
        g.fillCircle(s * 0.7, -s * 0.05, 2);
        break;

      // 6. ZWAARDVIS (Lang zwaard op de snuit)
      case "swordfish":
        g.fillStyle(0x20b2aa, 1);
        g.fillEllipse(0, 0, s * 1.2, s * 0.5);
        // Lang zwaard
        g.fillStyle(0xffffff, 1);
        g.fillRect(s * 0.5, -s * 0.05, s * 1.2, s * 0.1);
        g.fillStyle(0x0f766e, 1);
        g.fillTriangle(-s * 0.5, 0, -s * 0.9, -s * 0.4, -s * 0.9, s * 0.4);
        break;

      // 7. HAAI
      case "shark":
        g.fillStyle(0x708090, 1);
        g.fillEllipse(0, 0, s * 1.4, s * 0.6);
        g.fillTriangle(0, -s * 0.2, s * 0.2, -s * 0.7, -s * 0.3, -s * 0.2);
        g.fillTriangle(-s * 0.6, 0, -s, -s * 0.5, -s, s * 0.5);
        g.fillStyle(0xe6e6fa, 1);
        g.fillEllipse(0, s * 0.1, s * 1.2, s * 0.3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(s * 0.4, -s * 0.1, 3);
        break;

      // 8. LIGHTNING EEL (Elektrische paling met vonken)
      case "lightning":
        g.fillStyle(0x1e1b4b, 1);
        g.fillRoundedRect(-s, -s * 0.25, s * 2, s * 0.5, 10);
        // Elektrische gele gloed/vonken
        g.fillStyle(0xfde047, 0.9);
        g.fillCircle(s * 0.5, -s * 0.2, 4);
        g.fillCircle(-s * 0.3, s * 0.2, 4);
        break;

      // 9. OCTOPUS (Ronde kop met armen)
      case "octopus":
        g.fillStyle(0x9333ea, 1);
        g.fillCircle(0, -s * 0.2, s * 0.5);
        // Tentakels
        g.lineStyle(4, 0x7e22ce, 1);
        g.beginPath();
        g.moveTo(-s * 0.3, s * 0.2);
        g.lineTo(-s * 0.5, s * 0.7);
        g.moveTo(-s * 0.1, s * 0.2);
        g.lineTo(-s * 0.2, s * 0.8);
        g.moveTo(s * 0.1, s * 0.2);
        g.lineTo(s * 0.2, s * 0.8);
        g.moveTo(s * 0.3, s * 0.2);
        g.lineTo(s * 0.5, s * 0.7);
        g.strokePath();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(-s * 0.15, -s * 0.3, 3);
        g.fillCircle(s * 0.15, -s * 0.3, 3);
        break;

      // 10. MONSTERLIJKE DIEPZEEVIS (Anglerfish / Abyssal monster met enge tanden)
      case "monster":
        g.fillStyle(0x0f172a, 1);
        g.fillEllipse(0, 0, s * 1.3, s * 0.9);
        // Grote enge tanden
        g.fillStyle(0xf8fafc, 1);
        g.fillTriangle(s * 0.4, -s * 0.3, s * 0.6, -s * 0.1, s * 0.45, 0);
        g.fillTriangle(s * 0.4, s * 0.3, s * 0.6, 0.1, s * 0.45, s * 0.2);
        // Spriet met felrood/paars lampje
        g.lineStyle(2, 0xef4444, 1);
        g.lineBetween(0, -s * 0.4, s * 0.4, -s * 0.9);
        g.fillStyle(0xef4444, 1);
        g.fillCircle(s * 0.4, -s * 0.9, 7);
        break;

      // 11. GROTE WALVIS
      case "whale":
        g.fillStyle(0x1e293b, 1);
        g.fillRoundedRect(-s, -s * 0.4, s * 2, s * 0.8, 16);
        g.fillTriangle(-s, 0, -s * 1.4, -s * 0.5, -s * 1.4, s * 0.5);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(s * 0.6, -s * 0.1, 4);
        break;

      default:
        g.fillStyle(config.color, 1);
        g.fillEllipse(0, 0, s, s / 2);
        g.fillTriangle(-s / 2, 0, -s / 1.1, -s / 3, -s / 1.1, s / 3);
        break;
    }
  }

  public updateFish(screenWidth: number, deltaSec: number): void {
    if (this.isHooked) {
      this.scaleX = 1;
      this.scaleY = 1;
      this.updateStruggleAnimation(deltaSec);
      return;
    }

    this.angle = 0;
    this.scaleX = this.speed > 0 ? 1 : -1;
    this.scaleY = 1;

    this.x += this.speed;

    if (this.x < -120 && this.speed < 0) {
      this.x = screenWidth + 120;
    } else if (this.x > screenWidth + 120 && this.speed > 0) {
      this.x = -120;
    }
  }

  public resetAfterEscape(): void {
    this.isHooked = false;
    this.angle = 0;
    this.scaleY = 1;
    this.speed = -this.speed * 1.2;
    this.scaleX = this.speed > 0 ? 1 : -1;
  }

  private updateStruggleAnimation(deltaSec: number): void {
    this.struggleTimer += deltaSec * 10;
    this.isStruggling = Math.sin(this.struggleTimer) > 0.1;

    if (this.isStruggling) {
      this.angle = -90 + Math.sin(this.struggleTimer * 3) * 35;
    } else {
      this.angle = Phaser.Math.Linear(this.angle, -90, 0.1);
    }
  }
}
