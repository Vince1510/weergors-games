import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { PreloadScene } from "./scenes/PreloadScene";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 450,
  height: 800,
  parent: "game-container",
  backgroundColor: "#9ce3f5",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, GameScene, GameOverScene],
};

new Phaser.Game(gameConfig);
