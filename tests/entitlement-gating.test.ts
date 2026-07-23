import {
  canAccessFeature,
  getEntitlementGateState,
  getSubscriptionTierFromProduct,
  premiumEntitlementId,
  readPremiumEntitlement,
} from "@/lib/billing/entitlement-gating";

describe("entitlement gating utilities", () => {
  it("always allows free features without a Plus entitlement", () => {
    expect(canAccessFeature("dashboard_overview", false)).toBe(true);
    expect(canAccessFeature("expense_tracking", false)).toBe(true);
    expect(canAccessFeature("maintenance_checklists", false)).toBe(true);
    expect(canAccessFeature("vendor_directory", false)).toBe(true);
  });

  it("blocks Plus-only features for free users", () => {
    expect(canAccessFeature("document_vault", false)).toBe(false);
    expect(canAccessFeature("ocr_scan_extraction", false)).toBe(false);
    expect(canAccessFeature("vehicle_maintenance_records", false)).toBe(false);
  });

  it("allows Plus-only features for entitled users", () => {
    expect(canAccessFeature("document_vault", true)).toBe(true);
    expect(canAccessFeature("google_calendar_sync", true)).toBe(true);
    expect(canAccessFeature("renewal_reminders", true)).toBe(true);
  });

  it("reads the active premium_access entitlement from customer info", () => {
    const customerInfo = {
      entitlements: {
        active: {
          [premiumEntitlementId]: {
            isActive: true,
            productIdentifier: "domivault_plus_yearly",
          },
        },
      },
    };

    expect(readPremiumEntitlement(customerInfo)).toMatchObject({
      isActive: true,
      productIdentifier: "domivault_plus_yearly",
    });
  });

  it("labels Monthly, Yearly, Lifetime, and Free account states", () => {
    expect(getSubscriptionTierFromProduct("domivault_plus_monthly")).toBe("Monthly Subscription");
    expect(getSubscriptionTierFromProduct("domivault_plus_yearly")).toBe("Yearly Subscription");
    expect(getSubscriptionTierFromProduct("domivault_plus_lifetime")).toBe("Lifetime Access");
    expect(getSubscriptionTierFromProduct(null)).toBe("Free Tier");
  });

  it("builds a display state from RevenueCat premium status", () => {
    const state = getEntitlementGateState({
      appUserId: "user_123",
      customerInfo: {
        entitlements: {
          active: {
            [premiumEntitlementId]: {
              isActive: true,
              productIdentifier: "domivault_plus_monthly",
            },
          },
        },
        managementURL: null,
      },
      entitlementId: premiumEntitlementId,
      isPremium: true,
      managementURL: null,
    } as never);

    expect(state).toMatchObject({
      isPlus: true,
      planLabel: "Monthly Subscription",
      productIdentifier: "domivault_plus_monthly",
    });
  });
});
