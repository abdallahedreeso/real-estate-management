import React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSession } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider, useSupabaseClient } from "./SupabaseContext";

// Mock Clerk React hooks
vi.mock("@clerk/clerk-react", () => ({
  useSession: vi.fn(),
}));

// Mock Supabase JS client creator
vi.mock("@supabase/supabase-js", () => {
  const mockRealtime = { setAuth: vi.fn() };
  const mockClient = {
    realtime: mockRealtime,
    rest: { headers: {} },
  };
  return {
    createClient: vi.fn(() => mockClient),
  };
});

// A dummy component to consume the context for assertions
const ConsumerComponent = ({ onConsume }) => {
  const client = useSupabaseClient();
  onConsume(client);
  return <div>Supabase Client Active</div>;
};

describe("SupabaseContext / SupabaseProvider", () => {
  const mockGetToken = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReset();
  });

  it("initializes a single, stable Supabase client and provides it", () => {
    useSession.mockReturnValue({ session: undefined });

    let consumedClient = null;
    render(
      <SupabaseProvider>
        <ConsumerComponent onConsume={(client) => { consumedClient = client; }} />
      </SupabaseProvider>
    );

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(consumedClient).not.toBeNull();
  });

  it("dynamically injects Clerk JWT authorization header when a session is active", async () => {
    const mockSession = {
      getToken: mockGetToken.mockResolvedValue("mocked-clerk-jwt-token"),
    };
    useSession.mockReturnValue({ session: mockSession });

    let consumedClient = null;
    
    await act(async () => {
      render(
        <SupabaseProvider>
          <ConsumerComponent onConsume={(client) => { consumedClient = client; }} />
        </SupabaseProvider>
      );
    });

    expect(mockGetToken).toHaveBeenCalledWith({ template: "supabase" });
    expect(consumedClient.rest.headers["Authorization"]).toBe("Bearer mocked-clerk-jwt-token");
    expect(consumedClient.realtime.setAuth).toHaveBeenCalledWith("mocked-clerk-jwt-token");
  });

  it("removes Authorization header when user logs out (session becomes null)", async () => {
    // 1. Start with an active session
    const mockSession = {
      getToken: mockGetToken.mockResolvedValue("mocked-clerk-jwt-token"),
    };
    
    // We allow setting values dynamically to simulate logout transition
    let sessionState = { session: mockSession };
    useSession.mockImplementation(() => sessionState);

    let consumedClient = null;
    const { rerender } = render(
      <SupabaseProvider>
        <ConsumerComponent onConsume={(client) => { consumedClient = client; }} />
      </SupabaseProvider>
    );

    // Verify token was set
    expect(consumedClient.rest.headers["Authorization"]).toBe("Bearer mocked-clerk-jwt-token");

    // 2. Simulate Logout (session = null)
    sessionState = { session: null };
    
    await act(async () => {
      rerender(
        <SupabaseProvider>
          <ConsumerComponent onConsume={(client) => { consumedClient = client; }} />
        </SupabaseProvider>
      );
    });

    // Check that Authorization header was deleted
    expect(consumedClient.rest.headers["Authorization"]).toBeUndefined();
  });
});
