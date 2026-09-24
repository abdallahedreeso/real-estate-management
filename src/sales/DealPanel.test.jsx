import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DealPanel from "./DealPanel";

const mock = vi.hoisted(() => ({ client: null, deal: null, rpc: vi.fn() }));
vi.mock("@clerk/clerk-react", () => ({ useAuth: () => ({ userId: "seller-1" }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));
// eslint-disable-next-line react/prop-types
vi.mock("react-router-dom", () => ({ Link: ({ children, to }) => <a href={to}>{children}</a> }));
vi.mock("@/backend/supabase/supabase", () => ({ default: () => mock.client }));

describe("sale offer panel", () => {
  beforeEach(() => {
    mock.deal = {
      id: "deal-1", buyer_id: "buyer-1", seller_id: "seller-1", status: "proposed",
      offer_version: 2, buyer_accepted_version: 2, seller_accepted_version: null,
      price_egp: 3000000, seller_fee_bps: 100, conditions: "Subject to title verification",
      expires_at: "2099-01-01T00:00:00Z",
    };
    mock.rpc = vi.fn(async (name, params) => {
      if (name === "accept_sale_deal") {
        expect(params).toEqual({ p_deal: "deal-1", p_version: 2 });
        mock.deal = { ...mock.deal, seller_accepted_version: 2, status: "accepted" };
      }
      return { error: null };
    });
    mock.client = {
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: mock.deal, error: null }) }) }) }),
      rpc: (...args) => mock.rpc(...args),
    };
  });

  it("shows the fee and accepts exactly the current offer version", async () => {
    render(<DealPanel conversation={{ id: "conversation-1" }} />);
    expect(await screen.findByText("Proposed seller success fee")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept this version" }));
    await waitFor(() => expect(mock.rpc).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("Accepted")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Accept this version" })).toBeNull();
  });
});
