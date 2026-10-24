import Phaser from "phaser";

interface ThemeDefinition {
  name: string;
  minScore: number;
  colors: [number, number, number, number];
  decorations: DecorationType[];
}

type DecorationType = "rock" | "cloud" | "star" | "planet";

interface ThemeDecoration {
  artwork: Phaser.GameObjects.Graphics;
  speed: number;
  direction: number;
  baseY: number;
  phase: number;
}

const THEMES: ThemeDefinition[] = [
  {
    name: "Underground",
    minScore: 0,
    colors: [0x28170f, 0x3c2417, 0x1a100b, 0x302015],
    decorations: ["rock"],
  },
  {
    name: "Sky",
    minScore: 200,
    colors: [0x71cfe9, 0xb5edfa, 0xe4faff, 0xc3f0fb],
    decorations: ["cloud"],
  },
  {
    name: "Upper Sky / Stratosphere",
    minScore: 600,
    colors: [0x7b9ed0, 0xb8c9e8, 0xe4ddf0, 0xc9dcf1],
    decorations: ["cloud"],
  },
  {
    name: "Space",
    minScore: 1200,
    colors: [0x11152f, 0x29204c, 0x090d20, 0x171b3b],
    decorations: ["star", "planet"],
  },
  {
    name: "Heaven",
    minScore: 2000,
    colors: [0xf4c98e, 0xa7dff3, 0xe8c5ef, 0xffe5b1],
    decorations: ["star", "cloud"],
  },
];

