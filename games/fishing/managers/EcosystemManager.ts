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
      // Oppervlakte & Ondiep (0m - 120m)
      {
        count: 12,
        speed: 0.8,
        points: 10,
        color: 0xffaa00,
        size: 24,
        yMin: 200,
        yMax: 1500,
        type: "standard",
      },
      {
        count: 5,
        speed: 1.3,
        points: 40,
        color: 0x4682b4,
        size: 36,
        yMin: 300,
        yMax: 1500,
        type: "dolphin",
      },
      {
        count: 6,
        speed: 0.6,
        points: 50,
        color: 0x94a3b8,
        size: 42,
        yMin: 800,
        yMax: 2000,
        type: "sunfish",
      },

      // Middeldiep (130m - 300m)
      {
        count: 8,
        speed: 1.1,
        points: 30,
        color: 0x33cc33,
        size: 30,
        yMin: 2200,
        yMax: 4500,
        type: "standard",
      },
      {
        count: 6,
        speed: 1.5,
        points: 80,
        color: 0xdda0dd,
        size: 28,
        yMin: 2500,
        yMax: 5000,
        type: "jellyfish",
      },
      {
        count: 7,
        speed: 2.1,
        points: 70,
        color: 0xcc2222,
        size: 28,
        yMin: 2500,
        yMax: 4800,
        type: "piranha",
      },
      {
        count: 5,
        speed: 0.9,
        points: 90,
        color: 0x556b2f,
        size: 34,
        yMin: 3000,
        yMax: 5500,
        type: "eel",
      },

      // Diepzee (315m - 500m)
      {
        count: 6,
        speed: 1.8,
        points: 150,
        color: 0x20b2aa,
        size: 45,
        yMin: 5600,
        yMax: 7800,
        type: "swordfish",
      },
      {
        count: 5,
        speed: -1.0,
        points: 180,
        color: 0x708090,
        size: 55,
        yMin: 5800,
        yMax: 8000,
        type: "shark",
      },
      {
        count: 4,
        speed: 2.4,
        points: 220,
        color: 0x1e1b4b,
        size: 38,
        yMin: 6000,
        yMax: 8200,
        type: "lightning",
        isFast: true,
      },
      {
        count: 4,
        speed: 0.7,
        points: 250,
        color: 0x9333ea,
        size: 44,
        yMin: 6200,
        yMax: 8500,
        type: "octopus",
      },

      // Abyssale Zone & Bodem (500m+)
      {
        count: 3,
        speed: 1.2,
        points: 500,
        color: 0x0f172a,
        size: 60,
        yMin: 8600,
        yMax: 9400,
        type: "monster",
        isSpecial: true,
      },
      {
        count: 2,
        speed: 0.5,
        points: 1200,
        color: 0x1e293b,
        size: 90,
        yMin: 9500,
        yMax: 9900,
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
