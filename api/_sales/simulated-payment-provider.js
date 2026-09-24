import { PaymentUnavailableError } from "./payment-provider.js";

// Test-only synthetic balances. Never connect this provider to a deployed API route.
export class SimulatedSalePaymentProvider {
  constructor() {
    if (process.env.NODE_ENV !== "test") throw new PaymentUnavailableError();
    this.payments = new Map();
  }

  async createInstructions(dealId, amountEgp) {
    if (!dealId || !Number.isSafeInteger(amountEgp) || amountEgp <= 0) throw new Error("Invalid simulation amount");
    const reference = `sim:${dealId}`;
    if (!this.payments.has(reference)) this.payments.set(reference, { amountEgp, state: "created" });
    return { reference, amountEgp };
  }

  async confirmFunding(reference, amountEgp) {
    const item = this.payments.get(reference);
    if (!item || item.amountEgp !== amountEgp || !["created", "held"].includes(item.state)) throw new Error("Funding mismatch");
    item.state = "held";
    return { reference, state: item.state };
  }

  async getHeldBalance(reference) {
    const item = this.payments.get(reference);
    return item?.state === "held" ? item.amountEgp : 0;
  }

  async release(reference) { return this.settle(reference, "released"); }
  async refund(reference) { return this.settle(reference, "refunded"); }

  settle(reference, next) {
    const item = this.payments.get(reference);
    if (!item || !["held", next].includes(item.state)) throw new Error("Payment is not held");
    item.state = next;
    return { reference, state: next };
  }

  async reconcile(reference) {
    const item = this.payments.get(reference);
    return item ? { reference, ...item } : null;
  }
}
