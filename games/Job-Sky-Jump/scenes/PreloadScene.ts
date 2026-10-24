import Phaser from "phaser";
import { AssetManager } from "../managers/AssetManager";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  public preload(): void {
    this.load.image(
      AssetManager.PLAYER_KEY,
      "/games/Camping-Cross/assets/Job.png",
    );
  }

  public create(): void {
    AssetManager.createTextures(this);
    this.scene.start("GameScene");
  }
}
