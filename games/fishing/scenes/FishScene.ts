import Phaser from "phaser";
import { Fish } from "../entities/Fish";
import { InputManager } from "../managers/InputManager";
import { EnvironmentManager } from "../managers/EnvironmentManager";
import { EcosystemManager } from "../managers/EcosystemManager";
import { UIManager } from "../managers/UIManager";
import { ShopManager } from "../managers/ShopManager";

export class FishingScene extends Phaser.Scene {
  private worldWidth: number = 2400;
  private worldHeight: number = 10000;

  private inputManager!: InputManager;
  private envManager!: EnvironmentManager;
  private ecoManager!: EcosystemManager;
  private uiManager!: UIManager;
  private shopManager!: ShopManager;

  private boat!: Phaser.GameObjects.Container;
  private hookContainer!: Phaser.GameObjects.Container;
  private hookGraphics!: Phaser.GameObjects.Graphics;
  private fishingLineGraphics!: Phaser.GameObjects.Graphics;

  private boatSpeed: number = 280;

  private hookVx: number = 0;
  private isHookRetracted: boolean = true;
  private isPausedForShop: boolean = false;
  private maxDepthWarningShown: boolean = false;

  private hookedFish: Fish | null = null;
  private lineTension: number = 0;

  constructor() {
    super({ key: "FishingScene" });
  }

  create(): void {
    this.hookedFish = null;
    this.lineTension = 0;
    this.hookVx = 0;
    this.isHookRetracted = true;
    this.isPausedForShop = false;
    this.maxDepthWarningShown = false;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.inputManager = new InputManager(this);
    this.envManager = new EnvironmentManager(
      this,
      this.worldWidth,
      this.worldHeight,
    );
    this.ecoManager = new EcosystemManager(this, this.worldWidth);
    this.uiManager = new UIManager(this);
    this.shopManager = new ShopManager();

    this.envManager.initEnvironment();
    this.ecoManager.initEcosystem();
    this.uiManager.createHUD(this.shopManager, (isOpen) => {
      this.isPausedForShop = isOpen;
    });
    this.inputManager.createUIControls();

    const startX = this.worldWidth / 2;
    this.createBoat(startX, 90);

    const rodTipX = startX + 85;
    const rodTipY = 90 - 28;
    this.createHook(rodTipX, rodTipY + 12);

    this.fishingLineGraphics = this.add.graphics();

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);

