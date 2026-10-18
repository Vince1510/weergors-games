import Phaser from "phaser";

export function showGameOverOverlay(
  scene: Phaser.Scene,
  servedCount: number,
  highScore: number,
  onRestart: () => void,
): void {
  const backdrop = scene.add
    .rectangle(400, 225, 800, 450, 0x14202a, 0.78)
    .setDepth(1000)
    .setInteractive();
  backdrop.on(
    "pointerdown",
    (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => event.stopPropagation(),
  );

  const panel = scene.add
    .rectangle(400, 225, 390, 260, 0xfff2d5)
    .setStrokeStyle(6, 0xa94e34)
    .setDepth(1001);
  panel.setInteractive();
  panel.on(
    "pointerdown",
    (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => event.stopPropagation(),
  );

  scene.add
    .text(400, 145, "DE BAKKERIJ IS FAILLIET", {
      fontSize: "25px",
      color: "#913d2e",
      fontStyle: "bold",
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(1002);
  scene.add
    .text(400, 191, "Vijf klanten zijn boos vertrokken.", {
      fontSize: "16px",
      color: "#674735",
    })
    .setOrigin(0.5)
    .setDepth(1002);
  scene.add
    .text(400, 229, `Klanten geholpen: ${servedCount}     Topscore: ${highScore}`, {
      fontSize: "16px",
      color: "#674735",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(1002);

  const button = scene.add
    .rectangle(400, 296, 210, 54, 0x398567)
    .setStrokeStyle(3, 0x23664c)
    .setDepth(1002)
    .setInteractive({ useHandCursor: true });
  scene.add
    .text(400, 296, "OPNIEUW SPELEN", {
      fontSize: "17px",
      color: "#ffffff",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(1003);
  button.on(
    "pointerdown",
    (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      onRestart();
    },
  );
  button.on("pointerover", () => button.setFillStyle(0x48a178));
  button.on("pointerout", () => button.setFillStyle(0x398567));
}
