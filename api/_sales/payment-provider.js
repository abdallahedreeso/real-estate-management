// Server-only contract. A production implementation requires a signed agreement,
// independently verified webhooks, reconciliation, and legal approval.
export class PaymentUnavailableError extends Error {
  constructor() {
    super("Protected sale payments are not enabled.");
    this.name = "PaymentUnavailableError";
  }
}

export class DisabledSalePaymentProvider {
  async createInstructions() { throw new PaymentUnavailableError(); }
  async confirmFunding() { throw new PaymentUnavailableError(); }
  async getHeldBalance() { throw new PaymentUnavailableError(); }
  async release() { throw new PaymentUnavailableError(); }
  async refund() { throw new PaymentUnavailableError(); }
  async reconcile() { throw new PaymentUnavailableError(); }
  async verifyWebhook() { throw new PaymentUnavailableError(); }
}

export const salePaymentProvider = new DisabledSalePaymentProvider();