export class ThemeManager {
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly decorations: ThemeDecoration[] = [];
  private currentTheme?: ThemeDefinition;
  private elapsed = 0;
  private readonly scene: Phaser.Scene;
  private readonly width: number;
  private readonly height: number;

  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
  ) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.background = scene.add.graphics().setScrollFactor(0).setDepth(-20);
    this.label = scene.add
      .text(20, 51, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#17384a",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);
    this.setTheme(THEMES[0]);
  }

  public update(score: number, delta: number): void {
    const theme = [...THEMES].reverse().find((item) => score >= item.minScore);
    if (theme && theme !== this.currentTheme) {
      this.setTheme(theme);
    }

    this.elapsed += delta / 1000;
    for (const decoration of this.decorations) {
      const x =
        decoration.artwork.x +
        decoration.direction * decoration.speed * (delta / 1000);
      if (x < -70) {
        decoration.artwork.x = this.width + 70;
      } else if (x > this.width + 70) {
        decoration.artwork.x = -70;
      } else {
        decoration.artwork.x = x;
      }
      decoration.artwork.y =
        decoration.baseY + Math.sin(this.elapsed * 1.4 + decoration.phase) * 7;
    }
  }

  public destroy(): void {
    this.background.destroy();
    this.label.destroy();
    for (const decoration of this.decorations) {
      decoration.artwork.destroy();
    }
    this.decorations.length = 0;
  }

  private setTheme(theme: ThemeDefinition): void {
    this.currentTheme = theme;
    this.label.setText(theme.name.toUpperCase());
    this.label.setColor(theme.minScore >= 300 ? "#fff5c4" : "#ffffff");

    for (const decoration of this.decorations) {
      decoration.artwork.destroy();
    }
    this.decorations.length = 0;

    this.background.clear();
    this.background.fillGradientStyle(...theme.colors, 1);
    this.background.fillRect(0, 0, this.width, this.height);
    this.drawThemeBackdrop(theme);

    for (let index = 0; index < 8; index++) {
      const type = theme.decorations[index % theme.decorations.length];
      const artwork = this.scene.add
        .graphics()
        .setScrollFactor(0)
        .setDepth(-10);
      this.drawDecoration(artwork, type);
      const direction = index % 2 === 0 ? 1 : -1;
      const x = Phaser.Math.Between(0, this.width);
      const y = Phaser.Math.Between(90, this.height - 90);
      artwork.setPosition(x, y);
      this.decorations.push({
        artwork,
        speed: type === "cloud" ? 12 : 3,
        direction,
        baseY: y,
        phase: index,
      });
    }
  }

  private drawThemeBackdrop(theme: ThemeDefinition): void {
    if (theme.name === "Underground") {
      this.background.fillStyle(0x24140c, 0.78);
      this.background.fillRect(0, this.height * 0.2, this.width, this.height * 0.25);
      this.background.fillStyle(0x160d08, 0.72);
      this.background.fillRect(0, this.height * 0.68, this.width, this.height * 0.32);

      this.background.fillStyle(0x1c100a, 0.86);
      this.background.fillPoints(
        [
          new Phaser.Math.Vector2(0, this.height * 0.42),
          new Phaser.Math.Vector2(this.width * 0.2, this.height * 0.35),
          new Phaser.Math.Vector2(this.width * 0.43, this.height * 0.46),
          new Phaser.Math.Vector2(this.width * 0.68, this.height * 0.37),
          new Phaser.Math.Vector2(this.width, this.height * 0.44),
          new Phaser.Math.Vector2(this.width, this.height * 0.54),
          new Phaser.Math.Vector2(0, this.height * 0.54),
        ],
        true,
      );

      this.background.fillStyle(0x77502f, 0.95);
      this.background.lineStyle(5, 0x28170f, 1);
      this.background.strokeCircle(this.width * 0.72, this.height * 0.3, 48);
      this.background.strokeCircle(this.width * 0.72, this.height * 0.3, 30);
      this.background.lineBetween(
        this.width * 0.72 - 42,
        this.height * 0.3,
        this.width * 0.72 + 42,
        this.height * 0.3,
      );
      this.background.lineBetween(
        this.width * 0.72,
        this.height * 0.3 - 42,
        this.width * 0.72,
        this.height * 0.3 + 42,
      );

      for (let index = 0; index < 28; index++) {
        const x = Phaser.Math.Between(8, this.width - 8);
        const y = Phaser.Math.Between(10, this.height - 10);
        const radius = Phaser.Math.Between(2, 5);
        this.background.fillStyle(index % 2 === 0 ? 0x805533 : 0x160d08, 0.8);
        this.background.fillCircle(x, y, radius);
      }
      return;
    }

    if (theme.name === "Space") {
      this.background.fillStyle(0xffffff, 0.8);
      for (let index = 0; index < 80; index++) {
        const x = Phaser.Math.Between(4, this.width - 4);
        const y = Phaser.Math.Between(4, this.height - 4);
        this.background.fillCircle(x, y, index % 5 === 0 ? 2 : 1);
      }
      return;
    }

    if (theme.name === "Heaven") {
      this.background.fillStyle(0xfff4c8, 0.6);
      for (let index = 0; index < 12; index++) {
        const x = Phaser.Math.Between(10, this.width - 10);
        const y = Phaser.Math.Between(10, this.height - 10);
        this.background.fillCircle(x, y, Phaser.Math.Between(1, 3));
      }
      return;
    }

    this.background.fillStyle(0xffffff, theme.name === "Sky" ? 0.34 : 0.25);
    this.background.fillEllipse(55, 145, 175, 58);
    this.background.fillEllipse(this.width - 25, this.height - 190, 190, 68);
    this.background.fillEllipse(this.width * 0.58, this.height * 0.48, 160, 54);
  }

  private drawDecoration(
    artwork: Phaser.GameObjects.Graphics,
    type: DecorationType,
  ): void {
    if (type === "rock") {
      artwork.fillStyle(0x1a100b, 0.96);
      artwork.fillPoints(
        [
          new Phaser.Math.Vector2(-30, 18),
          new Phaser.Math.Vector2(-23, -8),
          new Phaser.Math.Vector2(-4, -22),
          new Phaser.Math.Vector2(19, -11),
          new Phaser.Math.Vector2(29, 18),
        ],
        true,
      );
      artwork.lineStyle(3, 0x654328, 1);
      artwork.strokePoints(
        [
          new Phaser.Math.Vector2(-30, 18),
          new Phaser.Math.Vector2(-23, -8),
          new Phaser.Math.Vector2(-4, -22),
          new Phaser.Math.Vector2(19, -11),
          new Phaser.Math.Vector2(29, 18),
        ],
        true,
      );
    } else if (type === "cloud") {
      artwork.fillStyle(0xffffff, 0.75);
      artwork.fillRoundedRect(-37, -3, 74, 22, 11);
      artwork.fillCircle(-16, -4, 14);
      artwork.fillCircle(6, -11, 19);
      artwork.fillCircle(26, -2, 13);
    } else if (type === "star") {
      artwork.fillStyle(0xfff2a8, 0.9);
      artwork.fillPoints(
        [
          new Phaser.Math.Vector2(0, -18),
          new Phaser.Math.Vector2(5, -5),
          new Phaser.Math.Vector2(18, 0),
          new Phaser.Math.Vector2(5, 5),
          new Phaser.Math.Vector2(0, 18),
          new Phaser.Math.Vector2(-5, 5),
          new Phaser.Math.Vector2(-18, 0),
          new Phaser.Math.Vector2(-5, -5),
        ],
        true,
      );
    } else if (type === "planet") {
      artwork.fillStyle(0xed8db9, 0.85);
      artwork.fillCircle(0, 0, 22);
      artwork.lineStyle(4, 0xf8d89a, 0.8);
      artwork.strokeEllipse(0, 0, 64, 18);
    }
  }
}
