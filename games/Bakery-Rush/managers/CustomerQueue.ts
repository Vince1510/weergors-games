import Phaser from "phaser";
import { Customer } from "../entities/Customer";

const MAX_CUSTOMERS = 3;
const CUSTOMER_SPAWN_X = 180;
const CUSTOMER_SPACING = 220;

export class CustomerQueue {
  private readonly customers: Customer[] = [];
  private readonly scene: Phaser.Scene;
  private readonly onCustomerSelected: (customer: Customer) => void;
  private readonly onCustomerLeft: () => void;

  constructor(
    scene: Phaser.Scene,
    onCustomerSelected: (customer: Customer) => void,
    onCustomerLeft: () => void,
  ) {
    this.scene = scene;
    this.onCustomerSelected = onCustomerSelected;
    this.onCustomerLeft = onCustomerLeft;
  }

  public get length(): number {
    return this.customers.length;
  }

  public clear(): void {
    for (const customer of this.customers) customer.destroy();
    this.customers.length = 0;
  }

  public spawn(): void {
    if (this.customers.length >= MAX_CUSTOMERS) return;

    const customer = new Customer(
      this.scene,
      CUSTOMER_SPAWN_X + this.customers.length * CUSTOMER_SPACING,
      Phaser.Math.Between(1, 3),
      this.customers.length,
    );
    customer.on("pointerdown", () => this.onCustomerSelected(customer));
    this.customers.push(customer);
  }

  public update(deltaSeconds: number): void {
    let customerLeft = false;
    for (let index = this.customers.length - 1; index >= 0; index--) {
      const customer = this.customers[index];
      if (!customer.updatePatience(deltaSeconds)) continue;
      customer.destroy();
      this.customers.splice(index, 1);
      this.onCustomerLeft();
      customerLeft = true;
      if (this.customers.length === 0) break;
    }
    if (customerLeft) this.reposition();
  }

  public findAt(x: number, y: number): Customer | undefined {
    return this.customers.find((customer) =>
      Phaser.Geom.Rectangle.Contains(
        new Phaser.Geom.Rectangle(
          customer.x - 72,
          customer.y - 108,
          144,
          216,
        ),
        x,
        y,
      ),
    );
  }

  public remove(customer: Customer): void {
    const index = this.customers.indexOf(customer);
    if (index === -1) return;
    this.customers.splice(index, 1);
    customer.destroy();
    this.reposition();
  }

  private reposition(): void {
    this.customers.forEach((customer, index) => {
      this.scene.tweens.killTweensOf(customer);
      this.scene.tweens.add({
        targets: customer,
        x: CUSTOMER_SPAWN_X + index * CUSTOMER_SPACING,
        duration: 220,
        ease: "Sine.Out",
      });
    });
  }
}
