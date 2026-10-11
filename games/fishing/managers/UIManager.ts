import Phaser from "phaser";
import { ShopManager } from "./ShopManager";
import { CollectionModal } from "./CollectionModal";

export class UIManager {
  private scene: Phaser.Scene;
  private coinsText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private tensionBarContainer!: Phaser.GameObjects.Container;
  private tensionBarFill!: Phaser.GameObjects.Graphics;

  private upgradeButtonsContainer!: Phaser.GameObjects.Container;
  private collectionModal: CollectionModal;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.collectionModal = new CollectionModal(scene);
  }

  public createHUD(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    // Links boven: Direct het geupdate geld
    this.coinsText = this.scene.add
      .text(20, 20, `Geld: €${shopManager.coins}`, {
        fontSize: "20px",
        color: "#ffd700",
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
    const btnHeight = 40;

    // --- COLLECTIE KNOP (Rechtsboven) ---
    const collBtnBg = this.scene.add
      .rectangle(0, 0, btnWidth, btnHeight, 0x1155aa)
      .setStrokeStyle(2, 0xffffff);

    const collBtnTxt = this.scene.add
      .text(0, 0, "Collectie 📖", {
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const collBtn = this.scene.add
      .container(this.scene.scale.width - 80, 35, [collBtnBg, collBtnTxt])
      .setScrollFactor(0)
      .setDepth(250);

    const hitArea = new Phaser.Geom.Rectangle(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
    );
    collBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    collBtn.on("pointerdown", () => {
      this.toggleCollection(shopManager, onShopStateChange);
    });

    this.createTensionBar();
    this.createUpgradeButtons(shopManager);

    this.collectionModal.create(shopManager, onShopStateChange, () => {
      this.toggleCollection(shopManager, onShopStateChange);
    });
  }

  private upgradeButtonContainers: Phaser.GameObjects.Container[] = [];

  private createUpgradeButtons(shopManager: ShopManager): void {
    this.renderUpgradeButtonsContent(shopManager);
  }

  public renderUpgradeButtonsContent(shopManager: ShopManager): void {
    this.upgradeButtonContainers.forEach((btn) => btn.destroy());
    this.upgradeButtonContainers = [];

    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;

    // Grid instellingen (2 kolommen x 2 rijen)
    const cardWidth = 195;
    const cardHeight = 64;
    const spacingX = 12;
    const spacingY = 10;

    // Plaats het grid net boven de pijltjesknoppen
    const startX = sw / 2 - (cardWidth + spacingX / 2);
    const startY = sh - 220;

    const upgradesInfo = [
      {
        title: "Vislijn lengte",
        level: shopManager.upgrades.lineLengthLevel,
        cost: shopManager.getLineUpgradeCost(),
        canBuy: shopManager.canBuyLineUpgrade(),
        iconKey: "icon_line", // Zorg dat deze texture bestaat of gebruik een fallback
        action: () => {
          if (shopManager.buyLineUpgrade()) {
            this.updateCoins(shopManager.coins);
            this.renderUpgradeButtonsContent(shopManager);
          }
        },
        col: 0,
        row: 0,
      },
      {
        title: "Snelheid",
        level: shopManager.upgrades.speedUpgradeLevel,
        cost: shopManager.getSpeedUpgradeCost(),
        canBuy: shopManager.canBuySpeedUpgrade(),
        iconKey: "icon_speed",
        action: () => {
          if (shopManager.buySpeedUpgrade()) {
            this.updateCoins(shopManager.coins);
            this.renderUpgradeButtonsContent(shopManager);
          }
        },
        col: 1,
        row: 0,
      },
      {
        title: "Sterker haakje",
        level: shopManager.upgrades.hookQualityLevel,
        cost: shopManager.getHookUpgradeCost(),
        canBuy: shopManager.canBuyHookUpgrade(),
        iconKey: "icon_hook",
        action: () => {
          if (shopManager.buyHookUpgrade()) {
            this.updateCoins(shopManager.coins);
            this.renderUpgradeButtonsContent(shopManager);
          }
        },
        col: 0,
        row: 1,
      },
      {
        title: "Haak capaciteit",
        level: shopManager.upgrades.hookCapacityLevel,
        cost: shopManager.getCapacityUpgradeCost(),
        canBuy: shopManager.canBuyCapacityUpgrade(),
        iconKey: "icon_capacity",
        action: () => {
          if (shopManager.buyCapacityUpgrade()) {
            this.updateCoins(shopManager.coins);
            this.renderUpgradeButtonsContent(shopManager);
          }
        },
        col: 1,
        row: 1,
      },
    ];

    upgradesInfo.forEach((item) => {
      const cardWidth = 195;
      const cardHeight = 64;
      const bgColor = item.canBuy ? 0x1e3a8a : 0x374151;

      const posX = startX + item.col * (cardWidth + 12) + cardWidth / 2;
      const posY = startY + item.row * (cardHeight + 10);

      // Maak de container interactief met een duidelijke hitArea
      const btnContainer = this.scene.add.container(posX, posY);
      btnContainer.setScrollFactor(0);
      btnContainer.setDepth(250);

      const hitArea = new Phaser.Geom.Rectangle(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
      );
      btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      const bg = this.scene.add
        .rectangle(0, 0, cardWidth, cardHeight, bgColor)
        .setStrokeStyle(2, item.canBuy ? 0x38bdf8 : 0x9ca3af);

      if (this.scene.textures.exists(item.iconKey)) {
        const icon = this.scene.add.image(-cardWidth / 2 + 24, 0, item.iconKey);
        icon.setDisplaySize(32, 32);
        btnContainer.add(icon);
      } else {
        const fallbackCircle = this.scene.add.circle(
          -cardWidth / 2 + 26,
          0,
          16,
          0x3b82f6,
        );
        btnContainer.add(fallbackCircle);
      }

      const textX = -cardWidth / 2 + 50;

      const titleText = this.scene.add.text(textX, -12, `${item.title}`, {
        fontSize: "13px",
        color: "#ffffff",
        fontStyle: "bold",
      });

      const infoText = this.scene.add.text(
        textX,
        8,
        `Lvl ${item.level} | €${item.cost}`,
        {
          fontSize: "12px",
          color: item.canBuy ? "#facc15" : "#9ca3af",
          fontStyle: "bold",
        },
      );

      btnContainer.add([bg, titleText, infoText]);

      if (item.canBuy) {
        btnContainer.on("pointerdown", () => {
          bg.setAlpha(0.8);
          item.action();
        });
        btnContainer.on("pointerup", () => bg.setAlpha(1));
        btnContainer.on("pointerout", () => bg.setAlpha(1));
      }

      btnContainer.setVisible(false);
      this.upgradeButtonContainers.push(btnContainer);
    });
  }

  public setUpgradeButtonsVisible(
    visible: boolean,
    shopManager: ShopManager,
  ): void {
    // Zet de zichtbaarheid van alle losse knoppen aan/uit
    this.upgradeButtonContainers.forEach((btn) => btn.setVisible(visible));
  }

  public updateCoins(coins: number): void {
    if (this.coinsText) {
      this.coinsText.setText(`Geld: €${coins}`);
    }
  }

  public updateDepth(depthMeters: number): void {
    if (this.depthText) {
      this.depthText.setText(`Diepte: ${depthMeters}m`);
    }
  }

  public toggleCollection(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    const nextState = !this.collectionModal.isOpen();
    this.collectionModal.setVisible(nextState, shopManager, onShopStateChange);
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
