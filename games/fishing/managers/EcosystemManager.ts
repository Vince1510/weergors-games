import Phaser from "phaser";
import { Fish, FishConfig } from "../entities/Fish";

interface SpawnerTier extends FishConfig {
  count: number;
  yMin: number;
  yMax: number;
}

export class EcosystemManager {
  private scene: Phaser.Scene;
  private worldWidth: number;

  public fishGroup!: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, worldWidth: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
  }

  public initEcosystem(): void {
    this.fishGroup = this.scene.physics.add.group();

    const fishTiers: SpawnerTier[] = [
      // ==========================================
      // TIER 1: Oppervlakte & Ondiep (0m - 4000m)
      // ==========================================
      {
        count: 8,
        speed: 0.8,
        points: 10,
        color: 0xffaa00,
        size: 24,
        yMin: 200,
        yMax: 1500,
        type: "standard",
      },
      {
        count: 6,
        speed: 0.9,
        points: 20,
        color: 0x94a3b8,
        size: 20,
        yMin: 300,
        yMax: 1800,
        type: "sardine",
      },
      {
        count: 6,
        speed: 0.8,
        points: 30,
        color: 0xf59e0b,
        size: 25,
        yMin: 200,
        yMax: 2000,
        type: "goldfish",
      },
      {
        count: 5,
        speed: 0.9,
        points: 35,
        color: 0xff6600,
        size: 26,
        yMin: 300,
        yMax: 2200,
        type: "clownfish",
      },
      {
        count: 5,
        speed: 1.0,
        points: 45,
        color: 0x3b82f6,
        size: 32,
        yMin: 400,
        yMax: 2500,
        type: "angelfish",
      },
      {
        count: 4,
        speed: 0.6,
        points: 45,
        color: 0xfacc15,
        size: 30,
        yMin: 250,
        yMax: 2800,
        type: "pufferfish",
      },
      {
        count: 4,
        speed: 0.5,
        points: 55,
        color: 0xef4444,
        size: 28,
        yMin: 400,
        yMax: 3000,
        type: "beta",
      },
      {
        count: 4,
        speed: 0.4,
        points: 60,
        color: 0xf97316,
        size: 28,
        yMin: 200,
        yMax: 3200,
        type: "seahorse",
      },
      {
        count: 5,
        speed: 0.4,
        points: 25,
        color: 0xf97316,
        size: 22,
        yMin: 500,
        yMax: 3500,
        type: "starfish",
      },
      {
        count: 5,
        speed: 0.7,
        points: 55,
        color: 0x06b6d4,
        size: 24,
        yMin: 800,
        yMax: 4000,
        type: "mandarin",
      },

      // ==========================================
      // TIER 2: Middeldiep (4000m - 14000m)
      // ==========================================
      {
        count: 5,
        speed: 1.3,
        points: 40,
        color: 0x4682b4,
        size: 36,
        yMin: 4200,
        yMax: 6500,
        type: "dolphin",
      },
      {
        count: 5,
        speed: 1.5,
        points: 80,
        color: 0xdda0dd,
        size: 28,
        yMin: 4500,
        yMax: 7000,
        type: "jellyfish",
      },
      {
        count: 5,
        speed: 2.1,
        points: 70,
        color: 0xcc2222,
        size: 28,
        yMin: 4800,
        yMax: 7500,
        type: "piranha",
      },
      {
        count: 4,
        speed: 0.9,
        points: 90,
        color: 0x556b2f,
        size: 34,
        yMin: 5000,
        yMax: 8500,
        type: "eel",
      },
      {
        count: 6,
        speed: 1.1,
        points: 50,
        color: 0x10b981,
        size: 32,
        yMin: 5500,
        yMax: 9500,
        type: "seadragon",
      },
      {
        count: 5,
        speed: 1.4,
        points: 90,
        color: 0x475569,
        size: 40,
        yMin: 6000,
        yMax: 10500,
        type: "barracuda",
        isFast: true,
      },
      {
        count: 5,
        speed: 0.9,
        points: 75,
        color: 0x94a3b8,
        size: 35,
        yMin: 6500,
        yMax: 11500,
        type: "lionfish",
      },
      {
        count: 4,
        speed: 0.9,
        points: 85,
        color: 0x3b82f6,
        size: 42,
        yMin: 7000,
        yMax: 12500,
        type: "electric_ray",
      },
      {
        count: 4,
        speed: 0.6,
        points: 85,
        color: 0x64748b,
        size: 45,
        yMin: 8000,
        yMax: 14000,
        type: "stingray",
      },

      // ==========================================
      // TIER 3: Diepzee (14000m - 26000m)
      // ==========================================
      {
        count: 4,
        speed: 0.6,
        points: 95,
        color: 0xa16207,
        size: 32,
        yMin: 14500,
        yMax: 17000,
        type: "flounder",
      },
      {
        count: 4,
        speed: 0.5,
        points: 65,
        color: 0xef4444,
        size: 26,
        yMin: 15000,
        yMax: 18000,
        type: "crab",
      },
      {
        count: 5,
        speed: 1.8,
        points: 150,
        color: 0x20b2aa,
        size: 45,
        yMin: 15500,
        yMax: 19000,
        type: "swordfish",
      },
      {
        count: 4,
        speed: 1.4,
        points: 160,
        color: 0xf43f5e,
        size: 35,
        yMin: 16000,
        yMax: 20000,
        type: "squid",
      },
      {
        count: 4,
        speed: -1.0,
        points: 180,
        color: 0x708090,
        size: 55,
        yMin: 17000,
        yMax: 21500,
        type: "shark",
      },
      {
        count: 4,
        speed: 2.4,
        points: 220,
        color: 0x1e1b4b,
        size: 38,
        yMin: 18000,
        yMax: 23000,
        type: "lightning",
        isFast: true,
      },
      {
        count: 4,
        speed: 0.7,
        points: 250,
        color: 0x9333ea,
        size: 44,
        yMin: 19000,
        yMax: 24500,
        type: "octopus",
      },
      {
        count: 4,
        speed: 1.6,
        points: 170,
        color: 0x64748b,
        size: 55,
        yMin: 20000,
        yMax: 26000,
        type: "hammerhead",
      },

      // ==========================================
      // TIER 4: Abyssale Zone & Bodem (26000m - 38000m+)
      // ==========================================
      {
        count: 4,
        speed: 1.2,
        points: 200,
        color: 0x0f172a,
        size: 70,
        yMin: 26500,
        yMax: 29000,
        type: "orca",
      },
      {
        count: 4,
        speed: 0.8,
        points: 160,
        color: 0x450a0a,
        size: 38,
        yMin: 27500,
        yMax: 30500,
        type: "vampire_squid",
      },
      {
        count: 4,
        speed: 0.7,
        points: 210,
        color: 0xfbcfe8,
        size: 30,
        yMin: 28500,
        yMax: 31500,
        type: "axolotl",
      },
      {
        count: 4,
        speed: 0.8,
        points: 300,
        color: 0x1e293b,
        size: 40,
        yMin: 29500,
        yMax: 32500,
        type: "anglerfish",
      },
      {
        count: 3,
        speed: 0.9,
        points: 380,
        color: 0x0f172a,
        size: 50,
        yMin: 30500,
        yMax: 33500,
        type: "manta",
      },
      {
        count: 3,
        speed: 1.2,
        points: 500,
        color: 0x0f172a,
        size: 60,
        yMin: 31500,
        yMax: 34500,
        type: "monster",
        isSpecial: true,
      },
      {
        count: 3,
        speed: 0.6,
        points: 350,
        color: 0x991b1b,
        size: 65,
        yMin: 32500,
        yMax: 35500,
        type: "giant_crab",
        isSpecial: true,
      },
      {
        count: 3,
        speed: 0.7,
        points: 280,
        color: 0xf8fafc,
        size: 85,
        yMin: 33500,
        yMax: 36500,
        type: "oarfish",
      },
      {
        count: 3,
        speed: 0.5,
        points: 310,
        color: 0xcbd5e1,
        size: 30,
        yMin: 34500,
        yMax: 37500,
        type: "isopod",
      },
      {
        count: 3,
        speed: 0.8,
        points: 340,
        color: 0x172554,
        size: 45,
        yMin: 35500,
        yMax: 38000,
        type: "pelican_eel",
      },
      {
        count: 2,
        speed: 0.5,
        points: 1200,
        color: 0x1e293b,
        size: 90,
        yMin: 36500,
        yMax: 38500,
        type: "whale",
      },
    ];

    fishTiers.forEach((tier) => {
      for (let i = 0; i < tier.count; i++) {
        const x = Phaser.Math.Between(200, this.worldWidth - 200);
        const y = Phaser.Math.Between(tier.yMin, tier.yMax);
        const directionSpeed = Math.random() > 0.5 ? tier.speed : -tier.speed;

        const fish = new Fish(this.scene, x, y, {
          ...tier,
          speed: directionSpeed,
        });

        this.fishGroup.add(fish);
      }
    });
  }

  public update(deltaSec: number): void {
    this.fishGroup.getChildren().forEach((obj) => {
      const fish = obj as Fish;
      if (fish && fish.active) {
        fish.updateFish(this.worldWidth, deltaSec);
      }
    });
  }
}
