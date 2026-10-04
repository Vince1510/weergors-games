import Phaser from "phaser";
import { InputManager } from "../managers/InputManager";
import { EnvironmentManager } from "../managers/EnvironmentManager";
import { EcosystemManager } from "../managers/EcosystemManager";
import { UIManager } from "../managers/UIManager";
import { ShopManager } from "../managers/ShopManager";
import { HookManager } from "../managers/HookManager";

export class FishingScene extends Phaser.Scene {
  private worldWidth: number = 2400;
  private worldHeight: number = 50000;
  private inputManager!: InputManager;
  private envManager!: EnvironmentManager;
  private ecoManager!: EcosystemManager;
  private uiManager!: UIManager;
  private shopManager!: ShopManager;
  private hookManager!: HookManager;

  private boat!: Phaser.GameObjects.Container;
  private boatSpeed: number = 280;
  private isPausedForShop: boolean = false;

  constructor() {
    super({ key: "FishingScene" });
  }

  preload(): void {
    const fishTypes = [
      "angelfish",
      "anglerfish",
      "axolotl",
      "beta",
      "clownfish",
      "crab",
      "dolphin",
      "eel",
      "electric_ray",
      "flounder",
      "giant_crab",
      "goldfish",
      "hammerhead",
      "isopod",
      "jellyfish",
      "lightning",
      "lionfish",
      "mandarin",
      "manta",
      "monster",
      "oarfish",
      "octopus",
      "orca",
      "pelican_eel",
      "piranha",
      "pufferfish",
      "sardine",
      "seadragon",
      "seahorse",
      "shark",
      "squid",
      "standard",
      "starfish",
      "stingray",
      "sunfish",
      "swordfish",
      "vampire_squid",
      "whale",
    ];

    fishTypes.forEach((fish) => {
      this.load.image(`fish_${fish}`, `/games/fishing/assets/${fish}.png`);
    });
  }

  create(): void {
    this.isPausedForShop = false;
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
    this.hookManager = new HookManager(
      this,
      this.inputManager,
      this.uiManager,
      this.shopManager,
    );

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
    this.hookManager.initHook(rodTipX, rodTipY + 12);

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);

    this.physics.add.overlap(
      this.hookManager.hookContainer,
      this.ecoManager.fishGroup,
      this.hookManager.handleCatch.bind(this.hookManager),
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

    if (this.hookManager.isHookRetracted) {
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
    } else {
      this.boat.angle = Math.sin(this.envManager.waveTimer * 1.5) * 2;
    }

    this.boat.y = 90 + Math.sin(this.envManager.waveTimer * 2) * 3;

    this.hookManager.update(deltaSec, this.boat.x, rodTipX, rodTipY, () => {
      this.cameras.main.startFollow(this.boat, true, 0.08, 0.08);
    });

    const currentDepthMeters = Math.max(
      0,
      Math.floor((this.hookManager.hookContainer.y - (this.boat.y - 28)) / 20),
    );
    this.uiManager.updateDepth(currentDepthMeters);
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
}
