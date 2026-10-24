import Phaser from "phaser";

export class AssetManager {
  public static readonly PLAYER_KEY = "job-player";
  public static readonly CLOUD_KEY = "sky-cloud";

  public static createTextures(scene: Phaser.Scene): void {
    const cloud = scene.add.graphics();
    cloud.fillStyle(0xffffff, 1);
    cloud.fillRoundedRect(4, 18, 84, 28, 14);
    cloud.fillCircle(28, 20, 19);
    cloud.fillCircle(52, 15, 23);
    cloud.fillCircle(73, 21, 17);
    cloud.generateTexture(AssetManager.CLOUD_KEY, 92, 50);
    cloud.destroy();
  }
}
