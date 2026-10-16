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
  cafe.lineStyle(5, 0xf8ffff, 0.9);
  cafe.strokeRoundedRect(32, 79, 736, 124, 12);
  cafe.lineStyle(3, 0xf8ffff, 0.7);
  cafe.lineBetween(400, 81, 400, 201);
  cafe.lineBetween(34, 143, 766, 143);
  cafe.setDepth(-6);

  const landscape = scene.add.graphics();
  landscape.fillStyle(0x7fc795, 1);
  landscape.fillEllipse(120, 178, 172, 95);
  landscape.fillEllipse(302, 180, 124, 84);
  landscape.fillEllipse(506, 179, 166, 96);
  landscape.fillEllipse(692, 179, 146, 103);
  landscape.fillStyle(0x4f9e79, 1);
  landscape.fillEllipse(98, 187, 90, 48);
  landscape.fillEllipse(560, 189, 104, 50);
  landscape.fillEllipse(729, 187, 94, 50);
  landscape.setDepth(-5);

  const decor = scene.add.graphics();
  for (const x of [87, 272, 526, 711]) {
    decor.fillStyle(0x477c68, 1);
    decor.fillRoundedRect(x - 4, 98, 8, 99, 3);
    decor.fillStyle(0x438e65, 1);
    decor.fillCircle(x - 15, 99, 15);
    decor.fillCircle(x + 5, 90, 19);
    decor.fillCircle(x + 18, 107, 13);
    decor.fillStyle(0x73b477, 1);
    decor.fillCircle(x - 14, 94, 6);
    decor.fillCircle(x + 6, 84, 7);
  }
  decor.setDepth(-4);

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