    this.physics.add.overlap(
      this.hookContainer,
      this.ecoManager.fishGroup,
      this.handleCatch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );
  }

  override update(_time: number, delta: number): void {
    if (this.isPausedForShop) return;

    const deltaSec = delta / 1000;
    const inputState = this.inputManager.inputState;

    this.envManager.update(deltaSec);
    this.ecoManager.update(deltaSec);

    const minX = 220;
    const maxX = this.worldWidth - 220;

    const rodTipX = this.boat.x + 85;
    const rodTipY = this.boat.y - 28;

    const maxHookY = this.shopManager.getMaxHookDepth();
    const currentHookSpeed = this.shopManager.getHookSpeed(); // Dynamische haaksnelheid uit ShopManager

    // --- MODUS 1: HAAK BINNEN (VAREN) ---
    if (this.isHookRetracted) {
      let boatAccelX = 0;
      if (inputState.left) boatAccelX = -this.boatSpeed;
      else if (inputState.right) boatAccelX = this.boatSpeed;

      if (boatAccelX !== 0) {
        this.boat.x = Phaser.Math.Clamp(
          this.boat.x + boatAccelX * deltaSec,
          minX,
          maxX,
        );
        this.boat.angle = boatAccelX > 0 ? 3 : -3;
      } else {
        this.boat.angle = Math.sin(this.envManager.waveTimer * 1.5) * 2;
      }

      this.boat.y = 90 + Math.sin(this.envManager.waveTimer * 2) * 3;

      this.hookContainer.x = rodTipX;
      this.hookContainer.y = rodTipY + 12;
      this.hookContainer.angle = 0;

      if (inputState.down) {
        this.isHookRetracted = false;
        this.maxDepthWarningShown = false;
        this.inputManager.setLeftRightVisible(false);

        this.cameras.main.stopFollow();
        this.cameras.main.pan(
          this.hookContainer.x,
          this.hookContainer.y,
          600,
          "Cubic.easeOut",
          true,
          (_camera, progress) => {
            if (progress === 1) {
              this.cameras.main.startFollow(
                this.hookContainer,
                true,
                0.08,
                0.08,
              );
            }
          },
        );
      }
    }
    // --- MODUS 2: HAAK IN HET WATER (VISSEN & INHALEN) ---
    else {
      this.boat.angle = Math.sin(this.envManager.waveTimer * 1.5) * 2;
      this.boat.y = 90 + Math.sin(this.envManager.waveTimer * 2) * 3;

      const dx = rodTipX - this.hookContainer.x;
      this.hookVx += dx * 4.0 * deltaSec;
      this.hookVx *= 0.92;

      this.hookContainer.x += this.hookVx * deltaSec;
      this.hookContainer.angle = Phaser.Math.Clamp(
        -this.hookVx * 0.15,
        -35,
        35,
      );

      if (inputState.down) {
        if (this.hookContainer.y < maxHookY) {
          this.hookContainer.y += currentHookSpeed * deltaSec;
        } else {
          this.hookContainer.y = maxHookY;
          if (!this.maxDepthWarningShown) {
            this.uiManager.showStatus("Max diepte! Upgrade vislijn.", 1800);
            this.maxDepthWarningShown = true;
          }
        }
      } else if (inputState.up) {
        this.maxDepthWarningShown = false;
        let currentPullSpeed = currentHookSpeed;
        if (this.hookedFish) {
          currentPullSpeed -= this.hookedFish.points * 0.4;
        }
        this.hookContainer.y -= Math.max(80, currentPullSpeed) * deltaSec;

        if (this.hookContainer.y <= rodTipY + 12) {
          this.hookContainer.y = rodTipY + 12;
          this.isHookRetracted = true;
          this.inputManager.setLeftRightVisible(true);

          this.cameras.main.stopFollow();
          this.cameras.main.pan(
            this.boat.x,
            this.boat.y,
            700,
            "Cubic.easeInOut",
            true,
            (_camera, progress) => {
              if (progress === 1) {
                this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);
              }
            },
          );

          if (this.hookedFish) {
            const fishNames: Record<string, string> = {
              dolphin: "Dolfijn 🐬",
              sunfish: "Maanvis 🌕",
              jellyfish: "Kwal 🪼",
              piranha: "Piranha 🐟",
              eel: "Paling 🐍",
              swordfish: "Zwaardvis 🗡️",
              shark: "Haai 🦈",
              lightning: "Lightning Eel ⚡",
              octopus: "Octopus 🐙",
              monster: "Diepzee Monster 👹",
              whale: "Walvis 🐋",
              standard: "Vis 🐠",
            };

            const name = fishNames[this.hookedFish.fishType] || "Vis 🐠";

            this.shopManager.addFishToInventory(
              name,
              this.hookedFish.points,
              0xffaa00,
            );
            this.uiManager.updateFishCount(
              this.shopManager.caughtFishList.length,
            );
            this.uiManager.showStatus(`${name} gevangen!`, 1800);
            this.uiManager.hideTensionBar();
            this.hookedFish.destroy();
            this.hookedFish = null;
            this.lineTension = 0;
          }
        }
      }

      // GEHAAKTE VIS & MELDING BIJ LOSBREKEN
      if (this.hookedFish) {
        const hookCurveX = this.hookContainer.x + 6;
        const hookCurveY = this.hookContainer.y + 14;

        this.hookedFish.x = hookCurveX;
        this.hookedFish.y = hookCurveY + this.hookedFish.size / 2;

        if (this.hookedFish.isStruggling) {
          this.hookVx += Math.random() > 0.5 ? 120 : -120;
        }

        const tensionMultiplier = this.shopManager.getTensionMultiplier();

        if (inputState.up && this.hookedFish.isStruggling) {
          this.lineTension +=
            (35 + this.hookedFish.points * 0.25) * tensionMultiplier * deltaSec;
        } else if (!inputState.up) {
          this.lineTension = Math.max(0, this.lineTension - 40 * deltaSec);
        }

        this.uiManager.updateTension(this.lineTension);

        if (this.lineTension >= 80) {
          this.uiManager.showStatus("Vis los! Upgrade haakje.", 2000);
          this.uiManager.hideTensionBar();

          if (this.hookedFish) {
            this.hookedFish.resetAfterEscape();
            this.hookedFish = null;
          }
          this.lineTension = 0;
          return;
        }
      } else {
        this.uiManager.hideTensionBar();
      }
    }

    const currentDepthMeters = Math.max(
      0,
      Math.floor((this.hookContainer.y - (this.boat.y - 28)) / 20),
    );
    this.uiManager.updateDepth(currentDepthMeters);

    this.drawFishingLine();
  }

  private createBoat(x: number, y: number): void {
    this.boat = this.add.container(x, y);
    const graphics = this.add.graphics();

    graphics.fillStyle(0x000000, 0.25);
    graphics.fillEllipse(0, 18, 140, 16);

    graphics.fillStyle(0x734222, 1);
    graphics.beginPath();
    graphics.moveTo(-65, -6);
    graphics.lineTo(-58, 14);
    graphics.lineTo(50, 14);
    graphics.lineTo(72, -6);
    graphics.lineTo(65, -10);
    graphics.lineTo(-60, -10);
    graphics.closePath();
    graphics.fillPath();

    graphics.lineStyle(1.5, 0x542e13, 0.8);
    graphics.lineBetween(-61, -2, 68, -2);
    graphics.lineBetween(-59, 6, 58, 6);

    graphics.lineStyle(3, 0x3d210c, 1);
    graphics.strokeLineShape(new Phaser.Geom.Line(-62, -10, 67, -10));

    graphics.fillStyle(0x542e13, 1);
    graphics.fillRect(-15, -9, 30, 4);

    graphics.fillStyle(0xcc2222, 1);
    graphics.fillRoundedRect(-12, -26, 16, 18, 3);

    graphics.fillStyle(0xffcc99, 1);
    graphics.fillCircle(-4, -31, 7);

    graphics.fillStyle(0x336633, 1);
    graphics.fillEllipse(-4, -36, 18, 6);
    graphics.fillCircle(-4, -38, 6);

    graphics.lineStyle(3, 0xcc2222, 1);
    graphics.lineBetween(0, -22, 18, -18);

    graphics.fillStyle(0xffcc99, 1);
    graphics.fillCircle(18, -18, 2.5);

    graphics.lineStyle(2.5, 0x222222, 1);
    graphics.lineBetween(12, -14, 85, -28);

    graphics.lineStyle(1.5, 0xdddddd, 1);
    graphics.strokeCircle(85, -28, 2);

    this.boat.add(graphics);
  }

  private createHook(x: number, y: number): void {
    this.hookContainer = this.add.container(x, y);

    this.hookGraphics = this.add.graphics();
    this.hookGraphics.lineStyle(3, 0xffffff, 1);
    this.hookGraphics.beginPath();
    this.hookGraphics.moveTo(0, 0);
    this.hookGraphics.lineTo(0, 10);
    this.hookGraphics.arc(6, 10, 6, Math.PI, 0, true);
    this.hookGraphics.lineTo(12, 4);
    this.hookGraphics.strokePath();

    this.hookGraphics.fillStyle(0xffffff, 1);
    this.hookGraphics.fillTriangle(12, 4, 9, 7, 13, 8);

    this.hookContainer.add(this.hookGraphics);
    this.hookContainer.setDepth(15);

    this.physics.add.existing(this.hookContainer);
    const body = this.hookContainer.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(16, 20);
    body.setOffset(-2, 0);
  }

  private drawFishingLine(): void {
    this.fishingLineGraphics.clear();

    const startX = this.boat.x + 85;
    const startY = this.boat.y - 28;
    const endX = this.hookContainer.x;
    const endY = this.hookContainer.y;

    if (this.isHookRetracted) return;

    const lineColor = this.lineTension > 50 ? 0xff2222 : 0xffffff;
    this.fishingLineGraphics.lineStyle(1.5, lineColor, 0.85);

    const midX = (startX + endX) / 2 - this.hookVx * 0.1;
    const midY = (startY + endY) / 2;

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(midX, midY),
      new Phaser.Math.Vector2(endX, endY),
    );

    const points = curve.getPoints(16);
    this.fishingLineGraphics.strokePoints(points);
  }

  private handleCatch(_hook: Phaser.GameObjects.Container, fish: Fish): void {
    if (this.hookedFish || fish.isHooked || this.isHookRetracted) return;
    this.hookedFish = fish;
    fish.isHooked = true;
    this.lineTension = 10;
  }
}
