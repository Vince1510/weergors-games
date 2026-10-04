import Phaser from "phaser";
import { Fish } from "../entities/Fish";
import { InputManager } from "./InputManager";
import { UIManager } from "./UIManager";
import { ShopManager } from "./ShopManager";

export class HookManager {
  private scene: Phaser.Scene;
  private inputManager: InputManager;
  private uiManager: UIManager;
  private shopManager: ShopManager;

  public hookContainer!: Phaser.GameObjects.Container;
  private hookGraphics!: Phaser.GameObjects.Graphics;
  private fishingLineGraphics!: Phaser.GameObjects.Graphics;

  public hookVx: number = 0;
  public isHookRetracted: boolean = true;
  private maxDepthWarningShown: boolean = false;

  public hookedFishes: Fish[] = [];
  public lineTension: number = 0;

  private fishNames: Record<string, string> = {
    angelfish: "Keizersvis 🐟",
    anglerfish: "Hengelvis 🎣",
    axolotl: "Axolotl 🦎",
    beta: "Kempvis 🐠",
    clownfish: "Clownvis 🐠",
    crab: "Krab 🦀",
    dolphin: "Dolfijn 🐬",
    eel: "Paling 🐍",
    electric_ray: "Sidderaal ⚡",
    flounder: "Bot / Platvis 🐟",
    giant_crab: "Reuzenkrab 🦀",
    goldfish: "Goudvis 🐠",
    hammerhead: "Hamerhaai 🦈",
    isopod: "Reuzenisopod 🐛",
    jellyfish: "Kwal 🪼",
    lightning: "Lightning Eel ⚡",
    lionfish: "Koraalduivel 🐉",
    mandarin: "Mandarijnvis 🐠",
    manta: "Mantarog 🌊",
    monster: "Diepzee Monster 👹",
    oarfish: "Riempjesvis 🐍",
    octopus: "Octopus 🐙",
    orca: "Orka 🐋",
    pelican_eel: "Pelikaanaling 🐟",
    piranha: "Piranha 🐟",
    pufferfish: "Kogelvis 🐡",
    sardine: "Sardine 🐟",
    seadragon: "Bladerachtige Zeedraak 🌿",
    seahorse: "Zeepaardje 🌊",
    shark: "Haai 🦈",
    squid: "Inktvis 🦑",
    standard: "Vis 🐠",
    starfish: "Zeester ⭐",
    stingray: "Pijlstaartrog 🦈",
    sunfish: "Maanvis 🌕",
    swordfish: "Zwaardvis 🗡️",
    vampire_squid: "Vampierinktvis 🦑",
    whale: "Walvis 🐋",
  };

