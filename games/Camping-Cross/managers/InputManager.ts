import Phaser from "phaser";

export class InputManager {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;
  private minSwipeDistance: number = 30;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public setupControls(
    onMove: (dx: number, dy: number) => void,
    isGameOver: () => boolean,
  ): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (isGameOver()) return;
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
    });

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (isGameOver()) return;

      const swipeX = pointer.x - this.pointerStartX;
      const swipeY = pointer.y - this.pointerStartY;
      const absX = Math.abs(swipeX);
      const absY = Math.abs(swipeY);

      if (absX > this.minSwipeDistance || absY > this.minSwipeDistance) {
        if (absX > absY) {
          onMove(swipeX > 0 ? 50 : -50, 0);
        } else {
          onMove(0, swipeY > 0 ? 50 : -50);
        }
      } else {
        onMove(0, -50); // Kort tikken = stap vooruit
      }
    });
  }

  public updateKeyboard(onMove: (dx: number, dy: number) => void): void {
    if (!this.cursors) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) onMove(0, -50);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) onMove(0, 50);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) onMove(-50, 0);
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) onMove(50, 0);
  }
}
