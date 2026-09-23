import { describe, expect, it } from "vitest";
import { egyptianWhatsAppNumber } from "./contact";

describe("Egyptian WhatsApp links", () => {
  it("converts local mobile numbers to international format", () => {
    expect(egyptianWhatsAppNumber("010 1234 5678")).toBe("201012345678");
  });
  it("accepts already international mobile numbers", () => {
    expect(egyptianWhatsAppNumber("+20 1012345678")).toBe("201012345678");
  });
  it("rejects invalid numbers", () => {
    expect(egyptianWhatsAppNumber("0123")).toBeNull();
  });
});
