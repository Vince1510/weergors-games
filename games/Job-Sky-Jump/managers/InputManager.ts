import Phaser from "phaser";

export class InputManager {
  private readonly scene: Phaser.Scene;
  private readonly leftKey?: Phaser.Input.Keyboard.Key;
  private readonly rightKey?: Phaser.Input.Keyboard.Key;
  private readonly aKey?: Phaser.Input.Keyboard.Key;
  private readonly dKey?: Phaser.Input.Keyboard.Key;
  private isDragging = false;
  private pointerX = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;

    if (keyboard) {
      this.leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.aKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.dKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
    scene.input.on("pointerupoutside", this.onPointerUp, this);
  }

  public getHorizontalInput(playerX: number): number {
    const keyboardDirection =
      Number(Boolean(this.rightKey?.isDown || this.dKey?.isDown)) -
      Number(Boolean(this.leftKey?.isDown || this.aKey?.isDown));

    if (keyboardDirection !== 0) return keyboardDirection;
    if (!this.isDragging) return 0;

    const distance = this.pointerX - playerX;
    return Math.abs(distance) < 12 ? 0 : Math.sign(distance);
  }

  public destroy(): void {
    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.off("pointerupoutside", this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true;
    this.pointerX = pointer.x;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isDragging && pointer.isDown) {
      this.pointerX = pointer.x;
    }
  }

  private onPointerUp(): void {
    this.isDragging = false;
  }
}
