import PropTypes from "prop-types";
import { render } from "@testing-library/react";
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
  const mockClient = {};
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
ConsumerComponent.propTypes = { onConsume: PropTypes.func.isRequired };

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

  it("provides the current Clerk JWT when Supabase makes a request", async () => {
    const mockSession = {
      getToken: mockGetToken.mockResolvedValue("mocked-clerk-jwt-token"),
    };
    useSession.mockReturnValue({ session: mockSession });

    render(
        <SupabaseProvider>
          <ConsumerComponent onConsume={() => {}} />
        </SupabaseProvider>
    );

    const accessToken = createClient.mock.calls[0][2].accessToken;
    expect(await accessToken()).toBe("mocked-clerk-jwt-token");
    expect(mockGetToken).toHaveBeenCalledWith({ template: "supabase" });
  });

  it("returns no token after the user signs out", async () => {
    // 1. Start with an active session
    const mockSession = {
      getToken: mockGetToken.mockResolvedValue("mocked-clerk-jwt-token"),
    };
    
    // We allow setting values dynamically to simulate logout transition
    let sessionState = { session: mockSession };
    useSession.mockImplementation(() => sessionState);

    const { rerender } = render(
      <SupabaseProvider>
        <ConsumerComponent onConsume={() => {}} />
      </SupabaseProvider>
    );

    const accessToken = createClient.mock.calls[0][2].accessToken;
    expect(await accessToken()).toBe("mocked-clerk-jwt-token");

    // 2. Simulate Logout (session = null)
    sessionState = { session: null };
    
    rerender(
        <SupabaseProvider>
          <ConsumerComponent onConsume={() => {}} />
        </SupabaseProvider>
    );

    expect(await accessToken()).toBeNull();
  });
});
