import Phaser from "phaser";

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  up: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  public inputState: InputState = {
    left: false,
    right: false,
    down: false,
    up: false,
  };

  private leftBtnContainer!: Phaser.GameObjects.Container;
  private rightBtnContainer!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createUIControls(): void {
    const screenWidth = this.scene.scale.width;
    const btnY = this.scene.scale.height - 70;

    this.leftBtnContainer = this.createTouchButton(
      60,
      btnY,
      "◄",
      () => (this.inputState.left = true),
      () => (this.inputState.left = false),
    );

    this.rightBtnContainer = this.createTouchButton(
      150,
      btnY,
      "►",
      () => (this.inputState.right = true),
      () => (this.inputState.right = false),
    );

    this.createTouchButton(
      screenWidth - 150,
      btnY,
      "▲",
      () => (this.inputState.up = true),
      () => (this.inputState.up = false),
    );

    this.createTouchButton(
      screenWidth - 60,
      btnY,
      "▼",
      () => (this.inputState.down = true),
      () => (this.inputState.down = false),
    );
  }

  // Toont of verbergt de links/rechts navigatieknoppen
  public setLeftRightVisible(visible: boolean): void {
    if (this.leftBtnContainer) this.leftBtnContainer.setVisible(visible);
    if (this.rightBtnContainer) this.rightBtnContainer.setVisible(visible);

    if (!visible) {
      this.inputState.left = false;
      this.inputState.right = false;
    }
  }

  private createTouchButton(
    x: number,
    y: number,
    label: string,
    onPress: () => void,
    onRelease: () => void,
  ): Phaser.GameObjects.Container {
    const size = 65;

    const btnBg = this.scene.add
      .graphics()
      .fillStyle(0xffffff, 0.3)
      .fillRoundedRect(-size / 2, -size / 2, size, size, 16)
      .lineStyle(2, 0xffffff, 0.7)
      .strokeRoundedRect(-size / 2, -size / 2, size, size, 16)
      .setScrollFactor(0)
      .setDepth(200);

    const btnText = this.scene.add
      .text(0, 0, label, {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const container = this.scene.add
      .container(x, y, [btnBg, btnText])
      .setScrollFactor(0)
      .setDepth(200);

    const hitArea = new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on("pointerdown", () => {
      btnBg.alpha = 0.6;
      onPress();
    });

    container.on("pointerup", () => {
      btnBg.alpha = 1;
      onRelease();
    });

    container.on("pointerout", () => {
      btnBg.alpha = 1;
      onRelease();
    });

    return container;
  }
}
