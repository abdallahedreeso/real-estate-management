import { describe, expect, it } from "vitest";
import { DisabledSalePaymentProvider, PaymentUnavailableError } from "./payment-provider";
import { SimulatedSalePaymentProvider } from "./simulated-payment-provider";

describe("unconfigured sale payment provider", () => {
  it("rejects every money operation", async () => {
    const provider = new DisabledSalePaymentProvider();
    for (const action of ["createInstructions", "confirmFunding", "getHeldBalance", "release", "refund", "reconcile", "verifyWebhook"]) {
      await expect(provider[action]()).rejects.toBeInstanceOf(PaymentUnavailableError);
    }
  });
});

describe("test-only sale payment simulation", () => {
  it("keeps synthetic funds held until one terminal action and rejects mismatched funding", async () => {
    const provider = new SimulatedSalePaymentProvider();
    const { reference } = await provider.createInstructions("deal-1", 3000000);
    await expect(provider.confirmFunding(reference, 2999999)).rejects.toThrow("Funding mismatch");
    await provider.confirmFunding(reference, 3000000);
    await provider.confirmFunding(reference, 3000000);
    expect(await provider.getHeldBalance(reference)).toBe(3000000);
    await provider.release(reference);
    expect(await provider.getHeldBalance(reference)).toBe(0);
    await expect(provider.refund(reference)).rejects.toThrow("Payment is not held");
  });
});
