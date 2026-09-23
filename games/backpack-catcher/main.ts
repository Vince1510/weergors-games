import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 450,
    height: 800,
    orientation: Phaser.Scale.Orientation.PORTRAIT,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false, // <-- Zet op TRUE om paars/groene omdelingslijnen te zien!
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);
