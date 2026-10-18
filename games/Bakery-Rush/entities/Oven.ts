import Phaser from "phaser";

export type OvenStatus = "empty" | "baking" | "ready" | "burnt";

export class Oven extends Phaser.GameObjects.Container {
  public status: OvenStatus = "empty";
  public timer = 0;

  public static readonly WIDTH = 218;
  public static readonly HEIGHT = 30;

  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly shadow: Phaser.GameObjects.Rectangle;
  private readonly highlight: Phaser.GameObjects.Rectangle;
  private readonly window: Phaser.GameObjects.Rectangle;
  private readonly light: Phaser.GameObjects.Arc;
  private readonly glow: Phaser.GameObjects.Rectangle;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly bread: Phaser.GameObjects.Ellipse;
  private readonly breadCrust: Phaser.GameObjects.Ellipse;
  private readonly breadCuts: Phaser.GameObjects.Graphics;
  private bakeDuration = 0;
  private pulseTween?: Phaser.Tweens.Tween;
  private lastStatusText = "";
  private dropTarget = false;

  constructor(scene: Phaser.Scene, x: number, y: number, ovenNumber: number) {
    super(scene, x, y);

    this.shadow = scene.add
      .rectangle(3, 4, Oven.WIDTH + 5, Oven.HEIGHT + 5, 0x352a28, 0.4)
      .setStrokeStyle(2, 0x352a28, 0.35);
    this.glow = scene.add
      .rectangle(0, 0, Oven.WIDTH + 6, Oven.HEIGHT + 6, 0x000000, 0)
      .setStrokeStyle(3, 0x34d399)
      .setAlpha(0);
    this.bodyRect = scene.add
      .rectangle(0, 0, Oven.WIDTH, Oven.HEIGHT, 0x374151)
      .setStrokeStyle(2, 0x172b37);
    this.highlight = scene.add.rectangle(
      0,
      -11,
      Oven.WIDTH - 10,
      3,
      0xffffff,
      0.18,
    );
    this.window = scene.add
      .rectangle(-76, 0, 54, 25, 0x111827)
      .setStrokeStyle(2, 0xa7c5c6);
    this.breadCrust = scene.add
      .ellipse(-76, 2, 35, 20, 0x92400e)
      .setVisible(false);
    this.bread = scene.add
      .ellipse(-76, 1, 30, 15, 0xfacc15)
      .setStrokeStyle(1, 0xfef3c7)
      .setVisible(false);
    this.breadCuts = scene.add.graphics().setVisible(false);
    this.breadCuts.lineStyle(2, 0xfef3c7, 0.9);
    this.breadCuts.beginPath();
    this.breadCuts.moveTo(-84, -3);
    this.breadCuts.lineTo(-79, 4);
    this.breadCuts.moveTo(-76, -5);
    this.breadCuts.lineTo(-71, 2);
    this.breadCuts.moveTo(-68, -3);
    this.breadCuts.lineTo(-64, 4);
    this.breadCuts.strokePath();

    const handle = scene.add
      .rectangle(-76, -10, 34, 4, 0xe6eef0)
      .setStrokeStyle(1, 0x667987);
    const label = scene.add.text(-39, -9, `OVEN ${ovenNumber}`, {
      fontSize: "9px",
      color: "#f9fafb",
      fontStyle: "bold",
    });
    this.statusText = scene.add.text(-39, 4, "LEEG · sleep deeg", {
      fontSize: "7px",
      color: "#d1d5db",
    });
    const knobs = [
      scene.add.circle(81, -5, 4, 0xe6b768).setStrokeStyle(1, 0x532f26),
      scene.add.circle(93, -5, 4, 0x73c6ae).setStrokeStyle(1, 0x244f4b),
    ];
    this.light = scene.add.circle(99, -11, 4, 0x6b7280);
    const feet = [
      scene.add.rectangle(-92, 17, 15, 4, 0x263744),
      scene.add.rectangle(92, 17, 15, 4, 0x263744),
    ];

    this.add([
      this.shadow,
      this.glow,
      this.bodyRect,
      this.highlight,
      this.window,
      this.breadCrust,
      this.bread,
      this.breadCuts,
      handle,
      label,
      this.statusText,
      ...knobs,
      this.light,
      ...feet,
    ]);
    this.setSize(Oven.WIDTH, Oven.HEIGHT);
    this.bodyRect.setInteractive({ useHandCursor: true });
    this.bodyRect.on("pointerdown", () => this.emit("oven-clicked"));
    scene.add.existing(this);
    this.updateVisuals();
  }

  public startBaking(durationSeconds: number): boolean {
    if (this.status !== "empty") return false;

    this.status = "baking";
    this.dropTarget = false;
    this.bakeDuration = durationSeconds;
    this.timer = durationSeconds;
    this.updateVisuals();
    return true;
  }

