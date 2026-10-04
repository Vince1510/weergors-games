import Phaser from "phaser";
import { ShopManager, ALL_FISH_TYPES } from "./ShopManager";

export class CollectionModal {
  private scene: Phaser.Scene;
  private collectionContainer!: Phaser.GameObjects.Container;
  private collectionCloseBtnContainer!: Phaser.GameObjects.Container;
  private isCollectionOpen: boolean = false;
  private collectionPage: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public create(
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
    onModalClose: () => void,
  ): void {
    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;

    const bgOverlay = this.scene.add
      .rectangle(0, 0, sw, sh, 0x000000, 0.85)
      .setOrigin(0);

    const panel = this.scene.add
      .rectangle(sw / 2, sh / 2, sw * 0.9, sh * 0.88, 0x0b192c)
      .setStrokeStyle(4, 0x00ffcc);

    const title = this.scene.add
      .text(sw / 2, sh / 2 - sh * 0.39, "VISCOLLECTIE (0 / 38)", {
        fontSize: "22px",
        color: "#00ffcc",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setName("collectionTitle");

    this.collectionContainer = this.scene.add
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

    this.collectionCloseBtnContainer = this.scene.add
      .container(sw / 2 + sw * 0.41, sh / 2 - sh * 0.39, [
        closeBtnBg,
        closeBtnTxt,
      ])
      .setScrollFactor(0)
      .setDepth(500)
      .setVisible(false);

    const closeHitArea = new Phaser.Geom.Circle(0, 0, 22);
    this.collectionCloseBtnContainer.setInteractive(
      closeHitArea,
      Phaser.Geom.Circle.Contains,
    );
    this.collectionCloseBtnContainer.on("pointerdown", () => {
      onModalClose();
    });
  }

  public isOpen(): boolean {
    return this.isCollectionOpen;
  }

  public setVisible(
    visible: boolean,
    shopManager: ShopManager,
    onShopStateChange: (isOpen: boolean) => void,
  ): void {
    this.isCollectionOpen = visible;
    this.collectionContainer.setVisible(visible);
    this.collectionCloseBtnContainer.setVisible(visible);
    onShopStateChange(visible);

    if (visible) {
      this.collectionPage = 0;
      this.renderContent(shopManager);
    }
  }

  public renderContent(shopManager: ShopManager): void {
    this.collectionContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child && child.getData("dynamic")) {
        child.destroy();
      }
    });

    const collectionData = shopManager.getCollectionStatus();
    const unlockedCount = collectionData.filter((f) => f.isUnlocked).length;

    const titleObj = this.collectionContainer.getByName(
      "collectionTitle",
    ) as Phaser.GameObjects.Text;
    if (titleObj) {
      titleObj.setText(
        `VISCOLLECTIE (${unlockedCount} / ${ALL_FISH_TYPES.length})`,
      );
    }

    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;

    const contentContainer = this.scene.add
      .container(0, 0)
      .setData("dynamic", true);
    this.collectionContainer.add(contentContainer);

    const itemsPerPage = 12;
    const totalPages = Math.ceil(collectionData.length / itemsPerPage);
    if (this.collectionPage >= totalPages) this.collectionPage = 0;
    if (this.collectionPage < 0) this.collectionPage = totalPages - 1;

    const startIndex = this.collectionPage * itemsPerPage;
    const pageItems = collectionData.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    const columns = 4;
    const cellWidth = 94;
    const cellHeight = 84;
    const totalGridWidth = columns * cellWidth;

    const startX = sw / 2 - totalGridWidth / 2 + cellWidth / 2;
    const startY = sh / 2 - sh * 0.22;

    pageItems.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;

      const box = this.scene.add
        .rectangle(x, y, cellWidth - 8, cellHeight - 6, 0x162942, 0.9)
        .setStrokeStyle(1.5, item.isUnlocked ? 0x00ffcc : 0x334455)
        .setData("dynamic", true);

      contentContainer.add(box);

      const fishImgKey = `fish_${item.type}`;
      if (this.scene.textures.exists(fishImgKey)) {
        const img = this.scene.add
          .image(x, y - 12, fishImgKey)
          .setData("dynamic", true);
        const maxDim = 38;
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        img.setScale(scale);
        img.setAlpha(item.isUnlocked ? 1.0 : 0.5);
        contentContainer.add(img);
      }

      const displayName = item.isUnlocked ? item.name : "???";
      const nameTxt = this.scene.add
        .text(x, y + 18, displayName, {
          fontSize: "11px",
          color: item.isUnlocked ? "#ffffff" : "#667788",
          fontStyle: "bold",
          align: "center",
        })
        .setOrigin(0.5)
        .setData("dynamic", true);

      contentContainer.add(nameTxt);
    });

    const bottomY = sh / 2 + sh * 0.29;

    const leftContainer = this.createPaginationButton(
      sw / 2 - 80,
      bottomY,
      "<",
      () => {
        this.collectionPage--;
        this.renderContent(shopManager);
      },
    );
    leftContainer.setData("dynamic", true);

    const pageIndicator = this.scene.add
      .text(
        sw / 2,
        bottomY,
        `Pagina ${this.collectionPage + 1} / ${totalPages}`,
        {
          fontSize: "14px",
          color: "#ffd700",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setData("dynamic", true);

    const rightContainer = this.createPaginationButton(
      sw / 2 + 80,
      bottomY,
      ">",
      () => {
        this.collectionPage++;
        this.renderContent(shopManager);
      },
    );
    rightContainer.setData("dynamic", true);

    this.collectionContainer.add([
      leftContainer,
      pageIndicator,
      rightContainer,
    ]);
  }

  private createPaginationButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const width = 44;
    const height = 32;

    const bg = this.scene.add
      .rectangle(0, 0, width, height, 0x1155aa)
      .setStrokeStyle(2, 0xffffff);

    const txt = this.scene.add
      .text(0, 0, label, {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const container = this.scene.add
      .container(x, y, [bg, txt])
      .setScrollFactor(0)
      .setDepth(450);

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

    return container;
  }
}
