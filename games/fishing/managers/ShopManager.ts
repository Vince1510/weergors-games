import Phaser from "phaser";

export interface UpgradeLevel {
  lineLengthLevel: number;
  hookQualityLevel: number;
  speedUpgradeLevel: number;
}

export interface CaughtFishItem {
  id: string;
  name: string;
  value: number;
  color: number;
}

const STORAGE_KEY = "camping_cross_fishing_save_v1";

export class ShopManager {
  public coins: number = 0;
  public caughtFishList: CaughtFishItem[] = [];

  public upgrades: UpgradeLevel = {
    lineLengthLevel: 1,
    hookQualityLevel: 1,
    speedUpgradeLevel: 1,
  };

  private maxLevel: number = 20; // Aantal upgrade levels verhoogd naar 20

  constructor() {
    this.loadFromLocalStorage();
  }

  public saveToLocalStorage(): void {
    try {
      const saveData = {
        coins: this.coins,
        caughtFishList: this.caughtFishList,
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
        if (parsed.upgrades) {
          this.upgrades = {
            lineLengthLevel: parsed.upgrades.lineLengthLevel || 1,
            hookQualityLevel: parsed.upgrades.hookQualityLevel || 1,
            speedUpgradeLevel: parsed.upgrades.speedUpgradeLevel || 1,
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
    });
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

  // Diepte schaalt nu door tot ver voorbij 10.000px naarmate je vordert tot level 20
  public getMaxHookDepth(): number {
    return 1500 + this.upgrades.lineLengthLevel * 500;
  }

  public getTensionMultiplier(): number {
    // Elk level maakt de haak sterker (loopt geleidelijk terug tot 0.15)
    return Math.max(0.15, 1 - (this.upgrades.hookQualityLevel - 1) * 0.045);
  }

  public getHookSpeed(): number {
    return 320 + (this.upgrades.speedUpgradeLevel - 1) * 45;
  }

  // --- DYNAMISCHE KOSTEN BEREKENING (T/M LEVEL 20) ---

  public getLineUpgradeCost(): number {
    if (this.upgrades.lineLengthLevel >= this.maxLevel) return 0;
    return Math.floor(50 * Math.pow(1.3, this.upgrades.lineLengthLevel - 1));
  }

  public canBuyLineUpgrade(): boolean {
    const cost = this.getLineUpgradeCost();
    return cost > 0 && this.coins >= cost;
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
    const cost = this.getHookUpgradeCost();
    return cost > 0 && this.coins >= cost;
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
    const cost = this.getSpeedUpgradeCost();
    return cost > 0 && this.coins >= cost;
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
}
