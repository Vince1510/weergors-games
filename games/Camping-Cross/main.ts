import Phaser from "phaser";
import { JobTheCatScene } from "./scenes/GameScene";

console.log("[DEBUG 1] main.ts is succesvol geladen.");

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#7ec850",
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
  scene: [JobTheCatScene],
};

export const launchGame = (containerId: string): Phaser.Game => {
  console.log(
    `[DEBUG 2] launchGame aangeroepen voor container-ID: "${containerId}"`,
  );

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(
      `[FOUT] Kan het DOM element met id "${containerId}" NIET vinden! Controleer je HTML file.`,
    );
  } else {
    console.log(
      `[DEBUG 3] DOM element "#${containerId}" is gevonden. Phaser wordt opgestart...`,
    );
  }

  return new Phaser.Game({
    ...config,
    parent: containerId,
  });
};

// --- AUTOMATISCHE START VOOR STANDALONE HTML ---
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const targetId = document.getElementById("game-container")
      ? "game-container"
      : document.getElementById("phaser-container")
        ? "phaser-container"
        : null;

    if (targetId) {
      console.log(
        `[DEBUG 4] Standalone HTML gedetecteerd. Start automatisch op "#${targetId}"...`,
      );
      launchGame(targetId);
    } else {
      console.error(
        "[FOUT] Noch '#game-container' noch '#phaser-container' werd gevonden in het DOM.",
      );
    }
  });
}

export default config;
