import Phaser from "phaser";
import { Platform, type PlatformType } from "../entities/Platform";
import { SkyItem } from "../entities/SkyItem";

interface SpawnRules {
  platforms: PlatformType[];
  itemType?: "umbrella";
  itemChance: number;
}

const SPAWN_RULES: { minScore: number; maxScore: number; rules: SpawnRules }[] =
  [
    {
      minScore: 0,
      maxScore: 199,
      rules: { platforms: ["standard"], itemChance: 0 },
    },
    {
      minScore: 200,
      maxScore: 599,
      rules: {
        platforms: ["standard", "cloud", "spring"],
        itemChance: 0,
      },
    },
    {
      minScore: 600,
      maxScore: 799,
      rules: {
        platforms: ["cloud", "spring", "plane"],
        itemType: "umbrella",
        itemChance: 0.24,
      },
    },
    {
      minScore: 800,
      maxScore: 999,
      rules: { platforms: ["cloud"], itemChance: 0 },
    },
    {
      minScore: 1000,
      maxScore: 1199,
      rules: { platforms: ["plane"], itemChance: 0 },
    },
    {
      minScore: 1200,
      maxScore: 1999,
      rules: {
        platforms: ["spaceship"],
        itemType: "umbrella",
        itemChance: 0.24,
      },
    },
    {
      minScore: 2000,
      maxScore: Number.POSITIVE_INFINITY,
      rules: { platforms: ["cloud"], itemChance: 0 },
    },
  ];

export class SpawnManager {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createPlatform(x: number, y: number, score: number): Platform {
    return new Platform(this.scene, x, y, this.getPlatformType(score));
  }

  public getPlatformType(score: number): PlatformType {
    return Phaser.Utils.Array.GetRandom(this.getRules(score).platforms);
  }

  public spawnItemAbove(
    platform: Platform,
    score: number,
  ): SkyItem | undefined {
    const rules = this.getRules(score);
    if (
      platform.type !== "standard" ||
      !rules.itemType ||
      Math.random() >= rules.itemChance
    ) {
      return undefined;
    }

    return new SkyItem(
      this.scene,
      platform.x,
      platform.y - Platform.HEIGHT / 2 - 34,
      rules.itemType,
    );
  }

  private getRules(score: number): SpawnRules {
    const phase = SPAWN_RULES.find(
      ({ minScore, maxScore }) => score >= minScore && score <= maxScore,
    );

    if (!phase) {
      throw new Error(`No spawn rules configured for score ${score}`);
    }

    return phase.rules;
  }
}
