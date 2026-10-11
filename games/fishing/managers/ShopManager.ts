import Phaser from "phaser";

export interface UpgradeLevel {
  lineLengthLevel: number;
  hookQualityLevel: number;
  speedUpgradeLevel: number;
  hookCapacityLevel: number;
}

export interface CaughtFishItem {
  id: string;
  name: string;
  value: number;
  color: number;
  type?: string;
}

const STORAGE_KEY = "camping_cross_fishing_save_v1";

// Alle 38 unieke vissen in de game
export const ALL_FISH_TYPES = [
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

export const FISH_DISPLAY_NAMES: Record<string, string> = {
  angelfish: "Keizersvis",
  anglerfish: "Hengelvis",
  axolotl: "Axolotl",
  beta: "Kempvis",
  clownfish: "Clownvis",
  crab: "Krab",
  dolphin: "Dolfijn",
  eel: "Paling",
  electric_ray: "Sidderaal",
  flounder: "Bot / Platvis",
  giant_crab: "Reuzenkrab",
  goldfish: "Goudvis",
  hammerhead: "Hamerhaai",
  isopod: "Reuzenisopod",
  jellyfish: "Kwal",
  lightning: "Lightning Eel",
  lionfish: "Koraalduivel",
  mandarin: "Mandarijnvis",
  manta: "Mantarog",
  monster: "Diepzee Monster",
  oarfish: "Riempjesvis",
  octopus: "Octopus",
  orca: "Orka",
  pelican_eel: "Pelikaanaling",
  piranha: "Piranha",
  pufferfish: "Kogelvis",
  sardine: "Sardine",
  seadragon: "Zeedraak",
  seahorse: "Zeepaardje",
  shark: "Haai",
  squid: "Inktvis",
  standard: "Vis",
  starfish: "Zeester",
  stingray: "Pijlstaartrog",
  sunfish: "Maanvis",
  swordfish: "Zwaardvis",
  vampire_squid: "Vampierinktvis",
  whale: "Walvis",
};

export class ShopManager {
  public coins: number = 0;
  public caughtFishList: CaughtFishItem[] = [];
  public unlockedFishTypes: string[] = []; // Unieke lijst van gevangen vissen

  public upgrades: UpgradeLevel = {
    lineLengthLevel: 1,
    hookQualityLevel: 1,
    speedUpgradeLevel: 1,
    hookCapacityLevel: 1,
  };

  private maxLevel: number = 20;

  constructor() {
    this.loadFromLocalStorage();
  }

  public saveToLocalStorage(): void {
    try {
      const saveData = {
        coins: this.coins,
        caughtFishList: this.caughtFishList,
        unlockedFishTypes: this.unlockedFishTypes,
        upgrades: this.upgrades,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.warn("Save error:", e);
    }
  }

  public loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.coins === "number") this.coins = parsed.coins;
        if (Array.isArray(parsed.caughtFishList))
          this.caughtFishList = parsed.caughtFishList;
        if (Array.isArray(parsed.unlockedFishTypes))
          this.unlockedFishTypes = parsed.unlockedFishTypes;
        if (parsed.upgrades) {
          this.upgrades = {
            lineLengthLevel: parsed.upgrades.lineLengthLevel || 1,
            hookQualityLevel: parsed.upgrades.hookQualityLevel || 1,
            speedUpgradeLevel: parsed.upgrades.speedUpgradeLevel || 1,
            hookCapacityLevel: parsed.upgrades.hookCapacityLevel || 1,
          };
        }
      }
    } catch (e) {
      console.warn("Load error:", e);
    }
  }

  public addFishToInventory(
    fishName: string,
    value: number,
    color: number,
    fishType: string = "standard",
  ): void {
    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);

    this.caughtFishList.push({
      id: uniqueId,
      name: fishName,
      value: value,
      color: color,
      type: fishType,
    });

    // Registreer uniek als ontdekt voor de collectie
    if (!this.unlockedFishTypes.includes(fishType)) {
      this.unlockedFishTypes.push(fishType);
    }

    this.saveToLocalStorage();
  }

  public sellAllFish(): number {
    const totalEarnings = this.caughtFishList.reduce(
      (sum, f) => sum + f.value,
      0,
    );
    this.coins += totalEarnings;
    this.caughtFishList = [];
    this.saveToLocalStorage();
    return totalEarnings;
  }

  public getCollectionStatus() {
    return ALL_FISH_TYPES.map((type) => ({
      type,
      name: FISH_DISPLAY_NAMES[type] || type,
      isUnlocked: this.unlockedFishTypes.includes(type),
    }));
  }

  public getMaxHookDepth(): number {
    return 3000 + this.upgrades.lineLengthLevel * 1800;
  }

  public getTensionMultiplier(): number {
    return Math.max(0.15, 1 - (this.upgrades.hookQualityLevel - 1) * 0.045);
  }

  public getHookSpeed(): number {
    return 320 + (this.upgrades.speedUpgradeLevel - 1) * 45;
  }

  public getMaxHookCapacity(): number {
    const capacity =
      1 +
      Math.floor(
        ((this.upgrades.hookCapacityLevel - 1) / (this.maxLevel - 1)) * 9,
      );
    return Phaser.Math.Clamp(capacity, 1, 10);
  }

  // Kostenberekeningen...
  public getLineUpgradeCost(): number {
    if (this.upgrades.lineLengthLevel >= this.maxLevel) return 0;
    return Math.floor(50 * Math.pow(1.3, this.upgrades.lineLengthLevel - 1));
  }
  public canBuyLineUpgrade(): boolean {
    return (
      this.getLineUpgradeCost() > 0 && this.coins >= this.getLineUpgradeCost()
    );
  }
  public buyLineUpgrade(): boolean {
    if (this.canBuyLineUpgrade()) {
      this.coins -= this.getLineUpgradeCost();
      this.upgrades.lineLengthLevel++;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  public getHookUpgradeCost(): number {
    if (this.upgrades.hookQualityLevel >= this.maxLevel) return 0;
    return Math.floor(65 * Math.pow(1.3, this.upgrades.hookQualityLevel - 1));
  }
  public canBuyHookUpgrade(): boolean {
    return (
      this.getHookUpgradeCost() > 0 && this.coins >= this.getHookUpgradeCost()
    );
  }
  public buyHookUpgrade(): boolean {
    if (this.canBuyHookUpgrade()) {
      this.coins -= this.getHookUpgradeCost();
      this.upgrades.hookQualityLevel++;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  public getSpeedUpgradeCost(): number {
    if (this.upgrades.speedUpgradeLevel >= this.maxLevel) return 0;
    return Math.floor(60 * Math.pow(1.3, this.upgrades.speedUpgradeLevel - 1));
  }
  public canBuySpeedUpgrade(): boolean {
    return (
      this.getSpeedUpgradeCost() > 0 && this.coins >= this.getSpeedUpgradeCost()
    );
  }
  public buySpeedUpgrade(): boolean {
    if (this.canBuySpeedUpgrade()) {
      this.coins -= this.getSpeedUpgradeCost();
      this.upgrades.speedUpgradeLevel++;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  public getCapacityUpgradeCost(): number {
    if (this.upgrades.hookCapacityLevel >= this.maxLevel) return 0;
    return Math.floor(80 * Math.pow(1.35, this.upgrades.hookCapacityLevel - 1));
  }
  public canBuyCapacityUpgrade(): boolean {
    return (
      this.getCapacityUpgradeCost() > 0 &&
      this.coins >= this.getCapacityUpgradeCost()
    );
  }
  public buyCapacityUpgrade(): boolean {
    if (this.canBuyCapacityUpgrade()) {
      this.coins -= this.getCapacityUpgradeCost();
      this.upgrades.hookCapacityLevel++;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }
}
