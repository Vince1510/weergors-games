import Phaser from "phaser";
import { ShopManager } from "./ShopManager";

export class UIManager {
  private scene: Phaser.Scene;
  private fishCountText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private tensionBarContainer!: Phaser.GameObjects.Container;
  private tensionBarFill!: Phaser.GameObjects.Graphics;

  private shopContainer!: Phaser.GameObjects.Container;
  private closeBtnContainer!: Phaser.GameObjects.Container;
  private isShopOpen: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createHUD(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    this.fishCountText = this.scene.add
      .text(20, 20, `Vissen in emmer: ${shopManager.caughtFishList.length}`, {
        fontSize: "20px",
        color: "#66ff66",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.depthText = this.scene.add
      .text(20, 52, "Diepte: 0m", {
        fontSize: "18px",
        color: "#66ccff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.statusText = this.scene.add
      .text(this.scene.scale.width / 2, 130, "", {
        fontSize: "20px",
        color: "#ff2222",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    const btnWidth = 130;
    const btnHeight = 42;

    const shopBtnBg = this.scene.add
      .rectangle(0, 0, btnWidth, btnHeight, 0x228833)
      .setStrokeStyle(2, 0xffffff);

    const shopBtnTxt = this.scene.add
      .text(0, 0, "Winkel 🛒", {
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const shopBtn = this.scene.add
      .container(this.scene.scale.width - 80, 40, [shopBtnBg, shopBtnTxt])
      .setScrollFactor(0)
      .setDepth(250);

    const hitArea = new Phaser.Geom.Rectangle(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
    );
    shopBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    shopBtn.on("pointerdown", () => {
      this.toggleShop(shopManager, onShopStateChange);
    });

    this.createTensionBar();
    this.createShopModal(shopManager, onShopStateChange);
  }

  public update(): void {
    if (this.fishCountText && this.depthText) {
      this.fishCountText.x = Math.round(20);
      this.fishCountText.y = Math.round(20);
      this.depthText.x = Math.round(20);
      this.depthText.y = Math.round(52);
    }
  }

  private createShopModal(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;

    const bgOverlay = this.scene.add
      .rectangle(0, 0, sw, sh, 0x000000, 0.8)
      .setOrigin(0);

    const panel = this.scene.add
      .rectangle(sw / 2, sh / 2, sw * 0.88, sh * 0.86, 0x112233)
      .setStrokeStyle(4, 0x33aaff);

    const title = this.scene.add
      .text(sw / 2, sh / 2 - sh * 0.37, "VISMARKT & WINKEL", {
        fontSize: "22px",
        color: "#ffd700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.shopContainer = this.scene.add
      .container(0, 0, [bgOverlay, panel, title])
      .setScrollFactor(0)
      .setDepth(400)
      .setVisible(false);

    const closeBtnBg = this.scene.add
      .circle(0, 0, 22, 0xcc2222)
      .setStrokeStyle(2, 0xffffff);

    const closeBtnTxt = this.scene.add
      .text(0, 0, "X", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.closeBtnContainer = this.scene.add
      .container(sw / 2 + sw * 0.39, sh / 2 - sh * 0.37, [
        closeBtnBg,
        closeBtnTxt,
      ])
      .setScrollFactor(0)
      .setDepth(500)
      .setVisible(false);

    const closeHitArea = new Phaser.Geom.Circle(0, 0, 22);
    this.closeBtnContainer.setInteractive(
      closeHitArea,
      Phaser.Geom.Circle.Contains,
    );

    this.closeBtnContainer.on("pointerdown", () => {
      this.toggleShop(shopManager, onShopStateChange);
    });
  }

  public toggleShop(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    this.isShopOpen = !this.isShopOpen;
    this.shopContainer.setVisible(this.isShopOpen);
    this.closeBtnContainer.setVisible(this.isShopOpen);
    onShopStateChange(this.isShopOpen);

    if (this.isShopOpen) {
      this.renderShopContent(shopManager, onShopStateChange);
    }
  }

  private renderShopContent(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;

    this.shopContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child && child.getData("dynamic")) {
        child.destroy();
      }
    });

    const fishCount = shopManager.caughtFishList.length;
    const totalVal = shopManager.caughtFishList.reduce(
      (sum, f) => sum + f.value,
      0,
    );

    const coinsHeader = this.scene.add
      .text(
        sw / 2,
        sh / 2 - sh * 0.28,
        `Beschikbare Munten: €${shopManager.coins}`,
        {
          fontSize: "18px",
          color: "#ffd700",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setData("dynamic", true);

    const invText = this.scene.add
      .text(
        sw / 2,
        sh / 2 - sh * 0.22,
        `Emmer: ${fishCount} vissen  |  Waarde: €${totalVal}`,
        {
          fontSize: "14px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5)
      .setData("dynamic", true);

    const sellBtnContainer = this.createButton(
      sw / 2,
      sh / 2 - sh * 0.14,
      280,
      36,
      "Alles Verkopen 💰",
      totalVal > 0 ? 0x22aa44 : 0x555555,
      totalVal > 0,
      () => {
        const earned = shopManager.sellAllFish();
        this.updateFishCount(shopManager.caughtFishList.length);
        this.showStatus(`+€${earned} verdiend!`, 1500);
        this.renderShopContent(shopManager, onShopStateChange);
      },
    );
    sellBtnContainer.setData("dynamic", true);

    // 1. Vislijn Lengte Upgrade
    const lineCost = shopManager.getLineUpgradeCost();
    const lineLabel =
      lineCost > 0
        ? `Vislijn Lengte (Lvl ${shopManager.upgrades.lineLengthLevel + 1}): €${lineCost}`
        : "Vislijn Lengte: MAX";

    const lineBtnContainer = this.createButton(
      sw / 2,
      sh / 2 - sh * 0.04,
      320,
      36,
      lineLabel,
      shopManager.canBuyLineUpgrade() ? 0x3388cc : 0x444444,
      shopManager.canBuyLineUpgrade(),
      () => {
        if (shopManager.buyLineUpgrade()) {
          this.updateFishCount(shopManager.caughtFishList.length);
          this.renderShopContent(shopManager, onShopStateChange);
        }
      },
    );
    lineBtnContainer.setData("dynamic", true);

    // 2. Snelheid Upgrade
    const speedCost = shopManager.getSpeedUpgradeCost();
    const speedLabel =
      speedCost > 0
        ? `Snelheid (Lvl ${shopManager.upgrades.speedUpgradeLevel + 1}): €${speedCost}`
        : "Snelheid: MAX";

    const speedBtnContainer = this.createButton(
      sw / 2,
      sh / 2 + sh * 0.06,
      320,
      36,
      speedLabel,
      shopManager.canBuySpeedUpgrade() ? 0x3388cc : 0x444444,
      shopManager.canBuySpeedUpgrade(),
      () => {
        if (shopManager.buySpeedUpgrade()) {
          this.updateFishCount(shopManager.caughtFishList.length);
          this.renderShopContent(shopManager, onShopStateChange);
        }
      },
    );
    speedBtnContainer.setData("dynamic", true);

    // 3. Sterker Haakje Upgrade
    const hookCost = shopManager.getHookUpgradeCost();
    const hookLabel =
      hookCost > 0
        ? `Sterker Haakje (Lvl ${shopManager.upgrades.hookQualityLevel + 1}): €${hookCost}`
        : "Sterker Haakje: MAX";

    const hookBtnContainer = this.createButton(
      sw / 2,
      sh / 2 + sh * 0.16,
      320,
      36,
      hookLabel,
      shopManager.canBuyHookUpgrade() ? 0x3388cc : 0x444444,
      shopManager.canBuyHookUpgrade(),
      () => {
        if (shopManager.buyHookUpgrade()) {
          this.updateFishCount(shopManager.caughtFishList.length);
          this.renderShopContent(shopManager, onShopStateChange);
        }
      },
    );
    hookBtnContainer.setData("dynamic", true);

    // 4. Haak Capaciteit Upgrade (Meerdere vissen tegelijk)
    const capacityCost = shopManager.getCapacityUpgradeCost();
    const maxCapacity = shopManager.getMaxHookCapacity();
    const capacityLabel =
      capacityCost > 0
        ? `Haak Capaciteit [Max ${maxCapacity}] (Lvl ${shopManager.upgrades.hookCapacityLevel + 1}): €${capacityCost}`
        : `Haak Capaciteit: MAX [Max ${maxCapacity}]`;

    const capacityBtnContainer = this.createButton(
      sw / 2,
      sh / 2 + sh * 0.26,
      320,
      36,
      capacityLabel,
      shopManager.canBuyCapacityUpgrade() ? 0x3388cc : 0x444444,
      shopManager.canBuyCapacityUpgrade(),
      () => {
        if (shopManager.buyCapacityUpgrade()) {
          this.updateFishCount(shopManager.caughtFishList.length);
          this.renderShopContent(shopManager, onShopStateChange);
        }
      },
    );
    capacityBtnContainer.setData("dynamic", true);

    this.shopContainer.add([
      coinsHeader,
      invText,
      sellBtnContainer,
      lineBtnContainer,
      speedBtnContainer,
      hookBtnContainer,
      capacityBtnContainer,
    ]);
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    bgColor: number,
    enabled: boolean,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const bg = this.scene.add
      .rectangle(0, 0, width, height, bgColor)
      .setStrokeStyle(2, 0xffffff);

    const txt = this.scene.add
      .text(0, 0, label, {
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const container = this.scene.add
      .container(x, y, [bg, txt])
      .setScrollFactor(0)
      .setDepth(450);

    if (enabled) {
      const hitArea = new Phaser.Geom.Rectangle(
        -width / 2,
        -height / 2,
        width,
        height,
      );
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      container.on("pointerdown", () => {
        bg.setAlpha(0.7);
        onClick();
      });

      container.on("pointerup", () => bg.setAlpha(1));
      container.on("pointerout", () => bg.setAlpha(1));
    }

    return container;
  }

  public updateFishCount(count: number): void {
    this.fishCountText.setText(`Vissen in emmer: ${count}`);
  }

  public updateDepth(depthMeters: number): void {
    this.depthText.setText(`Diepte: ${depthMeters}m`);
  }

  public updateTension(tension: number): void {
    if (tension <= 0) {
      this.tensionBarContainer.setVisible(false);
      return;
    }

    this.tensionBarContainer.setVisible(true);
    this.tensionBarFill.clear();

    let color = 0x00ff00;
    if (tension > 70) color = 0xff2222;
    else if (tension > 40) color = 0xffaa00;

    const barWidth = Phaser.Math.Clamp((tension / 100) * 196, 0, 196);
    this.tensionBarFill.fillStyle(color, 1);
    this.tensionBarFill.fillRoundedRect(-98, -8, barWidth, 16, 4);
  }

  public hideTensionBar(): void {
    this.tensionBarContainer.setVisible(false);
  }

  public showStatus(msg: string, durationMs: number = 1500): void {
    this.statusText.setText(msg);
    if (durationMs > 0) {
      this.scene.time.delayedCall(durationMs, () =>
        this.statusText.setText(""),
      );
    }
  }

  private createTensionBar(): void {
    const screenWidth = this.scene.scale.width;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-102, -12, 204, 24, 8);
    bg.lineStyle(2, 0xffffff, 0.8);
    bg.strokeRoundedRect(-102, -12, 204, 24, 8);

    const label = this.scene.add
      .text(0, -26, "LIJNSPANNING", {
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tensionBarFill = this.scene.add.graphics();

    this.tensionBarContainer = this.scene.add
      .container(screenWidth / 2, 85, [bg, label, this.tensionBarFill])
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }
}
