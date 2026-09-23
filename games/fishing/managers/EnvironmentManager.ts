import Phaser from "phaser";

export class EnvironmentManager {
  private scene: Phaser.Scene;
  private worldWidth: number;
  private worldHeight: number;

  public waveGraphics!: Phaser.GameObjects.Graphics;
  public waveTimer: number = 0;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  public initEnvironment(): void {
    this.createGradientOcean();
    this.createBays();
    this.waveGraphics = this.scene.add.graphics().setDepth(5);
  }

  public update(deltaSec: number): void {
    this.waveTimer += deltaSec * 3;
    this.drawWaves();
  }

  private drawWaves(): void {
    this.waveGraphics.clear();
    this.waveGraphics.lineStyle(4, 0xffffff, 0.8);
    this.waveGraphics.beginPath();

    const startY = 100;
    this.waveGraphics.moveTo(0, startY);

    for (let x = 0; x <= this.worldWidth; x += 20) {
      const y = startY + Math.sin(x * 0.02 + this.waveTimer) * 5;
      this.waveGraphics.lineTo(x, y);
    }
    this.waveGraphics.strokePath();
  }

  private createGradientOcean(): void {
    // 1. Lucht boven het water
    this.scene.add
      .rectangle(0, 0, this.worldWidth, 100, 0x87ceeb)
      .setOrigin(0)
      .setDepth(0);

    // 2. Genereer een compacte gradient-textuur (veilig binnen browser canvas limieten)
    const key = "ocean_gradient_texture";

    if (!this.scene.textures.exists(key)) {
      const canvas = this.scene.textures.createCanvas(key, 32, 512);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);

        // Vloeiende overgang van lichtblauw naar abyssaal zwart
        gradient.addColorStop(0.0, "#2288dd"); // Oppervlakte
        gradient.addColorStop(0.15, "#1565c0"); // Middeldiep
        gradient.addColorStop(0.4, "#0d47a1"); // Diepzee
        gradient.addColorStop(0.7, "#0a2540"); // Schemerzone
        gradient.addColorStop(1.0, "#081426"); // Abyssale bodem

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 512);
        canvas.refresh();
      }
    }

    // 3. Rek de textuur netjes uit over de volledige diepte van de wereld
    const oceanImg = this.scene.add
      .image(0, 100, key)
      .setOrigin(0, 0)
      .setDepth(0);
    oceanImg.setDisplaySize(this.worldWidth, this.worldHeight - 100);
  }

  private createBays(): void {
    // Linker Baai
    const leftBay = this.scene.add.graphics().setDepth(2);
    leftBay.fillStyle(0xd4a373, 1);
    leftBay.beginPath();
    leftBay.moveTo(0, 0);
    leftBay.lineTo(180, 0);
    leftBay.lineTo(130, 100);
    leftBay.lineTo(70, 450);
    leftBay.lineTo(0, 700);
    leftBay.closePath();
    leftBay.fillPath();

    // Rechter Baai
    const rightBay = this.scene.add.graphics().setDepth(2);
    rightBay.fillStyle(0xd4a373, 1);
    rightBay.beginPath();
    rightBay.moveTo(this.worldWidth, 0);
    rightBay.lineTo(this.worldWidth - 180, 0);
    rightBay.lineTo(this.worldWidth - 130, 100);
    rightBay.lineTo(this.worldWidth - 70, 450);
    rightBay.lineTo(this.worldWidth, 700);
    rightBay.closePath();
    rightBay.fillPath();
  }
}