  public update(deltaSeconds: number): void {
    if (this.status === "baking") {
      this.timer = Math.max(0, this.timer - deltaSeconds);
      if (this.timer === 0) {
        this.status = "ready";
        this.timer = 0;
      }
    } else if (this.status === "ready") {
      this.timer += deltaSeconds;
      if (this.timer >= 4) {
        this.status = "burnt";
        this.timer = 0;
      }
    }

    this.updateVisuals();
  }

  public collect(): boolean {
    if (this.status !== "ready") return false;
    this.reset();
    return true;
  }

  public clean(): boolean {
    if (this.status !== "burnt") return false;
    this.reset();
    return true;
  }

  public setDropTarget(active: boolean): void {
    if (this.status !== "empty" || this.dropTarget === active) return;
    this.dropTarget = active;
    this.updateVisuals();
  }

  private reset(): void {
    this.status = "empty";
    this.timer = 0;
    this.dropTarget = false;
    this.updateVisuals();
  }

  private updateVisuals(): void {
    switch (this.status) {
      case "empty":
        this.bodyRect.setFillStyle(0x374151);
        this.highlight.setFillStyle(0xffffff, 0.18);
        this.window.setFillStyle(0x111827);
        this.light.setFillStyle(0x6b7280);
        this.glow
          .setStrokeStyle(3, this.dropTarget ? 0xffd166 : 0x34d399)
          .setAlpha(this.dropTarget ? 0.85 : 0);
        this.setBreadVisible(false);
        this.setStatusText("LEEG · sleep deeg", "#d1d5db");
        break;
      case "baking":
        this.bodyRect.setFillStyle(0x78350f);
        this.highlight.setFillStyle(0xffd08a, 0.3);
        this.window.setFillStyle(0x5b3425);
        this.light.setFillStyle(0xf59e0b);
        this.glow.setAlpha(0);
        this.updateBreadColor(1 - this.timer / this.bakeDuration);
        this.setBreadVisible(true);
        this.setStatusText(`BAKKEN · ${this.timer.toFixed(1)}s`, "#fde68a");
        break;
      case "ready":
        this.bodyRect.setFillStyle(0x065f46);
        this.highlight.setFillStyle(0xb4f4bf, 0.35);
        this.window.setFillStyle(0x23543e);
        this.light.setFillStyle(0x34d399);
        this.updateBreadColor(1);
        this.setBreadVisible(true);
        this.setStatusText("KLAAR · klik om te pakken", "#a7f3d0");
        if (!this.pulseTween) {
          this.pulseTween = this.scene.tweens.add({
            targets: this.glow,
            alpha: { from: 0.35, to: 0.9 },
            duration: 550,
            yoyo: true,
            repeat: -1,
          });
        }
        break;
      case "burnt":
        this.bodyRect.setFillStyle(0x7f1d1d);
        this.highlight.setFillStyle(0xffc0a6, 0.22);
        this.window.setFillStyle(0x392b2b);
        this.light.setFillStyle(0xf87171);
        this.updateBreadColor(1.25);
        this.setBreadVisible(true);
        this.stopPulse();
        this.glow.setStrokeStyle(3, 0xf87171).setAlpha(0.8);
        this.setStatusText("VERBRAND · klik schoon", "#fecaca");
        break;
    }

    if (this.status !== "ready" && this.status !== "burnt") {
      this.stopPulse();
      this.glow.setStrokeStyle(
        3,
        this.status === "empty" && this.dropTarget ? 0xffd166 : 0x34d399,
      );
    }
  }

  private setStatusText(text: string, color: string): void {
    if (text !== this.lastStatusText) {
      this.statusText.setText(text);
      this.lastStatusText = text;
    }
    this.statusText.setColor(color);
  }

  private stopPulse(): void {
    this.pulseTween?.stop();
    this.pulseTween = undefined;
  }

  private setBreadVisible(visible: boolean): void {
    this.bread.setVisible(visible);
    this.breadCrust.setVisible(visible);
    this.breadCuts.setVisible(visible);
  }

  private updateBreadColor(progress: number): void {
    const pale = { r: 250, g: 204, b: 21 };
    const golden = { r: 217, g: 119, b: 6 };
    const brown = { r: 120, g: 53, b: 15 };
    const scorch = { r: 41, g: 28, b: 24 };
    const color = progress < 0.65
      ? this.blend(pale, golden, progress / 0.65)
      : this.blend(golden, progress > 1 ? scorch : brown, Math.min(1, (progress - 0.65) / 0.6));
    const crust = this.blend(
      { r: 146, g: 64, b: 14 },
      { r: 41, g: 28, b: 24 },
      Math.min(1, progress),
    );
    this.bread.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    this.breadCrust.setFillStyle(
      Phaser.Display.Color.GetColor(crust.r, crust.g, crust.b),
    );
  }

  private blend(
    from: { r: number; g: number; b: number },
    to: { r: number; g: number; b: number },
    amount: number,
  ): { r: number; g: number; b: number } {
    const t = Phaser.Math.Clamp(amount, 0, 1);
    return {
      r: Math.round(from.r + (to.r - from.r) * t),
      g: Math.round(from.g + (to.g - from.g) * t),
      b: Math.round(from.b + (to.b - from.b) * t),
    };
  }
}
