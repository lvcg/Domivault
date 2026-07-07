import { expect, test } from "@playwright/test";
import { cardByHeading, resetLocalState } from "./helpers";

test.describe("Vehicles and vendors", () => {
  test.beforeEach(async ({ page }) => {
    await resetLocalState(page);
  });

  test("renders vehicle status dropdown options with readable contrast", async ({ page }) => {
    await page.goto("/vehicles");
    await page.getByRole("button", { name: "Add Vehicle" }).click();

    const statusSelect = page.getByLabel("Status");
    await expect(statusSelect).toBeVisible();

    const contrast = await statusSelect.evaluate((select) => {
      const option = (select as HTMLSelectElement).options[0];
      const selectStyles = window.getComputedStyle(select);
      const optionStyles = window.getComputedStyle(option);
      return {
        background: optionStyles.backgroundColor || selectStyles.backgroundColor,
        color: optionStyles.color || selectStyles.color,
        text: option.textContent?.trim(),
      };
    });

    expect(contrast.text).toBeTruthy();
    expect(contrast.color).not.toBe(contrast.background);
    expect(contrast.color).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("removes a vendor card when delete is clicked", async ({ page }) => {
    await page.goto("/vendors");
    const vendor = cardByHeading(page, "Park Climate Studio");
    await expect(vendor).toBeVisible();

    await vendor.getByRole("button", { name: "Delete Park Climate Studio" }).click();
    await expect(vendor).toHaveCount(0);
  });
});

