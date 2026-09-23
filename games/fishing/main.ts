import Phaser from "phaser";
import { FishingScene } from "./scenes/FishScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 450,
    height: 800,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [FishingScene],
};

export const launchGame = (containerId: string): Phaser.Game => {
  return new Phaser.Game({
    ...config,
    parent: containerId,
  });
};

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const targetId = document.getElementById("game-container")
      ? "game-container"
      : null;
    if (targetId) {
      launchGame(targetId);
    }
  });
}

export default config;
