import Phaser from "phaser";
import { BreadBag } from "./entities/BreadBag";
import { Customer } from "./entities/Customer";
import { Freezer } from "./entities/Freezer";
import { Oven } from "./entities/Oven";
import { createBakeryEnvironment, createBakeryHud } from "./managers/BakeryEnvironment";
import { CustomerQueue } from "./managers/CustomerQueue";
import { showGameOverOverlay } from "./managers/GameOverOverlay";
import { ScoreManager } from "./managers/ScoreManager";

const BAKE_SECONDS = 3.5;
const ANGRY_CUSTOMERS_TO_GAME_OVER = 5;
export class BakeryScene extends Phaser.Scene {
  private servedCount = 0;
  private highScore = 0;
  private angryCustomerCount = 0;
  private bagStock = 0;
  private servedText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private freezer!: Freezer;
  private doughSelected = false;
  private readonly ovens: Oven[] = [];
  private highlightedOven?: Oven;
  private customerQueue!: CustomerQueue;
  private bag!: BreadBag;
  private bagDragging = false;
  private bagSelected = false;
  private activeDrag: "dough" | "bag" | undefined;
  private activePointer?: Phaser.Input.Pointer;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragMoved = false;
  private gameOver = false;
  private customerSpawnEvent?: Phaser.Time.TimerEvent;
  private feedbackTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("BakeryScene");
  }

  public create(): void {
    this.servedCount = 0;
    this.highScore = ScoreManager.getHighScore();
    this.angryCustomerCount = 0;
    this.bagStock = 0;
    this.gameOver = false;
    this.bagDragging = false;
    this.bagSelected = false;
    this.doughSelected = false;
    this.highlightedOven = undefined;
    this.ovens.length = 0;
    this.customerQueue?.clear();

    createBakeryEnvironment(this);
    const hud = createBakeryHud(this);
    this.servedText = hud.servedText;
    this.highScoreText = hud.highScoreText;
    this.updateScore();
    this.createFreezer();
    this.createCounter();
    this.createOvens();
    this.customerQueue = new CustomerQueue(
      this,
      (customer) => {
        if (this.bagSelected) {
          this.bagSelected = false;
          this.bag.setHighlighted(false);
          this.serveCustomer(customer);
        }
      },
      () => {
        this.onCustomerLeave();
      },
    );
    this.registerDragHandlers();

    this.customerQueue.spawn();
    this.customerSpawnEvent = this.time.addEvent({
      delay: 4800,
      callback: () => this.customerQueue.spawn(),
      loop: true,
    });
    this.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      this.removeDragHandlers,
      this,
    );
  }

  public update(_time: number, delta: number): void {
    if (this.gameOver) return;
    const deltaSeconds = delta / 1000;
    for (const oven of this.ovens) {
      oven.update(deltaSeconds);
    }

    this.customerQueue.update(deltaSeconds);
  }

  private createFreezer(): void {
    this.freezer = new Freezer(this, 108, 365);
  }

  private createCounter(): void {
    this.add
      .text(386, 306, "INPAKSTATION", {
        fontSize: "9px",
        color: "#ffedd5",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.bag = new BreadBag(this);

    this.feedbackText = this.add
      .text(400, 343, "", {
        fontSize: "9px",
        color: "#713e2b",
        align: "center",
        wordWrap: { width: 270 },
      })
      .setOrigin(0.5);
  }

  private createOvens(): void {
    const ovenX = 653;
    const firstOvenY = 328;
    const spacing = 32;

    for (let index = 0; index < 4; index++) {
      const oven = new Oven(this, ovenX, firstOvenY + index * spacing, index + 1);
      oven.on("oven-clicked", () => {
        if (this.doughSelected && oven.startBaking(BAKE_SECONDS)) {
          this.doughSelected = false;
          this.clearOvenTargets();
          this.freezer.resetDoughToken();
          if (this.freezer.doughToken.input) {
            this.freezer.doughToken.input.cursor = "grab";
          }
          this.showMessage("Deeg in de oven! Klaar over 3,5 seconden.", "#fde68a");
        } else if (oven.collect()) {
          this.bagStock++;
          this.addBreadToBag();
          this.showMessage("Vers broodje automatisch in de zak!", "#a7f3d0");
        } else if (oven.clean()) {
          this.showMessage("Oven schoongemaakt. Probeer het opnieuw!", "#fde68a");
        }
      });
      this.ovens.push(oven);
    }
  }

  private registerDragHandlers(): void {
    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerup", this.onPointerUp, this);
  }

  private removeDragHandlers(): void {
    this.input.off("pointerdown", this.onPointerDown, this);
    this.input.off("pointermove", this.onPointerMove, this);
    this.input.off("pointerup", this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.gameOver || this.activeDrag) return;

    if (
      Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.freezer.doughToken.x,
        this.freezer.doughToken.y,
      ) <= 42
    ) {
      this.beginDoughDrag(pointer);
      return;
    }

    if (
      Math.abs(pointer.x - this.bag.x) <= 108 &&
      Math.abs(pointer.y - this.bag.y) <= 43
    ) {
      this.beginBagDrag(pointer);
    }
  }

  private beginDoughDrag(pointer: Phaser.Input.Pointer): void {
    this.startDrag(pointer, "dough", this.freezer.doughToken.x, this.freezer.doughToken.y);
    this.doughSelected = false;
    this.clearOvenTargets();
    if (this.freezer.doughToken.input) {
      this.freezer.doughToken.input.cursor = "grabbing";
    }
    this.freezer.doughToken.setScale(1.12).setAlpha(0.85);
  }

  private beginBagDrag(pointer: Phaser.Input.Pointer): void {
    this.startDrag(pointer, "bag", this.bag.x, this.bag.y);
    this.bagSelected = false;
    this.bagDragging = true;
    this.bag.setScale(1.06).setDepth(10);
    this.bag.setHighlighted(true);
  }

  private startDrag(
    pointer: Phaser.Input.Pointer,
    item: "dough" | "bag",
    itemX: number,
    itemY: number,
  ): void {
    if (this.activeDrag) return;
    this.activeDrag = item;
    this.activePointer = pointer;
    this.dragOffsetX = itemX - pointer.x;
    this.dragOffsetY = itemY - pointer.y;
    this.dragMoved = false;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.gameOver || pointer !== this.activePointer || !this.activeDrag) return;
    if (!this.dragMoved && Phaser.Math.Distance.Between(
      pointer.downX,
      pointer.downY,
      pointer.x,
      pointer.y,
    ) > 6) {
      this.dragMoved = true;
    }

    if (this.activeDrag === "dough") {
      this.freezer.doughToken.setPosition(
        pointer.x + this.dragOffsetX,
        pointer.y + this.dragOffsetY,
      );
      const targetOven = this.findOvenAt(pointer.x, pointer.y);
      if (targetOven !== this.highlightedOven) {
        this.highlightedOven?.setDropTarget(false);
        this.highlightedOven = targetOven;
        this.highlightedOven?.setDropTarget(true);
      }
      return;
    }

    const x = Phaser.Math.Clamp(pointer.x + this.dragOffsetX, 110, 690);
    const y = Phaser.Math.Clamp(pointer.y + this.dragOffsetY, 64, 396);
    this.bag.setPosition(x, y);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.gameOver || pointer !== this.activePointer || !this.activeDrag) return;
    const item = this.activeDrag;
    const moved = this.dragMoved;
    this.activeDrag = undefined;
    this.activePointer = undefined;
    this.dragMoved = false;

    if (item === "dough") {
      if (moved) {
        const targetOven = this.findOvenAt(pointer.x, pointer.y);
        if (targetOven?.startBaking(BAKE_SECONDS)) {
          this.showMessage("Deeg in de oven! Klaar over 3,5 seconden.", "#fde68a");
        } else {
          this.showMessage("Laat het deeg los op een lege oven.", "#cbd5e1");
        }
        this.doughSelected = false;
        this.clearOvenTargets();
      } else {
        this.selectDough();
      }
      this.freezer.resetDoughToken();
      if (this.freezer.doughToken.input) {
        this.freezer.doughToken.input.cursor = "grab";
      }
      return;
    }

    this.bagDragging = false;
    if (moved) {
      const customer = this.customerQueue.findAt(pointer.x, pointer.y);
      if (customer) {
        this.serveCustomer(customer);
      }
      this.returnBagHome();
    } else {
      this.returnBagHome();
      this.selectBag();
    }
  }

  private clearOvenTargets(): void {
    this.highlightedOven?.setDropTarget(false);
    this.highlightedOven = undefined;
    for (const oven of this.ovens) oven.setDropTarget(false);
  }

  private findOvenAt(x: number, y: number): Oven | undefined {
    return this.ovens
      .filter(
        (oven) =>
          oven.status === "empty" &&
          Math.abs(x - oven.x) <= Oven.WIDTH / 2 + 48 &&
          Math.abs(y - oven.y) <= 30,
      )
      .sort(
        (first, second) =>
          Phaser.Math.Distance.Squared(x, y, first.x, first.y) -
          Phaser.Math.Distance.Squared(x, y, second.x, second.y),
      )[0];
  }

  private serveCustomer(customer: Customer): void {
    if (this.bagStock < customer.orderCount) {
      this.showMessage(
        `Deze klant wil ${customer.orderCount} broodje(s); vul de zak eerst.`,
        "#fde68a",
      );
      return;
    }

    this.bag.setScale(1);
    const deliveredPieces = this.bag.removeBread(customer.orderCount);
    this.bagStock -= customer.orderCount;
    customer.orderText.setText("✓ KLAAR!");
    for (const piece of deliveredPieces) {
      this.tweens.add({
        targets: piece,
        x: customer.x,
        y: customer.y + 24,
        scale: 0.2,
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0.3,
        duration: 320,
        ease: "Cubic.In",
        onComplete: () => piece.destroy(),
      });
    }
    this.completeCustomerOrder(customer);
  }

  private completeCustomerOrder(customer: Customer): void {
    this.servedCount++;
    if (this.servedCount > this.highScore) {
      this.highScore = this.servedCount;
      ScoreManager.saveHighScore(this.highScore);
    }
    this.updateScore();
    this.customerQueue.remove(customer);
    this.showMessage(
      `Bestelling geserveerd · +€${customer.orderCount * 18}`,
      "#a7f3d0",
    );
  }

  private addBreadToBag(): void {
    this.bag.addBread();
  }

  private returnBagHome(): void {
    this.bag
      .setPosition(BreadBag.HOME_X, BreadBag.HOME_Y)
      .setScale(1)
      .setDepth(10);
    this.bag.setHighlighted(false);
  }

  private updateScore(): void {
    this.servedText.setText(`GEHOLPEN: ${this.servedCount}`);
    this.highScoreText.setText(`TOPSCORE: ${this.highScore}`);
  }

  private onCustomerLeave(): void {
    if (this.gameOver) return;
    this.angryCustomerCount++;
    this.showMessage(
      `Klant boos vertrokken · ${this.angryCustomerCount}/${ANGRY_CUSTOMERS_TO_GAME_OVER}`,
      "#fca5a5",
    );
    if (this.angryCustomerCount >= ANGRY_CUSTOMERS_TO_GAME_OVER) {
      this.endGame();
    }
  }

  private endGame(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.customerSpawnEvent?.remove(false);
    this.customerQueue.clear();
    this.removeDragHandlers();
    showGameOverOverlay(this, this.servedCount, this.highScore, () => {
      this.scene.restart();
    });
  }

  private showMessage(message: string, color: string): void {
    this.feedbackText.setText(message).setColor(color);
    this.feedbackTimer?.remove(false);
    this.feedbackTimer = this.time.delayedCall(2200, () => {
      this.feedbackText.setText("");
    });
  }

  private selectBag(): void {
    if (this.bagDragging || this.bagStock === 0) return;
    this.bagSelected = true;
    this.bag.setHighlighted(true);
  }

  private selectDough(): void {
    this.doughSelected = true;
    for (const oven of this.ovens) {
      oven.setDropTarget(oven.status === "empty");
    }
  }
}
