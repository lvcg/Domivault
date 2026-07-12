import { expect, test } from "@playwright/test";
import { cardByHeading, dashboardMetric, resetLocalState } from "./helpers";

test.describe("Dashboard state sync", () => {
  test.beforeEach(async ({ page }) => {
    await resetLocalState(page);
  });

  test("updates Upcoming Tasks and Service Watch after deleting records without a hard refresh", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(dashboardMetric(page, "/maintenance", "Upcoming tasks")).toHaveText("3");
    await expect(dashboardMetric(page, "/appliances", "Service watch")).toHaveText("1");

    await page.goto("/maintenance");
    await cardByHeading(page, "Change HVAC filter").getByRole("button", { name: "Delete" }).click();
    await expect(cardByHeading(page, "Change HVAC filter")).toHaveCount(0);

    await page.goto("/appliances");
    await cardByHeading(page, "Refrigerator").getByRole("button", { name: "Delete" }).click();
    await expect(cardByHeading(page, "Refrigerator")).toHaveCount(0);

    await page.goto("/dashboard");
    await expect(dashboardMetric(page, "/maintenance", "Upcoming tasks")).toHaveText("2");
    await expect(dashboardMetric(page, "/appliances", "Service watch")).toHaveText("0");
  });
});

