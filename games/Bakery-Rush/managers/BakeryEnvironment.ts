import Phaser from "phaser";

export interface BakeryHud {
  readonly servedText: Phaser.GameObjects.Text;
  readonly highScoreText: Phaser.GameObjects.Text;
}

export function createBakeryEnvironment(scene: Phaser.Scene): void {
  scene.add.rectangle(0, 0, 800, 450, 0x9ed9e8).setOrigin(0).setDepth(-10);
  scene.add.rectangle(0, 0, 800, 54, 0x234a64).setOrigin(0).setDepth(-9);
  scene.add.rectangle(0, 54, 800, 218, 0xc7eadc).setOrigin(0).setDepth(-8);
  scene.add.rectangle(0, 254, 800, 20, 0x78b9a5).setOrigin(0).setDepth(-7);

  const cafe = scene.add.graphics();
  cafe.fillStyle(0xfff3d1, 1);
  cafe.fillRoundedRect(20, 69, 760, 154, 18);
  cafe.fillStyle(0x9dd7dd, 1);
  cafe.fillRoundedRect(32, 79, 736, 124, 12);
  cafe.setDepth(-7);

  const nature = scene.add.graphics();
  nature.fillStyle(0xffe69a, 1);
  nature.fillCircle(690, 109, 17);
  nature.fillStyle(0xffffff, 0.75);
  nature.fillEllipse(565, 112, 52, 15);
  nature.fillEllipse(583, 107, 26, 18);
  nature.fillEllipse(601, 112, 35, 13);
  nature.fillStyle(0x8dc9a2, 1);
  nature.fillEllipse(177, 184, 288, 36);
  nature.fillEllipse(408, 184, 330, 42);
  nature.fillEllipse(637, 184, 258, 36);
  nature.fillStyle(0x4a916b, 1);
  nature.fillRect(32, 178, 736, 25);

  for (const [x, baseY, scale] of [
    [92, 179, 0.8],
    [206, 181, 0.64],
    [496, 179, 0.72],
    [719, 181, 0.9],
  ]) {
    nature.fillStyle(0x75543b, 1);
    nature.fillRoundedRect(x - 4 * scale, baseY - 35 * scale, 8 * scale, 40 * scale, 3);
    nature.fillStyle(0x347a55, 1);
    nature.fillCircle(x, baseY - 48 * scale, 19 * scale);
    nature.fillCircle(x - 13 * scale, baseY - 38 * scale, 14 * scale);
    nature.fillCircle(x + 13 * scale, baseY - 38 * scale, 14 * scale);
    nature.fillStyle(0x5a9f68, 1);
    nature.fillCircle(x - 5 * scale, baseY - 51 * scale, 8 * scale);
  }

  nature.lineStyle(2, 0x9bd277, 0.9);
  for (let x = 42; x < 768; x += 17) {
    const y = 196 - ((x * 7) % 8);
    nature.lineBetween(x, y, x - 3, y - 7);
    nature.lineBetween(x + 2, y, x + 5, y - 5);
  }
  nature.fillStyle(0xffe28a, 1);
  for (const [x, y] of [[129, 188], [347, 195], [581, 187], [747, 194]]) {
    nature.fillCircle(x, y, 2);
    nature.fillCircle(x - 3, y, 1.5);
    nature.fillCircle(x + 3, y, 1.5);
    nature.fillCircle(x, y - 3, 1.5);
  }
  nature.setDepth(-5);

  const windowFrame = scene.add.graphics();
  windowFrame.lineStyle(5, 0xf8ffff, 0.9);
  windowFrame.strokeRoundedRect(32, 79, 736, 124, 12);
  windowFrame.lineStyle(3, 0xf8ffff, 0.7);
  windowFrame.lineBetween(400, 81, 400, 201);
  windowFrame.lineBetween(34, 143, 766, 143);
  windowFrame.setDepth(-3);

  scene.add.rectangle(0, 274, 800, 176, 0x9e593d).setOrigin(0).setDepth(-3);
  for (let y = 292; y < 450; y += 36) {
    scene.add
      .rectangle(0, y, 800, 2, 0x84432f, 0.38)
      .setOrigin(0)
      .setDepth(-2);
  }

  const counter = scene.add.graphics();
  counter.fillStyle(0x39251f, 0.35);
  counter.fillRoundedRect(14, 273, 772, 178, 18);
  counter.fillStyle(0xc47842, 1);
  counter.fillRoundedRect(12, 269, 776, 169, 18);
  counter.fillStyle(0xe7a75c, 1);
  counter.fillRoundedRect(12, 269, 776, 27, 14);
  counter.fillStyle(0xf7ca7e, 1);
  counter.fillRoundedRect(24, 274, 752, 9, 5);
  counter.lineStyle(3, 0x8d4d30, 0.8);
  counter.strokeRoundedRect(12, 269, 776, 169, 18);
  counter.setDepth(-1);

  scene.add
    .text(400, 18, "KAISER CRAZE: OVEN & CO.", {
      fontSize: "19px",
      color: "#ffe08a",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  scene.add
    .text(400, 39, "DE WARMSTE BROODJES VAN DE STAD", {
      fontSize: "8px",
      color: "#d9f2ef",
    })
    .setOrigin(0.5);
  scene.add
    .text(652, 305, "OVENS", {
      fontSize: "10px",
      color: "#fff1d0",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  const seats = scene.add.graphics();
  for (const x of [126, 394, 660]) {
    seats.fillStyle(0x185a64, 1);
    seats.fillRoundedRect(x - 24, 211, 48, 28, 11);
    seats.fillStyle(0x26828a, 1);
    seats.fillRoundedRect(x - 20, 214, 40, 17, 8);
    seats.lineStyle(3, 0x49635e, 1);
    seats.lineBetween(x - 17, 237, x - 22, 258);
    seats.lineBetween(x + 17, 237, x + 22, 258);
  }
  seats.setDepth(-3);
}

export function createBakeryHud(scene: Phaser.Scene): BakeryHud {
  return {
    servedText: scene.add.text(24, 19, "", {
      fontSize: "12px",
      color: "#baf4bc",
      fontStyle: "bold",
    }),
    highScoreText: scene.add.text(620, 19, "", {
      fontSize: "11px",
      color: "#fff1d0",
    }),
  };
}
