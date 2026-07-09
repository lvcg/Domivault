import { act, render, screen, waitFor } from "@testing-library/react";
import { DomiVaultUserProvider, useDomiVaultUser } from "@/components/auth/domivault-user-provider";
import { createClient } from "@/lib/supabase/client";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockedCreateClient = jest.mocked(createClient);

function Consumer() {
  const { isPlusUser, planTier } = useDomiVaultUser();

  return (
    <div>
      <span data-testid="plan-tier">{planTier}</span>
      <span data-testid="plus-state">{isPlusUser ? "plus" : "free"}</span>
    </div>
  );
}

function mockSupabaseClient(planTier: "free" | "vault_plus" = "free") {
  mockedCreateClient.mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              email: "test@domivault.app",
              id: "user_123",
            },
          },
        },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              plan_tier: planTier,
            },
          }),
        })),
      })),
    })),
  } as never);
}

describe("DomiVaultUserProvider entitlement state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("reactively unlocks Plus state when a successful purchase event fires", async () => {
    mockSupabaseClient("free");

    render(
      <DomiVaultUserProvider>
        <Consumer />
      </DomiVaultUserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("plan-tier")).toHaveTextContent("free");
      expect(screen.getByTestId("plus-state")).toHaveTextContent("free");
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("domivault-plus-entitlement-updated", {
        detail: {
          isPremium: true,
        },
      }));
    });

    expect(screen.getByTestId("plan-tier")).toHaveTextContent("vault_plus");
    expect(screen.getByTestId("plus-state")).toHaveTextContent("plus");
  });
});
