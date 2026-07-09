import { fireEvent, render, screen } from "@testing-library/react";
import { FeatureGate, GatedActionButton, LockedFeatureBadge, PlusBadge } from "@/components/billing/feature-gate";
import { useDomiVaultUser } from "@/components/auth/domivault-user-provider";

jest.mock("@/components/auth/domivault-user-provider", () => ({
  useDomiVaultUser: jest.fn(),
}));

jest.mock("@/components/billing/revenuecat-upgrade-button", () => ({
  RevenueCatUpgradeButton: ({ label = "Upgrade to Plus" }: { label?: string }) => (
    <button type="button">{label}</button>
  ),
}));

const mockedUseDomiVaultUser = jest.mocked(useDomiVaultUser);

function mockPlan(isPlusUser: boolean) {
  mockedUseDomiVaultUser.mockReturnValue({
    isLoading: false,
    isPlusUser,
    planTier: isPlusUser ? "vault_plus" : "free",
    refreshUserState: jest.fn(),
    user: null,
  });
}

describe("FeatureGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders visual Plus and locked badges", () => {
    render(
      <div>
        <PlusBadge />
        <LockedFeatureBadge />
      </div>,
    );

    expect(screen.getAllByText("Plus")).toHaveLength(2);
  });

  it("allows free users to access free features", () => {
    mockPlan(false);

    render(
      <FeatureGate featureId="dashboard_overview">
        <div>Free dashboard content</div>
      </FeatureGate>,
    );

    expect(screen.getByText("Free dashboard content")).toBeVisible();
    expect(screen.queryByText("Upgrade to Plus")).not.toBeInTheDocument();
  });

  it("shows the paywall UI when a free user reaches a premium feature", () => {
    mockPlan(false);

    render(
      <FeatureGate featureId="document_vault">
        <div>Secure document uploader</div>
      </FeatureGate>,
    );

    expect(screen.queryByText("Secure document uploader")).not.toBeInTheDocument();
    expect(screen.getByText("Receipt and warranty vault")).toBeVisible();
    expect(screen.getByText("Upgrade to Plus")).toBeVisible();
  });

  it("renders premium content for a Plus user", () => {
    mockPlan(true);

    render(
      <FeatureGate featureId="vehicle_maintenance_records">
        <div>Vehicle maintenance records</div>
      </FeatureGate>,
    );

    expect(screen.getByText("Vehicle maintenance records")).toBeVisible();
    expect(screen.queryByText("Upgrade to Plus")).not.toBeInTheDocument();
  });

  it("intercepts a premium action and presents the paywall for a free user", () => {
    mockPlan(false);
    const onAllowedClick = jest.fn();

    render(
      <GatedActionButton featureId="ocr_scan_extraction" onAllowedClick={onAllowedClick}>
        Scan receipt
      </GatedActionButton>,
    );

    fireEvent.click(screen.getByRole("button", { name: /scan receipt/i }));

    expect(onAllowedClick).not.toHaveBeenCalled();
    expect(screen.getByText("OCR scan extraction")).toBeVisible();
    expect(screen.getByText("Upgrade to Plus")).toBeVisible();
  });

  it("runs a premium action immediately for a Plus user", () => {
    mockPlan(true);
    const onAllowedClick = jest.fn();

    render(
      <GatedActionButton featureId="ocr_scan_extraction" onAllowedClick={onAllowedClick}>
        Scan receipt
      </GatedActionButton>,
    );

    fireEvent.click(screen.getByRole("button", { name: /scan receipt/i }));

    expect(onAllowedClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Upgrade to Plus")).not.toBeInTheDocument();
  });
});