  constructor(
    scene: Phaser.Scene,
    inputManager: InputManager,
    uiManager: UIManager,
    shopManager: ShopManager,
  ) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.uiManager = uiManager;
    this.shopManager = shopManager;
  }

  public initHook(x: number, y: number): void {
    this.reset();

    this.hookContainer = this.scene.add.container(x, y);

    this.hookGraphics = this.scene.add.graphics();
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

    this.scene.physics.add.existing(this.hookContainer);
    const body = this.hookContainer.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(16, 20);
    body.setOffset(-2, 0);

    this.fishingLineGraphics = this.scene.add.graphics();
  }

  public reset(): void {
    this.hookedFishes = [];
    this.lineTension = 0;
    this.hookVx = 0;
    this.isHookRetracted = true;
    this.maxDepthWarningShown = false;
  }
  public handleCatch(
    _hook:
      | Phaser.GameObjects.GameObject
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    fishObj:
      | Phaser.GameObjects.GameObject
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
  ): void {
    const fish = fishObj as Fish;
    if (!fish || fish.isHooked || this.isHookRetracted) return;

    const maxCapacity = this.shopManager.getMaxHookCapacity();
    if (this.hookedFishes.length >= maxCapacity) {
      return;
    }

    fish.isHooked = true;
    this.hookedFishes.push(fish);
    this.lineTension += 10;
  }

  public update(
    deltaSec: number,
    boatX: number,
    rodTipX: number,
    rodTipY: number,
    onRetractComplete: () => void,
  ): void {
    const inputState = this.inputManager.inputState;
    const maxHookY = this.shopManager.getMaxHookDepth();
    const currentHookSpeed = this.shopManager.getHookSpeed();

    // --- MODUS 1: HAAK BINNEN ---
    if (this.isHookRetracted) {
      this.hookContainer.x = rodTipX;
      this.hookContainer.y = rodTipY + 12;
      this.hookContainer.angle = 0;

      if (inputState.down) {
        this.isHookRetracted = false;
        this.maxDepthWarningShown = false;
        this.inputManager.setLeftRightVisible(false);

        this.scene.cameras.main.stopFollow();
        this.scene.cameras.main.pan(
          this.hookContainer.x,
          this.hookContainer.y,
          600,
          "Cubic.easeOut",
          true,
          (_camera, progress) => {
            if (progress === 1) {
              this.scene.cameras.main.startFollow(
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
    // --- MODUS 2: HAAK IN HET WATER ---
    else {
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

        const totalFishPoints = this.hookedFishes.reduce(
          (sum, f) => sum + f.points,
          0,
        );
        if (this.hookedFishes.length > 0) {
          currentPullSpeed -= totalFishPoints * 0.25;
        }
        this.hookContainer.y -= Math.max(80, currentPullSpeed) * deltaSec;

        if (this.hookContainer.y <= rodTipY + 12) {
          this.hookContainer.y = rodTipY + 12;
          this.isHookRetracted = true;
          this.inputManager.setLeftRightVisible(true);

          this.scene.cameras.main.stopFollow();
          this.scene.cameras.main.pan(
            boatX,
            rodTipY + 28,
            700,
            "Cubic.easeInOut",
            true,
            (_camera, progress) => {
              if (progress === 1) {
                onRetractComplete();
              }
            },
          );

          if (this.hookedFishes.length > 0) {
            this.hookedFishes.forEach((fish) => {
              const name = this.fishNames[fish.fishType] || "Vis 🐠";
              this.shopManager.addFishToInventory(
                name,
                fish.points,
                0xffaa00,
                fish.fishType,
              );
              fish.destroy();
            });

            this.uiManager.updateFishCount(
              this.shopManager.caughtFishList.length,
            );
            this.uiManager.showStatus(
              `${this.hookedFishes.length} vissen gevangen!`,
              1800,
            );
            this.hookedFishes = [];
            this.uiManager.hideTensionBar();
            this.lineTension = 0;
          }
        }
      }

      // --- MEERDERE GEHAAKTE VISSEN & SPANNING BEHEER ---
      if (this.hookedFishes.length > 0) {
        const hookCurveX = this.hookContainer.x + 6;
        const hookCurveY = this.hookContainer.y + 14;

        this.hookedFishes.forEach((fish, index) => {
          fish.x = hookCurveX + index * 8;
          fish.y = hookCurveY + 10 + index * 15;

          if (typeof fish.updateHooked === "function") {
            fish.updateHooked(deltaSec);
          }

          console.log(
            `[Vis ${index}] Type: ${fish.fishType} | isStruggling: ${fish.isStruggling} | Timer: ${fish.struggleTimer}`,
          );

          if (fish.isStruggling) {
            this.hookVx += Math.random() > 0.5 ? 120 : -120;
          }
        });

        const tensionMultiplier = this.shopManager.getTensionMultiplier();
        const totalPoints = this.hookedFishes.reduce(
          (sum, f) => sum + f.points,
          0,
        );
        const anyStruggling = this.hookedFishes.some((f) => f.isStruggling);

        console.log(
          `[Tension Update] anyStruggling: ${anyStruggling} | input.up: ${inputState.up} | Huidige spanning: ${this.lineTension}`,
        );

        if (inputState.up && anyStruggling) {
          this.lineTension +=
            (25 + totalPoints * 0.15) * tensionMultiplier * deltaSec;
        } else if (!inputState.up) {
          this.lineTension = Math.max(0, this.lineTension - 40 * deltaSec);
        }

        this.uiManager.updateTension(this.lineTension);

        if (this.lineTension >= 80) {
          console.log(`[Lijn Gebroken] Spanning bereikte ${this.lineTension}`);
          this.uiManager.showStatus("Te veel gewicht! Lijn gebroken.", 2000);
          this.uiManager.hideTensionBar();

          this.hookedFishes.forEach((fish) => {
            fish.resetAfterEscape();
          });
          this.hookedFishes = [];
          this.lineTension = 0;
          return;
        }
      } else {
        this.uiManager.hideTensionBar();
      }
    }

    this.drawFishingLine(rodTipX, rodTipY);
  }

  private drawFishingLine(rodTipX: number, rodTipY: number): void {
    this.fishingLineGraphics.clear();

    const endX = this.hookContainer.x;
    const endY = this.hookContainer.y;

    if (this.isHookRetracted) return;

    const lineColor = this.lineTension > 50 ? 0xff2222 : 0xffffff;
    this.fishingLineGraphics.lineStyle(1.5, lineColor, 0.85);

    const midX = (rodTipX + endX) / 2 - this.hookVx * 0.1;
    const midY = (rodTipY + endY) / 2;

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(rodTipX, rodTipY),
      new Phaser.Math.Vector2(midX, midY),
      new Phaser.Math.Vector2(endX, endY),
    );

    const points = curve.getPoints(16);
    this.fishingLineGraphics.strokePoints(points);
  }
}
